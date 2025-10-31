import React from 'react'
import { useDialog } from './dialog'
import { cn } from '@/lib/utils'

export const DialogTrigger = ({
  children,
  className,
  ...props
}: {
  children: React.ReactNode
} & React.ButtonHTMLAttributes<HTMLButtonElement>) => {
  const { setOpen, triggerRef } = useDialog()

  React.useEffect(() => {
    if (triggerRef.current) {
      triggerRef.current.focus()
    }
  }, [triggerRef])

  return (
    <button
      ref={triggerRef}
      tabIndex={0}
      type="button"
      data-slot="dialog-trigger"
      aria-haspopup="dialog"
      aria-expanded={false}
      onClick={() => setOpen(true)}
      className={cn(
        'outline-none focus-visible:ring-s-foreground/50 focus-visible:ring-2',
        className
      )}
      {...props}
    >
      {children}
    </button>
  )
}
