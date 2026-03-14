import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { useEffect, useState } from 'react'
// @ts-ignore
import { useArchApp } from './useArchApp'

export function ArrayBlock({}) {
  //'

  const appSystemPrompt = useArchApp((r) => r.appSystemPrompt)
  const appUserPrompt = useArchApp((r) => r.appUserPrompt)
  const plan = useArchApp((r) => r.plan)
  const stream = useArchApp((r) => r.stream)

  const [stopFunc, setStop] = useState<any>(() => {
    return () => {}
  })

  useEffect(() => {
    return () => {
      stopFunc()
    }
  }, [stopFunc])

  const onClick = async () => {
    const controller = window.api.askAI(
      {
        baseURL: `http://localhost:1234/v1`,

        apiKey: 'N/A',

        route: 'runRecursive',

        model: `qwen/qwen3.5-4b`,

        //
        // model: `qwen/qwen3.5-35b-a3b`,
        //
        // model: `qwen/qwen3.5-9b`,
        // model: `qwen/qwen3.5-4b`,
        // model: `openai/gpt-oss-20b`,

        folder: `recursive`,

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

        if (resp.type === 'plan') {
          if (resp.plan) {
            console.log(JSON.stringify(resp.plan, null, '\t'))
            useArchApp.setState({
              plan: resp.plan
            })
          }
        }
        if (resp.type === 'stream') {
          if (resp.stream) {
            useArchApp.setState({
              stream: resp.stream
            })
          }
        }
      }
    )

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
      <div>
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
            <Button className="mr-3" onClick={onClick}>
              Think
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
          </div>
          <pre className="text-xs whitespace-pre-wrap">{stream}</pre>
        </div>
      </div>
    </>
  )
}
