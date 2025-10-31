import React, { Activity } from 'react'
import ReactDom from 'react-dom'
import { useDialog } from './dialog'
import { cn } from '@/lib/utils'
import { AnimatePresence, motion } from 'motion/react'

export const DialogContent = ({
  children,
  className,
  ...props
}: {
  children: React.ReactNode
} & React.HTMLAttributes<HTMLDivElement>) => {
  const { open, setOpen, triggerRef } = useDialog()

  React.useEffect(() => {
    if (!open && triggerRef.current) {
      triggerRef.current.focus()
    }
  }, [open, triggerRef])

  // if (!open) return null
  return ReactDom.createPortal(
    // <AnimatePresence>
    <>
      {/* <AnimateActivity mode={open ? 'visible' : 'hidden'}> Unlock in 11 Days :( */}
      <div
        tabIndex={0}
        role="dialog"
        data-slot="dialog-portal"
        // className="z-50 fixed inset-0 flex items-center justify-center"
      >
        {open && <DialogOverlay setOpen={setOpen} />}
        <AnimatePresence>
          {open && (
            <motion.div
              // role="dialog"
              aria-modal="true"
              data-slot="dialog-content"
              data-state={open ? 'open' : 'closed'}
              className={cn(
                'z-50 bg-background fixed top-[50%] left-[50%] translate-x-[-50%] translate-y-[-50%]',
                className
              )}
              initial={{ opacity: 0, scale: 0.95, y: 16 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 16 }}
              transition={{ type: 'spring', stiffness: 260, damping: 20 }}
              // {...props}
            >
              {children}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
      {/* </AnimateActivity> */}
    </>,
    document.body
  )
}

export const DialogOverlay = ({
  setOpen,
}: {
  setOpen: (v: boolean) => void
}) => {
  return (
    <motion.div
      data-slot="dialog-overlay"
      aria-hidden="true" // prevent sr from reading this
      role="presentation"
      className="absolute inset-0 bg-black/50"
      onClick={() => setOpen(false)}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    />
  )
}
