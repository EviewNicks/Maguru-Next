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
import { BarsArrowUpIcon } from '@heroicons/react/24/outline'
import { SignedIn, SignedOut, SignInButton, SignUpButton } from '@clerk/nextjs'
import SignOutLink from './SignOutLink'
import UserIcon from './UserIcon'

export function LinksDropdown() {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" className="flex gap-4 max-w-[100px]">
          <BarsArrowUpIcon className="w-6 h-6" />
          <UserIcon />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <SignedOut>
          <DropdownMenuItem>
            <SignInButton>
              <button className="w-full text-center">Login</button>
            </SignInButton>
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem>
            <SignUpButton>
              <button className="w-full text-center">register</button>
            </SignUpButton>
          </DropdownMenuItem>
        </SignedOut>

        {/* Signin Button untuk User yang sudah login */}
        <SignedIn>
          <DropdownMenuLabel>
            <h6 className="text-center font-inter text-lg">My Account</h6>
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          {dropdownLinks.map((group, index) => (
            <div key={index}>
              <DropdownMenuGroup>
                {group.links.map((link) => (
                  <DropdownMenuItem
                    key={link.label}
                    disabled={link.disabled}
                    // onClick={link.onClick} // Tambahkan handler function
                  >
                    {link.href ? (
                      <Link href={link.href} className="w-full">
                        {link.label}
                      </Link>
                    ) : (
                      <span className="w-full">{link.label}</span>
                    )}
                    {link.shortcut && (
                      <DropdownMenuShortcut>
                        {link.shortcut}
                      </DropdownMenuShortcut>
                    )}
                  </DropdownMenuItem>
                  // </Link>
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
