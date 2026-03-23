import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { useEffect, useState } from 'react'
// @ts-ignore
import { useArchApp } from './useArchApp'
import nprogress from 'nprogress'
import { toast } from 'sonner'
import { generate } from 'random-words'

const slugs = [
  'i-am-capable-of-amazing-things',
  'believe-in-yourself',
  'progress-over-perfection',
  'every-day-is-a-fresh-start',
  'i-choose-to-be-happy',
  'my-potential-is-limitless',
  'i-am-worthy-of-success',
  'focus-on-the-good',
  'keep-moving-forward',
  'small-steps-lead-to-big-results',
  'i-embrace-challenges',
  'mistakes-are-opportunities-to-learn',
  'i-am-resilient',
  'positive-thoughts-create-positive-results',
  'i-have-the-power-to-create-change',
  'happiness-is-a-choice',
  'i-am-surrounded-by-support',
  'i-trust-my-journey',
  'one-day-at-a-time',
  'i-am-getting-stronger-every-day',
  'success-starts-with-a-mindset',
  'i-am-in-control-of-my-reactions',
  'gratitude-turns-what-we-have-into-enough',
  'i-deserve-to-be-happy',
  'my-mind-is-full-of-bright-ideas',
  'i-am-brave-and-bold',
  'i-can-and-i-will',
  'be-kind-to-yourself',
  'the-best-is-yet-to-come',
  'i-am-the-architect-of-my-life',
  'dream-big-work-hard',
  'i-am-enough',
  'challenges-make-me-grow',
  'i-choose-peace-over-worry',
  'radiate-positivity',
  'i-am-constantly-evolving',
  'my-hard-work-will-pay-off',
  'i-am-proud-of-my-progress',
  'i-attract-abundance',
  'stay-patient-and-trust-the-process',
  'i-am-a-problem-solver',
  'i-am-full-of-energy',
  'live-in-the-moment',
  'i-have-a-warrior-spirit',
  'i-am-open-to-new-possibilities',
  'my-voice-matters',
  'i-create-my-own-sunshine',
  'i-am-a-magnet-for-miracles',
  'nothing-is-impossible',
  'i-am-free-to-be-me',
  'i-love-the-person-i-am-becoming',
  'i-am-bold-enough-to-pursue-my-dreams',
  'i-can-handle-anything-life-throws-at-me',
  'my-failures-do-not-define-me',
  'i-am-at-peace-with-my-past',
  'i-am-excited-for-the-future',
  'i-have-plenty-of-time',
  'i-am-disciplined-and-focused',
  'my-life-is-full-of-purpose',
  'i-am-kind-to-everyone',
  'i-am-worthy-of-love',
  'i-am-becoming-the-best-version-of-myself',
  'every-breath-i-take-fills-me-with-confidence',
  'i-am-a-source-of-inspiration',
  'i-am-calm-and-centered',
  'i-am-making-a-difference',
  'my-energy-is-contagious',
  'i-am-persistent-and-patient',
  'i-am-grateful-for-this-day',
  'i-have-a-heart-of-gold',
  'i-am-in-alignment-with-my-goals',
  'my-possibilities-are-endless',
  'i-am-brave-enough-to-try',
  'i-am-deserving-of-all-the-good-things',
  'i-am-choosing-to-let-go-of-fear',
  'i-am-smart-and-capable',
  'i-am-a-light-in-the-world',
  'i-am-creating-a-life-i-love',
  'i-am-in-charge-of-my-happiness',
  'i-am-growing-wiser-every-day',
  'i-am-surrounded-by-love-and-light',
  'i-am-a-winner',
  'i-am-focused-on-the-present',
  'i-am-a-masterpiece-in-progress',
  'i-am-confident-in-my-abilities',
  'i-am-exactly-where-i-need-to-be',
  'i-am-full-of-creative-energy',
  'i-am-breaking-through-my-limits',
  'i-am-a-leader',
  'i-am-healthy-and-strong',
  'i-am-capable-of-reaching-my-goals',
  'i-am-attracting-positive-people',
  'i-am-dedicated-to-my-growth',
  'i-am-finding-joy-in-the-little-things',
  'i-am-powerful-beyond-measure',
  'i-am-courageous',
  'i-am-proud-of-who-i-am',
  'i-am-making-the-most-of-every-day',
  'i-am-a-force-for-good',
  'i-am-unstoppable'
]

export function ArrayBlock({}) {
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
    useArchApp.setState({
      seed: `${[`${Math.random().toString(35).slice(2, 9)}`, slugs[Math.floor(Math.random() * slugs.length)]].join('-')}`
    })
  }, [])

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

        appUserPrompt: `${appUserPrompt}`
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
          <div>Seed</div>
          <Textarea
            value={seed}
            onChange={(ev) => {
              useArchApp.setState({
                seed: ev.target.value
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
