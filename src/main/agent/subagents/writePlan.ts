import OpenAI from 'openai'
import { readFile, writeFile } from 'fs/promises'
import { join } from 'path'
import { makeDirectory } from 'make-dir'

export async function writePlan({ workspace, inbound, checkAborted, onEvent }) {
  await makeDirectory(join(workspace, 'ai-memory'))

  let whichPlan = ''

  try {
    const oldPlan = await readFile(join(workspace, 'ai-memory', 'system-plan.md'), 'utf8').catch(
      () => {
        throw new Error('no old plan found')
      }
    )
    const appIdea = await readFile(join(workspace, 'ai-memory', 'app-idea.md'), 'utf8').catch(
      () => {
        throw new Error('no app idea found')
      }
    )

    if (appIdea === inbound.appUserPrompt.trim()) {
      whichPlan = oldPlan
    } else {
      throw new Error('idea updated')
    }
  } catch (e) {
    //

    console.log(e.message)

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

current workspace path: "${workspace}"
current current working directory (cwd): "${workspace}"

MUST always use "./nextjs" folder for nextjs code
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
      await writeFile(
        join(workspace, 'ai-memory', 'app-idea.md'),
        inbound.appUserPrompt.trim(),
        'utf8'
      )
      await writeFile(join(workspace, 'ai-memory', 'system-plan.md'), whichPlan, 'utf8')
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
