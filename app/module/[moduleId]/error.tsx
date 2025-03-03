"use client"

import { useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { AlertCircle } from "lucide-react"

export default function ModuleError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    // Log error ke sistem monitoring
    console.error(error)
  }, [error])

  return (
    <div className="container mx-auto py-8 px-4 max-w-5xl">
      <div className="flex flex-col items-center justify-center min-h-[50vh] gap-4">
        <div className="flex items-center justify-center w-16 h-16 rounded-full bg-destructive/10">
          <AlertCircle className="h-8 w-8 text-destructive" />
        </div>
        
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-xl text-center">Terjadi Kesalahan</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground text-center">
              Maaf, kami tidak dapat memuat modul pembelajaran yang Anda minta.
            </p>
            <div className="mt-4 p-3 bg-muted rounded-md text-sm">
              <p className="font-mono">{error.message || "Kesalahan tidak diketahui"}</p>
            </div>
          </CardContent>
          <CardFooter className="flex justify-center gap-4">
            <Button variant="outline" onClick={() => window.location.href = "/dashboard"}>
              Kembali ke Dashboard
            </Button>
            <Button onClick={() => reset()}>
              Coba Lagi
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  )
}
