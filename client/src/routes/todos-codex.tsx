import * as React from 'react'
import { createFileRoute, useRouter } from '@tanstack/react-router'
import { hc } from 'hono/client'
import type { AppType } from '../../../server'
import { useQuery } from '@tanstack/react-query'
import { BadgeAlert, Plus } from 'lucide-react'
import { Checkbox as TCheckbox } from '@/components/tui/checkbox'
import { Skeleton } from '@/components/ui/skeleton'
import { authClient } from '@/lib/auth-client'
import { AnimatePresence, motion } from 'motion/react'
import { Button as TButton } from '@/components/tui/button'
import { Input as TInput } from '@/components/tui/input'

const client = hc<AppType>('/')

export const Route = createFileRoute('/todos-codex')({
  component: RouteComponent,
})

function RouteComponent() {
  // const [checked, setChecked] = React.useState<Record<string, boolean>>({})
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
  const [isAdding, setIsAdding] = React.useState(false)
  const [newTodoTitle, setNewTodoTitle] = React.useState('')
  const newTodoInputRef = React.useRef<HTMLInputElement>(null)
  React.useEffect(() => {
    if (!data) return
    const initial = Object.fromEntries(
      data.map((d) => [String(d.id), !!d.completed])
    ) as Record<string, boolean>
    setChecked(initial)
  }, [data])

  // React.useEffect(() => {
  //   if (!session) {
  //     router.navigate({ to: '/signin', replace: true })
  //   }
  // }, [router, session])

  // React.useEffect(() => {
  //   if (!isAdding) return
  //   const animationFrame = requestAnimationFrame(() => {
  //     newTodoInputRef.current?.focus()
  //   })
  //   return () => cancelAnimationFrame(animationFrame)
  // }, [isAdding])

  const midpoint = data ? Math.ceil(data.length / 2) : 0
  const upperTodos = data ? data.slice(0, midpoint) : []
  const lowerTodos = data ? data.slice(midpoint) : []

  const handleToggleAdd = () => {
    setIsAdding((prev) => !prev)
    setNewTodoTitle('')
  }

  const handleSubmitNewTodo = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    // Integrate with create todo mutation here
    setIsAdding(false)
    setNewTodoTitle('')
  }

  // React.useEffect(() => {

  // })

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
      <div className="flex flex-col gap-4">
        {/* <hr className="w-[80%] border-s-foreground/20 self-center" /> */}
        <div className="flex flex-col">
          {status === 'success' && (
            <motion.div layout className="flex flex-col gap-2">
              <AnimatePresence initial={false} mode="popLayout">
                {upperTodos.map((todo) => {
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
                {isAdding && (
                  <motion.form
                    key="new-todo"
                    layout
                    onSubmit={handleSubmitNewTodo}
                    initial={{ opacity: 0, y: 16, scale: 0.96 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -16, scale: 0.98 }}
                    transition={{
                      type: 'spring',
                      bounce: 0.3,
                      duration: 0.45,
                    }}
                    className="flex flex-col gap-3 rounded-lg border border-s-foreground/10 bg-s-background/60 p-3 shadow-lg"
                  >
                    <div className="flex flex-col gap-1">
                      <span className="text-sm font-medium text-s-foreground/70">
                        New todo
                      </span>
                      <TInput
                        ref={newTodoInputRef}
                        value={newTodoTitle}
                        onChange={(event) =>
                          setNewTodoTitle(event.target.value)
                        }
                        placeholder="What needs to be done?"
                        className="h-10"
                      />
                    </div>
                    <div className="flex justify-end gap-2">
                      <TButton
                        type="button"
                        variant="link"
                        onClick={handleToggleAdd}
                      >
                        Cancel
                      </TButton>
                      <TButton
                        type="submit"
                        variant="default"
                        disabled={!newTodoTitle}
                      >
                        Save
                      </TButton>
                    </div>
                  </motion.form>
                )}
                {/* {lowerTodos.map((todo) => {
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
                })} */}
              </AnimatePresence>
            </motion.div>
          )}
        </div>
        <TButton
          variant="link"
          className="w-fit text-s-foreground/50 text-sm mx-auto"
          onClick={handleToggleAdd}
        >
          {isAdding ? 'Close new todo' : 'Add new todo'}
        </TButton>
      </div>
    </div>
  )
}
