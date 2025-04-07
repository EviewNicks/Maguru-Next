import { render, screen } from '@testing-library/react'
import WelcomeHero from './WelcomeHero'
import '@testing-library/jest-dom'

describe('WelcomeHero Component', () => {
  it('renders welcome message with username when provided', () => {
    render(<WelcomeHero userName="John Doe" />)

    expect(screen.getByText('Selamat Datang, John Doe!')).toBeInTheDocument()
    expect(
      screen.getByText(/Platform pembelajaran interaktif/)
    ).toBeInTheDocument()
  })

  it('renders generic welcome message when username is not provided', () => {
    render(<WelcomeHero />)

    expect(
      screen.getByText('Selamat Datang di Dashboard Mahasiswa')
    ).toBeInTheDocument()
  })

  it('renders all feature cards', () => {
    render(<WelcomeHero />)

    expect(screen.getByText('Modul Pembelajaran')).toBeInTheDocument()
    expect(screen.getByText('Quiz Interaktif')).toBeInTheDocument()
    expect(screen.getByText('Profil & Progres')).toBeInTheDocument()
  })

  it('contains action buttons with correct links', () => {
    render(<WelcomeHero />)

    const startLearningButton = screen.getByText('Mulai Belajar')
    const viewProfileButton = screen.getByText('Lihat Profil')

    expect(startLearningButton.closest('a')).toHaveAttribute('href', '/module')
    expect(viewProfileButton.closest('a')).toHaveAttribute('href', '/profile')
  })
})
