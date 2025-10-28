import * as React from 'react'
import type { TodoQuery } from '../../../../server/types'
import { motion, AnimatePresence } from 'motion/react'
import { Checkbox as TCheckbox } from '@/components/tui/checkbox'
import { Input as TInput } from '@/components/tui/input'
import { useEffect, useRef } from 'react'

export interface TodoComponentProps {
  todo: TodoQuery
  isEditing: boolean
  editingTodo: TodoQuery
  handleTodoClick: (id: string) => void
  handleTodoDoubleClick: (id: string) => void
  handleEditInputChange: (e: React.FormEvent<HTMLFormElement>) => void
  // handleEditCommit: () => void
  handleEditInputKeyDown: (e: React.KeyboardEvent<HTMLFormElement>) => void
}

export const TodoComponent = React.forwardRef<
  HTMLInputElement,
  TodoComponentProps
>(
  (
    {
      todo,
      isEditing,
      editingTodo,
      handleTodoClick,
      handleTodoDoubleClick,
      handleEditInputChange,
      // handleEditCommit,
      handleEditInputKeyDown,
    },
    ref
  ) => {
    // console.log('todo:', todo)
    const textareaRef = useRef<HTMLTextAreaElement>(null)

    const autoResizeTextarea = () => {
      const textarea = textareaRef.current
      if (textarea) {
        textarea.style.height = 'auto'
        textarea.style.height = `${textarea.scrollHeight}px`
      }
    }

    useEffect(() => {
      if (isEditing) {
        autoResizeTextarea()
      }
    }, [isEditing, editingTodo.description])

    // const handleFormChange = (e: React.FormEvent<HTMLFormElement>) => {
    //   console.log()
    //   const form = e.currentTarget
    //   const formData = new FormData(form)
    //   const payload = Object.fromEntries(formData.entries())
    //   console.log(payload)
    // }
    return (
      <>
        {/* <AccordionDemo /> */}
        <motion.form
          layout
          // ref={ref}
          className={`w-[300px] h-fit px-2 flex flex-col items-start justify-start rounded-lg \
            ${isEditing ? '' : ''}`}
          onDoubleClick={() => handleTodoDoubleClick(todo.id)}
          onChange={handleEditInputChange}
          onKeyDown={handleEditInputKeyDown}
          // onBlur={handleEditCommit}
          animate={{
            scale: isEditing ? 1.04 : 1,
            backgroundColor: isEditing ? '#fffcec10' : 'rgba(0,0,0,0)',
            padding: isEditing ? '8px 8px' : '4px 8px',
            margin: isEditing ? '10px 0px' : '0px 0px',
          }}
          transition={{ type: 'spring', stiffness: 260, damping: 20 }}
        >
          <div className="w-full flex flex-row justify-start items-center gap-2">
            <TCheckbox
              checked={todo.completed}
              onCheckedChange={() => handleTodoClick(todo.id)}
            />

            {isEditing ? (
              <TInput
                ref={ref}
                id={`title-${todo.id}`}
                name="title"
                variant="plain"
                defaultValue={editingTodo.title}
                // onKeyDown={handleEditInputKeyDown}
                className="w-full rounded-none"
              />
            ) : (
              <div className="relative min-w-0">
                <p className="truncate">{todo.title}</p>
                <motion.span
                  className="pointer-events-none absolute left-0 right-0 top-1/2 h-0.5 bg-current"
                  initial={false}
                  animate={{ scaleX: todo.completed ? 1 : 0 }}
                  transition={{ duration: 0.2, ease: 'easeInOut' }}
                  style={{ transformOrigin: 'left center' }}
                />
              </div>
            )}
          </div>

          <AnimatePresence initial={false}>
            {isEditing && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{
                  height: 'auto',
                  opacity: 1,
                }}
                exit={{
                  height: 0,
                  opacity: 0,
                }}
                className="overflow-hidden pl-6 w-full text-s-foreground/70 text-sm font-normal"
              >
                <textarea
                  ref={textareaRef}
                  id={`desc-${todo.id}`}
                  name="description"
                  className="my-1 mb-3 w-full text-sm outline-none resize-none overflow-hidden"
                  defaultValue={editingTodo.description ?? ''}
                  placeholder="Notes"
                  onChange={autoResizeTextarea}
                  style={{ minHeight: '24px' }}
                />
              </motion.div>
            )}
          </AnimatePresence>
        </motion.form>
      </>
    )
  }
)
