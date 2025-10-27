import * as React from 'react'
import { Button as TButton } from '@/components/tui/button'
import { Link, useRouter } from '@tanstack/react-router'
import {
  House,
  BadgeInfo,
  BadgeCheck,
  LogOut,
  ListTodo,
  FolderLock,
} from 'lucide-react'
import Logo from '../assets/logo/arc-logo.svg'
import { authClient } from '../lib/auth-client'
import { triggerToast } from '@/utils/sonner/triggerToast'

export function Header() {
  const router = useRouter()
  // check for the existed session
  const [error, setError] = React.useState<string | null>(null)
  const [isLoading, setIsLoading] = React.useState(false)
  const { data: session, isPending } = authClient.useSession()

  const handleSignout = () => {
    setIsLoading(true)
    try {
      // Testing purpose
      // throw new Error('Something went wrong')
      authClient.signOut().then(() => {
        triggerToast('signout')
        router.navigate({
          to: '/',
        })
      })
    } catch (error) {
      console.error(`Sign Out failed: ${error}`)
      setError(error instanceof Error ? error.message : 'Unknown error')
    } finally {
      setIsLoading(false)
    }
  }

  React.useEffect(() => {
    if (error) {
      triggerToast('offline', error)
      setError(null)
    }
  }, [error])

  if (isPending) return

  return (
    <div className="fixed inset-x-0 left-0 p-6 w-full flex justify-start items-center gap-2 bg-s-accent">
      <img
        src={Logo}
        alt="Auths Logo"
        className="w-6 h-6 mx-4"
        loading="eager"
        decoding="async"
      />
      {!isPending && (
        <>
          <Link to="/" className="group/home">
            <TButton variant="plain" size="default" className="flex gap-1">
              <span>Home</span>{' '}
              <House
                size={12}
                strokeWidth={3}
                className="group-data-[status=active]/home:stroke-3"
              />
            </TButton>
          </Link>
          <Link to="/todos" className="" disabled={!session}>
            <TButton
              variant="plain"
              size="default"
              className="flex gap-1"
              disabled={!session}
            >
              <span>Todos</span>
              {!session ? (
                <FolderLock size={12} strokeWidth={3} />
              ) : (
                <ListTodo size={12} strokeWidth={3} />
              )}
            </TButton>
          </Link>
          {session ? (
            <TButton
              variant="default"
              size="default"
              className="flex gap-1 justify-self-end ml-auto"
              onClick={handleSignout}
            >
              <span>{isLoading ? 'Signing Out' : 'Sign Out'}</span>
              <LogOut size={12} strokeWidth={3} />
            </TButton>
          ) : (
            <Link to="/signin" className="justify-self-end ml-auto">
              <TButton variant="default" size="default" className="flex  gap-1">
                <span>Sign In</span>
                <BadgeCheck size={12} strokeWidth={3} />
              </TButton>
            </Link>
          )}
        </>
      )}
      <div className="nav-splitter"></div>
    </div>
  )
}
