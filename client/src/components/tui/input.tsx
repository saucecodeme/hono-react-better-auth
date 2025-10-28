import * as React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'

const inputVariants = cva(
  'h-9 px-3 py-1 text-base rounded-md outline-none border-s-input \
    aria-invalid:ring-s-destructive aria-invalid:ring-2 valid:ring-s-success valid:ring-2',
  {
    variants: {
      variant: {
        default:
          'bg-s-input text-s-primary-foreground focus-visible:border-s-ring-alt focus-visible:ring-s-ring-alt/50 focus-visible:ring-[3px] placeholder:text-s-input-placeholder',
        plain: 'h-fit p-0 aria-invalid:ring-0 valid:ring-0 rounded-none',
      },
    },
    defaultVariants: { variant: 'default' },
  }
)

export function Input({
  type,
  variant,
  className,
  ...props
}: React.ComponentProps<'input'> & VariantProps<typeof inputVariants>) {
  return (
    <input
      type={type}
      data-slot="input"
      className={cn(inputVariants({ variant }), className)}
      {...props}
    />
  )
}
