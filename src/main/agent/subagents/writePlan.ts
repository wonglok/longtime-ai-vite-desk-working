import OpenAI from 'openai'
import { readFile, writeFile } from 'fs/promises'
import { join } from 'path'
import { makeDirectory } from 'make-dir'

export async function writePlan({ appFolder, inbound, checkAborted, onEvent }) {
  await makeDirectory(join(appFolder, 'ai-memory'))

  let whichPlan = ''

  try {
    const oldPlan = await readFile(join(appFolder, 'ai-memory', 'system-plan.md'), 'utf8').catch(
      () => {
        throw new Error('no old plan found')
      }
    )
    const appIdea = await readFile(join(appFolder, 'ai-memory', 'app-idea.md'), 'utf8').catch(
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

current workspace path: "${appFolder}"
current current working directory (cwd): "${appFolder}"

MUST always use "./frontend" folder for frontend code
MUST always use "./backend" folder for backend code
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
        join(appFolder, 'ai-memory', 'app-idea.md'),
        inbound.appUserPrompt.trim(),
        'utf8'
      )
      await writeFile(join(appFolder, 'ai-memory', 'system-plan.md'), whichPlan, 'utf8')
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
