'use client'

import React from 'react'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import {
  ChevronDown,
  MessageSquare,
  MoreHorizontal,
  Share2,
  Edit,
} from 'lucide-react'
import { useModulePageCRUDContext } from '../../../context/ModulePageCRUDContext'
import { useUser } from '@clerk/nextjs'
import Image from 'next/image'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { Separator } from '@/components/ui/separator'
import { ActiveEditorIndicator } from '../../../components/feedback/ActiveEditorIndicator'
import { getConcurrentEditingService } from '../../../lib/draft/ConcurrentEditingService'
import { useEffect, useRef, useState } from 'react'

interface ViewHeaderProps {
  pageId: string
  moduleId: string
  onSwitchToEdit: () => void
}

/**
 * ViewHeader - Header untuk mode view
 *
 * Komponen ini menampilkan header yang lebih sederhana untuk mode view
 * dengan tombol untuk beralih ke mode edit.
 */
export function ViewHeader({
  pageId,
  moduleId,
  onSwitchToEdit,
}: ViewHeaderProps) {
  const { activePage } = useModulePageCRUDContext()

  // Integrasi dengan Clerk untuk data user
  const { user, isLoaded } = useUser()
  const currentUserId = user?.id || 'anonymous'
  const currentUserName = user?.fullName || user?.username || 'Pengguna'
  const userProfileImage = user?.imageUrl

  // State untuk concurrent editing
  const [activeEditors, setActiveEditors] = useState<
    Array<{
      userId: string
      userName: string
      timestamp: number
      profileImageUrl?: string
    }>
  >([])

  // Ref untuk concurrent editing service
  const concurrentEditingServiceRef = useRef(getConcurrentEditingService())

  // Efek untuk meregister aktivitas pengguna dan memonitor pengguna aktif lainnya
  useEffect(() => {
    if (!pageId || !isLoaded) return

    const concurrentEditingService = concurrentEditingServiceRef.current

    // Register aktivitas pengguna saat ini dengan data dari Clerk
    concurrentEditingService.registerActivity(
      pageId,
      currentUserId,
      currentUserName,
      userProfileImage
    )

    // Set callback untuk perubahan aktivitas
    concurrentEditingService.setActivityChangeCallback(
      (updatedPageId, editors) => {
        if (updatedPageId === pageId) {
          const filteredEditors = editors.filter(
            (e) => e.userId !== currentUserId
          )
          setActiveEditors(filteredEditors)
        }
      }
    )

    // Heartbeat interval untuk update aktivitas
    const heartbeatInterval = setInterval(() => {
      concurrentEditingService.registerActivity(
        pageId,
        currentUserId,
        currentUserName,
        userProfileImage
      )
    }, 30000) // Setiap 30 detik

    // Dapatkan editor aktif saat mount
    const initialEditors = concurrentEditingService.getActiveEditors(pageId)
    setActiveEditors(initialEditors.filter((e) => e.userId !== currentUserId))

    // Cleanup
    return () => {
      clearInterval(heartbeatInterval)
      // Unregister aktivitas saat unmount
      concurrentEditingService.unregisterActivity(pageId, currentUserId)
    }
  }, [pageId, currentUserId, currentUserName, userProfileImage, isLoaded])

  return (
    <div className="border-b sticky top-0 z-10 bg-background">
      <div className="container flex h-14 max-w-screen-2xl items-center">
        <div className="flex-1 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Button
              variant="ghost"
              size="icon"
              className="mr-2"
              aria-label="Menu utama"
            >
              <ChevronDown className="h-4 w-4" aria-hidden="true" />
            </Button>

            <div className="flex items-center space-x-2 flex-1">
              <h1 className="text-lg font-semibold truncate max-w-lg">
                {activePage?.title || 'Untitled Page'}
              </h1>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            {/* User Avatar */}
            {userProfileImage ? (
              <Avatar className="h-8 w-8">
                <div className="relative w-full h-full">
                  <Image
                    src={userProfileImage}
                    alt={currentUserName}
                    fill
                    className="object-cover rounded-full"
                  />
                </div>
              </Avatar>
            ) : (
              <Avatar className="h-8 w-8 bg-[#669df1]">
                <AvatarFallback className="bg-[#669df1] text-white">
                  {currentUserName.slice(0, 2).toUpperCase()}
                </AvatarFallback>
              </Avatar>
            )}

            {/* Comment Button */}
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="ghost" size="icon" aria-label="Komentar">
                    <MessageSquare className="h-4 w-4" aria-hidden="true" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Komentar</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>

            <Separator
              orientation="vertical"
              className="h-6 mx-1 bg-[#3b3b3b]"
            />

            {/* Edit Button */}
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-8 gap-1"
                    onClick={onSwitchToEdit}
                  >
                    <Edit className="h-4 w-4" />
                    <span>Edit</span>
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Edit halaman</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>

            {/* Active Editors Indicator */}
            {activeEditors.length > 0 && (
              <ActiveEditorIndicator editors={activeEditors} />
            )}

            {/* Share Button */}
            <Button
              variant="outline"
              className="border-[#3b3b3b] bg-transparent h-8 gap-1"
            >
              <Share2 className="h-4 w-4" />
              <span>Share</span>
            </Button>

            {/* More Options Button */}
            <Button variant="ghost" size="icon">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
