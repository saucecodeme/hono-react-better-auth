import { createRootRoute, Link, Outlet } from '@tanstack/react-router'
import { TanStackRouterDevtools } from '@tanstack/react-router-devtools'
import { TanstackQueryDevtools } from '../integration/tanstack-query/query-devtools'
import { Button as TButton } from '@/components/tui/button'
import { House, BadgeInfo, Network, KeyRound } from 'lucide-react'

const RootLayout = () => (
  <>
    <div className="fixed top-0 left-0 p-6 w-full flex justify-start items-center gap-2 bg-[#456378] backdrop-opacity-30">
      <Link to="/" className="">
        <TButton variant="plain" size="default" className="flex gap-1">
          <span>Home</span> <House size={12} strokeWidth={3} />
        </TButton>
      </Link>{' '}
      <Link to="/about">
        <TButton variant="plain" size="default" className="flex gap-1">
          <span>About</span>
          <BadgeInfo size={12} strokeWidth={3} />
        </TButton>
      </Link>
      <Link to="/tquery" className="">
        <TButton variant="link" size="default" className="flex gap-1">
          <span>Tquery</span>
          <Network size={12} strokeWidth={3} />
        </TButton>
      </Link>
      <Link to="/auth" className="justify-self-end ml-auto">
        <TButton variant="default" size="default" className="flex  gap-1">
          <span>Login</span>
          <KeyRound size={12} strokeWidth={3} />
        </TButton>
      </Link>
      <div className="nav-splitter"></div>
    </div>
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
