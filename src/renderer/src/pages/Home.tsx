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
  let [txt, setTxt] = useState('')

  const onClickAsk = async () => {
    //

    const data = await window.api.askAI(
      {
        apiKey: '',
        baseURL: `http://localhost:1234/v1`,

        model: 'qwen3.5-9b',
        // model: `qwen3.5-4b`,

        folder: `my-app-001`,

        action: 'message',
        prompt: `
App idea:
  - I want to build a todo app with kanban ui drag and drop with collaborative realtime update features.

Backend Technical Requirements: 
  - git init if there's no git
  - starta a express js project with socket.io 
  - use common js in package.json
  - support cors, any domain
  - use "3001" as frontend service port
  - use "3002" as backend service port
  - use socket-io powered collaboration features 
  - use json file database

Frontend Technical Requirements:
  - git init if there's no git
  - use a vite project with react disable linting, use javascript instead of typescript
  - use "3001" as frontend service port
  - use "3002" as backend service port
  - support cors, any domain
  - use socket.io-client powered collaboration features 

Todo list:
- [] todo app with all above features developed.

Guidelines: 
MUST Work within the workspace folder. 
Check the box when you fullfilled the requirement.
For every step update the todo list using task manager and also set next step using task manager.
When is app is fully built, update using task manager, then start the backend and frontend server.
          `
      },
      (stream) => {
        setTxt(`${stream.replace(/\<think\>/gi, '').replace(/\<\/think\>/gi, '')}`)
      }
    )

    console.log(data, 'result')
  }

  useEffect(() => {
    onClickAsk()
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

        <div className="gap-4 p-4 pt-0">
          {/*  */}

          {/*  */}

          {/*  */}

          <Button onClick={onClickAsk}>askAI</Button>

          <pre className="text-xs py-5 px-5 w-full whitespace-pre-wrap">{txt}</pre>

          {/*  */}
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
