import { Metadata } from 'next'
import { UnauthorizedMessage } from '@/components/ui'

export const metadata: Metadata = {
  title: 'Akses Tidak Diizinkan',
  description: 'Anda tidak memiliki izin untuk mengakses halaman ini.',
}

export default function UnauthorizedPage() {
  return (
    <div className="container flex items-center justify-center min-h-[80vh] py-8">
      <UnauthorizedMessage
        title="Akses Tidak Diizinkan"
        description="Maaf, Anda tidak memiliki izin untuk mengakses halaman ini. Silakan kembali ke halaman utama atau hubungi administrator jika Anda yakin seharusnya memiliki akses."
        backUrl="/"
      />
    </div>
  )
}
