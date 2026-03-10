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
import { TodoManagement } from '@renderer/ui/TodoManagement/TodoManagement'
import { useEffect, useState } from 'react'

export function Home() {
  let [messages, setContextMessages] = useState([])
  let [stopFunc, setStop] = useState<any>(null)

  // let [workstep, setWorkstep] = useState(null)
  // let [notice, setNotice] = useState('')
  // let [side, setSide] = useState('')
  // let [terminal, setTerm] = useState('')
  // let [workbox, setWorkbox] = useState('')
  // let [think, setThink] = useState('')

  useEffect(() => {
    const controller = window.api.askAI(
      {
        baseURL: `http://localhost:1234/v1`,
        apiKey: 'N/A',

        model: `qwen/qwen3.5-35b-a3b`,
        // model: `qwen3.5-9b`,

        folder: `todo-app`,

        action: 'message',

        appSpec: `
I want to build a todo app.

"[project-folder]/" folder has a package.json with scripts support commands such as: "npm run dev", "npm run build", "npm run start" command
"[project-folder]/frontend" folder uses astro with reactjs and socket.io-client 
"[project-folder]/backend" folder uses modules node.js, typescript, express js, json database, socket.io, package.json "script" has commands such as { "dev": "nodemon ./server.js",  "start": "node ./server.js" } 
        `
      },
      (stream) => {
        //
        const resp = JSON.parse(stream)
        console.log(resp)

        //

        // if (resp.type === 'workstep') {
        //   setWorkstep(resp.text)
        // }
        // if (resp.type === 'side') {
        //   setSide(resp.text)
        // }
        // if (resp.type === 'think') {
        //   setThink(resp.text)
        // }
        // if (resp.type === 'workbox') {
        //   setWorkbox(resp.text)
        // }
        // if (resp.type === 'notice') {
        //   setNotice(resp.text)
        // }
        // if (resp.type === 'terminal') {
        //   setTerm(resp.text)
        // }

        //

        if (resp.type === 'messages') {
          setContextMessages(resp.messages || [])
        }
        if (resp.type === 'todo') {
          console.log(resp.todo)
          useTM.setState({ todos: resp.todo })
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
