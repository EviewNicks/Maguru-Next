'use client'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import Link from 'next/link'
import { dropdownLinks } from '@/config/links'
import { ChevronDown } from 'lucide-react'
import {
  SignedIn,
  SignedOut,
  SignInButton,
  SignUpButton,
  useUser,
} from '@clerk/nextjs'
import SignOutLink from './SignOutLink'
import UserIcon from './UserIcon'
import { useEffect, useState } from 'react'

// Wrapper untuk menjalankan useLayoutEffect hanya di browser
const useClientOnlyEffect = typeof window !== 'undefined' ? useEffect : () => {}

export function LinksDropdown() {
  const { user, isLoaded } = useUser()
  const [userRole, setUserRole] = useState<string>('')

  // Gunakan useClientOnlyEffect untuk menghindari warning server-side
  useClientOnlyEffect(() => {
    if (isLoaded && user) {
      // Mengambil role dari metadata pengguna dengan type assertion yang lebih tepat
      const role = (user.publicMetadata?.role as string) || 'mahasiswa'
      setUserRole(role)
    }
  }, [isLoaded, user])

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          className="rounded-full flex items-center gap-2"
        >
          <UserIcon />
          <ChevronDown className="size-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="min-w-48">
        <SignedOut>
          <DropdownMenuItem>
            <SignInButton mode="modal">
              <button className="w-full text-left">Masuk</button>
            </SignInButton>
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem>
            <SignUpButton mode="modal">
              <button className="w-full text-left">Daftar</button>
            </SignUpButton>
          </DropdownMenuItem>
        </SignedOut>

        {/* Signin Button untuk User yang sudah login */}
        <SignedIn>
          <DropdownMenuLabel>
            <h6 className="text-center font-inter text-base">Akun Saya</h6>
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          {dropdownLinks.map((group, index) => (
            <div key={index}>
              <DropdownMenuGroup>
                {group.links
                  // Filter link berdasarkan role jika roleRequired ada
                  .filter(
                    (link) =>
                      !link.roleRequired || link.roleRequired === userRole
                  )
                  .map((link) => (
                    <DropdownMenuItem
                      key={link.label}
                      disabled={link.disabled}
                      asChild={link.href ? true : false}
                    >
                      {link.href ? (
                        <Link
                          href={link.href}
                          className="w-full flex justify-between items-center"
                        >
                          <span>{link.label}</span>
                          {link.shortcut && (
                            <DropdownMenuShortcut>
                              {link.shortcut}
                            </DropdownMenuShortcut>
                          )}
                        </Link>
                      ) : (
                        <div className="w-full flex justify-between items-center">
                          <span>{link.label}</span>
                          {link.shortcut && (
                            <DropdownMenuShortcut>
                              {link.shortcut}
                            </DropdownMenuShortcut>
                          )}
                        </div>
                      )}
                    </DropdownMenuItem>
                  ))}
              </DropdownMenuGroup>
              {group.separator && <DropdownMenuSeparator />}
            </div>
          ))}
          <DropdownMenuItem>
            <SignOutLink />
          </DropdownMenuItem>
        </SignedIn>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
