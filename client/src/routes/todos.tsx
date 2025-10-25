import * as React from 'react'
import { createFileRoute, useRouter } from '@tanstack/react-router'
import { hc } from 'hono/client'
import type { AppType } from '../../../server'
import { useQuery } from '@tanstack/react-query'
import { BadgeAlert, Save } from 'lucide-react'
import { Checkbox as TCheckbox } from '@/components/tui/checkbox'
import { Skeleton } from '@/components/ui/skeleton'
import { authClient } from '@/lib/auth-client'
import { motion, useAnimationControls, AnimatePresence } from 'motion/react'

import { Button as TButton } from '@/components/tui/button'
import { Input as TInput } from '@/components/tui/input'
import { v4 as uuid } from 'uuid'
import { useCreateTodo } from '@/utils/tanstack-query/useMutation'
import { title } from 'process'

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
  type Todos = NonNullable<typeof data>
  const [localData, setLocalData] = React.useState<Todos>([])
  const [checked, setChecked] = React.useState<Record<string, boolean>>({})

  const [isAdding, setIsAdding] = React.useState(false)
  const [newTodoTitle, setNewTodoTitle] = React.useState('')
  const newTodoInputRef = React.useRef<HTMLInputElement>(null)
  const listControls = useAnimationControls()
  const formControls = useAnimationControls()
  const createTodo = useCreateTodo()

  const handleToggleAdd = () => {
    setIsAdding((prev) => !prev)
    setNewTodoTitle('')
  }

  React.useEffect(() => {
    if (!isAdding) return
    const animationFrame = requestAnimationFrame(() => {
      newTodoInputRef.current?.focus()
    })
    return () => cancelAnimationFrame(animationFrame)
  }, [isAdding])

  type NewToDo = {
    id: string
    userId: string
    title: string
    description: string | null
    completed: boolean | null
    createdAt: string | null
    updatedAt: string | null
  }

  const handleSubmitNewTodo = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const form = e.currentTarget
    const formData = new FormData(form)
    const formObj = Object.fromEntries(formData.entries()) as { title: string }
    const newTodo = {
      title: formObj.title ?? '',
      description: 'This is just a placeholder',
    }

    // send a post request to the backend
    // ;(async () => {
    //   try {
    //     const res = await client.api.todos.$post({ json: payload })
    //     if (!res.ok) {
    //       console.error('Failed to create todo', await res.text())
    //       return
    //     }
    //     const created = (await res.json()) as NewToDo
    //     // Replace the optimistic item (matched by our generated id) with the server result
    //     setLocalData((prev) =>
    //       prev.map((t) => (t.id === payload.id ? created : t))
    //     )
    //   } catch (err) {
    //     console.error('Error creating todo', err)
    //   }
    // })()

    createTodo.mutate(newTodo)
    // reset form / UI
    form.reset()
    setNewTodoTitle('')
    setIsAdding(false)
  }

  React.useEffect(() => {
    if (!data) return
    const initial = Object.fromEntries(
      data.map((d) => [String(d.id), !!d.completed])
    ) as Record<string, boolean>
    setChecked(initial)
    setLocalData(data)
  }, [data])

  React.useEffect(() => {
    if (!session) {
      router.navigate({ to: '/signin', replace: true })
    }
  }, [router, session])

  if (isLoading || !localData)
    return (
      <div className="route-starter flex flex-col">
        {/* <Database size={24} strokeWidth={2} className="animate-pulse" /> */}
        <div className="flex flex-col gap-4 w-[100px]">
          {[...Array(4).keys()].map((id) => {
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
      <div className="flex flex-col items-center gap-4">
        <motion.div layout className="flex flex-col-reverse">
          {status === 'success' &&
            localData.map((todo) => {
              const isChecked = checked[todo.id] ?? false
              return (
                <motion.label
                  key={todo.id}
                  layout
                  className="flex items-center gap-2 rounded-md px-2 py-1"
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
              className="w-full py-3 flex flex-row item-start gap-1.5"
              // initial={{ opacity: 0, y: 16, scale: 0.96 }}
              // animate={{ opacity: 1, y: 0, scale: 1 }}
              // exit={{ opacity: 0, y: 16, scale: 0.98 }}

              initial={{ opacity: 0, y: -16, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -16, scale: 0.98 }}
              transition={{
                type: 'spring',
                // stiffness: 200,
                // damping: 10,
                delay: 0.2,
                bounce: 0,
                duration: 0.35,
              }}
              onSubmit={handleSubmitNewTodo}
            >
              <TInput
                ref={newTodoInputRef}
                name="title"
                placeholder="What needs to be done?"
                className="h-8 w-full text-sm"
                required
              />
              <TButton
                type="submit"
                variant="plain"
                className="h-8 rounded-md flex self-stretch items-center justify-center bg-black/80 hover:bg-black"
                size="default"
              >
                <Save size={16} />
              </TButton>
            </motion.form>
          )}
        </motion.div>
        <motion.div
          layout
          className="w-fit"
          transition={{
            type: 'spring',
            bounce: 0.3,
            duration: 0.45,
          }}
        >
          <TButton
            variant="link"
            className="w-fit text-s-foreground/50 text-sm mx-auto"
            onClick={handleToggleAdd}
          >
            {isAdding ? 'Close new todo' : 'Add new todo'}
          </TButton>
        </motion.div>
      </div>
    </div>
  )
}
