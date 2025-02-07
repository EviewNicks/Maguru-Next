import { metadata } from './../app/layout'
// hooks/useUsers.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import axios, { AxiosError } from 'axios'
import { User, UpdateUserPayload } from '@/types/user'
import { GetUsersQuery } from '@/lib/validations/user'

interface UserResponse {
  users: User[]
  metadata: {
    total: number
    page: number
    limit: number
  }
}

export const useUsers = (query?: GetUsersQuery) => {
  const queryClient = useQueryClient()

  const { data, isLoading, error } = useQuery<UsersResponse, AxiosError>({
    queryKey: ['users', query],
    queryFn: async () => {
      const searchParams = new URLSearchParams()
      if (query) {
        Object.entries(query).forEach(([key, value]) => {
          if (value) searchParams.append(key, value)
        })
      }
      const { data } = await axios.get(`/api/users?${searchParams.toString()}`)
      return data
    },
  })

  const updateUser = useMutation<User, AxiosError, UpdateUserPayload>({
    mutationFn: async (payload) => {
      const { data } = await axios.patch(`/api/users/${payload.id}`, payload)
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] })
    },
  })

  const deleteUser = useMutation<void, AxiosError, string>({
    mutationFn: async (userId) => {
      await axios.delete(`/api/users/${userId}`)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] })
    },
  })

  return {
    users: data?.users ?? [],
    metadata: data?.metadata,
    isLoading,
    error,
    updateUser,
    deleteUser,
  }
}
