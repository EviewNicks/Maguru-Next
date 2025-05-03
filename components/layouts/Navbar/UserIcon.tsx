'use client'

import { useUser } from '@clerk/nextjs'
import { User } from 'lucide-react'
import Image from 'next/image'
import { useEffect, useState } from 'react'

function UserIcon() {
  const { user, isLoaded } = useUser()
  const [profileImage, setProfileImage] = useState<string | null>(null)

  useEffect(() => {
    if (isLoaded && user) {
      setProfileImage(user.imageUrl)
    }
  }, [isLoaded, user])

  if (profileImage) {
    return (
      <Image
        alt="User Profile"
        src={profileImage}
        width={24}
        height={24}
        className="size-6 rounded-full object-cover"
      />
    )
  }

  // Return fallback icon when no profile image
  return (
    <div className="size-6 rounded-full bg-primary/10 flex items-center justify-center">
      <User className="size-4 text-primary" />
    </div>
  )
}

export default UserIcon
