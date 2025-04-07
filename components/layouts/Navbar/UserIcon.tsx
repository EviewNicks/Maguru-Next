'use client'

import { useUser } from '@clerk/nextjs'
import { UserCircleIcon } from '@heroicons/react/24/outline'
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
        width={20}
        height={20}
        className="w-5 h-5 rounded-full object-cover"
      />
    )
  }

  // Return fallback icon when no profile image
  return (
    <UserCircleIcon className="w-6 h-6 bg-primary rounded-full text-white" />
  )
}

export default UserIcon
