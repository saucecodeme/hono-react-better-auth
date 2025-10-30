import * as React from 'react'
import { createFileRoute, useRouter } from '@tanstack/react-router'
import { hc } from 'hono/client'
import type { AppType } from '../../../server'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { BadgeAlert } from 'lucide-react'
import { Skeleton } from '@/components/ui/skeleton'
import { authClient } from '@/lib/auth-client'
import { motion } from 'motion/react'
import { Button as TButton } from '@/components/tui/button'
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

  const todos = React.useMemo(() => {
    return data ?? []
  }, [data])

  const todoMap = React.useMemo(
    () => new Map(todos.map((todo) => [todo.id, todo])),
    [todos]
  )

  const [editingTodoId, setEditingTodoId] = React.useState<string | null>(null)
  const [editingTodo, setEditingTodo] = React.useState<TodoQuery>(TODO)

  const editingInputRef = React.useRef<HTMLInputElement>(null)
  const clickTimeoutRef = React.useRef<ReturnType<typeof setTimeout>>(null)

  const showError = React.useEffectEvent((message: string) => {
    triggerToast('error', message)
  })
  const clearPendingClick = React.useEffectEvent(() => {
    if (clickTimeoutRef.current) {
      clearTimeout(clickTimeoutRef.current)
      clickTimeoutRef.current = null
    }
  })

  React.useEffect(() => {
    if (!session) {
      router.navigate({ to: '/signin', replace: true })
    }
  }, [router, session])

  React.useEffect(() => {
    if (!editingTodoId) return
    const frame = requestAnimationFrame(() => {
      editingInputRef.current?.focus()
      editingInputRef.current?.select()
    })
    return () => cancelAnimationFrame(frame)
  }, [editingTodoId])

  React.useEffect(() => {
    return () => clearPendingClick()
  }, [clearPendingClick])

  const createTodo = useCreateTodo()
  const patchTodo = usePatchTodo()
  const deleteTodo = useDeleteTodo()

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
          const todo = deletedTodo as TodoQuery
          queryClient.setQueryData<Todos>(['todos'], (prev = []) =>
            prev.filter((item) => item.id !== todo.id)
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
          const todo = updatedTodo as TodoQuery
          triggerToast('save')
          queryClient.setQueryData<Todos>(['todos'], (prev = []) =>
            prev.map((item) => (item.id === todo.id ? todo : item))
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
        handleEditCommit()
      }
    },
    [handleEditCommit]
  )

  const handleEditInputChange = React.useCallback(
    (e: React.FormEvent<HTMLFormElement>) => {
      const form = e.currentTarget
      const formData = new FormData(form)
      const title = formData.get('title')
      const description = formData.get('description')

      setEditingTodo((prev) => ({
        ...prev,
        title: typeof title === 'string' ? title : '',
        description: typeof description === 'string' ? description : '',
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
        const todo = createdTodo as TodoQuery
        queryClient.setQueryData<Todos>(['todos'], (prev = []) => [
          todo,
          ...prev,
        ])
        triggerToast('save', 'Init new todo')
        setEditingTodoId(todo.id)
        setEditingTodo(todo)
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
