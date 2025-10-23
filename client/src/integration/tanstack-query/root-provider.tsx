import { QueryClient, QueryClientProvider } from '@tanstack/react-query'

type ProviderProps = {
  children: React.ReactNode
  queryClient: QueryClient
}

// QueryClientProvider connect and provides the QueryClient to your app
export function Provider({ children, queryClient }: ProviderProps) {
  return (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  )
}
