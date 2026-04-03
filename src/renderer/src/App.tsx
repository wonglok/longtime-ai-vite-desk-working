import { TooltipProvider } from '@/components/ui/tooltip'
import { AppRouter } from './router/Router'
import { Toaster } from 'sonner'
function App(): React.JSX.Element {
  return (
    <>
      <TooltipProvider>
        <AppRouter></AppRouter>
      </TooltipProvider>
      <Toaster></Toaster>
      123
    </>
  )
}

export default App
