import { notarize } from '@electron/notarize'
import path from 'path'

// loaded file
console.log('loaded: notarize')

// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
export const handler = async function () {
  // context: any
  console.log('notarize: start')
  await notarize({
    appPath: path.join(import.meta.dirname, '../dist/mac-arm64/longtime-ai.app'),
    keychainProfile: 'WONG_LOK_PROFILE'
  }).then((r) => {
    console.log(r)
    console.log('notarize: is ok!!')
  })

  return null
}

export default handler
