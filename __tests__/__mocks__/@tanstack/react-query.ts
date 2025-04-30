// Gunakan actual implementations untuk QueryClient dan QueryClientProvider
const actual = jest.requireActual('@tanstack/react-query')
export const QueryClient = actual.QueryClient
export const QueryClientProvider = actual.QueryClientProvider

// Mock hook useQuery dengan data default
export const useQuery = jest.fn().mockReturnValue({
  data: {
    users: [],
    metadata: {
      total: 0,
      currentPage: 1,
      totalPages: 0,
      limit: 10,
    },
  },
  isLoading: false,
  error: null,
  refetch: jest.fn(),
})

// Mock hook useMutation dan useQueryClient
export const useMutation = jest.fn()
export const useQueryClient = jest.fn()

// Simplified QueryClientProvider untuk testing
// export const QueryClientProvider = ({
//   children,
// }: {
//   children: React.ReactNode
// }) => {
//   return React.createElement(React.Fragment, null, children)
// }
