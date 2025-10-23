import { QueryClient } from '@tanstack/react-query'

// QueryClient itself is just the data/cache manager / interact with a cache
export function getContext() {
  const queryClient = new QueryClient()
  return { queryClient }
}
