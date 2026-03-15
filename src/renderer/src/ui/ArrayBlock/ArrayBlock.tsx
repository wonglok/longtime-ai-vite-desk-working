import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { useEffect, useState } from 'react'
// @ts-ignore
import { useArchApp } from './useArchApp'
import nprogress from 'nprogress'
import { toast } from 'sonner'

export function ArrayBlock({}) {
  //'

  const [working, setWorking] = useState(false)

  const appName = useArchApp((r) => r.appName)
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

        model: `qwen/qwen3.5-9b`,

        appName: `${appName}`,

        appSystemPrompt: `
${appSystemPrompt}
        `,
        appUserPrompt: `
${appUserPrompt}
        `
        //
      },
      (stream) => {
        //
        const resp = JSON.parse(stream)

        if (resp.type === 'stream') {
          if (resp.stream && resp.agentName) {
            useArchApp.setState({
              [`stream${resp.agentName}`]: resp.stream
            })
          }
          if (!resp.agentName) {
            useArchApp.setState({
              [`stream`]: resp.stream
            })
          }
        }

        if (resp.type === 'todo') {
          if (resp.todo && resp.agentName) {
            useArchApp.setState({
              [`todo${resp.agentName}`]: resp.todo
            })
          }
        }

        if (resp.type === 'cmd_begin') {
          // toast.info(resp['cmd_begin'])
          nprogress.start()

          // if (resp.cmd_begin && resp.agentName) {
          //   useArchApp.setState({
          //     [`cmd_begin${resp.agentName}`]: resp.cmd_begin
          //   })
          // }
        }

        if (resp.type === 'cmd_end') {
          toast.success(
            <>
              <div style={{ fontSize: '12px' }} className=" whitespace-pre-wrap py-3 ">
                {resp['cmd_end']}
              </div>
            </>,
            {
              duration: 1000,
              style: {
                width: `750px`
              }
            }
          )
          nprogress.done()
        }
      }
    )

    controller.getDataAsync().then(() => {
      setWorking(false)
    })

    window.onbeforeunload = () => {
      controller.abort()
      window.onbeforeunload = undefined
      return true
    }

    setStop((oldStop) => {
      if (typeof oldStop === 'function') {
        oldStop()
      }
      return () => {
        setWorking(false)
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
            value={appName}
            onChange={(ev) => {
              useArchApp.setState({
                appName: ev.target.value
              })
            }}
            rows={1}
            className="mb-2"
          ></Textarea>

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
