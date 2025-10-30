export function WarningMessage({
  name,
  message,
}: {
  name: string
  message: string
}) {
  return (
    <span
      id={`${name}-validation-status`}
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
