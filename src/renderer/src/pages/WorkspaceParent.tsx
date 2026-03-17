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
// import { ArrayBlock } from '@renderer/ui/ArrayBlock/ArrayBlock'
// import { TodoKanban } from '@renderer/ui/ArrayBlock/TodoKanban'
// import { Brain } from '@renderer/ui/ArrayBlock/Brain'
// import { MsgBlock } from '@renderer/ui/ArrayBlock/MsgBlock'
// import { Term } from '@renderer/ui/ArrayBlock/Term'
// import { SearchBar } from '@renderer/effects/SearchBar'

export function WorkspaceParent({ name = '', children }) {
  return (
    <SidebarProvider>
      <AppSidebar name={name} />
      <SidebarInset>{children}</SidebarInset>
    </SidebarProvider>
  )
}
