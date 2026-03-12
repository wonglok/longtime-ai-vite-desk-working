import { app } from 'electron'
import { makeDirectory } from 'make-dir'
import OpenAI from 'openai'
import z from 'zod'
import { getSkills } from './utils/getSkills'

export const SkillNode = z
  .object({
    _id: z.uuid(),
    skills: z.array(
      z.object({
        name: z.string(),
        description: z.string().describe('only file has content, dir dont have content')
      })
    )
  })
  .describe('suitable skills')

export type ExecStep = z.infer<typeof SkillNode>

export const runSkill = async ({ checkAborted, onEvent, inbound, randID }) => {
  const docs = app.getPath('documents')

  const workspace = `${docs}/ai-home`
  const projectHome = `${docs}/ai-home/${inbound.folder}`
  await makeDirectory(projectHome)

  const controller = new AbortController()
  const signal = controller.signal

  let run = async () => {
    const openai = new OpenAI({
      baseURL: inbound.baseURL,
      apiKey: inbound.apiKey
    })
    console.log(`${await getSkills(workspace)}`)

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
${await getSkills(workspace)}
              `
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
              name: 'result',
              schema: SkillNode.toJSONSchema()
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
