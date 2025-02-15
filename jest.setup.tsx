import '@testing-library/jest-dom'

// type MockImageProps = {
//   src: string | { src: string }
//   alt: string
//   [key: string]: any
// }

type MockLinkProps = {
  children: React.ReactNode
  href: string
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
