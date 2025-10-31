import * as React from 'react'
import type { TodoQuery } from '../../../../server/types'
import { motion, AnimatePresence } from 'motion/react'
import { Checkbox as TCheckbox } from '@/components/tui/checkbox'
import { Input as TInput, AutoWidthInput } from '@/components/tui/input'
import { Tag, CirclePlus } from 'lucide-react'
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
  containerRef: (el: HTMLFormElement) => void
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
      containerRef,
    },
    ref
  ) => {
    const [isOpenTag, setIsOpenTag] = React.useState(false)

    return (
      <div className="flex flex-col gap-0">
        <motion.form
          layout
          // ref={containerRef}
          className={`w-[300px] h-fit flex flex-col items-start justify-start rounded-lg`}
          onDoubleClick={() => handleTodoDoubleClick(todo.id)}
          onChange={handleEditInputChange}
          onKeyDown={handleEditInputKeyDown}
          // onBlur={handleLoseFocus}
          animate={{
            scale: isEditing ? 1 : 1,
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
                    {/* <div className="px-2 py-1 flex flex-row gap-1 items-center bg-s-destructive/50 rounded-lg text-xs">
                      <Tag size={10} strokeWidth={3} />
                      <span>Frontend</span>
                    </div>
                    <div className="px-2 py-1 flex flex-row gap-1 items-center bg-s-success/50 rounded-lg text-xs">
                      <Tag size={10} strokeWidth={3} />
                      <span>Backend</span>
                    </div> */}
                    {/* <TagComponent tagName="Frontend" />
                    <TagComponent tagName="Backend" /> */}
                  </div>
                </div>
                <div className="w-full flex justify-end">
                  <Tag
                    size={14}
                    strokeWidth={3}
                    className="self-end"
                    onClick={() => setIsOpenTag((prev) => !prev)}
                  />
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.form>

        <AnimatePresence>
          {isOpenTag && (
            <motion.div
              layout
              className="overflow-hidden w-[300px] bg-[#fffcec10] rounded-lg"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{
                opacity: { duration: 0.1 },
                height: { duration: 0.3 },
                padding: { duration: 0.3 },
              }}
            >
              <TagsComponent />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    )
  }
)

{
  /* <Dialog>
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
</Dialog> */
}
{
  /* <div className="mb-3 " /> */
}
