import type { ComponentType } from 'react'
import { toast } from 'sonner'
import { Unplug, BadgeCheck, Bug, Save } from 'lucide-react'

type TriggerCase = 'signin' | 'signout' | 'offline' | 'error' | 'save'

type ToastConfig = {
  message: string
  icon: ComponentType<{ size?: number; strokeWidth?: number }>
}

const toastConfig: Record<TriggerCase, ToastConfig> = {
  signin: {
    message: 'Signed in successfully.',
    icon: BadgeCheck,
  },
  signout: {
    message: 'Signed out successfully.',
    icon: Unplug,
  },
  offline: {
    message: 'You appear to be offline.',
    icon: Unplug,
  },
  error: {
    message: 'An unexpected errors occured',
    icon: Bug,
  },
  save: {
    message: 'Autosave',
    icon: Save,
  },
}

export function triggerToast(triggerCase: TriggerCase, customMessage = '') {
  const config = toastConfig[triggerCase]
  if (!config) return

  const Icon = config.icon

  toast(customMessage ? customMessage : config.message, {
    icon: <Icon size={16} strokeWidth={3} />,
  })
}
