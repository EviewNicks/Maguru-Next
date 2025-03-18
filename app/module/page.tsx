"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { BookOpen, Clock, ArrowRight, Eye } from "lucide-react"
import { Skeleton } from "@/components/ui/skeleton"
import { useRouter } from "next/navigation"
import { fetchModules, Module, ModulePage as ServiceModulePage } from "@/features/module/services/moduleService"
import { ModulePage, ModuleData as ModuleDataType } from "@/features/module/types"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

// Fungsi transformasi dari ModulePage service ke ModulePage types
const transformModulePage = (
  page: ServiceModulePage,
  index: number = 0,
  totalPages: number = 1
): ModulePage => {
  return {
    id: page.id,
    title: page.title,
    content: page.content,
    pageNumber: page.pageNumber || index + 1,
    isLastPage: page.isLastPage || index === totalPages - 1,
    media: page.media,
    requiredInteractions: page.requiredInteractions || [],
    interactiveElements: page.hasInteractiveElements ? [] : undefined
  }
}

// Interface untuk ModuleData yang digunakan di komponen ini
interface ModuleData extends Omit<ModuleDataType, 'estimatedTime'> {
  estimatedTime: string;
  visitedPages: string[];
}

// Fungsi transformasi dari Module ke ModuleData
const transformModuleToModuleData = (module: Module): ModuleData => {
  const storedProgress = localStorage.getItem(`module_progress_${module.id}`)
  const progressData = storedProgress ? JSON.parse(storedProgress) : null
  
  // Tambahkan validasi data dari localStorage
  let validProgressPercentage = 0
  let validVisitedPages: string[] = []
  let isModuleCompleted = false
  
  if (progressData) {
    try {
      validProgressPercentage = progressData.progressPercentage || 0
      
      // Pastikan visitedPages adalah array dan setiap nilai adalah string
      if (Array.isArray(progressData.visitedPages)) {
        validVisitedPages = progressData.visitedPages.map((page: string | number) => String(page))
      }
      
      isModuleCompleted = progressData.isCompleted || false
    } catch (error) {
      console.error("Error validating progress data:", error)
    }
  }
  
  // Transformasi halaman dengan informasi totalPages
  const transformedPages = module.pages.map((page, index) => 
    transformModulePage(page, index, module.pages.length)
  )
  
  return {
    id: module.id,
    title: module.title,
    description: module.description,
    pages: transformedPages,
    totalPages: module.pages.length,
    progressPercentage: validProgressPercentage,
    isCompleted: isModuleCompleted,
    quickViewModeAvailable: Boolean(module.quizAvailable),
    estimatedTime: String(module.estimatedTime || "10 menit"),
    visitedPages: validVisitedPages
  }
}

export default function ModulesPage() {
  const [modules, setModules] = useState<ModuleData[]>([])
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    const loadModules = async () => {
      try {
        const moduleData = await fetchModules()
        const transformedModules = moduleData.map(transformModuleToModuleData)
        setModules(transformedModules)
      } catch (error) {
        console.error("Error loading modules:", error)
      } finally {
        setLoading(false)
      }
    }

    loadModules()
  }, [])

  // Komponen untuk menampilkan kartu modul
  const ModuleCard = ({ module }: { module: ModuleData }) => {
    const handleModuleClick = () => {
      router.push(`/module/${module.id}`)
    }
    
    const handleQuickViewClick = (e: React.MouseEvent) => {
      e.stopPropagation()
      router.push(`/module/${module.id}?mode=quick`)
    }
    
    return (
      <Card 
        className="w-full cursor-pointer transition-all duration-300 hover:shadow-md"
        onClick={handleModuleClick}
      >
        <CardHeader>
          <div className="flex justify-between items-start">
            <div>
              <CardTitle className="text-xl">{module.title}</CardTitle>
              <CardDescription className="mt-2">{module.description}</CardDescription>
            </div>
            {module.quickViewModeAvailable && (
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="flex items-center gap-1"
                      onClick={handleQuickViewClick}
                    >
                      <Eye size={16} />
                      <span>Eksplorasi Cepat</span>
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Lihat semua materi tanpa harus menyelesaikan modul</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-4">
            <div className="flex justify-between">
              <div className="flex items-center gap-2">
                <BookOpen size={16} className="text-primary" />
                <span className="text-sm">{module.totalPages} halaman</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock size={16} className="text-primary" />
                <span className="text-sm">{module.estimatedTime}</span>
              </div>
            </div>
            
            <div className="mt-2">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium">Progres</span>
                <span className="text-sm">{module.progressPercentage}%</span>
              </div>
              <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                <div 
                  className={`h-full rounded-full ${
                    module.progressPercentage >= 100 
                      ? 'bg-green-500' 
                      : module.progressPercentage > 0 
                        ? 'bg-primary' 
                        : ''
                  } w-[${module.progressPercentage}%]`}
                ></div>
              </div>
            </div>
            
            {module.visitedPages.length > 0 && (
              <div className="mt-2">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-sm font-medium">Halaman yang sudah dikunjungi:</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {Array.from({ length: module.totalPages }).map((_, index) => {
                    const pageNumber = index + 1
                    const isVisited = module.visitedPages.includes(String(pageNumber))
                    
                    return (
                      <TooltipProvider key={index}>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <div 
                              className={`w-6 h-6 rounded-full flex items-center justify-center text-xs
                                ${isVisited 
                                  ? 'bg-primary text-white' 
                                  : 'bg-gray-200 text-gray-600'
                                }`}
                            >
                              {pageNumber}
                            </div>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>
                              {isVisited 
                                ? `Halaman ${pageNumber} sudah dikunjungi` 
                                : `Halaman ${pageNumber} belum dikunjungi`
                              }
                            </p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    )
                  })}
                </div>
              </div>
            )}
          </div>
        </CardContent>
        <CardFooter className="flex justify-between">
          <Badge variant={module.isCompleted ? "default" : "outline"}>
            {module.isCompleted ? "Selesai" : "Belum Selesai"}
          </Badge>
          <Button size="sm" className="flex items-center gap-1">
            Lanjutkan <ArrowRight size={16} />
          </Button>
        </CardFooter>
      </Card>
    )
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="flex flex-col gap-6">
        <div>
          <h1 className="text-3xl font-bold">Modul Pembelajaran</h1>
          <p className="text-muted-foreground mt-2">
            Pilih modul yang ingin Anda pelajari
          </p>
        </div>
        
        <div>
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3].map((i) => (
                <Card key={i} className="w-full">
                  <CardHeader>
                    <Skeleton className="h-6 w-3/4" />
                    <Skeleton className="h-4 w-full mt-2" />
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <Skeleton className="h-4 w-1/2" />
                      <Skeleton className="h-4 w-1/3" />
                      <Skeleton className="h-4 w-full" />
                    </div>
                  </CardContent>
                  <CardFooter>
                    <Skeleton className="h-10 w-full" />
                  </CardFooter>
                </Card>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {modules.map((module) => (
                <ModuleCard key={module.id} module={module} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
