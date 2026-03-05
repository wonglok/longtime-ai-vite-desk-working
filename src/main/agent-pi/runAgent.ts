import { gatherContext } from './gatherContext'

export const runAgent = async ({ onEvent, inbound }) => {
  await gatherContext({
    inbound: inbound,
    onEvent: ({ type, text }) => {
      onEvent({ type, text })
    }
  })

  return ''
}
