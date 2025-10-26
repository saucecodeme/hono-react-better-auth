import * as React from 'react'
import { createFileRoute, useRouter } from '@tanstack/react-router'
import { hc } from 'hono/client'
import type { AppType } from '../../../server'
import { useQuery } from '@tanstack/react-query'
import { BadgeAlert, Save } from 'lucide-react'
import { Checkbox as TCheckbox } from '@/components/tui/checkbox'
import { Skeleton } from '@/components/ui/skeleton'
import { authClient } from '@/lib/auth-client'
import { motion } from 'motion/react'
// import { useAnimationControls, AnimatePresence } from 'motion/react'
import { Button as TButton } from '@/components/tui/button'
import { Input as TInput } from '@/components/tui/input'
import {
  useCreateTodo,
  usePatchTodo,
  useDeleteTodo,
} from '@/utils/tanstack-query/useMutation'
import { createTodoSchema, patchTodoSchema } from '../../../server/types'
import z from 'zod'
import { triggerToast } from '@/utils/sonner/triggerToast'

// type TreeError = ReturnType<typeof z.treeifyError>

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
  const [editingTodoId, setEditingTodoId] = React.useState<string | null>(null)
  const [editingValue, setEditingValue] = React.useState('')
  const [formError, setFormError] = React.useState<string | null>(null)
  const [patchError, setPatchError] = React.useState<string | null>(null)
  const newTodoInputRef = React.useRef<HTMLInputElement>(null)
  const editingInputRef = React.useRef<HTMLInputElement>(null)
  const createTodo = useCreateTodo()
  const patchTodo = usePatchTodo()
  const deleteTodo = useDeleteTodo()
  const clickTimeoutRef = React.useRef<ReturnType<typeof setTimeout> | null>(
    null
  )

  const todos = React.useMemo(() => data ?? [], [data]) // ?? nullish coalescing operator

  const handleToggleAdd = () => {
    setIsAdding((prev) => !prev)
  }

  React.useEffect(() => {
    if (!isAdding) return
    const animationFrame = requestAnimationFrame(() => {
      newTodoInputRef.current?.focus()
    })
    return () => cancelAnimationFrame(animationFrame)
  }, [isAdding])

  React.useEffect(() => {
    if (!editingTodoId) return
    const frame = requestAnimationFrame(() => {
      editingInputRef.current?.focus()
      editingInputRef.current?.select()
    })
    return () => cancelAnimationFrame(frame)
  }, [editingTodoId])

  const handleSubmitNewTodo = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const form = e.currentTarget
    const formData = new FormData(form)
    const formObj = Object.fromEntries(formData.entries()) as { title: string }
    // Testing purpose
    // const formObj = {
    //   title: false,
    //   description: 'This is just a placeholder',
    // }

    const parsed = createTodoSchema.safeParse(formObj)
    if (!parsed.success) {
      const tree = z.treeifyError(parsed.error)
      setFormError(tree.errors?.[0] ?? 'Invalid input')
      return
    }

    createTodo.mutate(parsed.data)
    setLocalData((prev) => [
      {
        id: '',
        userId: '',
        title: parsed.data.title,
        description: parsed.data.description ?? '',
        completed: false,
        createdAt: '',
        updatedAt: '',
      },
      ...prev,
    ])
    form.reset()
    setIsAdding(false)
  }

  // Handle single & double click
  React.useEffect(() => {
    return () => {
      if (clickTimeoutRef.current) {
        clearTimeout(clickTimeoutRef.current)
      }
    }
  }, [])

  const handleClick = React.useCallback(
    (todoId: string) => {
      setChecked((prev) => ({
        ...prev,
        [todoId]: !prev[todoId],
      }))

      // Patch todo
      const parsed = patchTodoSchema.safeParse({ completed: !checked[todoId] })
      if (!parsed.success) {
        const tree = z.treeifyError(parsed.error)
        setPatchError(tree.errors[0] ?? 'Invalid error')
        return
      }
      patchTodo.mutate({ id: todoId, data: parsed.data })
    },
    [checked, patchTodo]
  )

  const handleEditTodo = React.useCallback(
    (todoId: string) => {
      const targetTodo = localData.find((todo) => todo.id === todoId)
      if (!targetTodo) return
      setEditingTodoId(todoId)
      setEditingValue(targetTodo.title)
    },
    [localData]
  )

  const handleEditCancel = React.useCallback(() => {
    setEditingTodoId(null)
    setEditingValue('')
  }, [])

  const handleEditCommit = React.useCallback(() => {
    if (!editingTodoId) return
    const trimmed = editingValue.trim() // Remove unnecessary whitespace
    if (trimmed.length === 0) {
      deleteTodo.mutate(editingTodoId)
      setLocalData((prev) => prev.filter((todo) => todo.id !== editingTodoId))
      handleEditCancel()
      return
    }

    setLocalData((prev) =>
      prev.map((todo) =>
        todo.id === editingTodoId ? { ...todo, title: trimmed } : todo
      )
    )

    // Patch todo
    const editedTodo = localData.find((todo) => todo.id === editingTodoId)!
    const parsed = patchTodoSchema.safeParse({ title: trimmed })
    if (editedTodo.title !== trimmed) {
      if (!parsed.success) {
        const tree = z.treeifyError(parsed.error)
        setPatchError(tree.errors[0] ?? 'Invalid input')
        handleEditCancel()
        return
      }
      patchTodo.mutate({ id: editingTodoId, data: parsed.data })
    }

    handleEditCancel()
  }, [
    editingTodoId,
    editingValue,
    handleEditCancel,
    patchTodo,
    deleteTodo,
    localData,
  ])

  const handleEditInputChange = React.useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      setEditingValue(event.target.value)
    },
    []
  )

  const handleEditInputKeyDown = React.useCallback(
    (event: React.KeyboardEvent<HTMLInputElement>) => {
      if (event.key === 'Enter') {
        event.preventDefault()
        handleEditCommit()
      } else if (event.key === 'Escape') {
        event.preventDefault()
        handleEditCancel()
      }
    },
    [handleEditCancel, handleEditCommit]
  )

  const handleTodoClick = React.useCallback(
    (todoId: string) => {
      if (clickTimeoutRef.current) {
        clearTimeout(clickTimeoutRef.current)
      }

      // Editing mode -> Do nothing
      if (editingTodoId) {
        clickTimeoutRef.current = null
        return
      }

      clickTimeoutRef.current = setTimeout(() => {
        handleClick(todoId)
        clickTimeoutRef.current = null
      }, 200)
    },
    [editingTodoId, handleClick]
  )

  const handleTodoDoubleClick = React.useCallback(
    (todoId: string) => {
      if (clickTimeoutRef.current) {
        clearTimeout(clickTimeoutRef.current)
        clickTimeoutRef.current = null
      }
      handleEditTodo(todoId)
    },
    [handleEditTodo]
  )

  // ---

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

  React.useEffect(() => {
    if (formError) {
      triggerToast('error', formError)
      setFormError('')
    }

    if (patchError) {
      triggerToast('error', patchError)
      setPatchError('')
    }
  }, [formError, patchError])

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
      <div className="w-full flex flex-col items-center gap-4">
        <motion.div
          layout
          className="w-[90%] md:w-fit md:max-w-[50vw] flex flex-col"
        >
          {isAdding && (
            <motion.form
              className="w-full py-3 flex flex-row item-start gap-1.5"
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
          {status === 'success' &&
            localData.map((todo) => {
              const isChecked = checked[todo.id] ?? false
              return (
                <motion.label
                  key={todo.id}
                  layout
                  animate={{ scale: editingTodoId === todo.id ? 1.04 : 1 }}
                  transition={{ type: 'spring', stiffness: 260, damping: 20 }}
                  className="flex items-center gap-2 rounded-md px-2 py-1 select-none"
                  onClick={() => handleTodoClick(todo.id)}
                  onDoubleClick={() => handleTodoDoubleClick(todo.id)}
                >
                  <TCheckbox
                    hidden={editingTodoId === todo.id}
                    checked={checked[todo.id]}
                  />
                  {editingTodoId === todo.id ? (
                    <TInput
                      ref={editingInputRef}
                      value={editingValue}
                      onChange={handleEditInputChange}
                      onBlur={handleEditCommit}
                      onKeyDown={handleEditInputKeyDown}
                      className="h-7 w-full text-sm"
                    />
                  ) : (
                    <div className="relative inline-block truncate">
                      <span>{todo.title}</span>
                      <motion.span
                        className="pointer-events-none absolute left-0 right-0 top-1/2 h-0.5 bg-current"
                        initial={false}
                        animate={{ scaleX: isChecked ? 1 : 0 }}
                        transition={{ duration: 0.25, ease: 'easeInOut' }}
                        style={{ transformOrigin: 'left center' }}
                      />
                    </div>
                  )}
                </motion.label>
              )
            })}
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
