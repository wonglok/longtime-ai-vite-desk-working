import { createAgent } from './sdk'
import { fetchTool, getAllFilesAsync, terminalTool } from './toolbox'
import { join } from 'path'
import { app } from 'electron'
import { makeDirectory } from 'make-dir'
// @ts-ignore
import metaprompt from './prompt/meta-prompt.md?raw'

// ============================================================================
// USAGE
// ============================================================================

export const enhancedAgent = async ({ mainWindow, event, randID, inbound }) => {
  const docs = app.getPath('documents')
  const workspace = join(docs, `ai-home`, `${inbound.folder}`)
  await makeDirectory(workspace)

  // const memory = await createMemoryAccessor({
  //   workspacePath: workspace
  // })

  // const refined = await streamText({
  //   api: inbound,
  //   temperature: 0,
  //   reasoning: {
  //     effort: 'low'
  //   },
  //   messages: [
  //     {
  //       role: 'system',
  //       content: `
  //         You are an experienced senior software engineer. You don't overthink. You write the plan concisely.
  //       `
  //     },
  //     {
  //       role: 'user',
  //       content: `
  //       ${metaprompt}
  //       ${inbound.prompt}`
  //     }
  //   ],
  //   onStream: (v) => {
  //     mainWindow.webContents.send(`askAI-stream${randID}`, v)
  //   }
  // })

  mainWindow.webContents.send(`askAI-stream${randID}`, 'Agent Starts...')

  const agent = await createAgent({
    apiKey: inbound.apiKey,
    baseURL: inbound.baseURL,
    onProgress: (str: string) => {
      mainWindow.webContents.send(`askAI-stream${randID}`, str)
    },
    temperature: 0.0,
    maxSteps: 999,
    model: inbound.model, // local
    // model: `m1-qwen3.5-35b-a3b`, // remote
    contextWindow: 4096,
    tools: [
      //
      terminalTool(),
      fetchTool
      // calculate
      // readFile(memory),
      // writeFile(memory)
    ]
  })

  const files = await getAllFilesAsync(workspace, [])
  const filesText = `${files
    .filter((r) => {
      if (r.includes('node_modules')) {
        return false
      }
      return true
    })
    .map((r) => {
      return `${r}`
    })
    .join('\n')}`.trim()

  console.log(filesText)

  const result = await agent.executeProcedure(`
    Here are the files of the current workspace:
    ${filesText}

    Here is the workspace: 
    ${workspace}

    Here is the prompt from user:
    ${inbound.prompt}
  `)

  /*
  Calculate 2+2, write to "result.txt", then read it back then add 1 then save it then send it to me.
  get http://example.com and write to "example.html"
  */

  console.log(result.output)

  //
  // console.log(result.output)
  //
}

// const planner = await generateJSON({
//     api: inbound,
//     messages: [
//       {
//         role: 'system',
//         content: `
//           You are a execution planner.
//         `
//       }
//     ],
//     schema: z.object({
//       plan: z.string(),
//       review: z.string()
//     }),
//     temperature: 0.5
//   })
// let tools = [
//   //
//   prepToolListFiles({ workspace: inbound.workspace }),
//   prepToolCreateFolder({ workspace: inbound.workspace }),
//   prepToolReadFile({ workspace: inbound.workspace }),
//   prepToolWriteFile({ workspace: inbound.workspace }),
//   prepToolTrashFile({ workspace: inbound.workspace }),
//   prepToolTrashFolder({ workspace: inbound.workspace })
// ]
//       let runGroup = async ({ plan }) => {
//         //
//         // console.log('before-task', todo)
//         //
//         const pickedTask = await streamText({
//           api: inbound,
//           onStream: (message) => {
//             mainWindow.webContents.send(`askAI-stream${randID}`, message)
//           },
//           messages: [
//             {
//               role: 'system',
//               content: `You are a developer.`
//             },
//             {
//               role: 'user',
//               content: `
//                 pick a task from the todo list and work on it. mark it as working with this: [doing].
//                 here's the todo list:\n${plan}`
//             }
//           ],
//           temperature: 0
//         })
//         console.log('after-pick', pickedTask)
//         const review = await generateJSON({
//           api: inbound,
//           messages: [
//             {
//               role: 'system',
//               content: `You are a senior developer.`
//             },
//             {
//               role: 'user',
//               content: `here's the todo list:\n${plan}`
//             },
//             {
//               role: 'user',
//               content: `the developer have been working on task: ${pickedTask}.
//               `
//             },
//             {
//               role: 'user',
//               content: `here's the current file system:\n${JSON.stringify(files, null, '\t')}`
//             },
//             {
//               role: 'user',
//               content: `You udpate the todo list, if it's finished then you use [done] to mark the task to be finished`
//             }
//           ],
//           schema: z.object({
//             plan: z.string().describe('update todo list with the work it provides'),
//             continueToRun: z.boolean()
//           }),
//           temperature: 0
//         })
//         console.log('after-review', review)
//         if (review.continueToRun) {
//           return await runGroup({ plan: review.todo })
//         } else {
//           return { plan: review.todo }
//         }
//       }
//       const plan = await streamText({
//         api: inbound,
//         temperature: 0,
//         onStream: (message) => {
//           mainWindow.webContents.send(`askAI-stream${randID}`, message)
//         },
//         messages: [
//           {
//             role: 'system',
//             content: `
//             You write structured todo list from the user requirements. You include check list task boxes []. You only plan the todo list, you dont write code.
//             If user didn't mention the backend, then please build an express js backend with simple fs based json db.
//             `
//           },
//           {
//             role: 'user',
//             content: `
// i want to build a todo list
//           `
//           }
//         ]
//       })
//       const output = await runGroup({
//         plan: `${plan}`
//       })

// const dirTool = prepToolListFiles({ workspace: inbound.workspace })
// const refined = await generateJSON({
//   api: inbound,
//   temperature: 0,
//   reasoning: {
//     effort: 'high'
//   },
//   messages: [
//     {
//       role: 'system',
//       content: `
//       You are an AI senior developer, you refine prompt and write overall context for AI agents to use.
//       Current file tree:
//       ${await dirTool.execute({ relativePath: './' })}
//     `
//     },
//     {
//       role: 'user',
//       content: `${inbound.prompt}`
//     }
//   ],
//   schema: z.object({
//     context: z.string()
//   })
// })
// mainWindow.webContents.send(
//   `askAI-stream${randID}`,
//   `Todo list: \n ${JSON.stringify(refined, null, '\t')}`
// )
