'use client'

import { motion } from 'framer-motion'
import { Star } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { SectionHeading } from '@/features/home-page/components/ui/SectionHeading'

export default function TestimonialsSection() {
  const testimonials = [
    {
      quote:
        'Maguru telah mengubah cara saya belajar teknologi. Guru Maya benar-benar memahami kebutuhan belajar saya dan selalu memberikan rekomendasi yang tepat.',
      author: 'Sarah Anggraini',
      role: 'Mahasiswa Teknik Informatika',
      rating: 5,
    },
    {
      quote:
        'Saya suka bagaimana Maguru menggabungkan pembelajaran teknis dengan soft skill. Sekarang saya tidak hanya bisa coding, tapi juga lebih baik dalam berkomunikasi dengan tim.',
      author: 'Michael Prasetyo',
      role: 'Fresh Graduate, UI/UX Designer',
      rating: 5,
    },
    {
      quote:
        'Sistem gamifikasi di Maguru membuat belajar menjadi menyenangkan. Saya jadi lebih termotivasi untuk menyelesaikan modul dan tantangan yang diberikan.',
      author: 'Putri Rahayu',
      role: 'Web Developer',
      rating: 5,
    },
    {
      quote:
        'Proyek kolaboratif di Maguru memberi kesempatan untuk menerapkan pengetahuan secara langsung. Rasanya seperti mendapat pengalaman kerja nyata.',
      author: 'Dimas Rizky',
      role: 'Mahasiswa Tahun Akhir',
      rating: 5,
    },
    {
      quote:
        'Pembelajaran AI yang dipersonalisasi di Maguru membuat saya bisa belajar dengan kecepatan sendiri. Alur pembelajarannya sangat intuitif dan mudah diikuti.',
      author: 'Lisa Permata',
      role: 'Administrator Sistem',
      rating: 5,
    },
    {
      quote:
        'Komunitas Maguru luar biasa suportif. Saya mendapatkan banyak inspirasi dan jaringan yang membantu karir saya di bidang teknologi.',
      author: 'Budi Santoso',
      role: 'Data Scientist',
      rating: 5,
    },
  ]

  return (
    <section id="testimonials" className="w-full py-20 md:py-32">
      <div className="container px-4 md:px-6">
        <SectionHeading
          badge="Testimoni"
          title="Apa Kata Mereka"
          description="Dengarkan pengalaman para pengguna yang telah merasakan perbedaan belajar di platform kami."
        />

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {testimonials.map((testimonial, i) => (
            <TestimonialCard key={i} testimonial={testimonial} index={i} />
          ))}
        </div>
      </div>
    </section>
  )
}

interface TestimonialCardProps {
  testimonial: {
    quote: string
    author: string
    role: string
    rating: number
  }
  index: number
}

function TestimonialCard({ testimonial, index }: TestimonialCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay: index * 0.05 }}
    >
      <Card className="h-full overflow-hidden border-border/40 bg-gradient-to-b from-background to-muted/10 backdrop-blur transition-all hover:shadow-md">
        <CardContent className="p-6 flex flex-col h-full">
          <div className="flex mb-4">
            {Array(testimonial.rating)
              .fill(0)
              .map((_, j) => (
                <Star
                  key={j}
                  className="size-4 text-yellow-500 fill-yellow-500"
                />
              ))}
          </div>
          <p className="text-lg mb-6 flex-grow">{testimonial.quote}</p>
          <div className="flex items-center gap-4 mt-auto pt-4 border-t border-border/40">
            <div className="size-10 rounded-full bg-muted flex items-center justify-center text-foreground font-medium">
              {testimonial.author.charAt(0)}
            </div>
            <div>
              <p className="font-medium">{testimonial.author}</p>
              <p className="text-sm text-muted-foreground">
                {testimonial.role}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}
