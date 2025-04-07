import React from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader } from '@/components/ui/card'

type WelcomeHeroProps = {
  userName?: string
}

/**
 * Komponen Hero untuk halaman dashboard user
 * @param userName - Nama pengguna yang akan ditampilkan
 */
export const WelcomeHero: React.FC<WelcomeHeroProps> = ({ userName }) => {
  return (
    <div className="flex flex-col items-center text-center">
      <h1 className="text-4xl font-bold mb-4 text-gray-900 dark:text-gray-50">
        {userName
          ? `Selamat Datang, ${userName}!`
          : 'Selamat Datang di Dashboard Mahasiswa'}
      </h1>
      <p className="text-lg text-gray-600 dark:text-gray-300 mb-8 max-w-2xl">
        Platform pembelajaran interaktif untuk membantu kamu menguasai
        keterampilan baru melalui modul pembelajaran yang dirancang khusus.
      </p>

      <div className="flex flex-wrap justify-center gap-6 mb-12">
        <Button
          asChild
          size="lg"
          className="bg-blue-600 hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-800"
        >
          <Link href="/module">Mulai Belajar</Link>
        </Button>
        <Button
          asChild
          size="lg"
          variant="outline"
          className="border-gray-300 text-gray-700 hover:text-gray-900 dark:border-gray-600 dark:text-gray-300 dark:hover:text-white"
        >
          <Link href="/profile">Lihat Profil</Link>
        </Button>
      </div>

      <div className="grid md:grid-cols-3 gap-8 mt-8 w-full">
        <FeatureCard
          title="Modul Pembelajaran"
          description="Akses seluruh modul pembelajaran interaktif yang telah tersedia."
          icon={<ModuleIcon />}
          iconColor="text-blue-600 dark:text-blue-400"
        />

        <FeatureCard
          title="Quiz Interaktif"
          description="Uji pemahaman dengan quiz dan dapatkan umpan balik instan."
          icon={<QuizIcon />}
          iconColor="text-green-600 dark:text-green-400"
        />

        <FeatureCard
          title="Profil & Progres"
          description="Pantau kemajuan belajar dan kelola profil pengguna Anda."
          icon={<ProfileIcon />}
          iconColor="text-purple-600 dark:text-purple-400"
        />
      </div>
    </div>
  )
}

// Komponen FeatureCard
type FeatureCardProps = {
  title: string
  description: string
  icon: React.ReactNode
  iconColor: string
}

const FeatureCard: React.FC<FeatureCardProps> = ({
  title,
  description,
  icon,
  iconColor,
}) => {
  return (
    <Card className="border-gray-100 dark:border-gray-800 dark:bg-gray-800/50">
      <CardHeader className="pb-2 pt-6 px-6 flex flex-col items-center">
        <div
          className={`mb-4 h-12 w-12 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center`}
        >
          <div className={iconColor}>{icon}</div>
        </div>
        <h3 className="text-xl font-semibold text-center text-gray-900 dark:text-gray-100">
          {title}
        </h3>
      </CardHeader>
      <CardContent className="text-center px-6 pb-6">
        <p className="text-gray-600 dark:text-gray-300">{description}</p>
      </CardContent>
    </Card>
  )
}

// Icons
const ModuleIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    className="h-6 w-6"
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
    />
  </svg>
)

const QuizIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    className="h-6 w-6"
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a1.994 1.994 0 01-1.414-.586m0 0L11 14h4a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2v4l.586-.586z"
    />
  </svg>
)

const ProfileIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    className="h-6 w-6"
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
    />
  </svg>
)

export default WelcomeHero
