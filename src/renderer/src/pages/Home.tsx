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

import 'nprogress/nprogress.css'
import { ArrayBlock } from '@renderer/ui/ArrayBlock/ArrayBlock'
import { TodoKanban } from '@renderer/ui/ArrayBlock/TodoKanban'
import { Brain } from '@renderer/ui/ArrayBlock/Brain'
// import { SearchBar } from '@renderer/effects/SearchBar'

export function Home() {
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

        <div className="px-4">
          <ArrayBlock></ArrayBlock>

          <div className="flex mb-3 space-x-3">
            <TodoKanban agentName="frontend"></TodoKanban>
            <TodoKanban agentName="backend"></TodoKanban>
          </div>

          <div className="flex mb-3 space-x-3">
            <Brain agentName="frontend"></Brain>
            <Brain agentName="backend"></Brain>
          </div>

          {/*  */}
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
