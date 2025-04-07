import React from 'react'

export const metadata = {
  title: 'Dashboard Mahasiswa | Maguru',
  description:
    'Dashboard untuk mahasiswa Maguru dengan akses ke modul pembelajaran dan quiz',
}

export default function UserDashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">{children}</div>
  )
}
