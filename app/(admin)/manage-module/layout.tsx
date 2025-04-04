import { ReactNode } from 'react'

/**
 * Layout untuk halaman Manajemen Modul
 *
 * Bisa digunakan untuk menambahkan elemen UI yang persisten
 * di semua halaman child dari manajemen modul jika ada
 *
 * @param {Object} props - Component props
 * @param {ReactNode} props.children - Child components
 */
export default function ModuleManagementLayout({
  children,
}: Readonly<{
  children: ReactNode
}>) {
  return <section className="h-full w-full">{children}</section>
}
