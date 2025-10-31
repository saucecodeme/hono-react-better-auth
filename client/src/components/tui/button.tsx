import { Slot } from '@radix-ui/react-slot'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'

const buttonVariants = cva(
  'font-marlin font-medium inline-flex items-center justify-center cursor-pointer whitespace-nowrap \
    outline-none rounded-lg transition-all duration-200 ease-in-out \
    disabled:pointer-events-none disabled:opacity-50 will-change-transform \
    shrink-0 focus-visible:ring-s-foreground/50 focus-visible:ring-2',
  {
    variants: {
      variant: {
        default:
          'bg-s-primary text-s-primary-foreground shadow-lg hover:bg-s-primary hover:scale-[1.05]',
        plain: 'text-s-primary hover:bg-black/40 hover:scale-[1.04]',
        link: 'link-hover text-s-primary underline-offset-6 focus-visible:ring-0',
      },
      size: {
        default: 'px-3 py-2 text-base',
        sm: 'px-2 py-1 text-sm',
        icon: 'size-9',
      },
    },
    defaultVariants: {
      variant: 'plain',
      size: 'default',
    },
  }
)

function Button({
  className,
  variant,
  size,
  asChild = false,
  ...props
}: React.ComponentProps<'button'> &
  VariantProps<typeof buttonVariants> & { asChild?: boolean }) {
  const Comp = asChild ? Slot : 'button'
  return (
    <Comp
      data-slot="button"
      className={cn(buttonVariants({ variant, size }), className)}
      {...props}
    />
  )
}

export { Button }
