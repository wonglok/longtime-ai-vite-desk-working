// import { LMStudioManager } from '@renderer/adapter/LMStudioManager'
// import AIPicker from '@renderer/components/AIPicker'
// import Versions from '@renderer/components/Versions'
// import { Link, Redirect, Route, Switch } from 'wouter'
import { HashRouter, Routes, Route, useParams } from 'react-router-dom'

import { LMStudioManager } from '../adapter/LMStudioManager'
// import Versions from '@renderer/gui/Versions'
// import AIPicker from '@renderer/gui/AIPicker'
// import { Setup } from '@renderer/pages/Setup'
// import { Embeddings } from '@renderer/pages/Embeddings'
import { Home } from '@renderer/pages/Home'
// import { RecursiveAI } from '@renderer/pages/RecursiveAI'
// import { Skill } from '@renderer/pages/Skill'
import { OnBoard } from '@renderer/pages/OnBoard'
import { WorkspaceLayout } from '@renderer/ui/workspace/WorkspaceParent'
import { WorkHome } from '@renderer/ui/HyperHome/home'
import { WorkDesk } from '@renderer/ui/workspace/desk'
// import { SearchBar } from '@renderer/effects/SearchBar'

export const AppRouter = () => {
  return (
    <>
      <HashRouter>
        <Routes>
          {/* <Route
            path="onboard"
            element={
              <>
                <OnBoard></OnBoard>
              </>
            }
          ></Route> */}

          <Route
            path="workspace/:name/setup"
            element={
              <>
                <NamedParams>
                  {(params) => {
                    return (
                      <WorkspaceLayout name={params.name}>
                        <LMStudioManager></LMStudioManager>
                      </WorkspaceLayout>
                    )
                  }}
                </NamedParams>
              </>
            }
          ></Route>

          <Route
            path="workspace/:name/desktop"
            element={
              <>
                <NamedParams>
                  {(params) => {
                    return (
                      <WorkspaceLayout name={params.name}>
                        <WorkDesk name={params.name}></WorkDesk>
                      </WorkspaceLayout>
                    )
                  }}
                </NamedParams>
              </>
            }
          ></Route>

          <Route
            path="workspace/:name/egg"
            element={
              <>
                <NamedParams>
                  {(params) => {
                    return (
                      <WorkspaceLayout name={params.name}>
                        <Home></Home>
                      </WorkspaceLayout>
                    )
                  }}
                </NamedParams>
              </>
            }
          ></Route>

          <Route
            path="workspace/:name"
            element={
              <>
                <NamedParams>
                  {(params) => {
                    console.log(params)

                    return (
                      <WorkspaceLayout name={params.name}>
                        <WorkHome name={params.name}></WorkHome>
                      </WorkspaceLayout>
                    )
                  }}
                </NamedParams>
              </>
            }
          ></Route>

          <Route
            path="/"
            element={
              <>
                <OnBoard></OnBoard>
              </>
            }
          ></Route>
        </Routes>

        {/*  */}

        {/*  */}
      </HashRouter>
    </>
  )
}

function NamedParams({ children = (v: any) => {} }: any) {
  let params: any = useParams()
  console.log(params)
  return children(params)
}

// export function Others() {
//   return (
//     <>
//       <Link href="/users/1">Profile</Link>
//       <Link href="/lmstudio">Setup LMStudio</Link>
//       <Link href="/about">About</Link>
//       <Link href="/dashboard">Dash</Link>
//       <Link href="/">Home</Link>

//       {/*  */}
//       {/*  */}
//       {/*  */}
//       {/*  */}

//       <Route>
//         <div>404: No such page!</div>
//       </Route>
//       <Route path="about">
//         <div className="p-2 bg-red-500">Powered by electron-vite</div>
//         <div className="text">
//           Build an Electron app with <span className="react">React</span>
//           &nbsp;and <span className="ts">TypeScript</span>
//         </div>
//         <p className="tip">
//           Please try pressing <code>F12</code> to open the devTool
//         </p>
//         <div className="actions">
//           <div className="action">
//             <a href="https://electron-vite.org/" target="_blank" rel="noreferrer">
//               Documentation
//             </a>
//           </div>
//         </div>

//         <Versions></Versions>
//       </Route>
//       <div>
//         <AIPicker
//           onModelSelect={(model, provider) => {
//             console.log(model, provider)
//           }}
//         ></AIPicker>
//       </div>

//       <Route path="lmstudio">
//         <LMStudioManager></LMStudioManager>
//       </Route>
//       <Route path="dashboard">
//         <Home></Home>
//       </Route>
//       <Route path="users/:name">
//         {(params: any) => (
//           <>
//             <div>Home</div>
//             <div>Hello, {params.name}!</div>
//           </>
//         )}
//       </Route>
//     </>
//   )
// }
