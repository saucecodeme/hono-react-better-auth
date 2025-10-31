import * as React from 'react'
import { createFileRoute, useRouter } from '@tanstack/react-router'
import { hc } from 'hono/client'
import type { AppType } from '../../../server'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { BadgeAlert, Tag } from 'lucide-react'
// import { Checkbox as TCheckbox } from '@/components/tui/checkbox'
import { Skeleton } from '@/components/ui/skeleton'
import { authClient } from '@/lib/auth-client'
import { motion } from 'motion/react'
import { Button as TButton } from '@/components/tui/button'
// import { Input as TInput } from '@/components/tui/input'
import {
  useCreateTodo,
  usePatchTodo,
  useDeleteTodo,
} from '@/utils/tanstack-query/useMutation'
import { triggerToast } from '@/utils/sonner/triggerToast'
import { TodoComponent } from '@/components/tui/todo'

import {
  patchTodoSchema,
  type CreateTodo,
  type TodoQuery,
  type TagQuery,
} from '../../../server/types'
import z from 'zod'
import { Dialog, DialogContent } from '@/components/tui/dialog'
import { TagsComponent } from '@/components/tui/tagsComponent'

export const Route = createFileRoute('/todos')({
  component: RouteComponent,
})

type Todos = TodoQuery[]
type Tags = TagQuery[]

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
  const [forceLoading, setForceLoading] = React.useState(true)

  const { data: session, isPending } = authClient.useSession()
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
  const { data: tagsData } = useQuery<Tags>({
    queryKey: ['tags'],
    queryFn: async () => {
      const res = await client.api.tags.$get()
      if (!res.ok) throw new Error('Failed to fetch todos')
      return res.json()
    },
  })

  React.useEffect(() => {
    const ref = setTimeout(() => {
      setForceLoading(false)
    }, 3000)
    return clearTimeout(ref)
  }, [])

  // Only recalculate this value when the deps change
  const todos = React.useMemo(() => data ?? [], [data])
  // For mapping, eliminated unnecessary loop method
  const todoMap = React.useMemo(
    () => new Map(todos.map((todo) => [todo.id, todo])),
    [todos]
  )
  const tags = React.useMemo(() => tagsData ?? [], [tagsData])
  // const tagMap = React.useMemo(
  //   () => new Map(tags.map((tag) => [tag.id, tag])),
  //   [tags]
  // )

  const [editingTodoId, setEditingTodoId] = React.useState<string | null>(null)
  const [editingTodo, setEditingTodo] = React.useState<TodoQuery>(TODO)

  const editingInputRef = React.useRef<HTMLInputElement>(null)
  const clickTimeoutRef = React.useRef<ReturnType<typeof setTimeout>>(null)
  // const currentTodoContainerRef = React.useRef<HTMLFormElement | null>(null)
  const todoContainerRefs = React.useRef<Record<string, HTMLFormElement>>({})

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
  const navigateToSignin = React.useEffectEvent(() => {
    router.navigate({ to: '/signin', replace: true })
  })

  React.useEffect(() => {
    if (!session && !isPending) {
      navigateToSignin()
    }
  }, [session, isPending, navigateToSignin])

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
              : 'Failed to update todo'
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
      // console.log(e)
      // const isMovingToDialog = e.relatedTarget?.closest('[role="dialog"]')
      if (!e.currentTarget.contains(e.relatedTarget)) handleEditCommit()
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

  // React.useEffect(() => {
  //   if (!editingTodoId) return

  //   function handleDocumentClick(e: MouseEvent) {
  //     if (!editingTodoId) return
  //     if (
  //       todoContainerRefs.current[editingTodoId] &&
  //       !todoContainerRefs.current[editingTodoId].contains(e.target as Node)
  //     ) {
  //       handleEditCommit()
  //     }
  //   }

  //   document.addEventListener('mousedown', handleDocumentClick)
  //   return () => document.removeEventListener('mousedown', handleDocumentClick)
  // }, [editingTodoId, handleEditCommit])

  if (isLoading && forceLoading) {
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
          <Dialog>
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
                  containerRef={(el: HTMLFormElement) => {
                    todoContainerRefs.current[todo.id] = el
                  }}
                />
              )
            })}
            <TagsComponent tags={tags} />
            <DialogContent
              className="px-4 py-4 bg-s-accent/30 rounded-lg min-w-[250px] shadow-lg \
                flex flex-col items-center justify-start gap-4 backdrop-blur-sm"
            >
              <p>Tags</p>
              <div className="w-full flex flex-col gap-1 items-start justify-start">
                {['Frontend', 'Backend', 'UIUX'].map((tagName) => (
                  <div
                    key={tagName}
                    className="w-full px-3 py-1 flex flex-row justify-start items-center \
                        rounded-md gap-2 text-s-primary hover:bg-black/20 transition-all duration-200 ease-in-out"
                  >
                    <Tag size={12} strokeWidth={3} />
                    <span>{tagName}</span>
                  </div>
                ))}
              </div>
            </DialogContent>
          </Dialog>
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
