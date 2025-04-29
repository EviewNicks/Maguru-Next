import React, { ReactElement } from 'react'
import { render, RenderOptions } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { TestReduxProvider } from './integration/mocks/redux-provider'

// Buat custom render function yang sudah menyertakan Provider
const customRender = (
  ui: ReactElement,
  options?: Omit<RenderOptions, 'wrapper'> & {
    initialReduxState?: unknown
    queryClient?: QueryClient
  }
) => {
  const { initialReduxState, queryClient, ...renderOptions } = options || {}

  // Gunakan QueryClient yang disediakan atau buat baru
  const testQueryClient =
    queryClient ||
    new QueryClient({
      defaultOptions: {
        queries: {
          retry: false,
        },
      },
    })

  // Buat wrapper yang sudah menyertakan Provider
  const Wrapper = ({ children }: { children: React.ReactNode }) => {
    return (
      <TestReduxProvider initialState={initialReduxState}>
        <QueryClientProvider client={testQueryClient}>
          {children}
        </QueryClientProvider>
      </TestReduxProvider>
    )
  }

  return render(ui, { wrapper: Wrapper, ...renderOptions })
}

// Re-export everything
export * from '@testing-library/react'
export { customRender as render }
