import { createRootRoute, Outlet } from '@tanstack/react-router'
import { TanStackRouterDevtools } from '@tanstack/react-router-devtools'
import { TanstackQueryDevtools } from '../integration/tanstack-query/query-devtools'
import { Header } from '../components/Header'
import { Toaster as Sonner } from 'sonner'

const toastOptions = {
  className:
    '!bg-s-accent !border-1 !text-s-foreground !w-fit !px-6 !select-none',
}

const RootLayout = () => (
  <>
    <Sonner toastOptions={toastOptions} />
    <Header />
    <div className="h-screen bg-noise-container">
      <Outlet />
    </div>
    {import.meta.env.DEV && (
      <>
        <TanstackQueryDevtools />
        <TanStackRouterDevtools />
      </>
    )}
  </>
)

export const Route = createRootRoute({ component: RootLayout })
