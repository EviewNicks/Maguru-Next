import React from 'react'

const actual = jest.requireActual('@tanstack/react-query')

export const QueryClient = actual.QueryClient
export const useQuery = jest.fn()
export const useMutation = jest.fn()
export const useQueryClient = jest.fn()

// Simplified QueryClientProvider untuk testing
export const QueryClientProvider = ({
  children,
}: {
  children: React.ReactNode
}) => {
  return React.createElement(React.Fragment, null, children)
}
