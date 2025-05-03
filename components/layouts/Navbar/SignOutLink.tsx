'use client'
import { useToast } from '@/hooks/use-toast'
import { SignOutButton } from '@clerk/nextjs'
import Link from 'next/link'
import { LogOut } from 'lucide-react'

function SignOutLink() {
  const { toast } = useToast()
  const handleLogout = () => {
    toast({ description: 'Logging Out...' })
  }
  return (
    <SignOutButton>
      <Link
        href="#"
        className="w-full text-left flex items-center gap-2 text-destructive"
        onClick={handleLogout}
      >
        <LogOut className="size-4" />
        <span>Keluar</span>
      </Link>
    </SignOutButton>
  )
}
export default SignOutLink
