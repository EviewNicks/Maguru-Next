import { describe, it, expect, vi, beforeEach, afterEach } from 'vites'
import { DraftFeedbackService } from './DraftFeedbackService'
import { StandardEditorContent } from '../../types'

// Mock window event listeners
const addEventListenerMock = vi.fn()
const removeEventListenerMock = vi.fn()

// Mock navigator.onLine
let mockOnline = true

// Mock window
vi.stubGlobal('window', {
  addEventListener: addEventListenerMock,
  removeEventListener: removeEventListenerMock,
})

// Mock navigator
vi.stubGlobal('navigator', {
  get onLine() {
    return mockOnline
  },
})

// Mock clearTimeout dan setTimeout
vi.useFakeTimers()

describe('DraftFeedbackService', () => {
  let service: DraftFeedbackService
  let statusChangeCallback: ReturnType<typeof vi.fn>

  const mockContent: StandardEditorContent = {
    type: 'doc',
    content: [
      { type: 'paragraph', content: [{ type: 'text', text: 'Test content' }] },
    ],
  }

  beforeEach(() => {
    // Reset mocks
    vi.clearAllMocks()
    mockOnline = true

    // Create new service instance
    service = new DraftFeedbackService()

    // Create spy for status change callback
    statusChangeCallback = vi.fn()
    service.setStatusChangeCallback(statusChangeCallback)
  })

  afterEach(() => {
    service.destroy()
  })

  it('should initialize with correct default values', () => {
    expect(service.getStatus()).toBe('idle')
    expect(service.getLastSavedAt()).toBeNull()
    expect(service.getLastError()).toBeNull()
    expect(service.isOnline()).toBe(true)
    expect(service.getFailedOperations()).toEqual([])
  })

  it('should register online/offline event listeners on initialization', () => {
    expect(addEventListenerMock).toHaveBeenCalledWith(
      'online',
      expect.any(Function)
    )
    expect(addEventListenerMock).toHaveBeenCalledWith(
      'offline',
      expect.any(Function)
    )
  })

  it('should clean up event listeners on destroy', () => {
    service.destroy()
    expect(removeEventListenerMock).toHaveBeenCalledWith(
      'online',
      expect.any(Function)
    )
    expect(removeEventListenerMock).toHaveBeenCalledWith(
      'offline',
      expect.any(Function)
    )
  })

  it('should update status and call callback', () => {
    const now = new Date()
    service.updateStatus('saving')
    expect(service.getStatus()).toBe('saving')
    expect(statusChangeCallback).toHaveBeenCalledWith('saving', undefined)

    service.updateStatus('saved', now)
    expect(service.getStatus()).toBe('saved')
    expect(service.getLastSavedAt()).toBe(now)
    expect(statusChangeCallback).toHaveBeenCalledWith('saved', now)
  })

  it('should handle errors correctly', () => {
    const testError = new Error('Test error')
    service.handleError(testError)
    expect(service.getStatus()).toBe('error')
    expect(service.getLastError()).toBe(testError)
    expect(statusChangeCallback).toHaveBeenCalledWith('error', undefined)
  })

  it('should handle offline status when error occurs offline', () => {
    mockOnline = false
    service = new DraftFeedbackService() // Reinitialize to get updated online status
    service.setStatusChangeCallback(statusChangeCallback)

    const testError = new Error('Test error')
    service.handleError(testError)
    expect(service.getStatus()).toBe('offline')
    expect(statusChangeCallback).toHaveBeenCalledWith('offline', undefined)
  })

  it('should queue and manage failed operations', () => {
    service.queueFailedOperation('page-1', mockContent, 'user-1')
    service.queueFailedOperation('page-2', mockContent, 'user-2')

    const operations = service.getFailedOperations()
    expect(operations.length).toBe(2)
    expect(operations[0].pageId).toBe('page-1')
    expect(operations[1].pageId).toBe('page-2')

    service.removeFailedOperation(0)
    expect(service.getFailedOperations().length).toBe(1)
    expect(service.getFailedOperations()[0].pageId).toBe('page-2')

    service.clearFailedOperations()
    expect(service.getFailedOperations().length).toBe(0)
  })

  it('should start and stop auto retry', async () => {
    const retryCallback = vi.fn().mockResolvedValue(undefined)

    // Queue a failed operation
    service.queueFailedOperation('page-1', mockContent, 'user-1')

    // Start auto retry
    service.startAutoRetry(retryCallback, 5000)

    // Advance timer
    vi.advanceTimersByTime(5000)

    // Verify retry was called
    expect(retryCallback).toHaveBeenCalled()
    expect(statusChangeCallback).toHaveBeenCalledWith('retrying', undefined)

    // Stop auto retry
    service.stopAutoRetry()

    // Reset status change callback
    statusChangeCallback.mockReset()

    // Advance timer again
    vi.advanceTimersByTime(5000)

    // Verify no more retries
    expect(statusChangeCallback).not.toHaveBeenCalled()
  })

  it('should handle online/offline events', () => {
    // Simulate offline event
    const offlineHandler = addEventListenerMock.mock.calls.find(
      (call) => call[0] === 'offline'
    )[1]

    offlineHandler()
    expect(service.isOnline()).toBe(false)
    expect(service.getStatus()).toBe('offline')
    expect(statusChangeCallback).toHaveBeenCalledWith('offline', undefined)

    // Reset callback mock
    statusChangeCallback.mockReset()

    // Simulate online event
    const onlineHandler = addEventListenerMock.mock.calls.find(
      (call) => call[0] === 'online'
    )[1]

    onlineHandler()
    expect(service.isOnline()).toBe(true)
    expect(service.getStatus()).toBe('idle')
    expect(statusChangeCallback).toHaveBeenCalledWith('idle', undefined)
  })
})
