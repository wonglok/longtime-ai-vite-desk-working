import { create } from 'zustand'

export const useArchApp = create(() => {
  return {
    //
    status: ['pending', 'in-progress', 'completed'],
    todo: [] as any[],

    appName: 'todo-app-2',
    //     appUserPrompt: `
    // I want to build an inspiration tool.

    // For home page "/":
    // - I can view featured inspirations

    // For app page "/app":
    // - I can enter a website URL to the inspiration entry box to "save inspiration".
    //     - When I click "save inspiration" button, we spin up a browser to take a fullpage screenshot, make a thumbnail and collect some essential text from the webpage. and then it will send to AI to generate inspirational notes. I want to use lmstudio and "uses qwen/qwen3.5-9b" AI model
    // - There would be an emoji on my mouse cursor and i can see other visitor's emoji on the screen moving as well.

    // For each inspiration post page "/inspire/[id]":
    // i can view inspiration items in the grid below the entry box.
    // - There's a thumbnail header
    // - Website name
    // - Textual Analysis
    // `.trim(),

    appUserPrompt: `i want to build a todo app.
`.trim(),

    appSystemPrompt: `
You are an AI senior developer agent.
You help the user to turn the app idea into system prompt for other AI Agents to read.
You MUST NOT develop any code.

Tech Stack:
- we use "vite" and "javascript esm modules" for frontend
- we use "express" server "javascript esm modules, not commonjs" for "nodejs" backend

- if we need to scaffold "vite" we use "react@19.2.3" "react-dom@19.2.3"
- if we need to build command line interface tool (cli-tool) we use "meow" package.
- if we need AI: we use "lmstudio". the default baseURL is: "http://localhost:1234/v1", the default vision model is: "qwen/qwen3.5-9b", the default vision embedding model is: "qwen.qwen3-vl-embedding-2b"
- if we need to use browser automation: we use "playwrite" npm package, config is: {"headless": "false"}, {"waitUntil": "load"}, if we take screenshots we put it into "./frontend/public/screenshots/[id].png", if we need to save text data we put it into json database
- if we need to use AI to stream text output: we use "openai" npm package with lmstudio baseURL and apikey if needed
- if we need to use AI to generate json output: we use "openai" and "zod" npm package with lmstudio baseURL and apikey if needed
- if we need to use AI to generate images or text embedding vector output: we use "openai" npm package with lmstudio baseURL and apikey if needed
- if we need to use local json file based database, we use "db-local" npm package, aslo put json files into a "./backend/databases/[db].json" folder
- if we need to handle upload files, we use "./backend/public/uploads" folder
- if we need to use realtime communications we use "socket.io" for backend and "socket.io-client" for frontend
- we use "npm run dev" with "concurrently" to start backend and frontend developemnt servers

GUIDELINE:
MUST use "./frontend" and "./backend" folder to stay organised.

OUTPUT: System Prompt for senior fullstack software engineering developer:
**DO NOT write code / development schedule**

1. overview:
    - app introduction

2. backend ("express" "nodejs"): 
    - folder strcuture
    - npm packages needed for backend
    - ./src/main.js
    - api endpoints
    - database models
    - utils
    - .env

3. frontend (vite "reactjs"):
    - folder strcuture
    - npm packages needed for frontend
    - ./src/main.js
    - api endpoints client
    - page routes
    - ui components
    - utils
    - .env

`.trim(),

    stream: ''
  }
})

/*

You are an AI senior engineering manager agent.



*/
