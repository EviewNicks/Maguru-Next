"use client"

import React from 'react'
import ModulePage from '@/features/module/components/ModulePage'

interface ModuleRouteProps {
  params: {
    moduleId: string
  }
}

export default function ModuleRoute({ params }: ModuleRouteProps) {
  const { moduleId } = params

  return <ModulePage moduleId={moduleId} />
}
