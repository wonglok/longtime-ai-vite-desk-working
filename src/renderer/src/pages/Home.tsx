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
import { ErrorMsg } from '@renderer/ui/TodoManagement/ErrorMsg'
// import { TodoManagement } from '@renderer/ui/TodoManagement/TodoManagement'

import { useEffect, useState } from 'react'

// @ts-ignore
import systemPt from '../prompts/system.md?raw'
import { toast } from 'sonner'
import nprogress from 'nprogress'
import 'nprogress/nprogress.css'
import { Brain } from '@renderer/ui/TodoManagement/Brain'
import { resolve } from 'path'
import { TodoManagement } from '@renderer/ui/TodoManagement/TodoManagement'

// import { TodoManagement } from '@renderer/ui/TodoManagement/TodoManagement'
// import { ActionsTerm } from '@renderer/ui/TodoManagement/ActionsTerm'
// import { Brain } from '@renderer/ui/TodoManagement/Brain'

export function Home() {
  // let [messages, setContextMessages] = useState([])
  let [stopFunc, setStop] = useState<any>(null)

  useEffect(() => {
    const controller = window.api.askAI(
      {
        baseURL: `http://localhost:1234/v1`,

        apiKey: 'N/A',

        route: 'runAgent',

        model: `qwen/qwen3.5-4b`,

        // model: `qwen/qwen3.5-9b`,
        // model: `qwen/qwen3-coder-30b`,
        // model: `qwen/qwen3.5-9b`,
        // model: `qwen/qwen3.5-9b`,
        // model: `openai/gpt-oss-20b`,

        folder: `inspire-book`,

        systemPrompt: `
${systemPt}
`,

        appIdea: ``.trim(),

        modifyMessage: `

        `,

        errorMessage: `
        
        `
      },
      (stream) => {
        //
        const resp = JSON.parse(stream)

        // if (resp.type !== 'brain') {
        //   console.log(resp)
        // }

        // if (resp.type === 'messages') {
        //   setContextMessages(resp.messages || [])
        // }
        if (resp.type === 'todo') {
          useTM.setState({ todo: resp.todo })
        }
        if (resp.type === 'error') {
          useTM.setState({ error: resp.error })
        }
        if (resp.type === 'brain') {
          useTM.setState({ brain: resp.brain })
        }

        if (resp.type === 'cmd_begin') {
          toast(resp.cmd_begin)
          nprogress.start()
        }
        if (resp.type === 'cmd_end') {
          nprogress.done()
        }

        if (resp.type === 'stream') {
          console.log(resp.stream)

          useTM.setState({ stream: resp.stream })
        }

        if (resp.type === 'terminalCalls') {
          useTM.setState({ terminalCalls: resp.terminalCalls })
        }
      }
    )

    window.onbeforeunload = () => {
      controller.abort()
      setTimeout(() => {
        window.location.reload()
      })
      window.onbeforeunload = undefined
      return false
    }

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

        <div className="gap-4 p-4 pt-0 w-full">
          <div>
            {stopFunc && (
              <Button
                variant={'destructive'}
                onClick={() => {
                  stopFunc()
                }}
              >
                STOP PROCESS IMMEDIATELY
              </Button>
            )}
            {<ErrorMsg></ErrorMsg>}
          </div>

          <div className="flex mb-3">
            <TodoManagement></TodoManagement>
          </div>

          <div className="w-full">
            <Brain></Brain>
          </div>

          <div className="w-full flex">
            <div className="w-2/3">{/* <ActionsTerm></ActionsTerm> */}</div>
          </div>

          <div className="text-xs w-full overflow-x-scroll">
            {/* {messages.map((msg: any, i) => {
              return (
                <li key={'k' + i} className="border p-2 mb-2 rounded-2xl">
                  <div className="text-xs whitespace-pre-wrap p-2 bg-gray-100 border rounded-lg">
                    {msg?.content.trim()}
                  </div>
                </li>
              )
            })} */}

            {/*  */}
            {/* <pre>{workstep}</pre> */}
            {/*  */}
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
