'use client'

import { motion } from 'framer-motion'
import { SectionHeading } from '@/features/home-page/components/ui/SectionHeading'

export default function HowItWorksSection() {
  const steps = [
    {
      step: '01',
      title: 'Daftar Akun',
      description:
        'Buat akun dalam hitungan detik dan mulai dengan pengalaman pembelajaran yang dipersonalisasi.',
    },
    {
      step: '02',
      title: 'Pilih Jalur Belajar',
      description:
        'Pilih jalur pembelajaran yang paling sesuai dengan minat dan tujuan karir teknologi Anda.',
    },
    {
      step: '03',
      title: 'Belajar & Berkembang',
      description:
        'Pelajari materi, selesaikan modul interaktif, kerjakan quiz, dan terlibat dalam proyek kolaboratif.',
    },
  ]

  return (
    <section className="w-full py-20 md:py-32 bg-secondary/70 dark:bg-secondary/50 relative overflow-hidden">
      <div className="absolute inset-0 -z-10 h-full w-full bg-[linear-gradient(to_right,#f0f0f0_1px,transparent_1px),linear-gradient(to_bottom,#f0f0f0_1px,transparent_1px)] dark:bg-[linear-gradient(to_right,#1f1f1f_1px,transparent_1px),linear-gradient(to_bottom,#1f1f1f_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_80%_50%_at_50%_50%,#000_40%,transparent_100%)]"></div>

      <div className="container px-4 md:px-6 relative">
        <SectionHeading
          badge="Cara Kerja"
          title="Pengalaman Belajar yang Menyenangkan"
          description="Platform kami dirancang untuk membuat belajar teknologi menjadi proses yang interaktif, personal, dan berorientasi pada proyek nyata."
        />

        <div className="grid md:grid-cols-3 gap-8 md:gap-12 relative">
          <div className="hidden md:block absolute top-1/2 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-border to-transparent -translate-y-1/2 z-0"></div>

          {steps.map((step, i) => (
            <StepCard key={i} step={step} index={i} />
          ))}
        </div>
      </div>
    </section>
  )
}

interface StepCardProps {
  step: {
    step: string
    title: string
    description: string
  }
  index: number
}

function StepCard({ step, index }: StepCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      className="relative z-10 flex flex-col items-center text-center space-y-4"
    >
      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-primary to-primary/70 text-primary-foreground text-xl font-bold shadow-lg">
        {step.step}
      </div>
      <h3 className="text-xl font-bold">{step.title}</h3>
      <p className="text-muted-foreground">{step.description}</p>
    </motion.div>
  )
}
