'use client'

import { useTheme } from './hooks/useTheme'
import { useSystemStatus } from './hooks/useSystemStatus'
import { useCurrentTime } from './hooks/useCurrentTime'
import { useParticleEffect } from './hooks/useParticleEffect'
import { Header } from './components/dashboard/Header'
import { SystemOverview } from './components/dashboard/SystemOverview'
import { SecurityAndAlerts } from './components/dashboard/SecurityAndAlerts'
import { CommunicationsLog } from './components/dashboard/CommunicationsLog'
import { RightSidebar } from './components/dashboard/RightSidebar'
import { LoadingOverlay } from './components/dashboard/LoadingOverlay'

/**
 * Komponen Dashboard utama
 */
export default function Dashboard() {
  // Hooks
  const { theme, toggleTheme } = useTheme()
  const { cpuUsage, memoryUsage, networkStatus, securityLevel, isLoading } =
    useSystemStatus()
  const currentTime = useCurrentTime()
  const canvasRef = useParticleEffect()

  return (
    <div
      className={`${theme} min-h-screen bg-gradient-to-br from-black to-slate-900 text-slate-100 relative overflow-hidden`}
    >
      {/* Background particle effect */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full opacity-30"
      />

      {/* Loading overlay */}
      <LoadingOverlay isLoading={isLoading} />

      <div className="container mx-auto p-4 relative z-10">
        {/* Header */}
        <Header theme={theme} toggleTheme={toggleTheme} />

        {/* Main content - Tanpa sidebar */}
        <div className="grid grid-cols-12 gap-6">
          {/* Main dashboard */}
          <div className="col-span-12 lg:col-span-9">
            <div className="grid gap-6">
              {/* System overview */}
              <SystemOverview
                cpuUsage={cpuUsage}
                memoryUsage={memoryUsage}
                networkStatus={networkStatus}
              />

              {/* Security & Alerts */}
              <SecurityAndAlerts securityLevel={securityLevel} />

              {/* Communications */}
              <CommunicationsLog />
            </div>
          </div>

          {/* Right sidebar */}
          <div className="col-span-12 lg:col-span-3">
            <RightSidebar currentTime={currentTime} />
          </div>
        </div>
      </div>
    </div>
  )
}
