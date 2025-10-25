import * as React from 'react'
import { createFileRoute, Link, useRouter } from '@tanstack/react-router'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/tui/button'
import { Input as TInput } from '@/components/tui/input'
import { BadgeCheck } from 'lucide-react'
import { authClient } from '../lib/auth-client'

export const Route = createFileRoute('/signup')({
  component: RouteComponent,
})

function WarningMessage({ name, message }: { name: string; message: string }) {
  return (
    <span
      id={`${name}-validaton-status`}
      role="alert"
      aria-live="polite"
      aria-atomic="true"
      aria-label={`${name} input validation`}
      className="warning-message text-nowrap"
    >
      {message}
    </span>
  )
}

type ErrorState = Record<
  'name' | 'email' | 'password' | 'confirm' | 'form',
  string
>
type SignUpForm = {
  name: string
  email: string
  password: string
  confirm: string
}

function RouteComponent() {
  const router = useRouter()
  const { data: session, isPending } = authClient.useSession()
  const [isLoading, setIsLoading] = React.useState(false)
  const [errors, setErrors] = React.useState<ErrorState>({
    name: '',
    email: '',
    password: '',
    confirm: '',
    form: '',
  })

  React.useEffect(() => {
    if (session) {
      router.navigate({ to: '/todos', replace: true })
    }
  }, [router, session])

  const validationMessages = React.useMemo(() => {
    return {
      name: {
        required: 'Name is required.',
        pattern: 'Name can only include alphabetic characters.',
        tooShort: 'Name must be at least 3 characters.',
        tooLong: 'Name must be at most 30 characters.',
      },
      email: {
        required: 'Email is required.',
        invalid: 'Enter a valid email address.',
      },
      password: {
        required: 'Password is required.',
        pattern:
          'Password can only include alphabetic characters, numbers, and @.',
        tooShort: 'Password must be at least 6 characters.',
        tooLong: 'Password must be at most 30 characters.',
      },
      confirm: {
        mismatch: 'Password mismatched.',
      },
    }
  }, [])

  const handleFormChange = (e: React.ChangeEvent<HTMLFormElement>) => {
    const form = e.currentTarget
    const focusedElementId = e.target.id
    const formData = new FormData(form)

    const nextValues = {
      name: (formData.get('name') as string) ?? '',
      email: (formData.get('email') as string) ?? '',
      password: (formData.get('password') as string) ?? '',
      confirm: (formData.get('confirm') as string) ?? '',
    }
    const nextErrors: ErrorState = {
      name: '',
      email: '',
      password: '',
      confirm: '',
      form: '',
    }

    if (focusedElementId === 'name') {
      const nameInput = form.elements.namedItem(
        'name'
      ) as HTMLInputElement | null
      if (nameInput && !nameInput.validity.valid) {
        if (nameInput.validity.valueMissing) {
          nextErrors.name = validationMessages.name.required
        } else if (nameInput.validity.patternMismatch) {
          nextErrors.name = validationMessages.name.pattern
        } else if (nameInput.validity.tooShort) {
          nextErrors.name = validationMessages.name.tooShort
        } else if (nameInput.validity.tooLong) {
          nextErrors.name = validationMessages.name.tooLong
        }
      }
    }

    if (focusedElementId === 'email') {
      const emailInput = form.elements.namedItem(
        'email'
      ) as HTMLInputElement | null
      if (emailInput && !emailInput.validity.valid) {
        nextErrors.email = emailInput.validity.valueMissing
          ? validationMessages.email.required
          : validationMessages.email.invalid
      }
    }

    if (focusedElementId === 'password') {
      const passwordInput = form.elements.namedItem(
        'password'
      ) as HTMLInputElement | null
      if (passwordInput && !passwordInput.validity.valid) {
        if (passwordInput.validity.valueMissing) {
          nextErrors.password = validationMessages.password.required
        } else if (passwordInput.validity.patternMismatch) {
          nextErrors.password = validationMessages.password.pattern
        } else if (passwordInput.validity.tooShort) {
          nextErrors.password = validationMessages.password.tooShort
        } else if (passwordInput.validity.tooLong) {
          nextErrors.password = validationMessages.password.tooLong
        }
      }
    }

    if (focusedElementId === 'confirm') {
      if (nextValues.password !== nextValues.confirm) {
        nextErrors.confirm = validationMessages.confirm.mismatch
      }
    }

    setErrors(nextErrors)
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()

    if (Object.values(errors).some(Boolean)) {
      console.error(Object.values(errors).join(' / '))
      return
    }

    const form = e.currentTarget
    const formData = new FormData(form)
    const { name, email, password, confirm } = Object.fromEntries(
      formData.entries()
    ) as SignUpForm

    // confirm password validation
    if (password !== confirm) {
      setErrors((prev) => ({
        ...prev,
        confirm: validationMessages.confirm.mismatch,
      }))
      return
    }

    try {
      setIsLoading(true)
      await authClient.signUp.email({ name, email, password })
      form.reset()
      router.navigate({ to: '/todos' })
    } catch (error) {
      setErrors((prev) => ({ ...prev, form: 'An unexpected error occured' }))
      console.error(`Sign Up failed: ${error}`)
    } finally {
      setIsLoading(false)
    }
  }

  if (isPending) return <section className="route-starter"></section>

  return (
    <section className="route-starter flex flex-col gap-4">
      <div className="w-[250px] flex flex-col gap-5">
        <div className="flex items-center gap-2">
          <BadgeCheck size={20} strokeWidth={3} />
          <h2>Create an account</h2>
        </div>
        <form
          className="flex flex-col gap-2"
          onChange={handleFormChange}
          onSubmit={handleSubmit}
        >
          <Label htmlFor="name">Name</Label>
          <TInput
            id="name"
            name="name"
            type="text"
            autoComplete="off"
            pattern="[A-Za-z]+"
            minLength={3}
            maxLength={30}
            placeholder="e.g. Supitcha"
            required
            aria-invalid={Boolean(errors.name)}
            disabled={isLoading}
          />
          <WarningMessage name="name" message={errors.name} />
          <Label htmlFor="email">Email</Label>
          <TInput
            id="email"
            name="email"
            type="email"
            autoComplete="off"
            placeholder="e.g. supitcha saucecode.me"
            required
            aria-invalid={Boolean(errors.email)}
            disabled={isLoading}
          />
          <WarningMessage name="email" message={errors.email} />
          <Label htmlFor="password">Password</Label>
          <TInput
            id="password"
            name="password"
            type="password"
            autoComplete="off"
            pattern="[A-Za-z0-9@]+"
            minLength={6}
            maxLength={30}
            required
            aria-invalid={Boolean(errors.password)}
            disabled={isLoading}
          />
          <WarningMessage name="password" message={errors.password} />
          <Label htmlFor="password">Confirm Password</Label>
          <TInput
            id="confirm"
            name="confirm"
            type="password"
            autoComplete="off"
            pattern="[A-Za-z0-9@]+"
            minLength={6}
            maxLength={30}
            required
            aria-invalid={Boolean(errors.confirm)}
            disabled={isLoading}
          />
          <WarningMessage name="confirm" message={errors.confirm} />
          <Button
            type="submit"
            variant="default"
            size="default"
            className="mt-2 flex  gap-1 bg-s-primary-foreground-unique! text-s-foreground!"
            disabled={Boolean(Object.values(errors).join('')) || isLoading}
          >
            {isLoading ? 'Creating account' : 'Sign Up'}
          </Button>
        </form>
        <span
          id="form-submission-status"
          role="alert"
          aria-live="polite"
          aria-atomic="true"
          aria-label="Form submission status"
          className={`warning-message text-nowrap ${errors.form ? 'opacity-100' : 'opacity-0 sr-only'}`}
        >
          {errors.form}
        </span>
      </div>

      <div className="flex gap-2 items-self-center items-center">
        <p>Already have an account?</p>
        <Link to="/signin">
          <Button variant="link" className="text-s-foreground!">
            Sign In
          </Button>
        </Link>
      </div>
    </section>
  )
}
