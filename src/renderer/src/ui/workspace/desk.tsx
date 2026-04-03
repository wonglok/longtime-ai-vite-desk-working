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
import { Environment, OrbitControls, PerspectiveCamera, useEnvironment } from '@react-three/drei'
import { Canvas, useThree } from '@react-three/fiber'
import { AuraEffect } from '@renderer/effects/AuraEffect'
// import { SearchBar } from '@renderer/effects/AuraBar'

import { Suspense, useEffect } from 'react'

// import hdr from './assets/brown_photostudio_02_1k.hdr?url'
import { CanvasGPU } from './3d/CanvasGPU/CanvasGPU'
import { DiamondCompos } from './3d/DiamondTSL/DiamondComponent'
import { BloomPipeline } from './3d/CanvasGPU/BloomPipeline'
import { DiamondCanvas } from './3d/DiamondTSL/DiamondCanvas'

//

export function WorkDesk({ name = '' }) {
  //

  console.log('name', name)

  return (
    <>
      <div className="w-full h-full relative">
        {/*  */}
        {/* <DiamondCanvas></DiamondCanvas> */}
        {/*  */}
      </div>
    </>
  )
}
