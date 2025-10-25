import * as React from 'react'
import { cn } from '@/lib/utils'

export function Input({
  type,
  className,
  ...props
}: React.ComponentProps<'input'>) {
  return (
    <input
      type={type}
      data-slot="input"
      className={cn(
        'h-9 px-3 py-1 text-base bg-s-input rounded-md text-s-primary-foreground outline-none \
        placeholder:text-s-input-placeholder border-s-input \
        focus-visible:border-s-ring-alt focus-visible:ring-s-ring-alt/50 focus-visible:ring-[3px] \
        aria-invalid:ring-s-destructive aria-invalid:ring-2 valid:ring-s-success valid:ring-2',
        className
      )}
      {...props}
    />
  )
}
