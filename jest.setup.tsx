import '@testing-library/jest-dom'
import React from 'react'

type MockLinkProps = {
  children: React.ReactNode
  href: string
}

// Perbaikan untuk generic component creator
const createMockComponent = (name: string) => {
  const Component = ({ children, ...props }: any) => (
    <div data-testid={`mock-${name}`} {...props}>
      {children}
    </div>
  )
  Component.displayName = name
  return Component
}

// Mock next/image
jest.mock('next/image', () => ({
  __esModule: true,
  default: ({ src, alt, ...props }: any) => (
    <img src={src} alt={alt} {...props} />
  ),
}))

// Mock next/link
jest.mock('next/link', () => {
  const MockLink: React.FC<MockLinkProps> = ({ children, href }) => {
    return (
      <a href={href} data-testid="mock-link">
        {children}
      </a>
    )
  }
  return { __esModule: true, default: MockLink }
})

// Mock semua komponen UI secara generic
jest.mock('@/components/ui/button', () => ({
  Button: createMockComponent('Button'),
}))

jest.mock('@/components/ui/card', () => ({
  Card: createMockComponent('Card'),
}))

jest.mock('@/components/ui/dropdown-menu', () => ({
  DropdownMenu: createMockComponent('DropdownMenu'),
  DropdownMenuTrigger: createMockComponent('DropdownMenuTrigger'),
  DropdownMenuContent: createMockComponent('DropdownMenuContent'),
  DropdownMenuItem: createMockComponent('DropdownMenuItem'),
}))

// Generic mock untuk semua icons
jest.mock(
  '@heroicons/react/24/outline',
  () =>
    new Proxy(
      {},
      {
        get: (_, iconName) => {
          return function MockIcon(props: any) {
            return (
              <div data-testid={`hero-icon-${String(iconName)}`} {...props} />
            )
          }
        },
      }
    )
)

// Mock next-themes
jest.mock('next-themes', () => ({
  ThemeProvider: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="theme-provider">{children}</div>
  ),
  useTheme: () => ({
    theme: 'light',
    setTheme: jest.fn(),
  }),
}))

// Window matchMedia mock
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: jest.fn().mockImplementation((query) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(),
    removeListener: jest.fn(),
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
})
