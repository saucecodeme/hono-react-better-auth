import { createRootRoute, Outlet } from '@tanstack/react-router'
import { TanStackRouterDevtools } from '@tanstack/react-router-devtools'
import { TanstackQueryDevtools } from '../integration/tanstack-query/query-devtools'
import { Header } from '../components/Header'

const RootLayout = () => (
  <>
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
