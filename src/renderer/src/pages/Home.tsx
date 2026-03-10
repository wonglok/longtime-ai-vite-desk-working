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

        model: `qwen/qwen3.5-35b-a3b`,

        folder: `todo-app`,

        appSpec: `
## app idea
I want to build a fullstack todo kanban drag and drop ap 
- with realtime updates
- showing mouse position of each page visitor

## folders
  - [project-folder]/frontend/* (frontend folder)
  - [project-folder]/backend/* (backend folder)

## frontend requirements
  - uses vite with react.js, esm javascript, 
  - zustand for global state management and 
  - socket.io-client, 
  - cors support for rest api and socletio calls

## backend requirements
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

  //
  //

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

        <div className="gap-4 p-4 pt-0 h-full w-full">
          <TodoManagement></TodoManagement>
          <ActionsTerm></ActionsTerm>

          <div className="text-xs">
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
          <div className="flex h-full">
            {stopFunc && (
              <Button
                variant={'destructive'}
                onClick={() => {
                  stopFunc()
                }}
              >
                STOP
              </Button>
            )}

            {/* <div className="w-1/2  h-full">
              <pre className="text-xs  w-full whitespace-pre-wrap">{notice}</pre>
              <pre className="text-xs  w-full whitespace-pre-wrap">{think}</pre>
              <pre className="text-xs  w-full whitespace-pre-wrap">{workbox}</pre>
              <pre className="text-xs  w-full whitespace-pre-wrap">{terminal}</pre>
            </div> */}
            {/* <div className="w-1/2 h-full">
              <pre className="text-xs  w-full whitespace-pre-wrap">
                

                <div>{side}</div>
              </pre>
            </div> */}
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
