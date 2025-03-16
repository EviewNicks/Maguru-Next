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
      { label: 'Dashboard', href: '/stats', shortcut: '⌘S' },
      { label: 'Profile', href: '/profile', shortcut: '⇧⌘P' },
      { label: 'Kursus', href: '/courses', shortcut: '⌘K' },
      { label: 'Keyboard shortcuts', href: '/shortcuts', shortcut: '⌘S' },
    ],
    separator: true,
  },
  {
    links: [
      { label: 'Tim', href: '/team' },
      { label: 'Undang Pengguna', href: '/invite' },
      { label: 'Tim Baru', href: '/team/new', shortcut: '⌘+T' },
    ],
    separator: true,
  },
  {
    links: [
      { label: 'GitHub', href: 'https://github.com' },
      { label: 'Bantuan', href: '/support' },
      { label: 'API', href: '/api', disabled: true },
    ],
    separator: true,
  },
]
