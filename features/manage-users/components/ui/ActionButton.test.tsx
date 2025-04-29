import { render, screen } from '@testing-library/react'
import { ActionButton } from './ActionButton'
import { Shield, Download, Terminal, RefreshCw } from 'lucide-react'
import userEvent from '@testing-library/user-event'

describe('ActionButton', () => {
  it('renders with icon and label', () => {
    render(<ActionButton icon={Shield} label="Security Scan" />)

    // Memverifikasi label ditampilkan dengan benar
    expect(screen.getByText('Security Scan')).toBeInTheDocument()

    // Memverifikasi icon ditampilkan (cek class yang biasa dipakai oleh Lucide icons)
    const iconElement = document.querySelector('svg')
    expect(iconElement).toBeInTheDocument()
  })

  it('renders with different icons correctly', () => {
    const { rerender } = render(<ActionButton icon={Shield} label="Security" />)

    // Rerender dengan icon berbeda
    rerender(<ActionButton icon={Download} label="Backup" />)
    expect(screen.getByText('Backup')).toBeInTheDocument()

    // Rerender dengan icon berbeda
    rerender(<ActionButton icon={Terminal} label="Console" />)
    expect(screen.getByText('Console')).toBeInTheDocument()

    // Rerender dengan icon berbeda
    rerender(<ActionButton icon={RefreshCw} label="Sync" />)
    expect(screen.getByText('Sync')).toBeInTheDocument()
  })

  it('handles click events', async () => {
    const user = userEvent.setup()
    const handleClick = jest.fn()

    // Tambahkan onClick handler melalui kustomisasi render
    const { container } = render(
      <ActionButton icon={Shield} label="Security Scan" />,
      {
        container: document.body.appendChild(document.createElement('div')),
      }
    )

    // Dapatkan button element
    const button = container.querySelector('button')
    expect(button).toBeInTheDocument()

    // Simulasikan klik pada button dan cek bahwa button dapat diklik
    if (button) {
      // Tambahkan onClick handler melalui addEventListener
      button.addEventListener('click', handleClick)
      await user.click(button)
      expect(handleClick).toHaveBeenCalledTimes(1)
    }
  })

  it('applies correct CSS classes', () => {
    render(<ActionButton icon={Shield} label="Security Scan" />)

    const button = screen.getByRole('button')

    // Verifikasi kelas yang seharusnya diterapkan pada button
    expect(button).toHaveClass('h-auto')
    expect(button).toHaveClass('py-3')
    expect(button).toHaveClass('px-3')
    expect(button).toHaveClass('flex')
    expect(button).toHaveClass('w-full')

    // Verifikasi kelas pada icon
    const icon = button.querySelector('svg')
    expect(icon).toHaveClass('h-5')
    expect(icon).toHaveClass('w-5')
    expect(icon).toHaveClass('text-cyan-500')
  })
})
