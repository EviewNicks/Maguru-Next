"use client"
import React, { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ArrowLeft, BookCheck, CheckCircle } from 'lucide-react'
import { toast } from '@/hooks/use-toast'
import { Badge } from '@/components/ui/badge'

interface ModuleCompletionData {
  moduleId: string
  completionStatus: number
  visitedPages: number[]
  lastVisitedPage: number
  timestamp: string
}

interface QuizPageProps {
  params: {
    moduleId: string
  }
}

export default function QuizPage({ params }: QuizPageProps) {
  const { moduleId } = params
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(true)
  const [isAuthorized, setIsAuthorized] = useState(false)
  const [moduleData, setModuleData] = useState<ModuleCompletionData | null>(null)
  const [quizStarted, setQuizStarted] = useState(false)

  useEffect(() => {
    // Validasi apakah pengguna telah menyelesaikan modul
    const validateModuleCompletion = () => {
      try {
        const moduleCompletionData = localStorage.getItem(`module_completion_${moduleId}`)
        
        if (!moduleCompletionData) {
          toast({
            title: "Akses Ditolak",
            description: "Anda belum menyelesaikan modul",
            variant: "destructive"
          })
          return false
        }
        
        const completionData: ModuleCompletionData = JSON.parse(moduleCompletionData)
        setModuleData(completionData)
        
        // Validasi tambahan
        const isCompletedRecently = isCompletionRecent(completionData.timestamp)
        const hasVisitedAllPages = completionData.visitedPages.length === completionData.lastVisitedPage

        // Modul dianggap selesai jika:
        // 1. Completion status 100%
        // 2. Diselesaikan dalam waktu 24 jam terakhir
        // 3. Semua halaman telah dikunjungi
        const isValid = 
          completionData.completionStatus === 100 && 
          isCompletedRecently && 
          hasVisitedAllPages

        if (!isValid) {
          toast({
            title: "Prasyarat Quiz Tidak Terpenuhi",
            description: "Pastikan Anda telah menyelesaikan seluruh modul dengan benar",
            variant: "destructive"
          })
        }

        return isValid
      } catch (error) {
        console.error('Error validating module completion:', error)
        toast({
          title: "Kesalahan Validasi",
          description: "Terjadi kesalahan saat memvalidasi penyelesaian modul",
          variant: "destructive"
        })
        return false
      }
    }

    // Fungsi untuk memeriksa apakah modul diselesaikan baru-baru ini (dalam 24 jam)
    const isCompletionRecent = (timestamp: string) => {
      const completionTime = new Date(timestamp).getTime()
      const currentTime = new Date().getTime()
      const twentyFourHoursAgo = currentTime - (24 * 60 * 60 * 1000)
      return completionTime > twentyFourHoursAgo
    }
    
    // Simulasi loading
    setTimeout(() => {
      const isValid = validateModuleCompletion()
      setIsAuthorized(isValid)
      setIsLoading(false)
    }, 1500)
  }, [moduleId])

  // Tampilan loading
  const handleBackToModule = () => {
    router.push(`/module/${moduleId}`)
  }

  const handleStartQuiz = () => {
    if (moduleData) {
      // Simpan status quiz dimulai ke localStorage
      localStorage.setItem(`quiz_started_${moduleId}`, JSON.stringify({
        startTime: new Date().toISOString(),
        moduleData: moduleData
      }))
      
      // Catat aktivitas pengguna
      
      // Ubah state untuk menampilkan pertanyaan quiz
      setQuizStarted(true)
      
      toast({
        title: "Quiz Dimulai",
        description: "Selamat mengerjakan quiz!",
        variant: "default"
      })
    } else {
      toast({
        title: "Kesalahan",
        description: "Data modul tidak ditemukan",
        variant: "destructive"
      })
    }
  }

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Card className="w-[400px]">
          <CardHeader>
            <CardTitle>Memuat Quiz</CardTitle>
            <CardDescription>Sedang memvalidasi penyelesaian modul...</CardDescription>
          </CardHeader>
          <CardContent className="flex justify-center">
            <div className="animate-spin">
              <BookCheck size={48} />
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Tampilan jika tidak diotorisasi
  if (!isAuthorized) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Card className="w-[400px]">
          <CardHeader>
            <CardTitle>Akses Ditolak</CardTitle>
            <CardDescription>Anda belum memenuhi prasyarat untuk mengakses quiz</CardDescription>
          </CardHeader>
          <CardContent className="flex justify-center">
            <Button 
              variant="outline" 
              onClick={() => router.push(`/module/${moduleId}`)}
            >
              <ArrowLeft className="mr-2" /> Kembali ke Modul
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Tampilan quiz yang sudah dimulai
  if (quizStarted) {
    return (
      <div className="container mx-auto py-16 px-4 max-w-4xl">
        <Card>
          <CardHeader>
            <CardTitle>Quiz Modul {moduleId}</CardTitle>
            <CardDescription>
              Jawablah pertanyaan-pertanyaan berikut berdasarkan materi yang telah dipelajari
            </CardDescription>
          </CardHeader>
          <CardContent>
            {/* Implementasi pertanyaan quiz akan ditambahkan di sini */}
            <div className="p-4 border rounded-md mb-4">
              <h3 className="font-semibold mb-2">Pertanyaan 1</h3>
              <p className="mb-4">Pertanyaan quiz akan ditampilkan di sini</p>
            </div>
            
            <div className="flex justify-between mt-6">
              <Button variant="outline" onClick={() => setQuizStarted(false)}>
                Kembali ke Informasi Quiz
              </Button>
              <Button>Selanjutnya</Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Tampilan informasi quiz
  return (
    <div className="container mx-auto py-16 px-4 max-w-4xl">
      <Card>
        <CardHeader>
          <CardTitle>Quiz Modul {moduleId}</CardTitle>
          <CardDescription>
            Selamat! Anda telah menyelesaikan modul dan siap untuk mengikuti quiz.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {moduleData && (
            <div className="bg-muted p-4 rounded-md mb-6">
              <h3 className="font-semibold mb-2">Status Penyelesaian Modul:</h3>
              <div className="flex items-center gap-2 mb-2">
                <CheckCircle className="h-5 w-5 text-green-500" />
                <span>Progres: <Badge variant="outline">{moduleData.completionStatus}%</Badge></span>
              </div>
              <div className="text-sm text-muted-foreground">
                Modul diselesaikan pada: {new Date(moduleData.timestamp).toLocaleString('id-ID')}
              </div>
            </div>
          )}
          
          <div className="bg-muted p-6 rounded-md mb-6">
            <h3 className="font-semibold mb-2">Informasi Quiz:</h3>
            <ul className="space-y-2 list-disc pl-5">
              <li>Quiz ini berisi pertanyaan tentang materi yang telah Anda pelajari</li>
              <li>Anda memiliki waktu 30 menit untuk menyelesaikan quiz</li>
              <li>Nilai minimum kelulusan adalah 70%</li>
            </ul>
          </div>
          
          <div className="flex items-center justify-between">
            <Button variant="outline" onClick={handleBackToModule} className="flex items-center gap-2">
              <ArrowLeft className="h-4 w-4" />
              Kembali ke Modul
            </Button>
            <Button onClick={handleStartQuiz}>Mulai Quiz</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
