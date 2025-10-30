import React from 'react'

type DialogContextType = {
  open: boolean
  setOpen: (v: boolean) => void
  triggerRef: React.RefObject<HTMLButtonElement | null>
}

const DialogContext = React.createContext<DialogContextType | null>(null)

export const Dialog = ({ children }: { children: React.ReactNode }) => {
  const [open, setOpen] = React.useState(false)
  const triggerRef = React.useRef<HTMLButtonElement>(null)
  return (
    <DialogContext.Provider value={{ open, setOpen, triggerRef }}>
      {children}
    </DialogContext.Provider>
  )
}

export const useDialog = () => {
  const ctx = React.useContext(DialogContext)
  if (!ctx) throw new Error('useDialog must be used within <Dialog>')
  return ctx
}
