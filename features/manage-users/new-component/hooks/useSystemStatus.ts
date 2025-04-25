import { useState, useEffect } from 'react'

interface SystemStatusData {
  systemStatus: number
  cpuUsage: number
  memoryUsage: number
  networkStatus: number
  securityLevel: number
  isLoading: boolean
}

/**
 * Hook untuk mengelola status sistem dan mensimulasikan data
 */
export function useSystemStatus(): SystemStatusData {
  const [systemStatus, setSystemStatus] = useState(85)
  const [cpuUsage, setCpuUsage] = useState(42)
  const [memoryUsage, setMemoryUsage] = useState(68)
  const [networkStatus, setNetworkStatus] = useState(92)
  const [securityLevel, setSecurityLevel] = useState(75)
  const [isLoading, setIsLoading] = useState(true)

  // Simulate data loading
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false)
    }, 2000)

    return () => clearTimeout(timer)
  }, [])

  // Simulate changing data
  useEffect(() => {
    const interval = setInterval(() => {
      setCpuUsage(Math.floor(Math.random() * 30) + 30)
      setMemoryUsage(Math.floor(Math.random() * 20) + 60)
      setNetworkStatus(Math.floor(Math.random() * 15) + 80)
      setSystemStatus(Math.floor(Math.random() * 10) + 80)
      setSecurityLevel(Math.floor(Math.random() * 15) + 70)
    }, 3000)

    return () => clearInterval(interval)
  }, [])

  return {
    systemStatus,
    cpuUsage,
    memoryUsage,
    networkStatus,
    securityLevel,
    isLoading,
  }
}
