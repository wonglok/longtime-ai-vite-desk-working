import { useArchApp } from './useArchApp'

export function MsgBlock({}) {
  const messages = useArchApp((r) => r.messages)
  const stream = useArchApp((r) => r.stream)
  const beforeRun = useArchApp((r) => r.beforeRun)
  return (
    <div className="text-xs w-full overflow-x-scroll">
      {beforeRun.map((msg: any, i) => {
        return (
          <li key={'k' + i} className="border p-2 my-2 rounded-2xl">
            <div className="text-xs whitespace-pre-wrap p-2 bg-gray-100 border rounded-lg">
              Running: {JSON.stringify(msg.command, null, '\t')}
            </div>
          </li>
        )
      })}

      {messages.map((msg: any, i) => {
        return (
          <li key={'k' + i} className="border p-2 mb-2 rounded-2xl">
            <div className="text-xs whitespace-pre-wrap p-2 bg-gray-100 border rounded-lg">
              {msg?.content.trim()}
            </div>
          </li>
        )
      })}

      {messages.length === 0 && stream && (
        <li key={'kstream123'} className="border p-2 mb-2 rounded-2xl">
          <div className="text-xs whitespace-pre-wrap p-2 bg-gray-100 border rounded-lg">
            {(stream || '').trim()}
          </div>
        </li>
      )}
    </div>
  )
}
