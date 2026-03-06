import {
  ChainOfThought,
  ChainOfThoughtContent,
  ChainOfThoughtHeader,
  ChainOfThoughtStep
} from '@/components/ai-elements/chain-of-thought'
import { AppSidebar } from '@/components/app-sidebar'
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator
} from '@/components/ui/breadcrumb'
import { Separator } from '@/components/ui/separator'
import { SidebarInset, SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar'
import { useEffect, useState } from 'react'

export function Home() {
  let [notice, setNotice] = useState('')
  let [side, setSide] = useState('')
  let [terminal, setTerm] = useState('')
  let [workbox, setWorkbox] = useState('')
  let [think, setThink] = useState('')

  useEffect(() => {
    const controller = window.api.askAI(
      {
        apiKey: 'NA',
        baseURL: `http://localhost:1234/v1`,

        model: `qwen/qwen3.5-9b`,

        folder: `my-app-001`,

        action: 'message',

        appSpec: `
User's App idea:
  - I want to build a todo app 
  - with kanban ui drag and drop 
  - with collaborative realtime update features
  - with mouse crusor of each visitor on screen (html div with transform translate)

Frontend Technical Requirements:
  - git init if there's no git
  - use a vite project with react disable linting, use javascript instead of typescript
  - npm install socket.io-client 
  - socket.io-client should support cors, any domain
  - use "3002" as frontend port

Backend Technical Requirements: 
  - git init if there's no git
  - start a nodejs backend 
  - npm init -y
  - npm install express socket.io 
  - use commonjs in package.json
  - write dev script in package.json
  - create .gitignore for "node_modules" folder and "dist" folder
  - socket.io-client should support cors, any domain
  - support cors, any domain
  - use "3001" as backend port
  - use json file database
          `
      },
      (stream) => {
        const data = JSON.parse(stream)
        // console.log(data)
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
      }
    )

    return () => {
      controller.abort()
      setThink('')
      setNotice('')
      setTerm('')
    }
  }, [])

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

        <div className="gap-4 p-4 pt-0">
          <pre className="text-xs py-5 px-5 w-full whitespace-pre-wrap">{notice}</pre>
          {/*  */}
          <ChainOfThought>
            <ChainOfThoughtContent>
              <ChainOfThoughtHeader>Thinking</ChainOfThoughtHeader>
              <ChainOfThoughtStep label={think} status={'active'} className="whitespace-pre-wrap" />
            </ChainOfThoughtContent>
          </ChainOfThought>

          <div className="flex">
            <div className="w-1/2">
              <pre className="text-xs py-5 px-5 w-full whitespace-pre-wrap">{workbox}</pre>
              <pre className="text-xs py-5 px-5 w-full whitespace-pre-wrap">{terminal}</pre>
            </div>
            <div className="w-1/2">
              <pre className="text-xs py-5 px-5 w-full whitespace-pre-wrap">{side}</pre>
            </div>
          </div>

          {/*  */}
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
