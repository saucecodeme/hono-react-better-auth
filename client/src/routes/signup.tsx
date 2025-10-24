import { useState } from 'react'
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
  const [isLoading, setIsLoading] = useState(false)
  const [errors, setErrors] = useState<ErrorState>({
    name: '',
    email: '',
    password: '',
    confirm: '',
    form: '',
  })

  if (isPending) return <section className="route-starter"></section>
  if (session) router.navigate({ to: '/todos' })

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

    // Name validation
    if (focusedElementId === 'name') {
      const nameInput = form.elements.namedItem(
        'name'
      ) as HTMLInputElement | null
      if (nameInput && !nameInput.validity.valid) {
        if (nameInput.validity.valueMissing) {
          nextErrors.name = 'Name is required.'
        } else if (nameInput.validity.patternMismatch) {
          nextErrors.name = 'Name can only include alphabetic characters.'
        } else if (nameInput.validity.tooShort) {
          nextErrors.name = `Name must be at least ${nameInput.minLength} characters.`
        } else if (nameInput.validity.tooLong) {
          nextErrors.name = `Name must be at most ${nameInput.maxLength} characters.`
        }
      }
    }

    // Email validation
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

    // Password validation
    if (focusedElementId === 'password') {
      const passwordInput = form.elements.namedItem(
        'password'
      ) as HTMLInputElement | null
      if (passwordInput && !passwordInput.validity.valid) {
        if (passwordInput.validity.valueMissing) {
          nextErrors.password = 'Password is required.'
        } else if (passwordInput.validity.patternMismatch) {
          nextErrors.password =
            'Password can only include alphabetic characters and numbers'
        } else if (passwordInput.validity.tooShort) {
          nextErrors.password = `Password must be at least ${passwordInput.minLength} characters.`
        } else if (passwordInput.validity.tooLong) {
          nextErrors.password = `Password must be at most ${passwordInput.maxLength} characters.`
        }
      }
    }

    if (focusedElementId === 'confirm') {
      const confirmInput = form.elements.namedItem(
        'confirm'
      ) as HTMLInputElement | null
      if (confirmInput) {
        if (nextValues.password !== nextValues.confirm) {
          nextErrors.confirm = 'Password mismatched'
        }
      }
    }
    // console.log(nextValues)
    setErrors(nextErrors)
  }

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()

    if (Object.values(errors).join('')) {
      console.error(Object.values(errors).join(' / '))
      return
    }
    setIsLoading(true)

    const form = e.currentTarget
    const formData = new FormData(form)
    const signUpForm = Object.fromEntries(formData.entries()) as SignUpForm
    const name = signUpForm.name
    const email = signUpForm.email
    const password = signUpForm.password
    try {
      authClient.signUp
        .email({
          name,
          email,
          password,
        })
        .then(() => {
          form.reset()
          router.navigate({
            to: '/todos',
          })
        })
    } catch (error) {
      setErrors((prev) => ({ ...prev, form: 'An unexpected error occured' }))
      console.error(`Sign Up failed: ${error}`)
    } finally {
      setIsLoading(false)
    }
  }

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
          {errors.form && `${errors.form}`}
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
