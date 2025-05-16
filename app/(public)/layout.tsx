import { PropsWithChildren } from 'react'
import Footer from '@/features/common/components/Footer'

export default function PublicLayout({ children }: PropsWithChildren) {
  return (
    <>
      {children}
      <Footer />
    </>
  )
}
