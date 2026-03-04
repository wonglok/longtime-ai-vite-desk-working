import { TooltipProvider } from '@/components/ui/tooltip'
import { AppRouter } from './router/Router'

function App(): React.JSX.Element {
  return (
    <>
      <TooltipProvider>
        <AppRouter></AppRouter>
      </TooltipProvider>
    </>
  )
}

export default App
