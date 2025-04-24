'use client'

import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { useAuth } from '@clerk/nextjs'

const HeroSection = () => {
  const { isSignedIn } = useAuth()

  return (
    <div className="relative overflow-hidden bg-background py-16">
      {/* Background Decoration */}
      <div className="absolute -right-10 -top-10 h-64 w-64 rounded-full bg-primary/10 blur-3xl"></div>
      <div className="absolute -bottom-10 -left-10 h-64 w-64 rounded-full bg-primary/10 blur-3xl"></div>

      <div className="container mx-auto px-4 py-8">
        <div className="grid items-center gap-12 lg:grid-cols-2">
          <div className="text-center lg:text-left">
            <h1 className="font-playfair mb-6 text-4xl font-bold leading-tight md:text-5xl lg:text-6xl">
              <span className="text-primary">Membangun</span> Generasi Tech yang{' '}
              <span className="text-primary">Berempati</span>
            </h1>
            <p className="mb-8 text-lg text-muted-foreground md:text-xl">
              Platform pembelajaran berbasis AI yang menyeimbangkan hard skills
              dan soft skills untuk masa depan teknologi yang berpusat pada
              manusia.
            </p>
            <div className="flex flex-col items-center gap-4 sm:flex-row lg:items-start lg:justify-start">
              {!isSignedIn ? (
                <>
                  <Button size="lg" asChild>
                    <Link href="/auth/sign-in">Mulai Belajar</Link>
                  </Button>
                  <Button variant="outline" size="lg" asChild>
                    <Link href="/module">Jelajahi Modul</Link>
                  </Button>
                </>
              ) : (
                <>
                  <Button size="lg" asChild>
                    <Link href="/user-dashboard">Dashboard Saya</Link>
                  </Button>
                  <Button variant="outline" size="lg" asChild>
                    <Link href="/module">Jelajahi Modul</Link>
                  </Button>
                </>
              )}
            </div>
          </div>

          {/* Stats Box */}
          <div className="relative rounded-lg border bg-card p-6 shadow-lg">
            <h3 className="mb-4 text-center text-2xl font-bold">
              Mengapa Maguru?
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="rounded-lg bg-primary/10 p-4 text-center">
                <span className="text-3xl font-bold text-primary">20+</span>
                <p className="text-sm">Modul Pembelajaran</p>
              </div>
              <div className="rounded-lg bg-primary/10 p-4 text-center">
                <span className="text-3xl font-bold text-primary">5000+</span>
                <p className="text-sm">Pengguna Aktif</p>
              </div>
              <div className="rounded-lg bg-primary/10 p-4 text-center">
                <span className="text-3xl font-bold text-primary">98%</span>
                <p className="text-sm">Tingkat Kepuasan</p>
              </div>
              <div className="rounded-lg bg-primary/10 p-4 text-center">
                <span className="text-3xl font-bold text-primary">100%</span>
                <p className="text-sm">Relevan dengan Industri</p>
              </div>
            </div>
            <div className="mt-4 text-center text-sm text-muted-foreground">
              Bergabunglah dengan ribuan pembelajar di seluruh Indonesia
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default HeroSection
