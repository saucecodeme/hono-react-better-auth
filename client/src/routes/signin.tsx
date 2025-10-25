import React from 'react'
import { createFileRoute, Link, useRouter } from '@tanstack/react-router'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/tui/button'
import { Input as TInput } from '@/components/tui/input'
import { BadgeCheck } from 'lucide-react'
import { authClient } from '../lib/auth-client'

export const Route = createFileRoute('/signin')({
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

type ErrorState = Record<'email' | 'password' | 'form', string>

function RouteComponent() {
  const router = useRouter()
  const { data: session, isPending } = authClient.useSession()
  const [errors, setErrors] = React.useState<ErrorState>({
    email: '',
    password: '',
    form: '',
  })
  const [isLoading, setIsLoading] = React.useState(false)

  React.useEffect(() => {
    if (session) {
      router.navigate({ to: '/todos' })
    }
  }, [session, router])

  if (isPending) return <section className="route-starter"></section>

  const handleFormChange = (e: React.ChangeEvent<HTMLFormElement>) => {
    const form = e.currentTarget
    const focusedElementId = e.target.id
    const nextErrors: ErrorState = {
      email: '',
      password: '',
      form: '',
    }

    if (focusedElementId === 'email') {
      const emailInput = form.elements.namedItem(
        'email'
      ) as HTMLInputElement | null
      if (emailInput && !emailInput.validity.valid) {
        nextErrors.email = emailInput.validity.valueMissing
          ? 'Email is required.'
          : 'Enter a valid email address.'
      }
    }

    if (focusedElementId === 'password') {
      const passwordInput = form.elements.namedItem(
        'password'
      ) as HTMLInputElement | null
      if (passwordInput && !passwordInput.validity.valid) {
        if (passwordInput.validity.valueMissing) {
          nextErrors.password = 'Password is required.'
        } else if (passwordInput.validity.patternMismatch) {
          nextErrors.password =
            'Password can only include letters, numbers, and @.'
        } else if (passwordInput.validity.tooShort) {
          nextErrors.password = `Password must be at least ${passwordInput.minLength} characters.`
        } else if (passwordInput.validity.tooLong) {
          nextErrors.password = `Password must be at most ${passwordInput.maxLength} characters.`
        }
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
    if (!form.checkValidity()) {
      form.reportValidity()
      return
    }

    const formData = new FormData(form)
    const email = (formData.get('email') as string) ?? ''
    const password = (formData.get('password') as string) ?? ''

    try {
      setIsLoading(true)
      await authClient.signIn.email({
        email,
        password,
      })
      form.reset()
      router.navigate({ to: '/todos' })
    } catch (error) {
      setErrors((prev) => ({
        ...prev,
        form: 'Sign in failed. Please check your credentials.',
      }))
      console.error('Sign in failed', error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <section className="route-starter flex flex-col gap-4">
      <div className="w-[250px] flex flex-col gap-5">
        <div className="flex items-center gap-2">
          <BadgeCheck size={20} strokeWidth={3} />
          <h2>Sign in to your account</h2>
        </div>
        <form
          className="flex flex-col gap-2"
          onChange={handleFormChange}
          onSubmit={handleSubmit}
        >
          <Label htmlFor="email">Email</Label>
          <TInput
            id="email"
            name="email"
            type="email"
            autoComplete="off"
            placeholder="e.g. supitcha@saucecode.me"
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

          <Button
            type="submit"
            variant="default"
            size="default"
            className="mt-2 flex gap-1 bg-s-primary-foreground-unique! text-s-foreground!"
            disabled={Boolean(Object.values(errors).join('')) || isLoading}
          >
            {isLoading ? 'Signing in...' : 'Sign In'}
          </Button>
        </form>
        <span
          id="form-signin-status"
          role="alert"
          aria-live="polite"
          aria-atomic="true"
          aria-label="Form submission status"
          className={`warning-message text-nowrap ${errors.form ? 'opacity-100' : 'opacity-0 sr-only'}`}
        >
          {errors.form}
        </span>
      </div>

      <div className="flex gap-2 items-center">
        <p>Need an account?</p>
        <Link to="/signup">
          <Button variant="link" className="text-s-foreground!">
            Create one
          </Button>
        </Link>
      </div>
    </section>
  )
}
