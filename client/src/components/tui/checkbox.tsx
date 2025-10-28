import * as React from 'react'
import * as CheckboxPrimitive from '@radix-ui/react-checkbox'
import { Asterisk } from 'lucide-react'

import { cn } from '@/lib/utils'

export function Checkbox({
  className,
  ...props
}: React.ComponentProps<typeof CheckboxPrimitive.Root>) {
  return (
    <CheckboxPrimitive.Root
      data-slot="checkbox"
      className={cn(
        'peer size-4 shrink-0 bg-s-input border-s-input rounded-sm dark:bg-input/30  \
        data-[state=checked]:bg-s-destructive data-[state=checked]:text-primary-foreground \
        dark:data-[state=checked]:bg-primary data-[state=checked]:border-s-destructive \
        shadow-xs outline-none will-change-auto transition-all duration-200 ease-in-out \
        focus-visible:border-s-ring focus-visible:ring-s-ring/50 focus-visible:ring-[3px] \
        disabled:cursor-not-allowed disabled:opacity-50 disabled:grayscale',
        className
      )}
      {...props}
    >
      <CheckboxPrimitive.Indicator
        data-slot="checkbox-indicator"
        className="grid place-content-center text-current transition-none"
      >
        <Asterisk className="size-3.5" />
      </CheckboxPrimitive.Indicator>
    </CheckboxPrimitive.Root>
  )
}
