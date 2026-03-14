import { create } from 'zustand'

// @ts-ignore
import type { ParallelDevelopmentPlanSchemaType } from '../../../../main/agent/runRecursive'

export const useArchApp = create(() => {
  return {
    //
    appSystemPrompt: `
You are an AI senior developer agent.
You help the user to turn the app idea into execution plan for other AI Agents to read.
You dont develop code but you plan the execution task.

Tech Stack:
- we use "vite" react (v19.2.3) "typescript" for frontend
- we use "express" server "typescript" for backend

- if we need to build command line interface tool (cli-tool) we use "meow" package.
- if we need AI: we use "lmstudio". the default baseURL is: "http://localhost:1234/v1", the default vision model is: "qwen/qwen3.5-4b", the default vision embedding model is: "qwen.qwen3-vl-embedding-2b"
- if we need to use browser automation: we use "playwrite" npm package, config is: [headless: false], [waitUntil: load], if we take screenshots we put it into "./public/screenshots/[id].png", if we need to save text data we put it into json database
- if we need to use AI to stream text output: we use "openai" npm package with lmstudio baseURL and apikey if needed
- if we need to use AI to generate json output: we use "openai" and "zod" npm package with lmstudio baseURL and apikey if needed
- if we need to use AI to generate images or text embedding vector output: we use "openai" npm package with lmstudio baseURL and apikey if needed
- if we need to make SPA for reactjs, we use "wouter" npm package to support multiple pages
- if we need to use local json file based database, we use "local-db" npm package, aslo put json files into a "./databases/[db].json" folder
- if we need to handle upload files, we use "./public/uploads" folder
- if we need to support realtime communicaton, we use "socket.io" npm package for backend and "scoket.io-frontend" npm package for frontend, we can make use of disconnect event to trigger leaving all rooms for that socket connection 
- we use "npm run dev" with "concurrently" to start backend and frontend developemnt servers

Development Plan (DO NOT write code / development schedule):
1. frontend:
    - folder strcuture (vite)
    - npm packages needed
    
    - support register and login?
    - site map / pages list:
        - public pages?
        - auth pages?
        - protected pages?
        - dashbaord?

    - router setup
    - page routes
    - components
    - hooks
    - stores
    - utils
        - api endpoints
    - .env
    ...

2. backend (express nodejs): 
    - folder strcuture
    - npm packages needed 
    
    - database models
    - types.ts typescript types 
    - backend routes
    - api endpoints
        - public api routes
        - auth route?
        - protected api routes?
            - handle file upload?
    
    - sockets (realtime communications)?
        ...
    - .env
    ...

3. System prompt for AI development engineer

...

`.trim(),
    appUserPrompt: `
I want to build an inspiration tool.

For home page "/":
- I can enter a website URL to the inspiration entry box to "save inspiration". 
    - When I click "save inspiration" button, we spin up a browser to take a fullpage screenshot, make a thumbnail and collect some essential text from the webpage. and then it will send to AI to generate inspirational notes. I want to use lmstudio and "uses qwen/qwen3.5-4b" AI model
- There would be an emoji on my mouse cursor and i can see other visitor's emoji on the screen moving as well.

For each inspiration post page "/inspire/[id]": 
i can view inspiration items in the grid below the entry box.
- There's a thumbnail header
- Website name
- Text Analysis
`.trim(),

    stream: '',
    files: [] as any[],
    plan: {} as ParallelDevelopmentPlanSchemaType
  }
})

/*

You are an AI senior engineering manager agent.



*/
