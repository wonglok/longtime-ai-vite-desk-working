import { Streamdown } from 'streamdown'
import { useArchApp } from './useArchApp'

export function MsgBlock({}) {
  const messages = useArchApp((r) => r.messages)
  const done = useArchApp((r) => r.done)
  const stream = useArchApp((r) => r.stream)
  const blocks = useArchApp((r) => r.blocks)
  const terminalCalls = useArchApp((r) => r.terminalCalls)

  //
  return (
    <div className="text-xs w-full overflow-x-scroll">
      {done && <div className="bg-green-500 text-white p-2 rounded-2xl m-2">{done}</div>}

      {/* {blocks.map((msg: any, i) => {
        return (
          <li key={'k' + i} className="border p-2 my-2 rounded-2xl bg-lime-300">
            <div className="text-xs whitespace-pre-wrap p-2 bg-gray-100 border rounded-lg">
              {JSON.stringify(msg.content, null, '\t')}
            </div>
          </li>
        )
      })} */}
      {/* <Streamdown mode="streaming">{(stream || '').trim()}</Streamdown> */}

      <li key={'kstream1234'} className="border p-2 mb-2 rounded-2xl">
        <div className="text-xs whitespace-pre-wrap p-2 bg-[#77e6ff] border rounded-lg">
          {(stream || '').trim()}
        </div>
      </li>

      {/* {terminalCalls.map((msg: any, i) => {
        console.log(msg)
        return (
          <li key={'k' + i} className="border p-2 my-2 rounded-2xl bg-lime-300">
            <div className="text-xs whitespace-pre-wrap p-2 bg-gray-100 border rounded-lg">
              {msg.result ? `Finished` : `Runnning`}: {JSON.stringify(msg.command, null, '\t')}
            </div>
          </li>
        )
      })} */}

      {messages.map((msg: any, i) => {
        return (
          <li key={'k' + i} className="border p-2 mb-2 rounded-2xl">
            <div className="text-xs whitespace-pre-wrap p-2 bg-lime-100 border rounded-lg">
              {msg?.content.trim()}
            </div>
          </li>
        )
      })}
    </div>
  )
}
