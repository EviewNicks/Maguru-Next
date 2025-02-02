import { currentUser } from '@clerk/nextjs/server'
import { UserCircleIcon } from '@heroicons/react/24/outline'
import Image from 'next/image'
async function UserIcon() {
  // const {userid} = auth() mengambil sesuatu berdasarkan userId,
  // kita bisa menggunakan fungsi auth

  const user = await currentUser()
  const profileImage = user?.imageUrl
  if (profileImage)
    return (
      <Image
        alt="User Profile"
        src={profileImage}
        width={20}
        height={20}
        className="w-5 h-5 rounded-full object-cover"
      />
    )
  return (
    <UserCircleIcon className="w-6 h-6 bg-primary rounded-full text-white" />
  )
}
export default UserIcon
