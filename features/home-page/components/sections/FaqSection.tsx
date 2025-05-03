'use client'

import { motion } from 'framer-motion'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion'
import { SectionHeading } from '@/features/home-page/components/ui/SectionHeading'

export default function FaqSection() {
  const faqs = [
    {
      question: 'Apa itu Maguru?',
      answer:
        'Maguru adalah platform pembelajaran berbasis AI yang menggabungkan teknologi terkini dengan pendekatan humanis. Kami menyediakan kursus teknologi, pengembangan soft skills, dan nilai-nilai manusia yang berkembang secara seimbang melalui sistem gamifikasi yang menarik.',
    },
    {
      question: 'Bagaimana sistem pembelajaran di Maguru bekerja?',
      answer:
        'Maguru menggunakan AI untuk menyesuaikan jalur pembelajaran dengan gaya belajar, kecepatan, dan tujuan karir individu. Pengguna dapat mengakses materi pembelajaran interaktif, mengerjakan quiz, berpartisipasi dalam proyek kolaboratif, dan mendapatkan bantuan dari Asisten AI "Guru Maya".',
    },
    {
      question: 'Apakah saya perlu punya pengetahuan teknologi sebelumnya?',
      answer:
        'Tidak, Maguru menyediakan jalur pembelajaran untuk semua tingkat, mulai dari pemula hingga tingkat lanjut. Sistem AI kami akan menyesuaikan konten berdasarkan tingkat pengetahuan Anda saat ini.',
    },
    {
      question: 'Apakah Maguru menyediakan sertifikat?',
      answer:
        'Ya, Maguru menyediakan sertifikat resmi setelah Anda menyelesaikan kursus dan proyek. Sertifikat ini dapat ditambahkan ke CV dan profil LinkedIn Anda untuk menunjukkan keterampilan yang telah Anda kuasai.',
    },
    {
      question: 'Bagaimana dengan keamanan data saya?',
      answer:
        'Kami menganggap keamanan data dengan sangat serius. Semua data dienkripsi baik saat transit maupun saat disimpan. Kami menggunakan praktik keamanan standar industri dan secara rutin menjalani audit keamanan. Platform kami mematuhi peraturan privasi data yang berlaku.',
    },
    {
      question: 'Bagaimana cara bergabung dengan Maguru?',
      answer:
        'Untuk bergabung dengan Maguru, cukup klik tombol "Mulai Belajar" di halaman utama, buat akun dengan email Anda, dan Anda langsung bisa mengakses materi pembelajaran dasar secara gratis. Untuk akses ke semua fitur premium, Anda dapat meningkatkan ke paket Professional.',
    },
  ]

  return (
    <section id="faq" className="w-full py-20 md:py-32">
      <div className="container px-4 md:px-6">
        <SectionHeading
          badge="FAQ"
          title="Pertanyaan Umum"
          description="Temukan jawaban untuk pertanyaan yang sering ditanyakan tentang platform kami."
        />

        <div className="mx-auto max-w-3xl">
          <Accordion type="single" collapsible className="w-full">
            {faqs.map((faq, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.3, delay: i * 0.05 }}
              >
                <AccordionItem
                  value={`item-${i}`}
                  className="border-b border-border/40 py-2"
                >
                  <AccordionTrigger className="text-left font-medium hover:no-underline">
                    {faq.question}
                  </AccordionTrigger>
                  <AccordionContent className="text-muted-foreground">
                    {faq.answer}
                  </AccordionContent>
                </AccordionItem>
              </motion.div>
            ))}
          </Accordion>
        </div>
      </div>
    </section>
  )
}
