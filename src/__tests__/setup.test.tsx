import { render, screen } from '@testing-library/react'
import '@testing-library/jest-dom'

describe('Setup Test', () => {
  it('should render component correctly', () => {
    render(<div data-testid="test">Hello Test</div>)
    expect(screen.getByTestId('test')).toHaveTextContent('Hello Test')
  })

  it('should handle basic assertions', () => {
    expect(1 + 1).toBe(2)
    expect(true).toBeTruthy()
    expect(false).toBeFalsy()
  })

  it('should handle async operations', async () => {
    const result = await Promise.resolve('test')
    expect(result).toBe('test')
  })
})
