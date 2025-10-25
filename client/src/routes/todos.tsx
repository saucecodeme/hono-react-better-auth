import * as React from 'react'
import { createFileRoute, useRouter } from '@tanstack/react-router'
import { hc } from 'hono/client'
import type { AppType } from '../../../server'
import { useQuery } from '@tanstack/react-query'
import { BadgeAlert } from 'lucide-react'
import { Checkbox as TCheckbox } from '@/components/tui/checkbox'
import { Skeleton } from '@/components/ui/skeleton'
import { authClient } from '@/lib/auth-client'
import { motion } from 'motion/react'

const client = hc<AppType>('/')

export const Route = createFileRoute('/todos')({
  component: RouteComponent,
})

function RouteComponent() {
  const { data: session } = authClient.useSession()
  const router = useRouter()
  const { data, isLoading, error, status } = useQuery({
    queryKey: ['todos'],
    queryFn: async () => {
      await new Promise((resolve) => setTimeout(resolve, 1000))
      const res = await client.api.todos.$get()
      if (!res.ok) throw new Error('Failed to fetch todos')
      return res.json()
    },
  })
  const [checked, setChecked] = React.useState<Record<string, boolean>>({})

  React.useEffect(() => {
    if (!data) return
    const initial = Object.fromEntries(
      data.map((d) => [String(d.id), !!d.completed])
    ) as Record<string, boolean>
    setChecked(initial)
  }, [data])

  React.useEffect(() => {
    if (!session) {
      router.navigate({ to: '/signin', replace: true })
    }
  }, [router, session])

  if (isLoading)
    return (
      <div className="route-starter flex flex-col">
        {/* <Database size={24} strokeWidth={2} className="animate-pulse" /> */}
        <div className="flex flex-col gap-2 w-[100px]">
          {[...Array(10).keys()].map((id) => {
            return (
              <div key={id} className="flex gap-2 items-center opacity-30">
                <Skeleton className="size-4 shrink-0 rounded-lg" />
                <Skeleton className="w-full h-4" />
              </div>
            )
          })}
        </div>
      </div>
    )
  if (error instanceof Error)
    return (
      <div role="alert" className="route-starter flex gap-2">
        <BadgeAlert size={24} strokeWidth={3} />
        <span>Error: {error.message}</span>
      </div>
    )
  return (
    <div className="route-starter">
      <div className="flex flex-col">
        {status === 'success' &&
          data.map((todo) => {
            const isChecked = checked[todo.id] ?? false
            return (
              <motion.label
                key={todo.id}
                layout
                className="flex items-center gap-2 rounded-md px-2 py-1"
                transition={{
                  type: 'spring',
                  stiffness: 380,
                  damping: 32,
                }}
              >
                <TCheckbox
                  checked={checked[todo.id]}
                  onCheckedChange={(value) =>
                    setChecked((prev) => ({
                      ...prev,
                      [todo.id]: value === true,
                    }))
                  }
                />
                <span className="relative inline-block">
                  <span>{todo.title}</span>
                  <motion.span
                    className="pointer-events-none absolute left-0 right-0 top-1/2 h-0.5 bg-current"
                    initial={false}
                    animate={{ scaleX: isChecked ? 1 : 0 }}
                    transition={{ duration: 0.25, ease: 'easeInOut' }}
                    style={{ transformOrigin: 'left center' }}
                  />
                </span>
              </motion.label>
            )
          })}
      </div>
    </div>
  )
}
