import { useEffect, useState } from 'react'
import { useHome } from './useHome'
import nprogress from 'nprogress'
// import { toast } from 'sonner'

export function HyperHome({ name = '' }) {
  const seed = useHome((r) => r.seed)
  const baseURL = useHome((r) => r.baseURL)
  const appModel = useHome((r) => r.appModel)
  const appName = useHome((r) => r.appName)
  const appUserPrompt = useHome((r) => r.appUserPrompt)
  const apiKey = useHome((r) => r.apiKey)

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
        route: 'readWorkspaceFiles',

        baseURL: baseURL || `http://localhost:1234/v1`,

        apiKey: apiKey || 'nono',

        workspace: name,

        model: `${appModel}`,

        seed: `${seed}`,

        appName: `${appName}`,

        appUserPrompt: `${appUserPrompt}`
      },
      (stream) => {
        //
        const resp = JSON.parse(stream)

        console.log(resp)

        if (resp.start) {
          nprogress.start()
        }
        if (resp.done) {
          nprogress.done()
        }

        if (resp.files) {
          useHome.setState({ files: resp.files })
        }
      }
    )

    controller.getDataAsync().then(() => {
      stopFunc()
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

  useEffect(() => {
    onClick()
  }, [])

  return (
    <>
      <div className="">Welcome Back! {name}</div>
    </>
  )
}
