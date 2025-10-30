import * as React from 'react'
import type { TodoQuery } from '../../../../server/types'
import { motion, AnimatePresence } from 'motion/react'
import { Checkbox as TCheckbox } from '@/components/tui/checkbox'
import { Input as TInput } from '@/components/tui/input'
import { Tag } from 'lucide-react'
import { Dialog, DialogTrigger, DialogContent } from '@/components/tui/dialog'

export interface TodoComponentProps {
  todo: TodoQuery
  isEditing: boolean
  editingTodo: TodoQuery
  handleTodoClick: (id: string) => void
  handleTodoDoubleClick: (id: string) => void
  handleEditInputChange: (e: React.FormEvent<HTMLFormElement>) => void
  // handleEditCommit: () => void
  handleEditInputKeyDown: (e: React.KeyboardEvent<HTMLFormElement>) => void
  handleLoseFocus: (e: React.FocusEvent<HTMLFormElement>) => void
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
      handleEditInputKeyDown,
      handleLoseFocus,
    },
    ref
  ) => {
    return (
      <>
        <motion.form
          layout
          // ref={ref}
          className={`w-[300px] h-fit px-2 flex flex-col items-start justify-start rounded-lg`}
          onDoubleClick={() => handleTodoDoubleClick(todo.id)}
          onChange={handleEditInputChange}
          onKeyDown={handleEditInputKeyDown}
          onBlur={handleLoseFocus}
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
                  id={`desc-${todo.id}`}
                  name="description"
                  className="my-1 w-full text-sm outline-none resize-none overflow-hidden field-sizing-content"
                  defaultValue={editingTodo.description ?? ''}
                  placeholder="Notes"
                  style={{ minHeight: '24px' }}
                />
                <div className="w-full flex justify-between items-center">
                  <div className="flex flex-row gap-1">
                    <div className="px-2 py-1 flex flex-row gap-1 items-center bg-s-destructive/50 rounded-lg text-xs">
                      <Tag size={10} strokeWidth={3} />
                      <span>Frontend</span>
                    </div>
                    <div className="px-2 py-1 flex flex-row gap-1 items-center bg-s-success/50 rounded-lg text-xs">
                      <Tag size={10} strokeWidth={3} />
                      <span>Backend</span>
                    </div>
                  </div>
                  <DialogTrigger className="p-1 rounded-md">
                    <Tag size={14} strokeWidth={3} />
                  </DialogTrigger>
                </div>
                {/* <Dialog>
                  <div className="w-full h-5 flex flex-row justify-end items-center">
                    <DialogTrigger>
                      <Tag size={14} strokeWidth={3} />
                    </DialogTrigger>
                    <DialogContent
                      className="p-4 bg-s-accent/10 rounded-lg min-w-[250px]
                        shadow-lg
                        flex flex-col items-center justify-start gap-4 backdrop-blur-sm"
                    >
                      <p>Tags</p>
                      <div className="w-full flex flex-col gap-2 items-start justify-start">
                        {['Frontend', 'Backend', 'UIUX'].map((tagName) => (
                          <div
                            key={tagName}
                            className="flex flex-row justify-start items-center gap-2"
                          >
                            <Tag size={12} strokeWidth={2} />
                            <span>{tagName}</span>
                          </div>
                        ))}
                      </div>
                    </DialogContent>
                  </div>
                </Dialog> */}
                {/* <div className="mb-3 " /> */}
              </motion.div>
            )}
          </AnimatePresence>
        </motion.form>
      </>
    )
  }
)
