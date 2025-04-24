import { describe, expect, it } from '@jest/globals'
import { cn } from './utils'

describe('Utils - cn function', () => {
  it('menggabungkan kelas CSS', () => {
    // Arrange
    const baseClass = 'text-gray-500'
    const conditionalClass = 'font-bold'

    // Act
    const result = cn(baseClass, conditionalClass)

    // Assert
    expect(result).toBe('text-gray-500 font-bold')
  })

  it('menghilangkan kelas yang falsy', () => {
    // Arrange
    const baseClass = 'text-gray-500'
    const conditionalClass = false && 'font-bold'

    // Act
    const result = cn(baseClass, conditionalClass)

    // Assert
    expect(result).toBe('text-gray-500')
  })

  it('menangani kelas yang undefined', () => {
    // Arrange
    const baseClass = 'text-gray-500'
    const conditionalClass = undefined

    // Act
    const result = cn(baseClass, conditionalClass)

    // Assert
    expect(result).toBe('text-gray-500')
  })

  it('menggabungkan beberapa kelas', () => {
    // Arrange
    const classes = [
      'text-gray-500',
      true && 'p-4',
      false && 'mb-2',
      'border',
      undefined,
    ]

    // Act
    const result = cn(...classes)

    // Assert
    expect(result).toBe('text-gray-500 p-4 border')
  })
})
