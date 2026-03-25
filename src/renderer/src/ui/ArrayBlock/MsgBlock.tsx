import { Streamdown } from 'streamdown'
import { useArchApp } from './useArchApp'

export function MsgBlock({}) {
  const messages = useArchApp((r) => r.messages)
  const done = useArchApp((r) => r.done)
  const stream = useArchApp((r) => r.stream)
  const thinking = useArchApp((r) => r.thinking)
  const cmd_begin = useArchApp((r) => r.cmd_begin)
  // const blocks = useArchApp((r) => r.blocks)
  // const terminalCalls = useArchApp((r) => r.terminalCalls)

  // console.log('messages', messages)
  //
  return (
    <>
      <div>
        {done && <div className="bg-green-500 text-white p-2 rounded-2xl m-2">{done}</div>}
        {cmd_begin && (
          <div className="bg-[#001580] text-white p-2 rounded-2xl m-2">{cmd_begin}</div>
        )}
      </div>
      <div className="flex space-x-2">
        <div className="text-xs w-full overflow-x-scroll">
          {/* {blocks.map((msg: any, i) => {
        return (
          <li key={'k' + i} className="border p-2 my-2 rounded-2xl bg-lime-300">
            <div className="text-xs whitespace-pre-wrap p-2 bg-gray-100 border rounded-lg">
              {JSON.stringify(msg.content, null, '\t')}
            </div>
          </li>
        )
      })} */}

          {/*  */}

          <div key={'thinking1234'} className="border p-2 mb-2 rounded-2xl">
            <div className="text-xs whitespace-pre-wrap p-2 bg-[#e9deff] text-#000000 border rounded-lg">
              {(thinking || '').trim()}
            </div>
          </div>

          <div key={'kstream1234'} className="border p-2 mb-2 rounded-2xl">
            <div className="text-xs whitespace-pre-wrap p-2 bg-[#bff3ff] border rounded-lg">
              {(stream || '').trim()}
            </div>
          </div>
        </div>
        <div className="text-xs w-full overflow-x-scroll">
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

          {messages?.map((msg: any, i) => {
            return (
              <li key={'k' + i} className="border p-2 mb-2 rounded-2xl">
                <div className={`bg-[#dcffd6] text-xs whitespace-pre-wrap p-2 border rounded-lg `}>
                  {msg?.content.trim()}
                </div>
              </li>
            )
          })}
        </div>
      </div>
    </>
  )
}
