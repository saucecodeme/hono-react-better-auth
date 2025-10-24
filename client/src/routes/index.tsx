import { useEffect } from 'react'
import { createFileRoute } from '@tanstack/react-router'
import BetterAuthLogo from '@/assets/logo/better-auth.png'

export const Route = createFileRoute('/')({
  component: Index,
})

function Index() {
  useEffect(() => {
    const link = document.createElement('link')
    link.rel = 'preload'
    link.as = 'image'
    link.href = BetterAuthLogo

    document.head.appendChild(link)

    return () => {
      document.head.removeChild(link)
    }
  }, [])

  return (
    <section className="py-[100px] h-full flex justify-center items-center">
      <div className="flex flex-col items-center justify-start gap-10">
        <div className="flex flex-row items-center gap-3 font-normal">
          <img src={BetterAuthLogo} className="w-6 opacity-50" />
          <span>Auth for developers</span>
        </div>
        <h1 className="text-5xl font-bold text-center leading-snug">
          The auth just <i className="italic">feels</i>
          <br /> better with{' '}
          <span className="text-s-destructive">Better Auth.</span>
        </h1>
      </div>
    </section>
  )
}
