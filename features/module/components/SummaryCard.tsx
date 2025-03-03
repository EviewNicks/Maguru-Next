// features/module/components/SummaryCard.tsx
"use client"

import { useState, useEffect } from 'react'
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { CheckCircle, AlertCircle, BookOpen, ArrowRight, RefreshCw } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { toast } from '@/hooks/use-toast'
import { ModuleData, ModulePage } from '@/features/module/types'

interface SummaryCardProps {
  moduleData: ModuleData
  visitedPages: number[]
  currentPage: number
  totalPages: number
  onNavigateToPage: (pageNumber: number) => void
  progressPercentage: number
}

const SummaryCard: React.FC<SummaryCardProps> = ({
  moduleData,
  visitedPages,
  currentPage,
  totalPages,
  onNavigateToPage,
  progressPercentage
}) => {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [recommendations, setRecommendations] = useState<{ pageNumber: number; title: string; reason: string }[]>([])
  const [isQuizReady, setIsQuizReady] = useState(false)

  // Fungsi untuk mengevaluasi kesiapan quiz
  const calculateQuizReadiness = () => {
    // Modul dianggap siap untuk quiz jika semua halaman telah dikunjungi
    const uniqueVisitedPages = new Set(visitedPages)
    const allPagesVisited = uniqueVisitedPages.size >= totalPages
    
    setIsQuizReady(allPagesVisited)
    return allPagesVisited
  }

  // Fungsi untuk menghasilkan rekomendasi halaman yang perlu diulang
  const generateRecommendations = () => {
    const uniqueVisitedPages = new Set(visitedPages)
    const recommendations = []

    // Rekomendasi untuk halaman yang belum dikunjungi
    for (let i = 1; i <= totalPages; i++) {
      if (!uniqueVisitedPages.has(i)) {
        const page = moduleData.pages.find(p => p.pageNumber === i)
        if (page) {
          recommendations.push({
            pageNumber: i,
            title: page.title,
            reason: 'Halaman belum dikunjungi'
          })
        }
      }
    }

    // Jika semua halaman sudah dikunjungi, berikan rekomendasi halaman penting
    if (recommendations.length === 0) {
      // Contoh: Rekomendasi halaman dengan konten penting atau interaktif
      const importantPages = moduleData.pages.filter(page => 
        page.interactiveElements && page.interactiveElements.length > 0
      )
      
      importantPages.slice(0, 3).forEach(page => {
        recommendations.push({
          pageNumber: page.pageNumber,
          title: page.title,
          reason: 'Halaman penting dengan elemen interaktif'
        })
      })
    }

    setRecommendations(recommendations)
    return recommendations
  }

  // Fungsi untuk menangani navigasi ke quiz
  const handleNavigateToQuiz = () => {
    if (!isQuizReady) {
      toast({
        title: "Belum siap untuk quiz",
        description: "Selesaikan semua halaman modul terlebih dahulu",
        variant: "destructive"
      })
      return
    }

    setIsLoading(true)
    
    // Simpan status penyelesaian modul ke localStorage
    const moduleProgress = {
      moduleId: moduleData.id,
      completionStatus: progressPercentage,
      visitedPages: Array.from(new Set(visitedPages)),
      lastVisitedPage: currentPage,
      timestamp: new Date().toISOString()
    }
    
    localStorage.setItem(`module_completion_${moduleData.id}`, JSON.stringify(moduleProgress))
    
    // Log aktivitas pengguna
    console.log('Pengguna menyelesaikan modul dan melanjutkan ke quiz', moduleProgress)
    
    // Navigasi ke halaman quiz
    setTimeout(() => {
      router.push(`/quiz/${moduleData.id}`)
    }, 1000)
  }

  // Fungsi untuk menangani ulang materi
  const handleRestartModule = () => {
    toast({
      title: "Mengulang materi",
      description: "Kembali ke halaman pertama",
    })
    
    onNavigateToPage(1)
  }

  // Efek untuk mengevaluasi kesiapan quiz dan menghasilkan rekomendasi
  useEffect(() => {
    calculateQuizReadiness()
    generateRecommendations()
  }, [visitedPages, totalPages])

  return (
    <Card className="w-full shadow-md">
      <CardHeader className="bg-primary/5">
        <CardTitle className="text-2xl flex items-center gap-2">
          <CheckCircle className={`h-6 w-6 ${isQuizReady ? 'text-green-500' : 'text-muted-foreground'}`} />
          Ringkasan Modul
        </CardTitle>
      </CardHeader>
      
      <CardContent className="pt-6">
        <div className="space-y-6">
          {/* Status Penyelesaian */}
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-medium">Status Penyelesaian</h3>
            <Badge variant={isQuizReady ? "default" : "outline"} className={isQuizReady ? "bg-green-500" : ""}>
              {isQuizReady ? 'Siap untuk Quiz' : `${progressPercentage}% Selesai`}
            </Badge>
          </div>
          
          {/* Ringkasan Materi */}
          <div>
            <h3 className="text-lg font-medium mb-3">Poin-poin Utama</h3>
            <ul className="space-y-2 list-disc pl-5">
              {moduleData.description.split('. ').map((point, index) => (
                <li key={index} className="text-muted-foreground">{point}</li>
              ))}
            </ul>
          </div>
          
          {/* Rekomendasi Halaman */}
          {recommendations.length > 0 && (
            <div>
              <h3 className="text-lg font-medium mb-3">Rekomendasi Halaman untuk Diulang</h3>
              <div className="space-y-3">
                {recommendations.map((rec, index) => (
                  <div key={index} className="flex items-start justify-between p-3 bg-muted rounded-md">
                    <div>
                      <p className="font-medium">{rec.title}</p>
                      <p className="text-sm text-muted-foreground">{rec.reason}</p>
                    </div>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => onNavigateToPage(rec.pageNumber)}
                      className="flex items-center gap-1"
                    >
                      <BookOpen className="h-4 w-4" />
                      Buka
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </CardContent>
      
      <CardFooter className="flex justify-between pt-4 border-t">
        <Button 
          variant="outline" 
          onClick={handleRestartModule}
          className="flex items-center gap-2"
        >
          <RefreshCw className="h-4 w-4" />
          Ulang Materi
        </Button>
        
        <Button 
          onClick={handleNavigateToQuiz} 
          disabled={!isQuizReady}
          className="flex items-center gap-2"
          {...(isLoading && { 'aria-disabled': true })}
        >
          {isLoading ? (
            <div className="flex items-center gap-2">
              <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent"></div>
              Memuat...
            </div>
          ) : (
            <>
              Lanjut ke Quiz
              <ArrowRight className="h-4 w-4" />
            </>
          )}
        </Button>
      </CardFooter>
    </Card>
  )
}

export default SummaryCard
