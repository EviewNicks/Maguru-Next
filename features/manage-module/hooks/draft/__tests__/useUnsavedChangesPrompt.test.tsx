import { renderHook, act } from '@testing-library/react-hooks'
import { useUnsavedChangesPrompt } from '../useUnsavedChangesPrompt'
import { useRouter } from 'next/navigation'

// Mock Next.js router
jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
}))

describe('useUnsavedChangesPrompt', () => {
  const mockRouter = {
    push: jest.fn(),
    back: jest.fn(),
  }

  const mockEvent = {
    preventDefault: jest.fn(),
    target: {
      closest: jest.fn(),
    },
  }

  const mockLink = {
    getAttribute: jest.fn(),
  }

  beforeEach(() => {
    jest.clearAllMocks()

    // Setup router mock
    ;(useRouter as jest.Mock).mockReturnValue(mockRouter)

    // Setup event mocks
    mockEvent.preventDefault.mockClear()
    mockEvent.target.closest.mockReset()
    mockLink.getAttribute.mockReset()

    // Setup document event listeners
    document.addEventListener = jest.fn()
    document.removeEventListener = jest.fn()

    // Setup window event listeners
    window.addEventListener = jest.fn()
    window.removeEventListener = jest.fn()

    // Setup sessionStorage
    Object.defineProperty(window, 'sessionStorage', {
      value: {
        setItem: jest.fn(),
      },
      writable: true,
    })
  })

  it('should initialize with default values', () => {
    const { result } = renderHook(() =>
      useUnsavedChangesPrompt({
        hasUnsavedChanges: false,
      })
    )

    expect(result.current.showDialog).toBe(false)
  })

  it('should add beforeunload event listener when hasUnsavedChanges is true', () => {
    renderHook(() =>
      useUnsavedChangesPrompt({
        hasUnsavedChanges: true,
      })
    )

    expect(window.addEventListener).toHaveBeenCalledWith(
      'beforeunload',
      expect.any(Function)
    )
  })

  it('should not add beforeunload event listener when hasUnsavedChanges is false', () => {
    renderHook(() =>
      useUnsavedChangesPrompt({
        hasUnsavedChanges: false,
      })
    )

    expect(window.addEventListener).not.toHaveBeenCalledWith(
      'beforeunload',
      expect.any(Function)
    )
  })

  it('should remove beforeunload event listener on unmount', () => {
    const { unmount } = renderHook(() =>
      useUnsavedChangesPrompt({
        hasUnsavedChanges: true,
      })
    )

    unmount()

    expect(window.removeEventListener).toHaveBeenCalledWith(
      'beforeunload',
      expect.any(Function)
    )
  })

  it('should add click event listener when hasUnsavedChanges is true', () => {
    renderHook(() =>
      useUnsavedChangesPrompt({
        hasUnsavedChanges: true,
      })
    )

    expect(document.addEventListener).toHaveBeenCalledWith(
      'click',
      expect.any(Function),
      { capture: true }
    )
  })

  it('should not add click event listener when hasUnsavedChanges is false', () => {
    renderHook(() =>
      useUnsavedChangesPrompt({
        hasUnsavedChanges: false,
      })
    )

    expect(document.addEventListener).not.toHaveBeenCalledWith(
      'click',
      expect.any(Function),
      { capture: true }
    )
  })

  it('should remove click event listener on unmount', () => {
    const { unmount } = renderHook(() =>
      useUnsavedChangesPrompt({
        hasUnsavedChanges: true,
      })
    )

    unmount()

    expect(document.removeEventListener).toHaveBeenCalledWith(
      'click',
      expect.any(Function),
      { capture: true }
    )
  })

  it('should show dialog when routerWithConfirm.push is called', () => {
    const { result } = renderHook(() =>
      useUnsavedChangesPrompt({
        hasUnsavedChanges: true,
      })
    )

    act(() => {
      result.current.routerWithConfirm.push('/test')
    })

    expect(result.current.showDialog).toBe(true)
    expect(mockRouter.push).not.toHaveBeenCalled() // Should not navigate immediately
  })

  it('should navigate directly when hasUnsavedChanges is false', () => {
    const { result } = renderHook(() =>
      useUnsavedChangesPrompt({
        hasUnsavedChanges: false,
      })
    )

    act(() => {
      result.current.routerWithConfirm.push('/test')
    })

    expect(result.current.showDialog).toBe(false)
    expect(mockRouter.push).toHaveBeenCalledWith('/test')
  })

  it('should navigate directly when preventNavigation is false', () => {
    const { result } = renderHook(() =>
      useUnsavedChangesPrompt({
        hasUnsavedChanges: true,
        preventNavigation: false,
      })
    )

    act(() => {
      result.current.routerWithConfirm.push('/test')
    })

    expect(result.current.showDialog).toBe(false)
    expect(mockRouter.push).toHaveBeenCalledWith('/test')
  })

  it('should show dialog when routerWithConfirm.back is called', () => {
    const { result } = renderHook(() =>
      useUnsavedChangesPrompt({
        hasUnsavedChanges: true,
      })
    )

    act(() => {
      result.current.routerWithConfirm.back()
    })

    expect(result.current.showDialog).toBe(true)
    expect(mockRouter.back).not.toHaveBeenCalled() // Should not navigate immediately
  })

  it('should navigate back directly when hasUnsavedChanges is false', () => {
    const { result } = renderHook(() =>
      useUnsavedChangesPrompt({
        hasUnsavedChanges: false,
      })
    )

    act(() => {
      result.current.routerWithConfirm.back()
    })

    expect(result.current.showDialog).toBe(false)
    expect(mockRouter.back).toHaveBeenCalled()
  })

  it('should call onConfirmNavigation and navigate when handleConfirm is called', async () => {
    const mockOnConfirmNavigation = jest.fn().mockResolvedValue(undefined)

    const { result } = renderHook(() =>
      useUnsavedChangesPrompt({
        hasUnsavedChanges: true,
        onConfirmNavigation: mockOnConfirmNavigation,
      })
    )

    // Set pendingUrl and showDialog manually for testing
    act(() => {
      result.current.showDialog = true
      result.current.pendingUrl = '/test'
    })

    // Call handleConfirm
    await act(async () => {
      await result.current.handleConfirm()
    })

    // Verify onConfirmNavigation was called
    expect(mockOnConfirmNavigation).toHaveBeenCalled()

    // Verify dialog was closed
    expect(result.current.showDialog).toBe(false)

    // Verify navigation occurred
    expect(window.sessionStorage.setItem).toHaveBeenCalledWith(
      'isNavigating',
      'true'
    )
    expect(mockRouter.push).toHaveBeenCalledWith('/test')
  })

  it('should close dialog when handleCancel is called', () => {
    const { result } = renderHook(() =>
      useUnsavedChangesPrompt({
        hasUnsavedChanges: true,
      })
    )

    // Set showDialog manually for testing
    act(() => {
      result.current.showDialog = true
      result.current.pendingUrl = '/test'
    })

    // Call handleCancel
    act(() => {
      result.current.handleCancel()
    })

    // Verify dialog was closed and pendingUrl was cleared
    expect(result.current.showDialog).toBe(false)
    expect(result.current.pendingUrl).toBeNull()
  })

  it('should handle link clicks and prevent navigation when hasUnsavedChanges is true', () => {
    const { result } = renderHook(() =>
      useUnsavedChangesPrompt({
        hasUnsavedChanges: true,
      })
    )

    const mockLinkClickEvent = {
      preventDefault: jest.fn(),
    }

    // Call handleLinkClick
    const shouldNavigate = result.current.handleLinkClick(
      '/test',
      mockLinkClickEvent
    )

    // Verify navigation was prevented
    expect(shouldNavigate).toBe(false)
    expect(mockLinkClickEvent.preventDefault).toHaveBeenCalled()
    expect(result.current.showDialog).toBe(true)
    expect(result.current.pendingUrl).toBe('/test')
  })

  it('should allow navigation when hasUnsavedChanges is false', () => {
    const { result } = renderHook(() =>
      useUnsavedChangesPrompt({
        hasUnsavedChanges: false,
      })
    )

    // Call handleLinkClick
    const shouldNavigate = result.current.handleLinkClick('/test')

    // Verify navigation was allowed
    expect(shouldNavigate).toBe(true)
    expect(result.current.showDialog).toBe(false)
  })

  it('should use custom confirmation message when provided', () => {
    const customMessage = 'Custom confirmation message'

    renderHook(() =>
      useUnsavedChangesPrompt({
        hasUnsavedChanges: true,
        confirmationMessage: customMessage,
      })
    )

    // Get the beforeunload handler
    const beforeUnloadHandler = (
      window.addEventListener as jest.Mock
    ).mock.calls.find((call) => call[0] === 'beforeunload')[1]

    // Create a mock event
    const mockBeforeUnloadEvent = {
      preventDefault: jest.fn(),
      returnValue: '',
    }

    // Call the handler
    const result = beforeUnloadHandler(mockBeforeUnloadEvent)

    // Verify custom message was used
    expect(result).toBe(customMessage)
    expect(mockBeforeUnloadEvent.returnValue).toBe(customMessage)
  })
})
