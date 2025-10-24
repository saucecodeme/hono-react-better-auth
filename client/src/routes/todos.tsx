import { createFileRoute } from '@tanstack/react-router'
import { hc } from 'hono/client'
import type { AppType } from '../../../server'
import { useQuery } from '@tanstack/react-query'
import { Database, BadgeAlert } from 'lucide-react'
import { Checkbox as TCheckbox } from '@/components/tui/checkbox'
import { Skeleton } from '@/components/ui/skeleton'

const client = hc<AppType>('/')

export const Route = createFileRoute('/todos')({
  component: RouteComponent,
})

function RouteComponent() {
  const { data, isLoading, isError, error, status } = useQuery({
    queryKey: ['todos'],
    queryFn: async () => {
      await new Promise((resolve) => setTimeout(resolve, 1000))
      const res = await client.api.todos.$get()
      if (!res.ok) throw new Error('Failed to fetch todos')
      return res.json()
    },
  })

  if (isLoading)
    return (
      <div className="route-starter flex flex-col">
        {/* <Database size={24} strokeWidth={2} className="animate-pulse" /> */}
        <div className="flex flex-col gap-2 w-[100px]">
          {[...Array(10).keys()].map((id) => {
            return (
              <div key={id} className="flex gap-2 items-center opacity-30">
                <Skeleton className="size-4 shrink-0 rounded-[4px]" />
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
            return (
              <div key={todo.id} className="flex gap-2 items-center">
                <TCheckbox />
                <div>{todo.title}</div>
              </div>
            )
          })}
      </div>
    </div>
  )
}
