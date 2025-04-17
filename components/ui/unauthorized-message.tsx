'use client'

import React from 'react'
import { ArrowLeft, ShieldAlert } from 'lucide-react'
import { Button } from './button'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from './card'
import { useRouter } from 'next/navigation'

interface UnauthorizedMessageProps {
  title?: string
  description?: string
  backUrl?: string
  backText?: string
}

export function UnauthorizedMessage({
  title = 'Akses Tidak Diizinkan',
  description = 'Maaf, Anda tidak memiliki izin untuk mengakses halaman ini. Anda memerlukan izin khusus atau perlu login terlebih dahulu.',
  backUrl = '/',
  backText = 'Kembali ke Beranda',
}: UnauthorizedMessageProps) {
  const router = useRouter()

  return (
    <div className="flex flex-col items-center justify-center min-h-[50vh] p-4">
      <Card className="w-full max-w-md border-red-200 shadow-md">
        <CardHeader className="pb-2">
          <div className="flex justify-center mb-4">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center">
              <ShieldAlert className="h-8 w-8 text-red-500" />
            </div>
          </div>
          <CardTitle className="text-center text-xl font-semibold text-red-600">
            {title}
          </CardTitle>
          <CardDescription className="text-center mt-2">
            {description}
          </CardDescription>
        </CardHeader>
        <CardContent className="text-center">
          <p className="text-sm text-gray-600">
            Jika Anda yakin seharusnya memiliki akses, silakan hubungi
            administrator sistem.
          </p>
        </CardContent>
        <CardFooter className="flex justify-center">
          <Button
            variant="outline"
            className="flex items-center gap-2"
            onClick={() => router.push(backUrl)}
          >
            <ArrowLeft className="h-4 w-4" />
            {backText}
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}
