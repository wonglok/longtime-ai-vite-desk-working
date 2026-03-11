import { type Action, useTM } from '@renderer/store/useTM'
// import { useState } from 'react'

// import Terminal, { ColorMode, TerminalOutput } from 'react-terminal-ui'

// const TerminalController = () => {
//   const terminalCalls = useTM((r: any) => r.terminalCalls) as Action[]

//   return (
//     <div className="container">
//       <Terminal
//         colorMode={ColorMode.Dark}
//         // onInput={(terminalInput) => {
//         //   // console.log(`New terminal input received: '${terminalInput}'`)
//         // }}
//       >
//         {terminalCalls.map((eachAction, idx) => {
//           return (
//             <div className="" key={`${eachAction.cmd}${idx}`}>
//               <TerminalOutput>{`${eachAction.cmd}`.trim()}</TerminalOutput>
//               <div className="h-4"></div>
//               <TerminalOutput>
//                 {`${`${eachAction.result || ''}`.replace('Successful: ', '').replace('Error: ', '')}`.trim()}
//               </TerminalOutput>
//             </div>
//           )
//         })}
//       </Terminal>
//     </div>
//   )
// }

export function ActionsTerm() {
  const terminalCalls = useTM((r: any) => r.terminalCalls) as Action[]

  console.log('terminalCalls', terminalCalls.map((r) => r.cmd).join('\n'))
  return (
    <>
      {/* <TerminalController></TerminalController> */}

      <div className="w-full mt-2 text-xs gap-2   ">
        {terminalCalls.map((eachAction, idx) => {
          return (
            <div className="mb-2 border rounded-2xl" key={`${eachAction.cmd}${idx}`}>
              <div className="p-2 bg-gray-100 m-2 border rounded-lg whitespace-pre-wrap">
                {`${eachAction.cmd}`.trim()}
              </div>
              <div className="p-2 bg-gray-100 m-2 border rounded-lg whitespace-pre-wrap">
                {`${eachAction.result}`.trim()}
              </div>
            </div>
          )
        })}
      </div>
    </>
  )
}
