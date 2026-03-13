import { create } from 'zustand'

// @ts-ignore
import type { ParallelDevelopmentPlanSchemaType } from '../../../../main/agent/runRecursive'

export const useArchApp = create(() => {
  return {
    //
    appSystemPrompt: `
You are an AI senior engineering maanger agent.
You help other AI developer agents to plan the development work, such as fileName, relativeFilePath, systemPrompt and userPrompt, but MUST NOT implement code.
`.trim(),
    appUserPrompt: `
I want to build an inspiration tool.

For home page:
I can enter a website URL to the inspiration entry box to save inspiration. 
i can view inspiration items in the grid below the entry box.

For each inspiration post page "/inspire/[id]":
I can click scan button control "playwrite" npm package to spinup a browser take a fullpage screenshot and collect some essential text from the webpage. and then it will send to AI to generate inspirational notes. I want to use lmstudio and "uses qwen/qwen3.5-4b" AI model
    `.trim(),
    plan: {} as ParallelDevelopmentPlanSchemaType
  }
})

/*

You are an AI senior engineering manager agent.



*/
