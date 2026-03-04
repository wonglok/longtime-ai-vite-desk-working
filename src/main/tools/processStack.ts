// import z from 'zod'
// import { generateJSON } from './adapter'
// import { prepToolListFiles, prepToolWriteFile } from './fsTools'

// export const processPromptRequest = async ({
//   randID,
//   mainWindow,
//   inbound,
//   // stack = [],
//   context = ''
// }: {
//   context: string
//   randID: string
//   mainWindow: any
//   inbound: any
//   // stack: { task: string }[]
// }) => {
//   //

// {
//             role: 'user',
//             content: `
//               Current files:
//               ${JSON.stringify(await dirTool.execute({ relativePath: './' }))}
//             `
//           },

//   const output = await generateJSON({
//     api: inbound,

//     messages: [
//       {
//         role: 'system',
//         content: `
//         you are a senior developer who writes typescript code.
//         you write todo list from user requirement.
//         the frontend uses typescript, html, vite, reactjs, zustand
//         the backend uses nodejs, expressjs, socket-io, low-db JSONFilePreset
//         we dont have to use CI/CD
//         `
//       },
//       {
//         role: 'user',
//         content: `
//         Here's the context of the application:
//         ${context}
//         `
//       }
//     ],
//     schema: z.object({
//       codes: z.array(
//         z.object({
//           //
//           fileContent: z.string(),
//           filePath: z.string()
//         })
//       )
//     }),
//     temperature: 0,
//     reasoning: {
//       effort: 'low'
//     }
//   })

//   console.log('output', output)

//   let writeTool = prepToolWriteFile({ workspace: inbound.workspace })

//   for (let code of output.codes) {
//     await writeTool.execute({
//       content: code.fileContent,
//       relativePath: code.filePath
//     })
//   }

//   // const result = await runSandboxCode({ code: `abc` })

//   // const review = await generateJSON({
//   //   api: inbound,
//   //   messages: [
//   //     {
//   //       role: 'system',
//   //       content: `You are an AI senior developer. You review the result according to the plan and schedule more tasks if necessary`
//   //     },
//   //     {
//   //       role: 'user',
//   //       content: `Execution result: ${result}`
//   //     }
//   //   ],
//   //   schema: z.object({
//   //     status: z.enum(['success', 'failed']),
//   //     comment: z.string(),
//   //     moreTasks: z.array(z.string())
//   //   }),
//   //   temperature: 0
//   // })

//   // review.moreTasks.forEach((task) => {
//   //   stack.push({ task })
//   // })

//   // console.log(review)
//   //

//   return {
//     stack
//   }
// }
