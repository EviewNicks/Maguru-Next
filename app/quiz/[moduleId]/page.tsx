"use client"

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ArrowLeft } from 'lucide-react'

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
  const [moduleData, setModuleData] = useState<any>(null)

  useEffect(() => {
    // Validasi apakah pengguna telah menyelesaikan modul
    const validateModuleCompletion = () => {
      try {
        const moduleCompletionData = localStorage.getItem(`module_completion_${moduleId}`)
        
        if (!moduleCompletionData) {
          console.log('Data penyelesaian modul tidak ditemukan')
          return false
        }
        
        const completionData = JSON.parse(moduleCompletionData)
        setModuleData(completionData)
        
        // Validasi: modul dianggap selesai jika completionStatus 100%
        return completionData.completionStatus === 100
      } catch (error) {
        console.error('Error validating module completion:', error)
        return false
      }
    }
    
    // Simulasi loading
    setTimeout(() => {
      const isValid = validateModuleCompletion()
      setIsAuthorized(isValid)
      setIsLoading(false)
    }, 1500)
  }, [moduleId])

  const handleBackToModule = () => {
    router.push(`/module/${moduleId}`)
  }

  if (isLoading) {
    return (
      <div className="container mx-auto py-16 px-4 max-w-4xl">
        <div className="flex flex-col items-center justify-center min-h-[50vh]">
          <div className="h-12 w-12 rounded-full border-4 border-primary border-t-transparent animate-spin mb-4"></div>
          <h2 className="text-2xl font-semibold">Mempersiapkan Quiz...</h2>
          <p className="text-muted-foreground mt-2">Mohon tunggu sebentar</p>
        </div>
      </div>
    )
  }

  if (!isAuthorized) {
    return (
      <div className="container mx-auto py-16 px-4 max-w-4xl">
        <Card className="border-destructive">
          <CardHeader>
            <CardTitle className="text-destructive">Akses Ditolak</CardTitle>
            <CardDescription>
              Anda belum menyelesaikan modul pembelajaran ini
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="mb-6">
              Untuk mengakses quiz, Anda harus menyelesaikan seluruh materi modul terlebih dahulu.
            </p>
            <Button onClick={handleBackToModule} className="flex items-center gap-2">
              <ArrowLeft className="h-4 w-4" />
              Kembali ke Modul
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

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
            <Button>Mulai Quiz</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
