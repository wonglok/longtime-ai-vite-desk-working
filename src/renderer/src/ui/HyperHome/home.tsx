// import { AppSidebar } from '@/components/app-sidebar'
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator
} from '@/components/ui/breadcrumb'
// import { Separator } from '@/components/ui/separator'
// import { useEffect } from 'react'
// SidebarInset, SidebarProvider,
import { SidebarTrigger } from '@/components/ui/sidebar'
import { AuraBar } from '@renderer/effects/AuraBar'
import { HyperHome } from './HyperHome'

export function WorkHome({ name }) {
  return (
    <>
      <div className="w-full h-full relative">
        {/* <div className=" absolute top-0 left-0 w-full h-full">
          <AuraBar></AuraBar>
        </div> */}

        <header className=" relative flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12">
          <div className=" absolute top-0 left-0 w-full h-full opacity-100">
            <AuraBar></AuraBar>
          </div>
          <div className=" absolute top-0 left-0 w-full h-full flex items-center justify-start">
            <div className="flex items-center gap-2 px-4">
              <SidebarTrigger className="-ml-1" />
              {/* <Separator orientation="vertical" className="mr-2 data-[orientation=vertical]:h-4" /> */}
              <Breadcrumb>
                <BreadcrumbList>
                  <BreadcrumbItem className="">
                    <BreadcrumbLink href="#/">Home</BreadcrumbLink>
                  </BreadcrumbItem>
                  <BreadcrumbSeparator className="" />
                  <BreadcrumbItem>
                    <BreadcrumbPage>Space: {name}</BreadcrumbPage>
                  </BreadcrumbItem>
                </BreadcrumbList>
              </Breadcrumb>
            </div>
          </div>
        </header>
        <HyperHome name={name}></HyperHome>
      </div>
    </>
  )
}

//
