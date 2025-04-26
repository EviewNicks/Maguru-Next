'use client'
import { useSystemStatus } from './hooks/useSystemStatus'
import { useCurrentTime } from './hooks/useCurrentTime'
import { useParticleEffect } from './hooks/useParticleEffect'
import { SystemOverview } from './components/dashboard/SystemOverview'
import { SecurityAndAlerts } from './components/dashboard/SecurityAndAlerts'
import { CommunicationsLog } from './components/dashboard/CommunicationsLog'
import { RightSidebar } from './components/dashboard/RightSidebar'
import { LoadingOverlay } from './components/dashboard/LoadingOverlay'
import { memo, useMemo } from 'react'

/**
 * Komponen Dashboard utama dengan optimasi rendering
 */
export default function Dashboard() {
  // Hooks
  const { cpuUsage, memoryUsage, networkStatus, securityLevel, isLoading } =
    useSystemStatus()
  const currentTime = useCurrentTime()
  const canvasRef = useParticleEffect()

  // Gunakan useMemo untuk data yang perlu dihitung dan diteruskan ke komponen
  const systemData = useMemo(
    () => ({
      cpuUsage,
      memoryUsage,
      networkStatus,
    }),
    [cpuUsage, memoryUsage, networkStatus]
  )

  // Gunakan useMemo untuk komponen yang sering dirender
  const mainContent = useMemo(
    () => (
      <div className="grid gap-2">
        {/* System overview */}
        <MemoizedSystemOverview {...systemData} />

        {/* Security & Alerts */}
        <MemoizedSecurityAlerts securityLevel={securityLevel} />

        {/* Communications */}
        <MemoizedCommunicationsLog />
      </div>
    ),
    [systemData, securityLevel]
  )

  return (
    <div className={` min-h-screen relative overflow-hidden`}>
      {/* Background particle effect */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full opacity-30"
      />

      {/* Loading overlay - hanya render jika loading */}
      {isLoading && <LoadingOverlay isLoading={isLoading} />}

      <div className="container mx-auto p-4 relative z-10">
        {/* Main content - Tanpa sidebar */}
        <div className="grid grid-cols-12 gap-2">
          {/* Main dashboard */}
          <div className="col-span-12 lg:col-span-9">{mainContent}</div>

          {/* Right sidebar */}
          <div className="col-span-12 lg:col-span-3">
            <MemoizedRightSidebar currentTime={currentTime} />
          </div>
        </div>
      </div>
    </div>
  )
}

// Memoize komponen-komponen untuk mencegah render ulang yang tidak perlu
const MemoizedSystemOverview = memo(SystemOverview)
const MemoizedSecurityAlerts = memo(SecurityAndAlerts)
const MemoizedCommunicationsLog = memo(CommunicationsLog)
const MemoizedRightSidebar = memo(RightSidebar)
