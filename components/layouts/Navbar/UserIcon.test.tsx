import { render, screen } from '@testing-library/react'
import '@testing-library/jest-dom'
import UserIcon from '@/components/layouts/Navbar/UserIcon'

// Mock next/image
jest.mock('next/image', () => ({
  __esModule: true,
  default: ({ src, alt, className }: any) => (
    <img src={src} alt={alt} className={className} data-testid="next-image" />
  ),
}))

// Mock heroicons
jest.mock('@heroicons/react/24/outline', () => ({
  UserCircleIcon: ({ className }: { className: string }) => (
    <div data-testid="hero-icon-UserCircleIcon" className={className} />
  ),
}))

// Mock console.error to prevent error logs in test output
const originalConsoleError = console.error
beforeAll(() => {
  console.error = jest.fn()
})

afterAll(() => {
  console.error = originalConsoleError
})

// Mock currentUser dari @clerk/nextjs/server
jest.mock('@clerk/nextjs/server', () => ({
  currentUser: jest.fn(),
}))

// Import currentUser setelah di-mock untuk bisa dimanipulasi dalam test
import { currentUser } from '@clerk/nextjs/server'

describe('UserIcon Component', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('renders profile image when user has imageUrl', async () => {
    // Setup mock untuk user dengan image
    const mockUser = {
      imageUrl: 'https://example.com/profile.jpg',
    }
    ;(currentUser as jest.Mock).mockResolvedValue(mockUser)

    // Render komponen
    render(await UserIcon())

    // Cek apakah Image ditampilkan dengan benar
    const image = screen.getByTestId('next-image')
    expect(image).toBeInTheDocument()
    expect(image).toHaveAttribute('src', mockUser.imageUrl)
    expect(image).toHaveAttribute('alt', 'User Profile')
    expect(image).toHaveClass('w-5 h-5 rounded-full object-cover')
  })

  it('renders UserCircleIcon when user has no imageUrl', async () => {
    // Setup mock untuk user tanpa image
    ;(currentUser as jest.Mock).mockResolvedValue(null)

    // Render komponen
    render(await UserIcon())

    // Cek apakah fallback icon ditampilkan
    const fallbackIcon = screen.getByTestId('hero-icon-UserCircleIcon')
    expect(fallbackIcon).toBeInTheDocument()
    expect(fallbackIcon).toHaveClass(
      'w-6 h-6 bg-primary rounded-full text-white'
    )
  })

  it('renders UserCircleIcon when imageUrl is undefined', async () => {
    // Setup mock untuk user dengan imageUrl undefined
    const mockUser = {
      imageUrl: undefined,
    }
    ;(currentUser as jest.Mock).mockResolvedValue(mockUser)

    // Render komponen
    render(await UserIcon())

    // Cek apakah fallback icon ditampilkan
    const fallbackIcon = screen.getByTestId('hero-icon-UserCircleIcon')
    expect(fallbackIcon).toBeInTheDocument()
    expect(fallbackIcon).toHaveClass(
      'w-6 h-6 bg-primary rounded-full text-white'
    )
  })

  it('handles error when currentUser fails', async () => {
    // Setup mock untuk simulasi error
    const mockError = new Error('Failed to fetch user')
    ;(currentUser as jest.Mock).mockRejectedValue(mockError)

    // Render komponen
    const component = await UserIcon()
    render(component)

    // Verifikasi bahwa error di-log
    expect(console.error).toHaveBeenCalledWith(
      'Error fetching user:',
      mockError
    )

    // Cek apakah fallback icon ditampilkan
    const fallbackIcon = screen.getByTestId('hero-icon-UserCircleIcon')
    expect(fallbackIcon).toBeInTheDocument()
    expect(fallbackIcon).toHaveClass(
      'w-6 h-6 bg-primary rounded-full text-white'
    )
  })
})
