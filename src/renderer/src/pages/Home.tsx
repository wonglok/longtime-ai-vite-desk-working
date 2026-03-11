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
import { ActionsTerm } from '@renderer/ui/TodoManagement/ActionsTerm'
import { ErrorMsg } from '@renderer/ui/TodoManagement/ErrorMsg'
// import { Brain } from '@renderer/ui/TodoManagement/Brain'
import { TodoManagement } from '@renderer/ui/TodoManagement/TodoManagement'
import { useEffect, useState } from 'react'

export function Home() {
  let [messages, setContextMessages] = useState([])
  let [stopFunc, setStop] = useState<any>(null)

  //

  useEffect(() => {
    const controller = window.api.askAI(
      {
        baseURL: `http://localhost:1234/v1`,

        apiKey: 'N/A',

        route: 'runAgent',

        model: `qwen/qwen3.5-35b-a3b`,

        // model: `qwen/qwen3-coder-30b`,
        // model: `qwen/qwen3.5-9b`,
        // model: `qwen/qwen3.5-4b`,
        // model: `openai/gpt-oss-20b`,

        folder: `ins`,

        soul: `
# SOUL and IDENTITY 
I am a senior developer.
I love helping other poeple (user) to turn their app idea into software.
I love the bible especially the Gospel of Jesus Christ and the book of Proverbs.
        `,
        appSpec: `
## NextJS App idea
  - init a nextjs app in standalone mode with a json-db in "[workspace]/data" folder
  - build an app to collect inspiration from websites
  - it has a dashboard ui to show a grid of different inspiration with thumbnails
  - when i click it it shows a detailed page

## add inspiration website
  - create a new inspiration post with postid in jsondb
  - use "playwright" to spin up a browser, set "headless" to "false" in playwright, set "waitUntil" parameter to "load" in "playwright"
  - navigate to that website
  - take a few screenshots of the full page into to a folder "[workspace]/public/public-data/screenshots/[postid]/*"
  - collect main information in "[workspace]/public/public-data/json/[postid]/*"

## Analyse the information collected 
  - use OpenAI NodeJS SDK in npm "openai" to analyse the screenshots and collected json in the folder
  - showing the web URL of file and the relative path of "OS folder location" to the json / the screenshot
  - close or disconnnect the browser in "playwright"

## feature of using OpenAI SDK npm moudle: "openai" 
  let's use "openai" npm module.
  the baseURL for openai would be http://localhost:1234/v1
  use "qwen/qwen3.5-35b-a3b" model

  `.trim(),

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

        if (resp.type === 'messages') {
          setContextMessages(resp.messages || [])
        }
        if (resp.type === 'todo') {
          useTM.setState({ todos: resp.todo })
        }
        if (resp.type === 'error') {
          useTM.setState({ error: resp.error })
        }
        if (resp.type === 'brain') {
          useTM.setState({ brain: resp.brain })
        }

        if (resp.type === 'terminalCalls') {
          useTM.setState({ terminalCalls: resp.terminalCalls })
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

          <div className="flex">
            <TodoManagement></TodoManagement>
          </div>
          <div className="w-full">{/* <Brain></Brain> */}</div>

          <div className="w-full flex">
            <div className="w-2/3">
              <ActionsTerm></ActionsTerm>
            </div>
          </div>

          <div className="text-xs w-full overflow-x-scroll">
            {messages.map((msg: any, i) => {
              return (
                <li key={'k' + i} className="border m-2 p-2">
                  <pre>{msg?.content.trim()}</pre>
                </li>
              )
            })}

            {/*  */}
            {/* <pre>{workstep}</pre> */}
            {/*  */}
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
