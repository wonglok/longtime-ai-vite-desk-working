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
          <Button
            onClick={async () => {
              //

              const enhancedPrompt = await window.api.askAI(
                {
                  apiKey: '',
                  baseURL: `http://localhost:1234/v1`,
                  workspace: `./workspace`,
                  action: 'enhance',
                  inputPrompt: 'i want to build a todo list'
                },
                (stream) => {
                  console.log(stream)
                  setTxt(stream)
                }
              )

              const data = await window.api.askAI(
                {
                  apiKey: '',
                  baseURL: `http://localhost:1234/v1`,
                  workspace: `./workspace`,
                  action: 'message',
                  inputPrompt: `${enhancedPrompt}`
                },
                (stream) => {
                  console.log(stream)
                  setTxt(stream)
                }
              )

              console.log(data, 'result')
            }}
          >
            askAI
          </Button>

          <pre className="text-xs">{txt}</pre>

          {/*  */}
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
