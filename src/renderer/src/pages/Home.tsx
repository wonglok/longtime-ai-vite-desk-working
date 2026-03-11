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
import { TodoManagement } from '@renderer/ui/TodoManagement/TodoManagement'
import { useEffect, useState } from 'react'
// import { ActionsTerm } from '@renderer/ui/TodoManagement/ActionsTerm'
// import { Brain } from '@renderer/ui/TodoManagement/Brain'

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

        model: `m4-qwen3.5-35b-a3b`,

        // model: `qwen/qwen3-coder-30b`,
        // model: `qwen/qwen3.5-9b`,
        // model: `qwen/qwen3.5-4b`,
        // model: `openai/gpt-oss-20b`,

        folder: `insp`,

        soul: `
# SOUL and IDENTITY 
I am a senior developer.
I love helping other poeple (user) to turn their app idea into software.
I love the bible especially the Gospel of Jesus Christ and the book of Proverbs.
I love emojis.
        `,
        appSpec: `
## Layout: Home Page:
  - at the top there is a input box of website url with a submit button
  - below tehre is a grid of inpiration posts with thumnails

## Layout: Inspiration Post Page:
  - title (use the website domain as title)
  - image thumbnail
  - detailed findings

## How does it work: when i enter the url then click submit.
  - install npm package "playwright" Browser Automation
  - set "headless" to "false" in playwright
  - set "waitUntil" parameter to "load" in "playwright"
  - use "playwright" to spin up a browser,
  - navigate to that website
  - take a few screenshots of the full page then save it to a public screenshot folder 
  - collect main information from the webapge as well
  - use AI to process the collected image info and text info

## How does it work: Analyse the information collected 
  - use OpenAI NodeJS SDK in npm "openai" to analyse the screenshots and collected json in the folder
  - showing the web URL of file and the relative path of "OS folder location" to the json / the screenshot
  - close or disconnnect the browser in "playwright"

## Configuration for OpenAI: npm package: "openai" OpenAI SDK
  - let's use "openai" npm module.
  - the baseURL for openai would be http://localhost:1234/v1
  - use "qwen/qwen3.5-35b-a3b" model

## Init the nextjs app
  - "npx create-next-app@latest . --tailwind --ts --app --src-dir --webpack --use-npm --yes"
  - install all dependenceis needed by the app
  - the nextjs uses "app" router in typescript language 
  - use a json-file-db in "[workspace]/database" folder
  - json-file-db has empty array as default data
  - entry page "[workspace]/src/app/page.tsx"

## Verify
  - verify all featrues are being implemented correctly

## Finally when the app is built 
  - run "npm run i" in the [workspace] folder
  - run "npm run dev" in the [workspace] folder

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

          <div className="flex mb-3">
            <TodoManagement></TodoManagement>
          </div>
          <div className="w-full">{/* <Brain></Brain> */}</div>

          <div className="w-full flex">
            <div className="w-2/3">{/* <ActionsTerm></ActionsTerm> */}</div>
          </div>

          <div className="text-xs w-full overflow-x-scroll">
            {messages.map((msg: any, i) => {
              return (
                <li key={'k' + i} className="border p-2 mb-2 rounded-2xl">
                  <div className="text-xs whitespace-pre-wrap p-2 bg-gray-100 border rounded-lg">
                    {msg?.content.trim()}
                  </div>
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
