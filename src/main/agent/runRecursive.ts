import { app } from 'electron'
import { makeDirectory } from 'make-dir'
import OpenAI from 'openai'
import z from 'zod'

export const DigGroundNode = z.object({
  _id: z.uuid(),
  name: z.string(),
  content: z.string().describe('only file has content, dir dont have content').optional(),
  isDir: z.boolean(),
  folder: z
    .array(
      z.object({
        _id: z.uuid(),
        name: z.string(),
        content: z.string().describe('only file has content, dir dont have content').optional(),
        isDir: z.boolean()
      })
    )
    .optional()
})

export type ExecStep = z.infer<typeof DigGroundNode>

export const runRecursive = async ({ checkAborted, onEvent, inbound, randID }) => {
  const docs = app.getPath('documents')
  const workspace = `${docs}/ai-home/${inbound.folder}`
  await makeDirectory(workspace)

  const controller = new AbortController()
  const signal = controller.signal

  let run = async () => {
    const openai = new OpenAI({
      baseURL: inbound.baseURL,
      apiKey: inbound.apiKey
    })
    const json = await openai.chat.completions
      .create(
        {
          model: inbound.model,
          messages: [
            {
              role: 'system',
              content: `${inbound.soul}`
            },
            {
              role: 'user',
              content: `
                ${inbound.prompt}
              `
            }
          ],
          response_format: {
            type: 'json_schema',
            json_schema: {
              name: 'tree',
              schema: DigGroundNode.toJSONSchema()
            }
          },
          reasoning_effort: 'none',
          temperature: 0
        },
        { signal }
      )
      .then(async (response) => {
        return JSON.parse(response.choices[0].message.content!) as ExecStep
      })
      .catch((r) => {
        console.error(r)
        return null
      })

    onEvent({ type: 'json', json: json })
  }

  if (signal.aborted) {
    return
  }

  await run()

  //
}
