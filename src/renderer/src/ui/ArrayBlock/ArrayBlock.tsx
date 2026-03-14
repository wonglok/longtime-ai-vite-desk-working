import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { useEffect, useState } from 'react'
// @ts-ignore
import { useArchApp } from './useArchApp'

export function ArrayBlock({}) {
  //'

  const [working, setWorking] = useState(false)

  const appSystemPrompt = useArchApp((r) => r.appSystemPrompt)
  const appUserPrompt = useArchApp((r) => r.appUserPrompt)
  // const plan = useArchApp((r) => r.plan)
  // const stream = useArchApp((r) => r.stream)

  const [stopFunc, setStop] = useState<any>(() => {
    return () => {}
  })

  useEffect(() => {
    return () => {
      stopFunc()
    }
  }, [stopFunc])

  const onClick = async () => {
    setWorking(true)
    const controller = window.api.askAI(
      {
        baseURL: `http://localhost:1234/v1`,

        apiKey: 'N/A',

        route: 'runAppPlanner',

        model: `qwen/qwen3.5-4b`,

        // model: `qwen/qwen3.5-35b-a3b`,
        //
        // model: `qwen/qwen3.5-9b`,
        // model: `qwen/qwen3.5-4b`,
        // model: `openai/gpt-oss-20b`,

        appName: `inspiration-book`,

        appSystemPrompt: `
${appSystemPrompt}
        `,
        appUserPrompt: `
${appUserPrompt}
        `
      },
      (stream) => {
        //
        const resp = JSON.parse(stream)

        if (resp.type === 'stream') {
          if (resp.stream) {
            useArchApp.setState({
              stream: resp.stream
            })
          }
        }

        if (resp.type === 'todo') {
          if (resp.todo) {
            useArchApp.setState({
              todo: resp.todo
            })
          }
        }
      }
    )

    controller.getDataAsync().then(() => {
      setWorking(false)
    })

    setStop((oldStop) => {
      if (typeof oldStop === 'function') {
        oldStop()
      }
      return () => {
        controller.abort()
      }
    })
  }
  return (
    <>
      <div className="flex">
        <div className="p-2 mb-2 rounded-2xl border">
          {/* <Textarea
            value={appSystemPrompt}
            onChange={(ev) => {
              useArchApp.setState({
                appSystemPrompt: ev.target.value
              })
            }}
            className="mb-2"
            rows={30}
          ></Textarea> */}

          <Textarea
            value={appUserPrompt}
            onChange={(ev) => {
              useArchApp.setState({
                appUserPrompt: ev.target.value
              })
            }}
            rows={100}
            className="mb-2"
          ></Textarea>

          <div>
            <Button
              className="mr-3"
              disabled={working}
              style={{
                backgroundColor: working ? `#17ac17` : ``
              }}
              onClick={onClick}
            >
              {working ? `Running` : `Plan and Build`}
            </Button>
            <Button
              className="mr-3"
              variant={'destructive'}
              onClick={() => {
                stopFunc()
              }}
            >
              Stop
            </Button>
            {/* <Button
              className="mr-3"
              variant={'default'}
              onClick={() => {
                copy(stream)
              }}
            >
              Copy
            </Button> */}
          </div>

          {/* <pre className="text-xs whitespace-pre-wrap">{stream}</pre> */}
        </div>
      </div>
    </>
  )
}
