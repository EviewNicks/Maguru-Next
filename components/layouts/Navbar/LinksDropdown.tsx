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

export function LinksDropdown() {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" className="flex gap-4 max-w-[100px]">
          <BarsArrowUpIcon className="w-6 h-6" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56" align="end">
        <DropdownMenuLabel>My Account</DropdownMenuLabel>
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
                    <DropdownMenuShortcut>{link.shortcut}</DropdownMenuShortcut>
                  )}
                </DropdownMenuItem>
                // </Link>
              ))}
            </DropdownMenuGroup>
            {group.separator && <DropdownMenuSeparator />}
          </div>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
