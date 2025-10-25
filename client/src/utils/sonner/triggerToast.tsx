import type { ComponentType } from 'react'
import { toast } from 'sonner'
import { Unplug, BadgeCheck } from 'lucide-react'

type TriggerCase = 'signin' | 'signout' | 'offline'

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
}

export function triggerToast(triggerCase: TriggerCase, customMessage = '') {
  const config = toastConfig[triggerCase]
  if (!config) return

  const Icon = config.icon

  toast(customMessage ? customMessage : config.message, {
    icon: <Icon size={16} strokeWidth={3} />,
  })
}
