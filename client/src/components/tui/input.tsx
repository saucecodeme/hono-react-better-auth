import * as React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'

const inputVariants = cva(
  'h-fit px-3 py-1 text-base rounded-md outline-none border-s-input \
    aria-invalid:ring-s-destructive aria-invalid:ring-2 valid:ring-s-success valid:ring-2',
  {
    variants: {
      variant: {
        default:
          'bg-s-input text-s-primary-foreground \
          focus-visible:ring-s-foreground/50 focus-visible:ring-[2px] placeholder:text-s-input-placeholder',
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

export function AutoWidthInput({
  type = 'text',
  variant,
  className,
  value,
  defaultValue,
  onChange,
  ...props
}: React.ComponentProps<'input'> & VariantProps<typeof inputVariants>) {
  const [inputValue, setInputValue] = React.useState(value || defaultValue || '')
  const [width, setWidth] = React.useState('1ch')
  const spanRef = React.useRef<HTMLSpanElement>(null)
  const inputRef = React.useRef<HTMLInputElement>(null)

  React.useEffect(() => {
    if (value !== undefined) {
      setInputValue(value)
    }
  }, [value])

  React.useEffect(() => {
    if (spanRef.current) {
      const spanWidth = spanRef.current.offsetWidth
      setWidth(`${spanWidth}px`)
    }
  }, [inputValue])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value)
    onChange?.(e)
  }

  return (
    <>
      <span
        ref={spanRef}
        className="invisible absolute whitespace-pre"
        style={{
          fontFamily: getComputedStyle(document.body).fontFamily,
          fontSize: inputRef.current ? getComputedStyle(inputRef.current).fontSize : '14px',
          fontWeight: inputRef.current ? getComputedStyle(inputRef.current).fontWeight : '400',
          letterSpacing: inputRef.current ? getComputedStyle(inputRef.current).letterSpacing : 'normal',
        }}
      >
        {inputValue || ''}
      </span>
      <input
        ref={inputRef}
        type={type}
        data-slot="input"
        className={cn(inputVariants({ variant }), className)}
        value={inputValue}
        onChange={handleChange}
        style={{ width }}
        {...props}
      />
    </>
  )
}
