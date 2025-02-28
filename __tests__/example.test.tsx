import { render, screen } from '@testing-library/react'
import '@testing-library/jest-dom'

interface TestComponentProps {
  text: string
}

const TestComponent: React.FC<TestComponentProps> = ({ text }) => {
  return <div data-testid="test-element">{text}</div>
}

describe('Example Test', () => {
  it('should pass basic test', () => {
    expect(true).toBe(true)
  })

  it('should render component with props correctly', () => {
    const testText = 'Test Content'
    render(<TestComponent text={testText} />)

    const element = screen.getByTestId('test-element')
    expect(element).toBeInTheDocument()
    expect(element).toHaveTextContent(testText)
  })

  it('should handle empty text', () => {
    render(<TestComponent text="" />)

    const element = screen.getByTestId('test-element')
    expect(element).toBeInTheDocument()
    expect(element).toHaveTextContent('')
  })
})
