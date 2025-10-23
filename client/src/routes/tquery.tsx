import { createFileRoute } from '@tanstack/react-router'
import { useQuery } from '@tanstack/react-query'
import { networkModeHelper } from '@/utils'
import { Database } from 'lucide-react'
import { hc } from 'hono/client'
import type { AppType } from '../../../server/index'

const client = hc<AppType>('/')

export const Route = createFileRoute('/tquery')({
  component: Tquery,
})

function Tquery() {
  const { data, isLoading, error, status, fetchStatus } = useQuery({
    queryKey: ['tquery-key'],
    queryFn: async () => {
      // fake delay
      await new Promise((resolve) => setTimeout(resolve, 2000))

      // const res = await fetch('https://jsonplaceholder.typicode.com/posts/1')
      // if (!res.ok) throw new Error('Network error')
      // return res.json()

      // const res = await fetch('/api/user')
      const res = await client.api.user.$get() // implement hono rpc
      if (!res.ok) throw new Error('Failed to fetch user')
      return res.json()
    },
  })
  if (isLoading)
    return (
      <div className="route-starter">
        {/* Loading... {fetchStatus}{' '} */}
        <Database size={24} strokeWidth={2} className="animate-pulse" />
      </div>
    )
  if (error instanceof Error)
    return <div className="route-starter">Error: {error.message}</div>

  const newStatus = networkModeHelper({ status, fetchStatus })
  return (
    <div className="route-starter flex-col">
      <h2>Query status: {newStatus}</h2>
      <div>
        {status === 'success' &&
          data.map((user) => (
            <div key={user.id}>
              {user.id}. {user.name}
            </div>
          ))}
      </div>
    </div>
  )
}
