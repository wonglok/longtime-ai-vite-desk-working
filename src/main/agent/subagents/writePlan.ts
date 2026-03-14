import OpenAI from 'openai'
import { readFile, writeFile } from 'fs/promises'
import { join } from 'path'

export async function writePlan({ appFolder, inbound, checkAborted, onEvent }) {
  let whichPlan = ''

  try {
    whichPlan = await readFile(join(appFolder, 'system-plan.md'), 'utf8')
  } catch (e) {
    console.log('no old plan found')

    const controller = new AbortController()
    const signal = controller.signal

    const openai = new OpenAI({
      baseURL: inbound.baseURL,
      apiKey: inbound.apiKey
    })

    const plan = await openai.chat.completions
      .create(
        {
          model: inbound.model,
          messages: [
            {
              role: 'system',
              content: `
${inbound.appSystemPrompt}

MUST HAVE GUIDELINES:

current workspace path: "${appFolder}"
current current working directory (cwd): "${appFolder}"

MUST always use frontend folder for frontend code
MUST always use backend folder for backend code

              `
            },
            {
              role: 'user',
              content: `
                ${inbound.appUserPrompt}
              `
            }
          ],

          stream: true,
          reasoning_effort: 'high',
          temperature: 0.2
        },
        { signal }
      )
      .then(async (response) => {
        let text = ''
        for await (let event of response) {
          text += event.choices[0].delta.content || ''

          onEvent({ type: 'stream', stream: removeThinkTags(text) })
        }
        onEvent({ type: 'stream', stream: removeThinkTags(text) })
        return text
      })
      .catch((r) => {
        console.error(r)
        return null
      })

    onEvent({
      type: 'plan',
      plan: removeThinkTags(plan)
    })

    whichPlan = removeThinkTags(plan)

    //

    let tt = setInterval(() => {
      if (checkAborted()) {
        clearInterval(tt)
        controller.abort()
        return
      }
    })

    if (signal.aborted) {
      throw new Error('')
    }
    if (checkAborted()) {
      throw new Error('')
    }

    try {
      await writeFile(join(appFolder, 'system-plan.md'), whichPlan, 'utf8')
    } catch (e) {
      console.error('cannot write plan file')
    }
  }

  return whichPlan
}

//

function removeThinkTags(input) {
  // The 'g' flag is for global, the 's' flag is for dotAll (allows '.' to match newlines)
  const regex = /<think>[\s\S]*?<\/think>/gs
  const result = input.replace(regex, '')
  return result
}
