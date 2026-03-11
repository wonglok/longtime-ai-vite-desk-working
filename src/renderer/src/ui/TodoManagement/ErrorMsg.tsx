import { useTM } from '@renderer/store/useTM'

export function ErrorMsg() {
  const error = useTM((r) => r.error)
  return <>{error}</>
}
