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
import { Brain } from '@renderer/ui/TodoManagement/Brain'
import { TodoManagement } from '@renderer/ui/TodoManagement/TodoManagement'
import { useEffect, useState } from 'react'

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

        // model: `qwen/qwen3-coder-30b`,
        model: `qwen/qwen3.5-35b-a3b`,

        folder: `todo-app`,

        appSpec: `
## app idea
I want to build a fullstack trello style task management app
- trello style UI drag and drop items
- with realtime updates using socket.io
- showing mouse position of each page visitor

## app's folders
  - [project-folder]/frontend/* (frontend folder)
  - [project-folder]/backend/* (backend folder)

## frontend development guidelines
  - uses vite with react.js, esm javascript
  - zustand for state management
  - socket.io-client
  - use @use-gesture/react for gesture / drag and drop code
  - cors support for rest api and socletio calls

## backend development guidelines
  - uses node.js backend with esm javascript, 
  - express, 
  - json database, 
  - socket.io, 
  - cors support for all rest and socletio responses, 
  - package.json "script" has commands such as "npm run build", "npm run start", "npm run dev". 
  - the backend folder should also have .gitignore file to avoid commiting "node_modules" folder to git
        `,

        errorMessage: `

        `
      },
      (stream) => {
        //
        const resp = JSON.parse(stream)
        console.log(resp)

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
          <div className="w-full">
            <Brain></Brain>
          </div>

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
