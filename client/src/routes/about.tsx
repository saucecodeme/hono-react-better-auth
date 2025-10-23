import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/about')({
  component: About,
})

function About() {
  return (
    <div className="route-starter">
      <h3>About Me : l</h3>
    </div>
  )
}
