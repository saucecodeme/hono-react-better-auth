import './index.css'
import { StrictMode } from 'react'
import ReactDom from 'react-dom/client'
import { RouterProvider, createRouter } from '@tanstack/react-router'

import { getContext } from './integration/tanstack-query/query-client'
import { Provider as TanstackQueryProvider } from './integration/tanstack-query/root-provider'

// Import the generated route tree
import { routeTree } from './routeTree.gen'

const TanstackQueryProviderContext = getContext()
const router = createRouter({
  routeTree,
  context: { ...TanstackQueryProviderContext },
  defaultPreload: 'intent',
  scrollRestoration: true, // enable built-in scroll position saving navigating back and forth
  defaultStructuralSharing: true, // keeps references stable when objects haven't changed to avoid unnes renders
  defaultPreloadStaleTime: 0, // ensuring fresh data
})

// Register the router instance for type safety
declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router
  }
}

const rootElement = document.getElementById('root')!
if (!rootElement.innerHTML) {
  const root = ReactDom.createRoot(rootElement)
  root.render(
    // <StrictMode>
    //   <TanstackQueryProvider {...TanstackQueryProviderContext}>
    //     <RouterProvider router={router} />
    //   </TanstackQueryProvider>
    // </StrictMode>

    <TanstackQueryProvider {...TanstackQueryProviderContext}>
      <RouterProvider router={router} />
    </TanstackQueryProvider>
  )
}
