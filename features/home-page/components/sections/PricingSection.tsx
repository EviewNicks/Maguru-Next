'use client'

import { motion } from 'framer-motion'
import { Check } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { SectionHeading } from '@/features/home-page/components/ui/SectionHeading'

export default function PricingSection() {
  const monthlyPlans = [
    {
      name: 'Basic',
      price: 'Gratis',
      description: 'Akses dasar untuk memulai perjalanan belajar Anda.',
      features: [
        'Akses ke materi dasar',
        'Quiz dan latihan interaktif',
        'Asisten AI terbatas',
        'Diskusi komunitas',
      ],
      cta: 'Mulai Sekarang',
    },
    {
      name: 'Professional',
      price: 'Rp149rb',
      description: 'Akses penuh ke semua fitur pembelajaran.',
      features: [
        'Semua fitur Basic',
        'Akses semua kursus',
        'Proyek kolaboratif',
        'Personalisasi AI penuh',
        'Sertifikat resmi',
      ],
      cta: 'Gabung Sekarang',
      popular: true,
    },
    {
      name: 'Enterprise',
      price: 'Kontak',
      description: 'Solusi khusus untuk institusi dan perusahaan.',
      features: [
        'Solusi edukasi korporat',
        'Dashboard analitik tim',
        'Pelatihan khusus',
        'Materi yang disesuaikan',
        'Dukungan prioritas',
        'Sertifikasi tim',
      ],
      cta: 'Hubungi Kami',
    },
  ]

  const annualPlans = [
    {
      name: 'Basic',
      price: 'Gratis',
      description: 'Akses dasar untuk memulai perjalanan belajar Anda.',
      features: [
        'Akses ke materi dasar',
        'Quiz dan latihan interaktif',
        'Asisten AI terbatas',
        'Diskusi komunitas',
      ],
      cta: 'Mulai Sekarang',
    },
    {
      name: 'Professional',
      price: 'Rp99rb',
      description: 'Akses penuh ke semua fitur pembelajaran.',
      features: [
        'Semua fitur Basic',
        'Akses semua kursus',
        'Proyek kolaboratif',
        'Personalisasi AI penuh',
        'Sertifikat resmi',
      ],
      cta: 'Gabung Sekarang',
      popular: true,
    },
    {
      name: 'Enterprise',
      price: 'Kontak',
      description: 'Solusi khusus untuk institusi dan perusahaan.',
      features: [
        'Solusi edukasi korporat',
        'Dashboard analitik tim',
        'Pelatihan khusus',
        'Materi yang disesuaikan',
        'Dukungan prioritas',
        'Sertifikasi tim',
      ],
      cta: 'Hubungi Kami',
    },
  ]

  return (
    <section
      id="pricing"
      className="w-full py-20 md:py-32 bg-muted/30 relative overflow-hidden"
    >
      <div className="absolute inset-0 -z-10 h-full w-full bg-white dark:bg-black bg-[linear-gradient(to_right,#f0f0f0_1px,transparent_1px),linear-gradient(to_bottom,#f0f0f0_1px,transparent_1px)] dark:bg-[linear-gradient(to_right,#1f1f1f_1px,transparent_1px),linear-gradient(to_bottom,#1f1f1f_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_80%_50%_at_50%_50%,#000_40%,transparent_100%)]"></div>

      <div className="container px-4 md:px-6 relative">
        <SectionHeading
          badge="Keanggotaan"
          title="Pilih Paket Belajar Anda"
          description="Temukan paket yang paling sesuai dengan kebutuhan pembelajaran Anda. Semua paket termasuk fitur Guru Maya dan akses komunitas."
        />

        <div className="mx-auto max-w-5xl">
          <Tabs defaultValue="monthly" className="w-full">
            <div className="flex justify-center mb-8">
              <TabsList className="rounded-full p-1">
                <TabsTrigger value="monthly" className="rounded-full px-6">
                  Bulanan
                </TabsTrigger>
                <TabsTrigger value="annually" className="rounded-full px-6">
                  Tahunan (Hemat 33%)
                </TabsTrigger>
              </TabsList>
            </div>
            <TabsContent value="monthly">
              <div className="grid gap-6 lg:grid-cols-3 lg:gap-8">
                {monthlyPlans.map((plan, i) => (
                  <PricingCard key={i} plan={plan} index={i} />
                ))}
              </div>
            </TabsContent>
            <TabsContent value="annually">
              <div className="grid gap-6 lg:grid-cols-3 lg:gap-8">
                {annualPlans.map((plan, i) => (
                  <PricingCard key={i} plan={plan} index={i} />
                ))}
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </section>
  )
}

interface PricingCardProps {
  plan: {
    name: string
    price: string
    description: string
    features: string[]
    cta: string
    popular?: boolean
  }
  index: number
}

function PricingCard({ plan, index }: PricingCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
    >
      <Card
        className={`relative overflow-hidden h-full ${plan.popular ? 'border-primary shadow-lg' : 'border-border/40 shadow-md'} bg-gradient-to-b from-background to-muted/10 backdrop-blur`}
      >
        {plan.popular && (
          <div className="absolute top-0 right-0 bg-primary text-primary-foreground px-3 py-1 text-xs font-medium rounded-bl-lg">
            Terpopuler
          </div>
        )}
        <CardContent className="p-6 flex flex-col h-full">
          <h3 className="text-2xl font-bold">{plan.name}</h3>
          <div className="flex items-baseline mt-4">
            <span className="text-4xl font-bold">{plan.price}</span>
            {plan.price !== 'Gratis' && plan.price !== 'Kontak' && (
              <span className="text-muted-foreground ml-1">/bulan</span>
            )}
          </div>
          <p className="text-muted-foreground mt-2">{plan.description}</p>
          <ul className="space-y-3 my-6 flex-grow">
            {plan.features.map((feature, j) => (
              <li key={j} className="flex items-center">
                <Check className="mr-2 size-4 text-primary" />
                <span>{feature}</span>
              </li>
            ))}
          </ul>
          <Button
            className={`w-full mt-auto rounded-full ${plan.popular ? 'bg-primary hover:bg-primary/90' : 'bg-muted hover:bg-muted/80'}`}
            variant={plan.popular ? 'default' : 'outline'}
          >
            {plan.cta}
          </Button>
        </CardContent>
      </Card>
    </motion.div>
  )
}
