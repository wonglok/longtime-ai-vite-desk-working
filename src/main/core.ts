// import { MessageChannelMain, utilityProcess } from 'electron'
// import { generateJSON } from './tools/adapter'
// import { z } from 'zod'
// import { processPromptRequest } from './tools/processStack'
// import { prepToolListFiles } from './tools/fsTools'

import { example } from './agent/example'

// function removeThinkTags(input) {
//   const regex = /<think>.*?<\/think>/gis
//   const result = input.replace(regex, '')
//   return result
// }

// console.log('plan', removeThinkTags(plan))

export const setupIPCMain = async ({ ipcMain, mainWindow }) => {
  //
  ipcMain.on('askAI-message', async (event, inbound, randID) => {
    //

    try {
      mainWindow.webContents.send(`askAI-stream${randID}`, `Begin Processing Todo list...`)

      if (inbound.action === 'message') {
        example()
        //
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
      }

      event.reply(`${'askAI-reply'}${randID}`, { status: 'done' })
    } catch (e) {
      event.reply(`${'askAI-reply'}${randID}`, { status: 'failed' })
    } finally {
    }
  })
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
