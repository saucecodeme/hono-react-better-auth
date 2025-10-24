import { Button as TButton } from '@/components/tui/button'
import { Link } from '@tanstack/react-router'
import { House, BadgeInfo, Network, KeyRound, ListTodo } from 'lucide-react'
import Logo from '../assets/logo/arc-logo.svg'

export function Header() {
  return (
    <div className="fixed top-0 left-0 p-6 w-full flex justify-start items-center gap-2 bg-[#456378] backdrop-opacity-30">
      <img src={Logo} className="w-6 h-6 mx-4" />
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
      <Link to="/todos" className="">
        <TButton variant="plain" size="default" className="flex  gap-1">
          <span>Todos</span>
          <ListTodo size={12} strokeWidth={3} />
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
  )
}
