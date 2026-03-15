import { create } from 'zustand'

export const useArchApp = create(() => {
  return {
    //
    messages: [],
    status: ['pending', 'in-progress', 'completed'],
    todo: [] as any[],

    appName: 'hello-01',
    //     appUserPrompt: `
    // I want to build an inspiration tool.

    // For home page "/":
    // - I can view featured inspirations

    // For app page "/app":
    // - I can enter a website URL to the inspiration entry box to "save inspiration".
    //     - When I click "save inspiration" button, we spin up a browser to take a fullpage screenshot, make a thumbnail and collect some essential text from the webpage. and then it will send to AI to generate inspirational notes. I want to use lmstudio and "uses qwen/qwen3.5-9b" AI model

    // For each inspiration post page "/inspire/[id]":
    // i can view inspiration items in the grid below the entry box.
    // - There's a thumbnail header
    // - Website name
    // - Textual Analysis
    // `.trim(),

    appUserPrompt: `i want to build a hello world app.
`.trim(),

    appSystemPrompt: `
You are an AI senior developer agent.
You help the user to turn the app idea into system prompt for other AI Agents to read.
You MUST NOT develop any code.

Tech Stack:
- we use "nextjs" with "javascript esm modules and no eslint" for fullstack

- if we need to scaffold "vite" we use "react@19.2.3" "react-dom@19.2.3"
- if we need to build command line interface tool (cli-tool) we use "meow" package.
- if we need AI: we use "lmstudio". the default baseURL is: "http://localhost:1234/v1", the default vision model is: "qwen/qwen3.5-9b", the default vision embedding model is: "qwen.qwen3-vl-embedding-2b"
- if we need to use browser automation: we use "playwrite" npm package, config is: {"headless": "false"}, {"waitUntil": "load"}, if we take screenshots we put it into "./nextjs/public/screenshots/[id].png", if we need to save text data we put it into json database
- if we need to use AI to stream text output: we use "openai" npm package with lmstudio baseURL and apikey if needed
- if we need to use AI to generate json output: we use "openai" and "zod" npm package with lmstudio baseURL and apikey if needed
- if we need to use AI to generate images or text embedding vector output: we use "openai" npm package with lmstudio baseURL and apikey if needed
- if we need to use local json file based database, we use "db-local" npm package, aslo put json files into a "./nextjs/databases/[db].json" folder
- if we need to handle upload files, we use "./nextjs/public/uploads" folder
- we use "npm run dev" with "concurrently" to start nextjs servers

OUTPUT: System Prompt for senior fullstack software engineering developer:
**DO NOT write code / development schedule**

1. overview:
    - app introduction

2. nextjs: 
    - folder strcuture
    - npm packages needed
    - api endpoints
    - database models
    - utils
    - .env

`.trim(),

    stream: ''
  }
})

/*

You are an AI senior engineering manager agent.

*/
