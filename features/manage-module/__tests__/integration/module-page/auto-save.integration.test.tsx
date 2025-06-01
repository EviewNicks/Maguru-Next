import { renderHook, act, waitFor } from '@testing-library/react'
import { rest } from 'msw'
import { setupServer } from 'msw/node'
import { draftHandlers } from '../../__mocks__/mockDraftHandlers'
import useRichTextAutosave from '../../../hooks/useRichTextAutosave'
import { DraftSaveStatus } from '../../../types'

// Setup mock server
const server = setupServer(...draftHandlers)

// Mock timer
jest.useFakeTimers()

// Mock modulePageAdapter
jest.mock('../../../adapters/modulePageAdapter', () => ({
  saveDraft: jest.fn().mockImplementation(async (pageId, content, authorId) => {
    const response = await fetch(
      `/api/module/module-test-1/pages/${pageId}/draft`,
      {
        method: 'POST',
        body: JSON.stringify({ content, authorId }),
        headers: { 'Content-Type': 'application/json' },
      }
    )
    const data = await response.json()
    return data.data
  }),
}))

// Unmock useRichTextAutosave to test the actual implementation
jest.unmock('../../../hooks/useRichTextAutosave')

describe('Auto-save Integration Tests', () => {
  beforeAll(() => {
    server.listen()
  })

  afterEach(() => {
    server.resetHandlers()
    jest.clearAllMocks()
  })

  afterAll(() => {
    server.close()
    jest.useRealTimers()
  })

  describe('useRichTextAutosave Hook', () => {
    it('should update save status correctly during autosave flow', async () => {
      const onChange = jest.fn()
      const onSave = jest.fn().mockImplementation(async (content) => {
        const modulePageAdapter = require('../../../adapters/modulePageAdapter')
        return modulePageAdapter.saveDraft(
          'draft-page-1',
          content,
          'test-user-id'
        )
      })

      // Render the hook
      const { result } = renderHook(() =>
        useRichTextAutosave({
          onChange,
          onSave,
          autoSaveInterval: 1000, // 1 second for testing
          pageId: 'draft-page-1',
        })
      )

      // Initial state check
      expect(result.current.saveStatus).toBe(DraftSaveStatus.SAVED)

      // Simulate editor change
      act(() => {
        const content = {
          type: 'doc',
          content: [
            {
              type: 'paragraph',
              content: [{ text: 'New content', type: 'text' }],
            },
          ],
        }
        result.current.handleEditorChange(content)
      })

      // Status should change to UNSAVED immediately
      expect(result.current.saveStatus).toBe(DraftSaveStatus.UNSAVED)

      // Advance timer to trigger auto-save
      act(() => {
        jest.advanceTimersByTime(1000)
      })

      // Status should change to SAVING
      expect(result.current.saveStatus).toBe(DraftSaveStatus.SAVING)

      // Wait for save to complete
      await waitFor(() => {
        expect(onSave).toHaveBeenCalled()
      })

      // Status should be SAVED after successful save
      expect(result.current.saveStatus).toBe(DraftSaveStatus.SAVED)
      expect(result.current.lastSaved).toBeDefined()
    })

    it('should handle network error during auto-save', async () => {
      // Mock network failure
      server.use(
        rest.post(
          '/api/module/:moduleId/pages/:pageId/draft',
          (req, res, ctx) => {
            return res.networkError('Failed to connect')
          }
        )
      )

      const onChange = jest.fn()
      const onSave = jest.fn().mockImplementation(async (content) => {
        const modulePageAdapter = require('../../../adapters/modulePageAdapter')
        return modulePageAdapter.saveDraft(
          'draft-page-1',
          content,
          'test-user-id'
        )
      })

      // Render the hook
      const { result } = renderHook(() =>
        useRichTextAutosave({
          onChange,
          onSave,
          autoSaveInterval: 1000,
          pageId: 'draft-page-1',
        })
      )

      // Simulate editor change
      act(() => {
        const content = {
          type: 'doc',
          content: [
            {
              type: 'paragraph',
              content: [{ text: 'Content with error', type: 'text' }],
            },
          ],
        }
        result.current.handleEditorChange(content)
      })

      // Advance timer to trigger auto-save
      act(() => {
        jest.advanceTimersByTime(1000)
      })

      // Wait for save attempt to complete
      await waitFor(() => {
        expect(onSave).toHaveBeenCalled()
      })

      // Status should be ERROR after failed save
      expect(result.current.saveStatus).toBe(DraftSaveStatus.ERROR)
    })

    it('should debounce multiple rapid changes', async () => {
      const onChange = jest.fn()
      const onSave = jest.fn().mockImplementation(async (content) => {
        const modulePageAdapter = require('../../../adapters/modulePageAdapter')
        return modulePageAdapter.saveDraft(
          'draft-page-1',
          content,
          'test-user-id'
        )
      })

      // Render the hook
      const { result } = renderHook(() =>
        useRichTextAutosave({
          onChange,
          onSave,
          autoSaveInterval: 1000,
          debounceTime: 500, // 500ms debounce
          pageId: 'draft-page-1',
        })
      )

      // Simulate multiple rapid editor changes
      act(() => {
        const content1 = {
          type: 'doc',
          content: [
            {
              type: 'paragraph',
              content: [{ text: 'Change 1', type: 'text' }],
            },
          ],
        }
        result.current.handleEditorChange(content1)
      })

      // Wait less than debounce time
      act(() => {
        jest.advanceTimersByTime(200)
      })

      // Second change
      act(() => {
        const content2 = {
          type: 'doc',
          content: [
            {
              type: 'paragraph',
              content: [{ text: 'Change 2', type: 'text' }],
            },
          ],
        }
        result.current.handleEditorChange(content2)
      })

      // Wait less than debounce time
      act(() => {
        jest.advanceTimersByTime(200)
      })

      // Third change
      act(() => {
        const content3 = {
          type: 'doc',
          content: [
            {
              type: 'paragraph',
              content: [{ text: 'Change 3', type: 'text' }],
            },
          ],
        }
        result.current.handleEditorChange(content3)
      })

      // Verify onChange called for each change
      expect(onChange).toHaveBeenCalledTimes(3)

      // But onSave should not have been called yet
      expect(onSave).not.toHaveBeenCalled()

      // Advance timer past debounce time
      act(() => {
        jest.advanceTimersByTime(1000)
      })

      // Wait for save to complete
      await waitFor(() => {
        expect(onSave).toHaveBeenCalled()
      })

      // onSave should have been called exactly once with the latest content
      expect(onSave).toHaveBeenCalledTimes(1)
      expect(onSave).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'doc',
          content: [
            {
              type: 'paragraph',
              content: [{ text: 'Change 3', type: 'text' }],
            },
          ],
        })
      )
    })

    it('should force save immediately when requested', async () => {
      const onChange = jest.fn()
      const onSave = jest.fn().mockImplementation(async (content) => {
        const modulePageAdapter = require('../../../adapters/modulePageAdapter')
        return modulePageAdapter.saveDraft(
          'draft-page-1',
          content,
          'test-user-id'
        )
      })

      // Render the hook
      const { result } = renderHook(() =>
        useRichTextAutosave({
          onChange,
          onSave,
          autoSaveInterval: 10000, // Long interval
          pageId: 'draft-page-1',
        })
      )

      // Simulate content change
      act(() => {
        const content = {
          type: 'doc',
          content: [
            {
              type: 'paragraph',
              content: [{ text: 'Force save content', type: 'text' }],
            },
          ],
        }
        result.current.handleEditorChange(content)
      })

      // Status should be UNSAVED
      expect(result.current.saveStatus).toBe(DraftSaveStatus.UNSAVED)

      // Force save immediately
      act(() => {
        result.current.forceSave()
      })

      // Status should change to SAVING immediately
      expect(result.current.saveStatus).toBe(DraftSaveStatus.SAVING)

      // Wait for save to complete
      await waitFor(() => {
        expect(onSave).toHaveBeenCalled()
      })

      // Status should be SAVED after successful save
      expect(result.current.saveStatus).toBe(DraftSaveStatus.SAVED)
    })
  })
})
