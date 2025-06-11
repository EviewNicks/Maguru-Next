import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import {
  ConcurrentEditingService,
  ActiveEditor,
} from './ConcurrentEditingService'
import { ModulePage } from '../../types'

// Mock setInterval and clearInterval
vi.useFakeTimers()

describe('ConcurrentEditingService', () => {
  let service: ConcurrentEditingService
  let activityChangeCallback: ReturnType<typeof vi.fn>

  beforeEach(() => {
    // Reset mocks
    vi.clearAllMocks()

    // Create new service instance
    service = new ConcurrentEditingService()

    // Create spy for activity change callback
    activityChangeCallback = vi.fn()
    service.setActivityChangeCallback(activityChangeCallback)
  })

  afterEach(() => {
    service.destroy()
  })

  it('should initialize with empty editors map', () => {
    expect(service.getActiveEditors('page-1')).toEqual([])
  })

  it('should register and unregister user activity', () => {
    const pageId = 'page-1'
    const userId = 'user-1'
    const userName = 'User One'

    // Register user
    service.registerActivity(pageId, userId, userName)

    // Verify callback was called
    expect(activityChangeCallback).toHaveBeenCalledWith(
      pageId,
      expect.arrayContaining([
        expect.objectContaining({
          userId,
          userName,
          pageId,
        }),
      ])
    )

    // Verify user is registered
    const editors = service.getActiveEditors(pageId)
    expect(editors.length).toBe(1)
    expect(editors[0].userId).toBe(userId)
    expect(editors[0].userName).toBe(userName)

    // Unregister user
    service.unregisterActivity(pageId, userId)

    // Verify callback was called again
    expect(activityChangeCallback).toHaveBeenCalledWith(pageId, [])

    // Verify user is unregistered
    expect(service.getActiveEditors(pageId).length).toBe(0)
  })

  it('should update timestamp for existing user', () => {
    const pageId = 'page-1'
    const userId = 'user-1'
    const userName = 'User One'

    // Register user
    service.registerActivity(pageId, userId, userName)
    const firstTimestamp = service.getActiveEditors(pageId)[0].timestamp

    // Wait a bit (simulate time passing)
    vi.advanceTimersByTime(1000)

    // Register the same user again
    service.registerActivity(pageId, userId, userName)
    const secondTimestamp = service.getActiveEditors(pageId)[0].timestamp

    // Verify timestamp was updated
    expect(secondTimestamp).toBeGreaterThan(firstTimestamp)

    // Verify callback was only called once (for the first registration)
    expect(activityChangeCallback).toHaveBeenCalledTimes(1)
  })

  it('should detect other active editors', () => {
    const pageId = 'page-1'

    // Register two users
    service.registerActivity(pageId, 'user-1', 'User One')
    service.registerActivity(pageId, 'user-2', 'User Two')

    // Check for user-1
    expect(service.hasOtherActiveEditors(pageId, 'user-1')).toBe(true)

    // Check for non-existent user
    expect(service.hasOtherActiveEditors(pageId, 'user-3')).toBe(true)

    // Check with only one user
    service.unregisterActivity(pageId, 'user-2')
    expect(service.hasOtherActiveEditors(pageId, 'user-1')).toBe(false)
  })

  it('should clean up inactive editors', () => {
    const pageId = 'page-1'

    // Register users
    service.registerActivity(pageId, 'user-1', 'User One')
    service.registerActivity(pageId, 'user-2', 'User Two')

    // Verify both users are active
    expect(service.getActiveEditors(pageId).length).toBe(2)

    // Reset callback to track cleanup call
    activityChangeCallback.mockReset()

    // Advance time to make users inactive (> 5 minutes)
    vi.advanceTimersByTime(6 * 60 * 1000)

    // Trigger cleanup manually
    // @ts-ignore - accessing private method for testing
    service._cleanupInactiveEditors()

    // Verify all users are now inactive
    expect(service.getActiveEditors(pageId).length).toBe(0)
    expect(activityChangeCallback).toHaveBeenCalledWith(pageId, [])
  })

  it('should detect version conflicts between pages', () => {
    const now = new Date()
    const later = new Date(now.getTime() + 60000)

    const localPage = {
      version: 1,
      updatedAt: now,
      lastEditBy: 'user-1',
    } as ModulePage

    const remotePage = {
      version: 2,
      updatedAt: later,
      lastEditBy: 'user-2',
    } as ModulePage

    // Should detect conflict (different versions and updates)
    expect(service.hasVersionConflict(localPage, remotePage)).toBe(true)

    // Should not detect conflict if versions are same
    const sameVersionPage = { ...remotePage, version: 1 } as ModulePage
    expect(service.hasVersionConflict(localPage, sameVersionPage)).toBe(false)

    // Should not detect conflict if update times are same
    const sameUpdateTimePage = {
      ...remotePage,
      updatedAt: now,
      lastEditBy: 'user-1',
    } as ModulePage
    expect(service.hasVersionConflict(localPage, sameUpdateTimePage)).toBe(
      false
    )

    // Should handle null pages
    expect(service.hasVersionConflict(null, remotePage)).toBe(false)
    expect(service.hasVersionConflict(localPage, null)).toBe(false)
    expect(service.hasVersionConflict(null, null)).toBe(false)
  })
})
