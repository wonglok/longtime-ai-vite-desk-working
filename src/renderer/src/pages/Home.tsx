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
import { useEffect, useState } from 'react'

export function Home() {
  let [messages, setMessages] = useState([])
  let [workstep, setWorkstep] = useState(null)
  let [notice, setNotice] = useState('')
  let [side, setSide] = useState('')
  let [terminal, setTerm] = useState('')
  let [workbox, setWorkbox] = useState('')
  let [think, setThink] = useState('')
  let [stopFunc, setStop] = useState<any>(null)

  useEffect(() => {
    const controller = window.api.askAI(
      {
        baseURL: `http://localhost:1234/v1`,
        apiKey: 'N/A',

        // model: `qwen/qwen3.5-35b-a3b`,
        model: `qwen3.5-9b`,

        folder: `my-app-001`,

        action: 'message',

        appSpec: `I want to build a todo app with kanban ui with collaborative realtime update with drag and drop feature and mouse crusor of each visitor as well

frontend uses react, "@use-gesture/react"
backend uses json db, express and socketio with cors support
          `
      },
      (stream) => {
        //
        const data = JSON.parse(stream)
        console.log(data)

        if (data.type === 'workstep') {
          setWorkstep(data.text)
        }
        if (data.type === 'side') {
          setSide(data.text)
        }
        if (data.type === 'think') {
          setThink(data.text)
        }
        if (data.type === 'workbox') {
          setWorkbox(data.text)
        }
        if (data.type === 'notice') {
          setNotice(data.text)
        }
        if (data.type === 'terminal') {
          setTerm(data.text)
        }
        if (data.type === 'messages') {
          setMessages(JSON.parse(data.text))
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
      setWorkbox('')
      setSide('')
      setThink('')
      setNotice('')
      setTerm('')
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

        <div className="gap-4 p-4 pt-0  h-full">
          <div className="text-xs">
            {messages.map((msg: any, i) => {
              return (
                <li key={'k' + i} className="border m-2 p-2">
                  <pre>{msg?.content.trim()}</pre>
                </li>
              )
            })}
            {/* <pre>{workstep}</pre> */}
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
