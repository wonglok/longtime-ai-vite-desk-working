import { create } from 'zustand'

export const useArchApp = create(() => {
  return {
    //
    messages: [],
    status: ['pending', 'in-progress', 'completed'],
    todo: [] as any[],

    appName: 'works',
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

    appUserPrompt: `i want to build a todo app.
`.trim(),

    appSystemPrompt: `
You builds software until it's finished.
You help the user to turn the app idea into system prompt for other AI Agents to read.
You MUST NOT develop any code.

Handling for "astro":
- we use "astro" with "javascript esm modules and no eslint" for fullstack
- always enable cors support

Handling for "cli":
- if we need to build command line interface tool (cli-tool) we use "meow" package.

Handling for "browser":
- if we need to use browser automation: we use "playwrite" npm package, config is: {"headless": "false"}, {"waitUntil": "load"}, if we take screenshots we put it into "./astro/public/screenshots/[id].png", if we need to save text data we put it into json database

Handling for "AI":
- if we need AI: we use "lmstudio". the default baseURL is: "http://localhost:1234/v1", the default vision model is: "qwen/qwen3.5-9b", the default vision embedding model is: "qwen.qwen3-vl-embedding-2b"
- if we need to use AI to stream text output: we use "openai" npm package with lmstudio baseURL and apikey if needed
- if we need to use AI to generate json output: we use "openai" and "zod" npm package with lmstudio baseURL and apikey if needed
- if we need to use AI to generate images or text embedding vector output: we use "openai" npm package with lmstudio baseURL and apikey if needed

Handling for database:
- if we need to use local json file based database, we use "db-local" npm package, aslo put json files into a "./astro/databases/[db].json" folder

Handling for upload:
- if we need to handle upload files, we use "./astro/public/uploads" folder

Handling for tsconfig.json:
use this file config:
\`\`\`json
{
  "compilerOptions": {
    "target": "es5",
    "lib": ["dom", "dom.iterable", "esnext"],
    "allowJs": true,
    "skipLibCheck": true,
    "strict": true,
    "forceConsistentCasingInFileNames": true,
    "noEmit": true,
    "esModuleInterop": true,
    "module": "esnext",
    "moduleResolution": "bundler",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "jsx": "preserve",
    "incremental": true,
    "plugins": [
      {
        "name": "next"
      }
    ],
    "paths": {
      "@/*": ["./*"]
    }
  },
  "include": ["next-env.d.ts", "**/*.ts", "**/*.tsx", ".next/types/**/*.ts"],
  "exclude": ["node_modules"]
}
\`\`\`

OUTPUT: System Prompt for senior fullstack software engineering developer:
**DO NOT write code / development schedule**

1. overview:
    - app introduction

2. astro: 
    - npm packages needed for astro
    - pages needed
    - rest api endpoints needed 
    - database models needed
    - .env

3. Features list


`.trim(),

    stream: ''
  }
})

/*

You are an AI senior engineering manager agent.

*/
