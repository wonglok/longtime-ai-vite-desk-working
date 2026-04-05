import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { useEffect, useState } from 'react'
// @ts-ignore
import { useArchApp } from './useArchApp'
import nprogress from 'nprogress'
import { toast } from 'sonner'
import { useHome } from '../HyperHome/useHome'
// import { generate } from 'random-words'

export function ArrayBlock({}) {
  const workspace = useHome((r) => r.workspace)

  //
  //
  //

  const appName = useArchApp((r) => r.appName)
  const appUserPrompt = useArchApp((r) => r.appUserPrompt)
  const appModel = useArchApp((r) => r.appModel)
  const baseURL = useArchApp((r) => r.baseURL)
  const apiKey = useArchApp((r) => r.apiKey)
  const seed = useArchApp((r) => r.seed)

  const [working, setWorking] = useState(false)
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
        baseURL: baseURL || `http://localhost:1234/v1`,

        apiKey: apiKey || 'nono',

        route: 'runAppPlanner',

        // model: `qwen/qwen3.5-4b`,

        model: `${appModel}`,

        appName: `${appName}-${seed}`,

        appUserPrompt: `${appUserPrompt}`,

        workspace: `${workspace}`
      },
      (stream) => {
        //
        const resp = JSON.parse(stream)

        if (resp.alldone) {
          setWorking(false)
        }

        if (resp.done) {
          nprogress.done()
          useArchApp.setState({ done: resp.done })
        }

        if (resp.init) {
          useArchApp.setState({ terminalWindow: resp.init })
        }

        if (resp.blocks) {
          useArchApp.setState({ blocks: resp.blocks })
        }

        if (resp.beforeRun) {
          nprogress.start()
          useArchApp.setState({ terminalCalls: resp.beforeRun })
        }
        if (resp.duringRun) {
          useArchApp.setState({ terminalCalls: resp.duringRun })
        }
        if (resp.afterRun) {
          nprogress.done()
          useArchApp.setState({ terminalCalls: resp.afterRun })
        }

        if (resp.type === 'messages') {
          if (resp.messages instanceof Array) {
            useArchApp.setState({ messages: resp.messages })
          }
        }

        if (resp.type === 'thinking') {
          useArchApp.setState({ thinking: resp.thinking })
        }

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

        if (resp.type === 'todo' && resp.todo instanceof Array) {
          if (resp.todo && resp.agentName) {
            useArchApp.setState({
              [`todo${resp.agentName}`]: resp.todo
            })
          } else {
            useArchApp.setState({
              [`todo`]: resp.todo
            })
          }
        }

        if (resp.type === 'nProgressStart') {
          nprogress.start()
        }
        if (resp.type === 'nProgressEnd') {
          nprogress.done()
        }

        if (resp.type === 'cmd_begin') {
          useArchApp.setState({ cmd_begin: resp.cmd_begin })
          // toast.info(resp['cmd_begin'])

          nprogress.start()

          if (resp.cmd_begin.includes('npm install')) {
            toast.success(
              <>
                <div style={{ fontSize: '12px' }} className=" whitespace-pre-wrap py-3 ">
                  {resp['cmd_begin']}
                </div>
              </>,
              {
                position: 'bottom-center',
                duration: 1000 * 10000,
                style: {
                  width: `750px`
                }
              }
            )
          }

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
              position: 'bottom-center',
              duration: 1000,
              style: {
                width: `750px`
              }
            }
          )
          nprogress.done()
          useArchApp.setState({ cmd_begin: '' })
        }
      }
    )

    controller.getDataAsync().then(() => {
      // setWorking(false)
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

  useEffect(() => {
    // onClick()
  }, [])

  return (
    <>
      <div className="flex">
        <div className="p-2 mb-2 rounded-2xl border">
          <div>Proejct Name</div>
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
          <div>
            <div>
              Seed
              <button
                className="p-2 bg-gray-200 rounded-2xl mx-2"
                onClick={() => {
                  //
                  useArchApp.getState().refreshSeed()
                  //
                }}
              >
                {/*  */}Build a new version
                {/*  */}
              </button>
            </div>
          </div>
          <Textarea
            value={seed}
            onChange={(ev) => {
              useArchApp.setState({
                seed: ev.target.value
              })
              localStorage.setItem('seed', ev.target.value)
            }}
            rows={1}
            className="mb-2"
          ></Textarea>

          <div>BaseURL</div>
          <Textarea
            value={baseURL}
            onChange={(ev) => {
              useArchApp.setState({
                baseURL: ev.target.value
              })
            }}
            rows={1}
            className="mb-2"
          ></Textarea>

          <div>apiKey</div>
          <Textarea
            value={apiKey}
            onChange={(ev) => {
              useArchApp.setState({
                apiKey: ev.target.value
              })
            }}
            rows={1}
            className="mb-2"
          ></Textarea>

          <div>appModel</div>
          <Textarea
            value={appModel}
            onChange={(ev) => {
              useArchApp.setState({
                appModel: ev.target.value
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
