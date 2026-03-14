import { app } from 'electron'
import { makeDirectory } from 'make-dir'
import OpenAI from 'openai'
// import z from 'zod'
import { developCode } from './subagents/developCode'
import { writePlan } from './subagents/writePlan'

export const runAppPlanner = async ({ checkAborted, onEvent, inbound, randID }) => {
  const docs = app.getPath('documents')
  const appFolder = `${docs}/ai-home/apps/${inbound.appName}`
  await makeDirectory(appFolder)

  const plan = await writePlan({
    appFolder: appFolder,
    inbound,
    checkAborted,
    onEvent: onEvent
  })

  await developCode({
    checkAborted: checkAborted,
    appFolder: appFolder,
    plan: plan,
    inbound: inbound,
    onEvent: (ev) => {
      onEvent(ev)
    }
  })

  //
}

// export const CoderSchema = z
//   .object({
//     _id: z.string().describe('small-id-for-unique-object-id'),
//     filePath: z.string().describe('file location path'),
//     thought: z.string().describe(`thouht of the agent for that task`),
//     systemPrompt: z
//       .string()
//       .describe(
//         'AI agent context: system prompt message for the task and the code to be written. you need to follow the system prompt for this.'
//       ),

//     userPrompt: z
//       .string()
//       .describe(
//         'AI agent context: user prompt message for the task and the code file to be written and with file content summary'
//       )
//   })
//   .describe('a development plan for AI Coding Agent to generate that code file')

// export type CoderType = z.infer<typeof CoderSchema>

// export const ParallelDevelopmentPlanSchema = z.object({
//   folders: z.string().describe('folder structure'),
//   todo: z.array(
//     z.object({
//       //
//       task: z.string().describe('task'),
//       codes: z.array(CoderSchema)
//       //
//     })
//   )
//   // tasks: z.discriminatedUnion('type', [webapp, commandLineTool]),
// })

// export type ParallelDevelopmentPlanSchemaType = z.infer<typeof ParallelDevelopmentPlanSchema>
