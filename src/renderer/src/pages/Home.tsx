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
import { useState } from 'react'

export function Home() {
  let [txt, setTxt] = useState('')
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

          <Button
            onClick={async () => {
              //

              const data = await window.api.askAI(
                {
                  apiKey: '',
                  baseURL: `http://localhost:1234/v1`,
                  model: 'qwen3.5-9b',

                  folder: `my-app-01`,

                  action: 'message',
                  prompt: `
                  App idea:
                    - i want to build a kanban drag and drop todo app.

                  Frontend:
                    - reactjs with vite
                    - socket io client
                    - three.js
                    - @react-three/fiber @react-three/drei

                  Backend: 
                    - express js 
                    - socket-io powered collaboration features 
                    - json file database
                  `
                },
                (stream) => {
                  console.log(stream)
                  setTxt(`${stream}`)
                }
              )

              console.log(data, 'result')
            }}
          >
            askAI
          </Button>

          <pre className="text-xs px-5 w-full whitespace-pre-wrap">{txt}</pre>

          {/*  */}
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
