// import { LMStudioManager } from '@renderer/adapter/LMStudioManager'
// import AIPicker from '@renderer/components/AIPicker'
// import Versions from '@renderer/components/Versions'
import { Link, Redirect, Route, Switch } from 'wouter'
import { LMStudioManager } from '../adapter/LMStudioManager'
import Versions from '@renderer/gui/Versions'
import AIPicker from '@renderer/gui/AIPicker'
import { Setup } from '@renderer/pages/Setup'
import { Embeddings } from '@renderer/pages/Embeddings'
import { Home } from '@renderer/pages/Home'
import { RecursiveAI } from '@renderer/pages/RecursiveAI'

export const AppRouter = () => (
  <>
    <Switch>
      <Route path="/embeddings">
        <Embeddings></Embeddings>
      </Route>

      <Route path="/setup">
        <Setup></Setup>
      </Route>

      <Route path="/home">
        <Home></Home>
      </Route>

      <Route path="/recursive-ai">
        <RecursiveAI></RecursiveAI>
      </Route>

      <Route path="/">
        <Redirect href="/home"></Redirect>
      </Route>
    </Switch>
  </>
)

export function Others() {
  return (
    <>
      <Link href="/users/1">Profile</Link>
      <Link href="/lmstudio">Setup LMStudio</Link>
      <Link href="/about">About</Link>
      <Link href="/dashboard">Dash</Link>
      <Link href="/">Home</Link>
      {/*  */}
      {/*  */}
      {/* <SearchBar></SearchBar> */}
      {/*  */}
      {/*  */}
      <Route>
        <div>404: No such page!</div>
      </Route>
      <Route path="/about">
        <div className="p-2 bg-red-500">Powered by electron-vite</div>
        <div className="text">
          Build an Electron app with <span className="react">React</span>
          &nbsp;and <span className="ts">TypeScript</span>
        </div>
        <p className="tip">
          Please try pressing <code>F12</code> to open the devTool
        </p>
        <div className="actions">
          <div className="action">
            <a href="https://electron-vite.org/" target="_blank" rel="noreferrer">
              Documentation
            </a>
          </div>
        </div>

        <Versions></Versions>
      </Route>
      <div>
        <AIPicker
          onModelSelect={(model, provider) => {
            console.log(model, provider)
          }}
        ></AIPicker>
      </div>

      <Route path="/lmstudio">
        <LMStudioManager></LMStudioManager>
      </Route>
      <Route path="/dashboard">
        <Home></Home>
      </Route>
      <Route path="/users/:name">
        {(params) => (
          <>
            <div>Home</div>
            <div>Hello, {params.name}!</div>
          </>
        )}
      </Route>
    </>
  )
}
