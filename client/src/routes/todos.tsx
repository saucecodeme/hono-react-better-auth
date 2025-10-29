import * as React from 'react'
import { createFileRoute, useRouter } from '@tanstack/react-router'
import { hc } from 'hono/client'
import type { AppType } from '../../../server'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { BadgeAlert, Save } from 'lucide-react'
// import { Checkbox as TCheckbox } from '@/components/tui/checkbox'
import { Skeleton } from '@/components/ui/skeleton'
import { authClient } from '@/lib/auth-client'
import { motion } from 'motion/react'
import { Button as TButton } from '@/components/tui/button'
import { Input as TInput } from '@/components/tui/input'
import {
  useCreateTodo,
  usePatchTodo,
  useDeleteTodo,
} from '@/utils/tanstack-query/useMutation'
import { triggerToast } from '@/utils/sonner/triggerToast'
import { TodoComponent } from '@/components/tui/todo'

import {
  createTodoSchema,
  patchTodoSchema,
  type CreateTodo,
  type TodoQuery,
} from '../../../server/types'
import z from 'zod'

export const Route = createFileRoute('/todos')({
  component: RouteComponent,
})

type Todos = TodoQuery[]

const client = hc<AppType>('/')

const TODO: TodoQuery = {
  id: '',
  createdAt: '',
  updatedAt: '',
  userId: '',
  title: '',
  description: '',
  completed: false,
}

function RouteComponent() {
  const { data: session } = authClient.useSession()
  const router = useRouter()
  const queryClient = useQueryClient()
  const { data, isLoading, error } = useQuery<Todos>({
    queryKey: ['todos'],
    queryFn: async () => {
      const res = await client.api.todos.$get()
      if (!res.ok) throw new Error('Failed to fetch todos')
      return res.json()
    },
  })

  // Only recalculate this value when the deps change
  const todos = React.useMemo(() => {
    // console.log('Todos:', data)
    return data ?? []
  }, [data])
  // For mapping, eliminated unnecessary loop method
  const todoMap = React.useMemo(
    () => new Map(todos.map((todo) => [todo.id, todo])),
    [todos]
  )

  // const [isAdding, setIsAdding] = React.useState(false)
  const [editingTodoId, setEditingTodoId] = React.useState<string | null>(null)
  const [editingTodo, setEditingTodo] = React.useState<TodoQuery>(TODO)

  const newTodoInputRef = React.useRef<HTMLInputElement>(null)
  const editingInputRef = React.useRef<HTMLInputElement>(null)
  const clickTimeoutRef = React.useRef<ReturnType<typeof setTimeout>>(null)

  // ? No need to wrap this inside useEffectEvent
  const showError = React.useEffectEvent((message: string) => {
    triggerToast('error', message)
  })
  const clearPendingClick = React.useEffectEvent(() => {
    if (clickTimeoutRef.current) {
      clearTimeout(clickTimeoutRef.current)
      clickTimeoutRef.current = null
    }
  })

  // Comment this out first
  React.useEffect(() => {
    if (!session) {
      router.navigate({ to: '/signin', replace: true })
    }
  }, [router, session])

  // Focusing the specific element for better UX
  // React.useEffect(() => {
  //   if (!isAdding) return
  //   const frame = requestAnimationFrame(() => {
  //     newTodoInputRef.current?.focus()
  //   })

  //   return () => cancelAnimationFrame(frame)
  // }, [isAdding])

  React.useEffect(() => {
    if (!editingTodoId) return
    const frame = requestAnimationFrame(() => {
      editingInputRef.current?.focus()
      editingInputRef.current?.select()
    })
    return () => cancelAnimationFrame(frame)
  }, [editingTodoId])

  // To make sure that the callback is not running after unmount
  React.useEffect(() => {
    return () => clearPendingClick()
  }, [clearPendingClick])

  // Use useMutation from TanStack Query to send the request and call invalidateQueries on success
  const createTodo = useCreateTodo()
  const patchTodo = usePatchTodo()
  const deleteTodo = useDeleteTodo()

  // Prevent TButton unnecessary re-renders
  // const handleToggleAdd = React.useCallback(
  //   () => setIsAdding((prev) => !prev),
  //   []
  // )

  // ? No need to wrap this inside useCallback
  // const handleSubmitNewTodo = React.useCallback(
  //   (e: React.FormEvent<HTMLFormElement>) => {
  //     e.preventDefault()
  //     const formData = new FormData(e.currentTarget)
  //     const payload = Object.fromEntries(formData.entries()) as {
  //       title: string
  //     }
  //     const parsed = createTodoSchema.safeParse(payload)
  //     if (parsed.error) {
  //       showError(z.treeifyError(parsed.error).errors?.[0] ?? 'Invalid input')
  //       return
  //     }

  //     createTodo.mutate(parsed.data, {
  //       onSuccess: (createdTodo) => {
  //         // update query data cache manually (UI update instantly)
  //         queryClient.setQueryData<Todos>(['todos'], (prev = []) => [
  //           createdTodo as TodoQuery,
  //           ...prev,
  //         ])
  //       },
  //       onError: (mutationError) => {
  //         showError(
  //           mutationError instanceof Error
  //             ? mutationError.message
  //             : 'Failed to create todo'
  //         )
  //       },
  //     })

  //     e.currentTarget.reset()
  //     setIsAdding(false)
  //   },
  //   [createTodo, queryClient, showError]
  // )

  // Single & Double click, Editing mode
  const handleCompleteToggle = React.useCallback(
    (id: string) => {
      const todo = todoMap.get(id)
      if (!todo) return

      const nextCompleted = !todo.completed
      patchTodo.mutate(
        { id, data: { completed: nextCompleted } },
        {
          onSuccess: () => {
            // update query data cache manually (UI update instantly)
            queryClient.setQueryData<Todos>(['todos'], (prev = []) =>
              prev?.map((todo) =>
                todo.id === id ? { ...todo, completed: nextCompleted } : todo
              )
            )
          },
          onError: (mutationError) => {
            showError(
              mutationError instanceof Error
                ? mutationError.message
                : 'Failed to update todo'
            )
          },
        }
      )
    },
    [patchTodo, queryClient, showError, todoMap]
  )

  const handleTodoClick = React.useCallback(
    (id: string) => {
      clearPendingClick()
      // if (editingTodoId) return // Do nothing in the editing mode

      clickTimeoutRef.current = setTimeout(() => {
        handleCompleteToggle(id)
        clickTimeoutRef.current = null
      }, 200)
    },
    [clearPendingClick, handleCompleteToggle]
  )

  const handleEditTodo = React.useCallback(
    (id: string) => {
      const todo = todoMap.get(id)
      if (!todo) return
      setEditingTodoId(id)
      setEditingTodo(todo)
    },
    [todoMap]
  )

  const handleEditCancel = React.useCallback(() => {
    setEditingTodoId(null)
    setEditingTodo(TODO)
  }, [])

  const handleEditCommit = React.useCallback(() => {
    if (!editingTodoId) return
    const newTitle = editingTodo.title.trim()
    const newDescription = editingTodo.description?.trim() ?? ''
    const todo = todoMap.get(editingTodoId)
    if (
      !todo ||
      (todo.title === newTitle && todo.description === newDescription)
    ) {
      handleEditCancel()
      return
    }

    // Delete todo
    if (!newTitle && !newDescription) {
      deleteTodo.mutate(editingTodoId, {
        onSuccess: (deletedTodo) => {
          queryClient.setQueryData<Todos>(['todos'], (prev = []) =>
            prev.filter((todo) => todo.id !== (deletedTodo as TodoQuery).id)
          )
        },
        onError: (mutationError) => {
          showError(
            mutationError instanceof Error
              ? mutationError.message
              : 'Failed to delete todo'
          )
        },
      })
      handleEditCancel()
      return
    }

    const parsed = patchTodoSchema.safeParse({
      title: newTitle,
      description: newDescription,
    })
    if (parsed.error) {
      showError(z.treeifyError(parsed.error).errors?.[0] ?? 'Invalid input')
      return
    }
    patchTodo.mutate(
      { id: editingTodoId, data: parsed.data },
      {
        onSuccess: (updatedTodo) => {
          triggerToast('save')
          queryClient.setQueryData<Todos>(['todos'], (prev = []) =>
            prev.map((todo) =>
              todo.id === (updatedTodo as TodoQuery).id
                ? (updatedTodo as TodoQuery)
                : todo
            )
          )
        },
        onError: (mutationError) => {
          showError(
            mutationError instanceof Error
              ? mutationError.message
              : 'Failed to delete todo'
          )
        },
      }
    )

    handleEditCancel()
  }, [
    deleteTodo,
    editingTodoId,
    editingTodo,
    handleEditCancel,
    patchTodo,
    queryClient,
    showError,
    todoMap,
  ])

  const handleTodoDoubleClick = React.useCallback(
    (id: string) => {
      clearPendingClick()
      handleEditTodo(id)
    },
    [handleEditTodo, clearPendingClick]
  )

  const handleLoseFocus = React.useCallback(
    (e: React.FocusEvent<HTMLFormElement>) => {
      if (!e.currentTarget.contains(e.relatedTarget)) {
        console.log('Outside form')
        handleEditCommit()
      }
    },
    [handleEditCommit]
  )

  const handleEditInputChange = React.useCallback(
    (e: React.FormEvent<HTMLFormElement>) => {
      const form = e.currentTarget
      const formData = new FormData(form)
      const payload = Object.fromEntries(formData.entries()) as {
        title: string
        description: string
      }
      setEditingTodo((prev) => ({
        ...(prev as TodoQuery),
        title: payload.title as string,
        description: payload.description as string,
      }))
    },
    []
  )

  const handleEditInputKeyDown = React.useCallback(
    (e: React.KeyboardEvent<HTMLFormElement>) => {
      if (e.key === 'Enter') {
        e.preventDefault()
        handleEditCommit()
      } else if (e.key === 'Escape') {
        e.preventDefault()
        handleEditCommit()
        handleEditCancel()
      }
    },
    [handleEditCommit, handleEditCancel]
  )

  const handleInitNewTodo = React.useCallback(() => {
    const blankTodo: CreateTodo = { title: 'New todo', description: '' }
    createTodo.mutate(blankTodo, {
      onSuccess: (createdTodo) => {
        // update query data cache manually (UI update instantly) -> this is not instantly
        queryClient.setQueryData<Todos>(['todos'], (prev = []) => [
          createdTodo as TodoQuery,
          ...prev,
        ])
        triggerToast('save', 'Init new todo')
        // handleTodoDoubleClick((createdTodo as TodoQuery).id)
        // handleEditTodo((createdTodo as TodoQuery).id)
        setEditingTodoId((createdTodo as TodoQuery).id)
        setEditingTodo(createdTodo as TodoQuery)
      },
      onError: (mutationError) => {
        showError(
          mutationError instanceof Error
            ? mutationError.message
            : 'Failed to create todo'
        )
      },
    })
  }, [createTodo, queryClient, showError])

  if (isLoading) {
    return (
      <div className="route-starter flex flex-col">
        <div className="flex flex-col gap-4 w-[100px]">
          {[...Array(4).keys()].map((id) => (
            <div key={id} className="flex gap-2 items-center opacity-30">
              <Skeleton className="size-4 shrink-0 rounded-lg" />
              <Skeleton className="w-full h-4" />
            </div>
          ))}
        </div>
      </div>
    )
  }

  if (error instanceof Error) {
    return (
      <div role="alert" className="route-starter flex gap-2">
        <BadgeAlert size={24} strokeWidth={3} />
        <span>Error: {error.message}</span>
      </div>
    )
  }

  return (
    <section className="route-starter">
      <div className="w-full flex flex-col items-center gap-4">
        <motion.div>
          {/* {isAdding && (
            <motion.form
              className="w-full py-3 flex flex-row item-start gap-1.5"
              initial={{ opacity: 0, y: -16, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -16, scale: 0.98 }}
              transition={{
                type: 'spring',
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
                disabled={createTodo.isPending}
              >
                <Save size={16} />
              </TButton>
            </motion.form>
          )} */}

          {/* {todos.map((todo) => {
            const isEditing = editingTodoId === todo.id

            return (
              <motion.div
                key={todo.id}
                layout
                animate={{ scale: isEditing ? 1.04 : 1 }}
                transition={{ type: 'spring', stiffness: 260, damping: 20 }}
                className="min-w-[250px] flex items-center gap-2 rounded-md px-2 py-1 select-none"
                // onClick={() => handleTodoClick(todo.id)}
                onDoubleClick={() => handleTodoDoubleClick(todo.id)}
              >
                <TCheckbox
                  hidden={isEditing}
                  checked={todo.completed}
                  onCheckedChange={() => handleTodoClick(todo.id)}
                />
                {isEditing ? (
                  <TInput
                    // ref={editingInputRef}
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
                      animate={{ scaleX: todo.completed ? 1 : 0 }}
                      transition={{ duration: 0.2, ease: 'easeInOut' }}
                      style={{ transformOrigin: 'left center' }}
                    />
                  </div>
                )}
              </motion.div>
            )
          })} */}

          {todos.map((todo) => {
            const isEditing = editingTodoId === todo.id
            return (
              <TodoComponent
                ref={editingInputRef}
                key={todo.id}
                todo={todo}
                isEditing={isEditing}
                editingTodo={editingTodo}
                handleTodoClick={handleTodoClick}
                handleTodoDoubleClick={handleTodoDoubleClick}
                handleEditInputChange={handleEditInputChange}
                handleEditInputKeyDown={handleEditInputKeyDown}
                handleLoseFocus={handleLoseFocus}
              />
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
            className="text-s-foreground/50 text-sm"
            onClick={handleInitNewTodo}
          >
            Add new todo
          </TButton>
        </motion.div>
      </div>
    </section>
  )
}
