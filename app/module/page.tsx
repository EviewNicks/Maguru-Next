"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { BookOpen, Clock, Award, ArrowRight } from "lucide-react"
import { Skeleton } from "@/components/ui/skeleton"
import { useRouter } from "next/navigation"
import { fetchModules, Module, ModulePage as ServiceModulePage } from "@/features/module/services/moduleService"
import { ModuleData, ModulePage } from "@/features/module/types"

// Fungsi transformasi dari ModulePage service ke ModulePage types
const transformModulePage = (
  page: ServiceModulePage, 
  index: number, 
  totalPages: number
): ModulePage => ({
  id: page.id,
  title: page.title,
  content: page.content,
  media: page.media,
  isLastPage: index === totalPages - 1,
  pageNumber: index + 1,
  requiredInteractions: page.requiredInteractions,
  interactiveElements: page.hasInteractiveElements ? [] : undefined
})

// Fungsi transformasi dari Module ke ModuleData
const transformModuleToModuleData = (module: Module): ModuleData => {
  const storedProgress = localStorage.getItem(`module_progress_${module.id}`)
  const progressData = storedProgress ? JSON.parse(storedProgress) : null
  
  return {
    id: module.id,
    title: module.title,
    description: module.description,
    pages: module.pages.map((page, index) => 
      transformModulePage(page, index, module.totalPages)
    ),
    totalPages: module.totalPages,
    progressPercentage: progressData?.progressPercentage || 0,
    isCompleted: progressData?.progressPercentage === 100,
    quickViewModeAvailable: module.quizAvailable,
    estimatedTime: module.estimatedTime
  }
}

export default function ModulesPage() {
  const [modules, setModules] = useState<ModuleData[]>([])
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    const getModules = async () => {
      try {
        setLoading(true)
        const modulesData = await fetchModules()
        const transformedModules = modulesData.map(transformModuleToModuleData)
        setModules(transformedModules)
      } catch (error) {
        console.error("Error fetching modules:", error)
      } finally {
        setLoading(false)
      }
    }

    getModules()
  }, [])

  const getProgressForModule = (moduleId: string) => {
    try {
      const storedProgress = localStorage.getItem(`module_progress_${moduleId}`)
      if (!storedProgress) return 0
      
      const progressData = JSON.parse(storedProgress)
      return progressData.progressPercentage || 0
    } catch (error) {
      console.error("Error getting module progress:", error)
      return 0
    }
  }

  const renderModuleCard = (module: ModuleData) => {
    const progress = getProgressForModule(module.id)
    const isCompleted = progress === 100
    
    return (
      <Card key={module.id} className="h-full flex flex-col hover:shadow-md transition-shadow">
        <CardHeader>
          <div className="flex justify-between items-start">
            <CardTitle className="text-xl">{module.title}</CardTitle>
            {isCompleted && (
              <Badge variant="outline" className="flex items-center gap-1">
                <Award className="h-3 w-3" />
                Selesai
              </Badge>
            )}
          </div>
          <CardDescription>{module.description}</CardDescription>
        </CardHeader>
        <CardContent className="flex-grow">
          <div className="flex flex-col gap-3">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <BookOpen className="h-4 w-4" />
              <span>{module.totalPages} halaman</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Clock className="h-4 w-4" />
              <span>±{module.estimatedTime} menit</span>
            </div>
            
            {/* Progress bar */}
            {progress > 0 && (
              <div className="mt-2">
                <div className="text-sm text-muted-foreground mb-1">
                  Progress: {progress}%
                </div>
                <div className="w-full bg-muted rounded-full h-2">
                  <div className="bg-primary h-2 rounded-full progress-bar" style={{ width: `${progress}%` }} />
                </div>
              </div>
            )}
          </div>
        </CardContent>
        <CardFooter>
          <Button 
            className="w-full" 
            onClick={() => router.push(`/module/${module.id}`)}
          >
            {progress > 0 && !isCompleted ? "Lanjutkan" : "Mulai Belajar"}
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </CardFooter>
      </Card>
    )
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="flex flex-col gap-8">
        <div>
          <h1 className="text-3xl font-bold mb-2">Modul Pembelajaran</h1>
          <p className="text-muted-foreground">
            Pilih modul pembelajaran yang ingin Anda pelajari.
          </p>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <Card key={i} className="h-full">
                <CardHeader>
                  <Skeleton className="h-6 w-3/4 mb-2" />
                  <Skeleton className="h-4 w-full" />
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <Skeleton className="h-4 w-1/2" />
                    <Skeleton className="h-4 w-1/3" />
                    <Skeleton className="h-2 w-full rounded-full" />
                  </div>
                </CardContent>
                <CardFooter>
                  <Skeleton className="h-10 w-full" />
                </CardFooter>
              </Card>
            ))}
          </div>
        ) : (
          <>
            {modules.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-muted-foreground">
                  Tidak ada modul pembelajaran yang tersedia saat ini.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {modules.map(renderModuleCard)}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}
