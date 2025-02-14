import { render, screen, fireEvent } from '@testing-library/react'
import '@testing-library/jest-dom'
import ModeToggle from '@/components/layouts/Navbar/DarkMode'
import { ThemeProvider } from 'next-themes'

jest.mock('next-themes', () => ({
  useTheme: jest.fn(() => ({ setTheme: jest.fn() })),
}))

describe('DarkMode Component', () => {
  it('renders the toggle button', () => {
    render(
      <ThemeProvider>
        <ModeToggle />
      </ThemeProvider>
    )
    expect(
      screen.getByRole('button', { name: /toggle theme/i })
    ).toBeInTheDocument()
  })

  it('opens the dropdown menu on button click', () => {
    render(
      <ThemeProvider>
        <ModeToggle />
      </ThemeProvider>
    )

    const button = screen.getByRole('button', { name: /toggle theme/i })
    fireEvent.click(button)

    expect(screen.getByText('Light')).toBeInTheDocument()
    expect(screen.getByText('Dark')).toBeInTheDocument()
    expect(screen.getByText('System')).toBeInTheDocument()
  })

  it('calls setTheme when selecting an option', () => {
    const mockSetTheme = jest.fn()
    jest.mock('next-themes', () => ({
      useTheme: () => ({ setTheme: mockSetTheme }),
    }))

    render(
      <ThemeProvider>
        <ModeToggle />
      </ThemeProvider>
    )

    fireEvent.click(screen.getByRole('button', { name: /toggle theme/i }))
    fireEvent.click(screen.getByText('Dark'))

    expect(mockSetTheme).toHaveBeenCalledWith('dark')
  })
})
