import '@testing-library/jest-dom'
import React from 'react'

// Mock next/image
jest.mock('next/image', () => ({
  __esModule: true,
  default: (props: {
    src: string | { src: string }
    alt: string
    [key: string]: any
  }) => {
    const finalSrc = typeof props.src === 'object' ? props.src.src : props.src
    return React.createElement('img', {
      ...props,
      src: finalSrc,
      alt: props.alt,
    })
  },
}))

// Mock next/link
jest.mock('next/link', () => ({
  __esModule: true,
  default: ({
    children,
    href,
  }: {
    children: React.ReactNode
    href: string
  }) => {
    return React.createElement('a', { href }, children)
  },
}))

// Add window.matchMedia mock
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
