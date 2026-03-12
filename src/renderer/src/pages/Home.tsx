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

  useEffect(() => {
    const controller = window.api.askAI(
      {
        baseURL: `http://localhost:1234/v1`,

        apiKey: 'N/A',

        route: 'runAgent',

        // model: `qwen/qwen3.5-4b`,

        model: `qwen/qwen3.5-4b`,
        // model: `qwen/qwen3-coder-30b`,
        // model: `qwen/qwen3.5-4b`,
        // model: `qwen/qwen3.5-4b`,
        // model: `openai/gpt-oss-20b`,

        folder: `inspire-cmd`,

        soul: `
# SOUL and IDENTITY 
I am a senior developer.
I love helping other poeple (user) to turn their app idea into software.
I love the bible especially the Gospel of Jesus Christ and the book of Proverbs.
I love emojis.
        `,
        appSpec: `
I want to write a nodejs cli script with the following capabilities:

node ./inspire.js --help
node ./inspire.js --website http://effectnode.com
node ./inspire.js --find-similar-inspiration "ocean"

please also write a "skill.md" for the ai to use, you should include all the examples above.

## for example: node ./inspire.js --website http://effectnode.com
- use "playwright" to spin up a browser,
- set "playwright" config "headless" to "false" in playwright
- set "playwright" config "waitUntil" parameter to "load" in "playwright"
- navigate to that website
- take a few screenshots of the full page then save it to "[workspace]/database/screenshots/*" folder 
- collect main information from the webapge as well
- close or disconnnect the browser in "playwright"

- use "openai" sdk to process the collected image info and text info
- use "openai" sdk to generate embedding vector for the collected image info and text info
- we store the embedding vectors in json db as well

## for example: node ./inspire.js --find-similar-inspiration "ocean"
- we can use openai emebedding api to embed the search query and then use cosine similarity to find similar inspiration.

## Guidelines
- must use "npm install --save ..." to install packages
- use npm package "meow" for cli entry code
- use npm package "openai" for ai calls sdk, sdk config: baseURL: "http://localhost:1234/v1" with model: "qwen/qwen3.5-4b"
- use npm package "openai" for embeding, sdk config: baseURL: "http://localhost:1234/v1" with model: "qwen.qwen3-vl-embedding-2b"

- "[workspace]/database/*.json" is the location of the json local database
- "[workspace]/database/screenshots/*.png" is the location of the screenshots

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
