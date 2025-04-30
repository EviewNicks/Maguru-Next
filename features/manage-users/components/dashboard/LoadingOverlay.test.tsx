import { render, screen } from '@testing-library/react'
import { LoadingOverlay } from './LoadingOverlay'

describe('LoadingOverlay', () => {
  it('renders loading overlay when isLoading is true', () => {
    render(<LoadingOverlay isLoading={true} />)

    // Verifikasi teks loading ditampilkan
    expect(screen.getByText('SYSTEM INITIALIZING')).toBeInTheDocument()

    // Verifikasi container overlay ditampilkan dengan class yang benar
    // Dapatkan langsung div utama dengan class absolute
    const overlay = screen.getByTestId('loading-overlay')
    expect(overlay).toHaveClass('absolute')
    expect(overlay).toHaveClass('inset-0')
    expect(overlay).toHaveClass('bg-black/80')
    expect(overlay).toHaveClass('z-50')

    // Verifikasi elemen animasi ditampilkan
    const animationElements = document.querySelectorAll(
      '[class*="rounded-full"]'
    )
    expect(animationElements.length).toBe(5)

    // Verifikasi animasi memiliki class yang benar
    expect(
      document.querySelector('[class*="animate-ping"]')
    ).toBeInTheDocument()
    expect(
      document.querySelector('[class*="animate-spin"]')
    ).toBeInTheDocument()
    expect(
      document.querySelector('[class*="animate-spin-slow"]')
    ).toBeInTheDocument()
    expect(
      document.querySelector('[class*="animate-spin-slower"]')
    ).toBeInTheDocument()
  })

  it('renders nothing when isLoading is false', () => {
    const { container } = render(<LoadingOverlay isLoading={false} />)

    // Verifikasi tidak ada elemen yang ditampilkan
    expect(container.firstChild).toBeNull()

    // Verifikasi teks loading tidak ada di dokumen
    expect(screen.queryByText('SYSTEM INITIALIZING')).not.toBeInTheDocument()
  })

  it('applies correct styling to loading text', () => {
    render(<LoadingOverlay isLoading={true} />)

    // Dapatkan elemen text
    const textElement = screen.getByText('SYSTEM INITIALIZING')

    // Verifikasi styling
    expect(textElement).toHaveClass('text-cyan-500')
    expect(textElement).toHaveClass('font-mono')
    expect(textElement).toHaveClass('text-sm')
    expect(textElement).toHaveClass('tracking-wider')
  })

  it('applies animation classes to spinner elements', () => {
    render(<LoadingOverlay isLoading={true} />)

    // Verifikasi class animasi pada elemen border
    const borders = document.querySelectorAll('[class*="border-4"]')

    // Seharusnya ada 5 elemen dengan border-4
    expect(borders.length).toBe(5)

    // Verifikasi warna border - gunakan metode getAttribute untuk memeriksa class
    // daripada querySelector dengan selector yang tidak valid
    const spinnerElements = Array.from(
      document.querySelectorAll('[class*="border-4"]')
    )

    // Buat fungsi helper untuk memeriksa apakah elemen memiliki class tertentu
    const hasClass = (element: Element, className: string) =>
      element.className.split(' ').some((cls) => cls.includes(className))

    // Verifikasi bahwa setidaknya satu elemen memiliki class yang sesuai
    expect(
      spinnerElements.some((el) => hasClass(el, 'border-cyan-500'))
    ).toBeTruthy()
    expect(
      spinnerElements.some((el) => hasClass(el, 'border-t-cyan-500'))
    ).toBeTruthy()
    expect(
      spinnerElements.some((el) => hasClass(el, 'border-r-purple-500'))
    ).toBeTruthy()
    expect(
      spinnerElements.some((el) => hasClass(el, 'border-b-blue-500'))
    ).toBeTruthy()
    expect(
      spinnerElements.some((el) => hasClass(el, 'border-l-green-500'))
    ).toBeTruthy()
  })
})
