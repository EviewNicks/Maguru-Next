'use client'

import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import Link from 'next/link'
import { useAuth } from '@clerk/nextjs'
import HeroSection from './HeroSection'

const HomePage = () => {
  const { isSignedIn } = useAuth()

  return (
    <div className="flex flex-col space-y-8">
      {/* Hero Section */}
      <HeroSection />

      {/* Features Section */}
      <div className="py-12">
        <div className="container mx-auto px-4">
          <h2 className="mb-2 text-center text-3xl font-bold">Fitur Utama</h2>
          <p className="mb-10 text-center text-muted-foreground">
            Pahami bagaimana Maguru membantu Anda mengembangkan keterampilan
            secara komprehensif
          </p>
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            <FeatureCard
              title="Manajemen Pengguna"
              description="Kelola pengguna aplikasi dengan mudah, termasuk peran dan status. Dapatkan statistik dan visualisasi data pengguna."
              link={isSignedIn ? '/admin/manage-users' : '/auth/sign-in'}
              buttonText={isSignedIn ? 'Kelola Pengguna' : 'Masuk Untuk Akses'}
            />
            <FeatureCard
              title="Modul Pembelajaran"
              description="Akses modul pembelajaran interaktif dengan berbagai topik hard skills dan soft skills."
              link={isSignedIn ? '/module' : '/auth/sign-in'}
              buttonText={isSignedIn ? 'Lihat Modul' : 'Masuk Untuk Akses'}
            />
            <FeatureCard
              title="Quiz dan Evaluasi"
              description="Uji pemahaman Anda melalui quiz dan dapatkan evaluasi instan untuk mengukur kemajuan pembelajaran."
              link={isSignedIn ? '/quiz' : '/auth/sign-in'}
              buttonText={isSignedIn ? 'Mulai Quiz' : 'Masuk Untuk Akses'}
            />
          </div>
        </div>
      </div>

      {/* Testimonial Section */}
      <div className="bg-secondary py-16">
        <div className="container mx-auto px-4">
          <h2 className="mb-2 text-center text-3xl font-bold">
            Testimoni Pengguna
          </h2>
          <p className="mb-10 text-center text-muted-foreground">
            Apa kata pengguna tentang pengalaman belajar mereka di Maguru
          </p>
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            <TestimonialCard
              quote="Platform ini membantu saya mengembangkan keterampilan teknis dan soft skills secara bersamaan. Sangat direkomendasikan!"
              author="Budi Santoso"
              role="Mahasiswa Teknik Informatika"
              avatar="/images/avatars/avatar-1.png"
            />
            <TestimonialCard
              quote="Antarmuka yang intuitif dan materi yang komprehensif. Sebagai dosen, ini sangat membantu dalam mengajar kelas saya."
              author="Dr. Siti Rahayu"
              role="Dosen Ilmu Komputer"
              avatar="/images/avatars/avatar-2.png"
            />
            <TestimonialCard
              quote="Saya berhasil meningkatkan soft skills dan mendapatkan pekerjaan baru berkat kursus di Maguru. Terima kasih!"
              author="Andi Wijaya"
              role="Software Developer"
              avatar="/images/avatars/avatar-3.png"
            />
          </div>
        </div>
      </div>
    </div>
  )
}

// Komponen Card untuk Fitur
const FeatureCard = ({
  title,
  description,
  link,
  buttonText,
}: {
  title: string
  description: string
  link: string
  buttonText: string
}) => {
  return (
    <Card className="flex h-full flex-col">
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent className="flex-grow">
        <p>{description}</p>
      </CardContent>
      <CardFooter>
        <Button asChild className="w-full">
          <Link href={link}>{buttonText}</Link>
        </Button>
      </CardFooter>
    </Card>
  )
}

// Komponen Card untuk Testimoni
const TestimonialCard = ({
  quote,
  author,
  role,
  avatar = '',
}: {
  quote: string
  author: string
  role: string
  avatar?: string
}) => {
  return (
    <Card className="bg-background">
      <CardContent className="pt-6">
        <p className="mb-4 italic">&ldquo;{quote}&rdquo;</p>
        <div className="flex items-center">
          {avatar && (
            <div className="mr-3 h-10 w-10 overflow-hidden rounded-full bg-primary/10">
              {/* Uncomment when you have real avatars */}
              {/* <img src={avatar} alt={author} className="h-full w-full object-cover" /> */}
            </div>
          )}
          <div>
            <p className="font-semibold">{author}</p>
            <p className="text-sm text-muted-foreground">{role}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

export default HomePage
