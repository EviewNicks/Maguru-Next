import { render, screen } from '@testing-library/react'
import { StatusItem } from './StatusItem'

describe('StatusItem', () => {
  it('renders correctly with label and value', () => {
    render(<StatusItem label="Core Systems" value={75} color="cyan" />)

    // Memverifikasi label ditampilkan dengan benar
    expect(screen.getByText('Core Systems')).toBeInTheDocument()

    // Memverifikasi nilai persentase ditampilkan dengan benar
    expect(screen.getByText('75 %')).toBeInTheDocument()

    // Memverifikasi progress bar ada dalam DOM
    expect(document.querySelector('.bg-gradient-to-r')).toBeInTheDocument()
  })

  it('uses correct gradient class based on color prop', () => {
    const { rerender } = render(
      <StatusItem label="Security" value={85} color="cyan" />
    )

    // Memverifikasi gradient cyan diterapkan
    expect(document.querySelector('.from-cyan-500')).toBeInTheDocument()

    // Rerender dengan color berbeda
    rerender(<StatusItem label="Security" value={85} color="green" />)

    // Memverifikasi gradient green diterapkan
    expect(document.querySelector('.from-green-500')).toBeInTheDocument()

    // Rerender dengan color berbeda
    rerender(<StatusItem label="Network" value={85} color="blue" />)

    // Memverifikasi gradient blue diterapkan
    expect(document.querySelector('.from-blue-500')).toBeInTheDocument()

    // Rerender dengan color berbeda
    rerender(<StatusItem label="Storage" value={85} color="purple" />)

    // Memverifikasi gradient purple diterapkan
    expect(document.querySelector('.from-purple-500')).toBeInTheDocument()
  })

  it('uses default gradient class when invalid color is provided', () => {
    // @ts-expect-error - Menguji behavior saat color tidak valid
    render(<StatusItem label="Test" value={50} color="invalid" />)

    // Memverifikasi default gradient (cyan) diterapkan
    expect(document.querySelector('.from-cyan-500')).toBeInTheDocument()
  })

  it('applies the correct value to the progress bar', () => {
    render(<StatusItem label="Test" value={42} color="cyan" />)

    // Memverifikasi value diterapkan dengan benar ke progress component
    const progressIndicator = document.querySelector(
      '[style*="translateX(-58%)"]'
    )
    expect(progressIndicator).toBeInTheDocument()
  })
})
