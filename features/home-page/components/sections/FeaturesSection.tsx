'use client'

import { motion } from 'framer-motion'
import { Zap, BookOpen, Users, Brain, Star, Award } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { SectionHeading } from '@/features/home-page/components/ui/SectionHeading'

export default function FeaturesSection() {
  const features = [
    {
      title: 'Pembelajaran AI Personal',
      description:
        'Pengalaman belajar yang disesuaikan dengan gaya dan kebutuhan belajar individu Anda.',
      icon: <Brain className="size-5" />,
    },
    {
      title: 'Gamifikasi Menarik',
      description:
        'Kembangkan keterampilan sambil menikmati elemen game yang membuat belajar lebih menyenangkan.',
      icon: <Zap className="size-5" />,
    },
    {
      title: 'Komunitas Kolaboratif',
      description:
        'Belajar bersama dan berkolaborasi dalam proyek nyata dengan komunitas yang mendukung.',
      icon: <Users className="size-5" />,
    },
    {
      title: 'Materi Berkualitas Tinggi',
      description:
        'Konten pembelajaran terstruktur yang selalu diperbarui mengikuti perkembangan teknologi terkini.',
      icon: <BookOpen className="size-5" />,
    },
    {
      title: 'Asisten AI "Guru Maya"',
      description:
        'Asisten pribadi yang membantu menjawab pertanyaan dan memberi motivasi selama perjalanan belajar Anda.',
      icon: <Star className="size-5" />,
    },
    {
      title: 'Sertifikasi Profesional',
      description:
        'Dapatkan sertifikat yang diakui industri setelah menyelesaikan kursus dan proyek.',
      icon: <Award className="size-5" />,
    },
  ]

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  }

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 },
  }

  return (
    <section id="features" className="w-full py-20 md:py-32">
      <div className="container px-4 md:px-6">
        <SectionHeading
          badge="Fitur"
          title="Belajar Teknologi dengan Cara Baru"
          description="Platform kami menggabungkan teknologi AI dengan pendekatan humanis untuk menciptakan pengalaman belajar yang holistik dan bermakna."
        />

        <motion.div
          variants={container}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true }}
          className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3"
        >
          {features.map((feature, i) => (
            <FeatureCard key={i} feature={feature} variants={item} />
          ))}
        </motion.div>
      </div>
    </section>
  )
}

interface FeatureCardProps {
  feature: {
    title: string
    description: string
    icon: React.ReactNode
  }
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  variants: any
}

function FeatureCard({ feature, variants }: FeatureCardProps) {
  return (
    <motion.div variants={variants}>
      <Card className="h-full overflow-hidden border-border/40 bg-gradient-to-b from-background to-muted/10 backdrop-blur transition-all hover:shadow-md">
        <CardContent className="p-6 flex flex-col h-full">
          <div className="size-10 rounded-full bg-primary/10 dark:bg-primary/20 flex items-center justify-center text-primary mb-4">
            {feature.icon}
          </div>
          <h3 className="text-xl font-bold mb-2">{feature.title}</h3>
          <p className="text-muted-foreground">{feature.description}</p>
        </CardContent>
      </Card>
    </motion.div>
  )
}
