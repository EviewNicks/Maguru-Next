type DropdownLink = {
  label: string
  href?: string
  shortcut?: string
  disabled?: boolean
  icon?: string // Nama icon (opsional)
  onClick?: () => void // Handler function (opsional)
}

type DropdownGroup = {
  links: DropdownLink[]
  separator?: boolean // Apakah perlu separator setelah kelompok ini?
}

export const dropdownLinks: DropdownGroup[] = [
  {
    links: [
      { label: 'Profile', href: '/profile', shortcut: '⇧⌘P' },
      { label: 'courses', href: '/courses', shortcut: '⌘B' },
      { label: 'Settings', href: '/settings', shortcut: '⌘S' },
      { label: 'Keyboard shortcuts', href: '/shortcuts', shortcut: '⌘K' },
    ],
    separator: true,
  },
  {
    links: [
      { label: 'team', href: '/team' },
      { label: 'Invite users', href: '/invite' },
      { label: 'New Team', href: '/team/new', shortcut: '⌘+T' },
    ],
    separator: true,
  },
  {
    links: [
      { label: 'GitHub', href: 'https://github.com' },
      { label: 'Support', href: '/support' },
      { label: 'API', href: '/api', disabled: true },
    ],
    separator: true,
  },
  {
    links: [{ label: 'Log out', onClick: () => console.log('Logging out...') }],
  },
]
