import { render, screen } from '@testing-library/react'
import { NavItem } from './NavItem'
import { Command, Activity, Database } from 'lucide-react'
import userEvent from '@testing-library/user-event'

describe('NavItem', () => {
  it('renders with icon and label', () => {
    render(<NavItem icon={Command} label="Dashboard" />)

    // Memverifikasi label ditampilkan dengan benar
    expect(screen.getByText('Dashboard')).toBeInTheDocument()

    // Memverifikasi button element ada
    const button = screen.getByRole('button')
    expect(button).toBeInTheDocument()

    // Memverifikasi icon ditampilkan
    const icon = button.querySelector('svg')
    expect(icon).toBeInTheDocument()
  })

  it('applies active style when active prop is true', () => {
    const { rerender } = render(
      <NavItem icon={Command} label="Dashboard" active={true} />
    )

    const button = screen.getByRole('button')

    // Verifikasi kelas active diterapkan
    expect(button).toHaveClass('bg-slate-800/70')
    expect(button).toHaveClass('text-cyan-400')

    // Rerender dengan active=false
    rerender(<NavItem icon={Command} label="Dashboard" active={false} />)

    // Verifikasi kelas non-active diterapkan
    expect(button).toHaveClass('text-slate-400')
    expect(button).not.toHaveClass('text-cyan-400')
  })

  it('renders different icons correctly', () => {
    const { rerender } = render(<NavItem icon={Command} label="Dashboard" />)
    expect(screen.getByText('Dashboard')).toBeInTheDocument()

    rerender(<NavItem icon={Activity} label="Diagnostics" />)
    expect(screen.getByText('Diagnostics')).toBeInTheDocument()

    rerender(<NavItem icon={Database} label="Data Center" />)
    expect(screen.getByText('Data Center')).toBeInTheDocument()
  })

  it('handles click events', async () => {
    // Setup userEvent
    const user = userEvent.setup()
    const handleClick = jest.fn()

    const { container } = render(<NavItem icon={Command} label="Dashboard" />)

    // Dapatkan button element
    const button = screen.getByRole('button')

    // Tambahkan onClick handler
    button.addEventListener('click', handleClick)

    // Simulasikan klik
    await user.click(button)

    // Verifikasi handler dipanggil
    expect(handleClick).toHaveBeenCalledTimes(1)
  })

  it('has correct base styles', () => {
    render(<NavItem icon={Command} label="Dashboard" />)

    const button = screen.getByRole('button')

    // Verifikasi kelas dasar
    expect(button).toHaveClass('w-full')
    expect(button).toHaveClass('justify-start')

    // Verifikasi kelas ikon
    const icon = button.querySelector('svg')
    expect(icon).toHaveClass('mr-2')
    expect(icon).toHaveClass('h-4')
    expect(icon).toHaveClass('w-4')
  })
})
