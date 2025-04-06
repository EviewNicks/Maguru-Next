'use client'

import { useState, useEffect } from 'react'
import { UserData, UserStats } from '../types'

/**
 * Custom hook untuk mengambil dan mengelola data pengguna
 * @param userId - ID pengguna yang akan diambil datanya
 * @returns Object yang berisi data pengguna, statistik, status loading dan error
 */
export function useUserData(userId?: string) {
  const [userData, setUserData] = useState<UserData | null>(null)
  const [userStats, setUserStats] = useState<UserStats | null>(null)
  const [isLoading, setIsLoading] = useState<boolean>(true)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    async function fetchUserData() {
      // Jika tidak ada userId, jangan lakukan fetch
      if (!userId) {
        setIsLoading(false)
        return
      }

      setIsLoading(true)
      setError(null)

      try {
        // Simulasi fetch data dari API
        // Dalam implementasi nyata, ini akan diganti dengan pemanggilan API sebenarnya
        // const response = await fetch(`/api/users/${userId}`)
        // const data = await response.json()

        // Untuk saat ini, gunakan data dummy
        const dummyData: UserData = {
          id: userId,
          name: 'John Doe',
          email: 'john.doe@example.com',
          role: 'mahasiswa',
          modules: [
            {
              id: 'mod1',
              title: 'Pengenalan AI',
              progress: 75,
              lastAccessedAt: new Date().toISOString(),
            },
            {
              id: 'mod2',
              title: 'Machine Learning Dasar',
              progress: 30,
              lastAccessedAt: new Date().toISOString(),
            },
          ],
        }

        const dummyStats: UserStats = {
          completedModules: 3,
          totalModules: 10,
          averageScore: 85,
          lastQuizScore: 90,
          totalXp: 1250,
          level: 4,
        }

        setUserData(dummyData)
        setUserStats(dummyStats)
      } catch (err) {
        console.error('Error fetching user data:', err)
        setError(
          err instanceof Error ? err : new Error('Unknown error occurred')
        )
      } finally {
        setIsLoading(false)
      }
    }

    fetchUserData()
  }, [userId])

  // Fungsi untuk memperbarui data pengguna
  const updateUserData = async (updatedData: Partial<UserData>) => {
    if (!userId || !userData) return

    try {
      // Simulasi API call untuk update data
      // const response = await fetch(`/api/users/${userId}`, {
      //   method: 'PATCH',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify(updatedData)
      // })
      // const result = await response.json()

      // Update state lokal dengan data terbaru
      setUserData((prev) => (prev ? { ...prev, ...updatedData } : null))
      return true
    } catch (err) {
      console.error('Error updating user data:', err)
      setError(
        err instanceof Error ? err : new Error('Failed to update user data')
      )
      return false
    }
  }

  return {
    userData,
    userStats,
    isLoading,
    error,
    updateUserData,
  }
}
