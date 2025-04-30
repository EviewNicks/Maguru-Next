import { renderHook, act } from '@testing-library/react'
import { useParticleEffect } from './useParticleEffect'
import React from 'react'

// Mock factory untuk membuat instance Particle
class MockParticle {
  update = jest.fn()
  draw = jest.fn()
}

// Mock untuk context canvas
const mockContext = {
  clearRect: jest.fn(),
  fillStyle: '',
  beginPath: jest.fn(),
  arc: jest.fn(),
  fill: jest.fn(),
}

// Mock untuk canvas dan context
const mockCanvas = {
  width: 500,
  height: 300,
  offsetWidth: 500,
  offsetHeight: 300,
  getContext: jest.fn(() => mockContext),
  addEventListener: jest.fn(),
  removeEventListener: jest.fn(),
}

// Setup mock untuk DOM elements
Object.defineProperty(global, 'requestAnimationFrame', {
  value: jest.fn((cb) => cb()),
})

Object.defineProperty(global, 'cancelAnimationFrame', {
  value: jest.fn(),
})

// Spy pada React untuk mengontrol useRef dan useState
jest.spyOn(React, 'useRef').mockImplementation((initialValue: unknown) => ({
  current: initialValue,
}))

// Bypass untuk tipe useState karena tidak penting untuk pengujian
const mockUseState = jest.spyOn(
  React,
  'useState'
) as unknown as jest.SpyInstance
mockUseState.mockImplementation(() => [true, jest.fn()])

describe('useParticleEffect hook', () => {
  beforeEach(() => {
    jest.clearAllMocks()

    // Mock window event handlers
    window.addEventListener = jest.fn()
    window.removeEventListener = jest.fn()

    // Reset mocks untuk requestAnimationFrame dan cancelAnimationFrame
    jest.spyOn(window, 'requestAnimationFrame').mockImplementation((cb) => {
      return window.setTimeout(() => cb(0), 0)
    })
    jest
      .spyOn(window, 'cancelAnimationFrame')
      .mockImplementation(window.clearTimeout)

    // Reset React mock implementations
    jest.spyOn(React, 'useRef').mockImplementation((initialValue: unknown) => ({
      current: initialValue,
    }))

    // Mock particle implementation
    const mockedParticles: MockParticle[] = []
    for (let i = 0; i < 50; i++) {
      mockedParticles.push(new MockParticle())
    }

    // Setup particlesRef mock untuk test yang menggunakan particle array
    jest
      .spyOn(React, 'useRef')
      .mockImplementationOnce(() => ({ current: mockCanvas })) // canvasRef
      .mockImplementationOnce(() => ({ current: null })) // animationFrameId
      .mockImplementationOnce(() => ({ current: mockedParticles })) // particlesRef

    // Mock useState to return initialized = true
    mockUseState.mockImplementation(() => [true, jest.fn()])

    // Memastikan context.clearRect terpanggil saat animasi
    mockContext.clearRect.mockClear()
  })

  afterEach(() => {
    // Restore original implementations
    jest.restoreAllMocks()
  })

  it('mengembalikan referensi canvas', () => {
    // Reset mocks untuk mendapatkan default behavior pada useRef
    jest.spyOn(React, 'useRef').mockRestore()

    // Render hook
    const { result } = renderHook(() => useParticleEffect())

    // Verifikasi bahwa hook mengembalikan ref
    expect(result.current).toBeDefined()
    expect(typeof result.current).toBe('object')
  })

  it('menginisialisasi canvas dengan benar saat hook dipanggil', () => {
    // Render hook
    renderHook(() => useParticleEffect())

    // Verifikasi context diambil dan canvas diukur
    expect(mockCanvas.getContext).toHaveBeenCalledWith('2d')

    // Verifikasi ukuran canvas diatur
    expect(mockCanvas.width).toBe(mockCanvas.offsetWidth)
    expect(mockCanvas.height).toBe(mockCanvas.offsetHeight)
  })

  it('menjalankan animasi partikel saat komponen di-mount', () => {
    // Spy pada requestAnimationFrame
    const requestAnimationFrameSpy = jest.spyOn(window, 'requestAnimationFrame')

    // Reset clearRect untuk tracking pangilan yang benar
    mockContext.clearRect.mockClear()

    // Render hook
    renderHook(() => useParticleEffect())

    // Verifikasi animasi dimulai
    expect(requestAnimationFrameSpy).toHaveBeenCalled()

    // Verifikasi context.clearRect dipanggil, berarti animasi aktif
    expect(mockContext.clearRect).toHaveBeenCalled()
  })

  it('membersihkan animasi saat hook di-unmount', () => {
    // Spy pada cancelAnimationFrame
    const cancelAnimationFrameSpy = jest.spyOn(window, 'cancelAnimationFrame')

    // Render hook dan langsung unmount
    const { unmount } = renderHook(() => useParticleEffect())

    // Panggil fungsi cleanup
    unmount()

    // Verifikasi event listener dihapus dan animasi dibersihkan
    expect(window.removeEventListener).toHaveBeenCalledWith(
      'resize',
      expect.any(Function)
    )
    expect(cancelAnimationFrameSpy).toHaveBeenCalled()
  })

  it('mengatur ulang ukuran canvas saat jendela di-resize', () => {
    // Mock window.addEventListener untuk mendapatkan callback
    let resizeCallback: (() => void) | undefined
    window.addEventListener = jest.fn((event, callback) => {
      if (event === 'resize') {
        resizeCallback = callback as () => void
      }
    })

    // Render hook
    renderHook(() => useParticleEffect())

    // Ubah ukuran canvas mock
    mockCanvas.offsetWidth = 800
    mockCanvas.offsetHeight = 600

    // Memastikan resizeCallback sudah dibuat sebelum dipanggil
    expect(resizeCallback).toBeDefined()

    // Panggil callback resize - menggunakan non-null assertion karena sudah diverifikasi di atas
    act(() => {
      ;(resizeCallback as () => void)()
    })

    // Verifikasi ukuran canvas diperbarui
    expect(mockCanvas.width).toBe(800)
    expect(mockCanvas.height).toBe(600)
  })
})
