// app/module/[moduleId]/loading.tsx
import { Skeleton } from "@/components/ui/skeleton"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { BookOpen } from "lucide-react"

export default function ModuleLoading() {
  return (
    <div className="container mx-auto py-8 px-4 max-w-5xl">
      <div className="flex flex-col items-center justify-center min-h-[50vh] gap-4">
        <div className="flex items-center justify-center w-16 h-16 rounded-full bg-primary/10">
          <BookOpen className="h-8 w-8 text-primary animate-pulse" />
        </div>
        
        <h1 className="text-2xl font-bold text-center">
          Memuat Modul Pembelajaran...
        </h1>
        
        <div className="w-full max-w-md">
          <Skeleton className="h-4 w-full mb-2" />
          <Skeleton className="h-4 w-3/4 mb-6" />
        </div>
        
        <Card className="w-full max-w-3xl">
          <CardHeader>
            <Skeleton className="h-8 w-3/4 mb-2" />
            <Skeleton className="h-4 w-1/2" />
          </CardHeader>
          <CardContent className="space-y-4">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-32 w-full rounded-md" />
            <div className="flex justify-between pt-4">
              <Skeleton className="h-10 w-24" />
              <Skeleton className="h-10 w-24" />
            </div>
          </CardContent>
        </Card>
        
        <div className="w-full max-w-3xl mt-4">
          <Skeleton className="h-2 w-full rounded-full" />
        </div>
      </div>
    </div>
  )
}
