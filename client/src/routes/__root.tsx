import { createRootRoute, Outlet } from '@tanstack/react-router'
import { TanStackRouterDevtools } from '@tanstack/react-router-devtools'
import { TanstackQueryDevtools } from '../integration/tanstack-query/query-devtools'
import { Header } from '../components/Header'
import { Toaster as Sonner } from 'sonner'

const RootLayout = () => (
  <>
    <Sonner
      toastOptions={{
        className:
          '!bg-s-accent !border-1 !text-s-foreground !w-fit !px-6 !select-none',
      }}
    />
    <Header />
    <div className="px-10 h-[calc(100vh)]">
      <div className="bg-noise" />
      <Outlet />
    </div>
    <TanStackRouterDevtools />
    <TanstackQueryDevtools />
  </>
)

export const Route = createRootRoute({ component: RootLayout })

// [&.active]:font-bold
