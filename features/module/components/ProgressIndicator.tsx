// features/module/components/ProgressIndicator.tsx
"use client"

import React, { useEffect, useState, useCallback } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { 
  selectProgressPercentage, 
  selectIsModuleCompleted,
  selectModuleId,
  SET_PROGRESS_PERCENTAGE
} from '@/store/features/progressSlice'
import { Progress } from '@/components/ui/progress'
import { 
  Tooltip, 
  TooltipContent, 
  TooltipProvider, 
  TooltipTrigger 
} from '@/components/ui/tooltip'
import { CheckCircle } from 'lucide-react'

interface ProgressIndicatorProps {
  currentPage: number
  totalPages: number
  hasVisitedPages?: number[]
}

const ProgressIndicator: React.FC<ProgressIndicatorProps> = ({
  currentPage,
  totalPages,
  hasVisitedPages = []
}) => {
  const dispatch = useDispatch()
  const progressPercentage = useSelector(selectProgressPercentage)
  const isModuleCompleted = useSelector(selectIsModuleCompleted)
  const moduleId = useSelector(selectModuleId)
  
  // State untuk animasi pulsasi
  const [isPulsing, setIsPulsing] = useState(false)
  
  // Hitung persentase progres berdasarkan halaman yang telah dikunjungi
  const calculateProgress = useCallback(() => {
    if (hasVisitedPages.length > 0) {
      // Jika ada data halaman yang telah dikunjungi, gunakan itu
      const uniqueVisitedPages = [...new Set(hasVisitedPages)]
      return Math.round((uniqueVisitedPages.length / totalPages) * 100)
    }
    
    // Jika tidak ada data halaman yang dikunjungi, gunakan halaman saat ini
    return Math.round((currentPage / totalPages) * 100)
  }, [hasVisitedPages, totalPages, currentPage])
  
  // Tentukan warna berdasarkan progres
  const calculateColorClass = (progress: number): string => {
    if (progress >= 80) return 'progress-high'
    if (progress >= 50) return 'progress-medium'
    return 'progress-low'
  }
  
  // Efek untuk menghitung dan memperbarui persentase progres
  useEffect(() => {
    const newProgress = calculateProgress()
    
    // Hanya perbarui jika berbeda dari nilai sebelumnya
    if (newProgress !== progressPercentage) {
      dispatch(SET_PROGRESS_PERCENTAGE(newProgress))
      
      // Tambahkan animasi pulsasi saat progres berubah
      setIsPulsing(true)
      const timer = setTimeout(() => setIsPulsing(false), 1500)
      
      return () => clearTimeout(timer)
    }
  }, [currentPage, hasVisitedPages, totalPages, progressPercentage, dispatch, calculateProgress])
  
  // Efek untuk menyimpan progres ke localStorage
  useEffect(() => {
    if (moduleId) {
      const progressData = {
        currentPage,
        progressPercentage,
        isModuleCompleted,
        lastUpdated: new Date().toISOString(),
        visitedPages: hasVisitedPages
      }
      
      localStorage.setItem(`module_progress_${moduleId}`, JSON.stringify(progressData))
    }
  }, [progressPercentage, currentPage, isModuleCompleted, moduleId, hasVisitedPages])
  
  // Fungsi untuk mengambil data dari localStorage
  const getProgressFromLocalStorage = useCallback(() => {
    if (!moduleId) return null
    
    const storedProgress = localStorage.getItem(`module_progress_${moduleId}`)
    if (!storedProgress) return null
    
    try {
      return JSON.parse(storedProgress)
    } catch (error) {
      console.error('Error parsing progress data from localStorage:', error)
      return null
    }
  }, [moduleId])
  
  // Efek untuk mengambil data dari localStorage saat komponen dimuat
  useEffect(() => {
    const storedProgress = getProgressFromLocalStorage()
    
    if (storedProgress && storedProgress.visitedPages) {
      // Jika ada data yang tersimpan, gunakan untuk menghitung progres
      const calculatedProgress = Math.round(
        (storedProgress.visitedPages.length / totalPages) * 100
      )
      
      if (calculatedProgress !== progressPercentage) {
        dispatch(SET_PROGRESS_PERCENTAGE(calculatedProgress))
      }
    }
  }, [moduleId, totalPages, progressPercentage, dispatch, getProgressFromLocalStorage])
  
  const colorClass = calculateColorClass(progressPercentage)
  
  return (
    <div className="w-full space-y-2">
      <div className="flex justify-between items-center text-sm text-muted-foreground mb-1">
        <span>Halaman {currentPage} dari {totalPages}</span>
        
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <span className="flex items-center gap-1 cursor-help">
                {isModuleCompleted ? (
                  <>
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <span className="text-green-500 font-medium">Modul Selesai!</span>
                  </>
                ) : (
                  <span>{progressPercentage}% selesai</span>
                )}
              </span>
            </TooltipTrigger>
            <TooltipContent side="top">
              <p>
                {isModuleCompleted 
                  ? 'Anda telah menyelesaikan modul ini!' 
                  : `Anda telah menyelesaikan ${progressPercentage}% dari modul ini.`
                }
              </p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>
      
      <Progress 
        value={progressPercentage} 
        className={`h-2 ${colorClass} ${isPulsing ? 'animate-pulse' : ''}`}
      />
      
      {/* Indikator halaman (dots) */}
      <div className="flex justify-between mt-1">
        {Array.from({ length: totalPages }).map((_, index) => {
          const pageNumber = index + 1
          const isVisited = hasVisitedPages.includes(pageNumber)
          const isCurrent = pageNumber === currentPage
          
          return (
            <div 
              key={`page-${pageNumber}`}
              className={`
                h-2 w-2 rounded-full transition-all duration-300
                ${isCurrent ? 'scale-150 bg-primary' : ''}
                ${isVisited && !isCurrent ? 'bg-primary/70' : ''}
                ${!isVisited && !isCurrent ? 'bg-muted' : ''}
              `}
              title={`Halaman ${pageNumber}`}
            />
          )
        })}
      </div>
    </div>
  )
}

export default ProgressIndicator