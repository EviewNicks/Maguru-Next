import { currentUser } from '@clerk/nextjs/server'
import { UserCircleIcon } from '@heroicons/react/24/outline'
import Image from 'next/image'

async function UserIcon() {
  try {
    const user = await currentUser()
    const profileImage = user?.imageUrl

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
  } catch (error) {
    console.error('Error fetching user:', error)
  }

  // Return fallback icon for any error case or when no profile image
  return (
    <UserCircleIcon className="w-6 h-6 bg-primary rounded-full text-white" />
  )
}

export default UserIcon
