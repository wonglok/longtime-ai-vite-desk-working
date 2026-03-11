// import {
//   ChainOfThought,
//   ChainOfThoughtContent,
//   ChainOfThoughtHeader,
//   ChainOfThoughtStep
// } from '@/components/ai-elements/chain-of-thought'
import { AppSidebar } from '@/components/app-sidebar'
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator
} from '@/components/ui/breadcrumb'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { SidebarInset, SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar'
import { useTM } from '@renderer/store/useTM'
import { ActionsTerm } from '@renderer/ui/TodoManagement/ActionsTerm'
// import { Brain } from '@renderer/ui/TodoManagement/Brain'
import { TodoManagement } from '@renderer/ui/TodoManagement/TodoManagement'
import { useEffect, useState } from 'react'

/*

## app idea
  - build a todo task management app
  - kanban style UI drag and drop items similar to trello
  - with realtime updates using socket.io
  - showing mouse position of each page visitor

## app folders
  - frontend
    "~/frontend/*" (Frontend folder)
    "~/frontend/src/App.jsx" (Frontend app entry point for App.jsx)

  - backend
    "~/backend/*" (Backend folder for nodejs)
    "~/backend/src/index.js" (Backend source code entry point)
    "~/backend/public/*" (Public folder for static assets)
    "~/backend/data/*" (Data folder for json database)

## frontend guidelines
  - uses vite with react.js, esm javascript
  - port 5174
  - "npm install axios @tailwindcss/postcss socket.io-client"
  - don't use proxy in vite, enable cors for axios for REST APIs calls and soclet.io-client calls
  - no need to start frontend server at the end
  - in the end, run "npm install"
  - in the end, verify app idea is fully implemented in code

## backend guidelines
  - uses node.js backend with esm javascript
  - port 3001
  - "npm install express socket.io"
  - json database with some sample data
  - cors support for all rest api response and soclet.io
  - "~/backend/package.json" "script" has commands such as "npm run build", "npm run start", "npm run dev"
  - the backend folder should also have .gitignore file to avoid commiting "node_modules" folder to git
  - no need to start backend server at the end
  - in the end, run "npm install"
  - in the end, verify app idea is fully implemented in code

*/

/*

write a nodejs script site.js that uses npm package "playwright". install it via npm 
and then use it to visit effectnode.com 
and jott down some inspiration 
and take a few screenshots.
and read the screenshots and then save the data inside "content" folder.

let's use "openai" npm module.
the baseURL for openai would be http://localhost:1234/v1
use model "qwen/qwen3.5-35b-a3b" model

Analyse the "content" folder text file / json file / images with OpenAI SDK 
and write the report of screenshots into "report.md"

*/
export function Home() {
  //

  let [messages, setContextMessages] = useState([])
  let [stopFunc, setStop] = useState<any>(null)

  useEffect(() => {
    const controller = window.api.askAI(
      {
        baseURL: `http://localhost:1234/v1`,

        apiKey: 'N/A',

        route: 'runAgent',

        model: `qwen/qwen3.5-35b-a3b`,

        // model: `qwen/qwen3-coder-30b`,
        // model: `qwen/qwen3.5-9b`,
        // model: `qwen/qwen3.5-4b`,
        // model: `openai/gpt-oss-20b`,

        folder: `inspiration`,

        soul: `
# SOUL and IDENTITY 
I am a senior developer.
I love helping other poeple (user) to turn their app idea into software.
I love the bible especially the Gospel of Jesus Christ and the book of proverbs.
        `,
        appSpec: `
## App idea
  - build a fullstack app to collect inspiration from websites
  - have a dashboard ui

## collect website page using "playwright":
  - set headless to false in playwright
  - take screenshot into to a folder "~/backend/public/<website.com>/screenshots/*"
  - collect main information in "~/backend/public/<website.com>/json/*"
  - use OpenAI nodejs SDK in npm "openai" to analyse the screenshots and collected json in the folder
  - save the screenshot to analytics

## How to configure OpenAI SDK npm moudle: "openai" 
  let's use "openai" npm module.
  the baseURL for openai would be http://localhost:1234/v1
  use "qwen/qwen3.5-35b-a3b" model

## app folders
  - frontend folder
    "~/frontend/*" (Frontend folder)
    "~/frontend/src/App.jsx" (Frontend app entry point for App.jsx)

  - backend folder
    "~/backend/*" (Backend folder for nodejs)
    "~/backend/src/index.js" (Backend source code entry point)
    "~/backend/public/*" (Public folder for static assets)
    "~/backend/public/<website.com>/json" (Public folder for webiste collected json info)
    "~/backend/public/<website.com>/screenshots" (Public folder for webiste collected screenshots)
    "~/backend/data/*" (Data folder for json database)

## frontend guidelines
  - uses vite with react.js, esm javascript
  - port 5174
  - "npm install axios @tailwindcss/postcss socket.io-client"
  - don't use proxy in vite, enable cors for "axios" for REST APIs calls and "soclet.io-client" calls
  - no need to start frontend server at the end
  - must use "axios" with cors instead of fetch
  - in the end, run "npm install"
  - in the end, verify app idea is fully implemented in code

## backend guidelines
  - uses node.js backend with esm javascript
  - port 3001
  - "npm install express socket.io"
  - json database with some sample data
  - cors support for all rest api response and "soclet.io"
  - implement "npm run build", "npm run start", "npm run dev" for "~/backend/package.json"
  - the backend folder should also have .gitignore file to avoid commiting "node_modules" folder to git
  - no need to start backend server at the end
  - in the end, run "npm install"
  - in the end, verify app idea is fully implemented in code


        `.trim(),

        errorMessage: `
        `
      },
      (stream) => {
        //
        const resp = JSON.parse(stream)

        // if (resp.type !== 'brain') {
        //   console.log(resp)
        // }

        if (resp.type === 'messages') {
          setContextMessages(resp.messages || [])
        }
        if (resp.type === 'todo') {
          useTM.setState({ todos: resp.todo })
        }
        if (resp.type === 'brain') {
          useTM.setState({ brain: resp.brain })
        }

        if (resp.type === 'terminalCalls') {
          useTM.setState({ terminalCalls: resp.terminalCalls })
        }
      }
    )

    setStop(() => {
      return () => {
        controller.abort()
      }
    })

    return () => {
      controller.abort()
      // setWorkbox('')
      // setSide('')
      // setThink('')
      // setNotice('')
      // setTerm('')
    }
  }, [])

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <header className="flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12">
          <div className="flex items-center gap-2 px-4">
            <SidebarTrigger className="-ml-1" />
            <Separator orientation="vertical" className="mr-2 data-[orientation=vertical]:h-4" />
            <Breadcrumb>
              <BreadcrumbList>
                <BreadcrumbItem className="hidden md:block">
                  <BreadcrumbLink href="/about">Build Your Application</BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator className="hidden md:block" />
                <BreadcrumbItem>
                  <BreadcrumbPage>Data Fetching</BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </div>
        </header>

        <div className="gap-4 p-4 pt-0 w-full">
          {stopFunc && (
            <Button
              variant={'destructive'}
              onClick={() => {
                stopFunc()
              }}
            >
              STOP PROCESS IMMEDIATELY
            </Button>
          )}

          <div className="flex">
            <TodoManagement></TodoManagement>
          </div>
          <div className="w-full">{/* <Brain></Brain> */}</div>

          <div className="w-full flex">
            <div className="w-2/3">
              <ActionsTerm></ActionsTerm>
            </div>
          </div>

          <div className="text-xs w-full overflow-x-scroll">
            {messages.map((msg: any, i) => {
              return (
                <li key={'k' + i} className="border m-2 p-2">
                  <pre>{msg?.content.trim()}</pre>
                </li>
              )
            })}

            {/*  */}
            {/* <pre>{workstep}</pre> */}
            {/*  */}
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
