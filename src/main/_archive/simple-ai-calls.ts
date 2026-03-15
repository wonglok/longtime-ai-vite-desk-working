export async function generateJSON({
  baseURL = 'http://localhost:1234/v1',
  apiKey = '',
  schema,
  temperature = 0.8,
  reasoning = {
    effort: 'low'
  },
  messages = [
    {
      role: 'system',
      content: 'You are a helpful jokester.'
    },
    {
      role: 'user',
      content: 'Tell me a joke.'
    }
  ]
}) {
  //

  return await fetch(`${baseURL}/chat/completions`, {
    method: 'POST',
    mode: 'cors',
    headers: new Headers({
      [`Content-Type`]: `application/json`,
      [`Authorization`]: `Bearer ${apiKey || 'na'}`
    }),
    body: JSON.stringify({
      model: `qwen3.5-9b`,
      messages: messages,
      response_format: {
        type: 'json_schema',
        json_schema: {
          // name: 'my_response',
          strict: 'true',
          schema: schema.toJSONSchema()
        }
      },
      reasoning: reasoning,
      temperature: temperature,
      stream: false
    })
  })
    .then(async (r) => {
      if (!r.ok) {
        console.error(await r.text())
        throw new Error('cannot generate json error')
      }
      return r.json()
    })
    .then((data) => {
      return JSON.parse(data.choices[0].message.content)
    })
}

export async function streamText({
  baseURL = 'http://localhost:1234/v1',
  apiKey = '',
  onStream = (v: any) => {},
  temperature = 0.8,
  messages = [
    {
      role: 'system',
      content: 'You are a helpful jokester.'
    },
    {
      role: 'user',
      content: 'Tell me a joke.'
    }
  ],
  reasoning = {
    effort: 'low'
  }
}) {
  let response = await fetch(`${baseURL}/chat/completions`, {
    method: 'POST',
    mode: 'cors',
    headers: new Headers({
      [`Content-Type`]: `application/json`,
      [`Authorization`]: `Bearer ${apiKey || 'na'}`
    }),
    body: JSON.stringify({
      model: `qwen3.5-9b`,
      messages: messages,
      temperature: temperature,
      stream: true,
      reasoning: reasoning
    })
  })

  if (!response.ok) throw new Error('cannot stream text')
  if (!response.body) throw new Error('cannot stream text')

  // Use TextDecoderStream to decode the raw bytes to text
  const reader = response.body.pipeThrough(new TextDecoderStream()).getReader()

  let text = ''
  while (true) {
    const { value, done } = await reader.read()
    if (done) {
      break
    }

    // OpenAI streams data in SSE format, with lines starting with "data: "
    const lines = value.split('\n')
    for (const line of lines) {
      if (line.length === 0 || line.startsWith(':')) continue // Ignore empty lines or comments

      if (line === 'data: [DONE]') {
        // End of stream marker
        return text
      }

      if (line.startsWith('data: ')) {
        const jsonString = line.substring(6) // Extract JSON string after "data: "
        try {
          const parsedData = JSON.parse(jsonString)
          const content = parsedData.choices?.[0]?.delta?.content
          if (content) {
            text += content
            onStream(text)
          }
        } catch (error) {
          console.error('Error parsing JSON chunk:', error)
        }
      }
    }
  }

  return text
}

// while (true) {
//   if (!reader) {
//     break
//   }

//   const { value, done } = await reader.read()
//   if (done) break // Exit the loop when the stream is finished

//   const chunkText = decoder.decode(value)
//   console.log(chunkText)

//   // 'value' is a Uint8Array (an array of bytes)
//   // Process the chunk here
// }
