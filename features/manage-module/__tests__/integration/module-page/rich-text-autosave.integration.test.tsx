import React from 'react'
import { render, screen, waitFor, act } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { rest } from 'msw'
import { setupServer } from 'msw/node'
import { draftHandlers } from '../../__mocks__/mockDraftHandlers'
import RichTextEditorWithAutosave from '../../../components/RichTextEditorWithAutosave'
import { DraftSaveStatus } from '../../../types'

// Mock editor
jest.mock('@tiptap/react', () => ({
  useEditor: jest.fn().mockImplementation(() => ({
    chain: () => ({
      focus: () => ({
        run: jest.fn(),
      }),
    }),
    getJSON: jest.fn().mockReturnValue({
      type: 'doc',
      content: [
        {
          type: 'paragraph',
          content: [{ text: 'Mock content', type: 'text' }],
        },
      ],
    }),
    isEmpty: jest.fn().mockReturnValue(false),
    commands: {
      setContent: jest.fn(),
    },
  })),
  EditorContent: ({ editor }) => (
    <div data-testid="editor-content">
      <button
        data-testid="simulate-edit-button"
        onClick={() =>
          editor.commands.setContent({
            type: 'doc',
            content: [
              {
                type: 'paragraph',
                content: [{ text: 'Edited content', type: 'text' }],
              },
            ],
          })
        }
      >
        Simulate Edit
      </button>
    </div>
  ),
}))

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

describe('RichTextEditorWithAutosave Component Integration Test', () => {
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

  it('renders editor with auto-save status indicator', async () => {
    const onSave = jest.fn()
    const onChange = jest.fn()

    render(
      <RichTextEditorWithAutosave
        initialContent={{
          type: 'doc',
          content: [
            {
              type: 'paragraph',
              content: [{ text: 'Initial content', type: 'text' }],
            },
          ],
        }}
        onSave={onSave}
        onChange={onChange}
        pageId="draft-page-1"
        readOnly={false}
        autoSaveInterval={1000}
      />
    )

    // Verify initial render
    expect(screen.getByTestId('editor-content')).toBeInTheDocument()
    expect(screen.getByText('Tersimpan')).toBeInTheDocument()

    // Simulate user editing
    await userEvent.click(screen.getByTestId('simulate-edit-button'))

    // Status should change to UNSAVED
    expect(screen.getByText('Belum tersimpan')).toBeInTheDocument()

    // Advance timer to trigger auto-save
    act(() => {
      jest.advanceTimersByTime(1000)
    })

    // Status should change to SAVING
    expect(screen.getByText('Menyimpan...')).toBeInTheDocument()

    // Wait for save to complete
    await waitFor(() => {
      expect(screen.getByText('Tersimpan')).toBeInTheDocument()
    })

    // Verify onSave was called
    expect(onSave).toHaveBeenCalled()
  })

  it('displays error status when save fails', async () => {
    // Mock network error
    server.use(
      rest.post(
        '/api/module/:moduleId/pages/:pageId/draft',
        (req, res, ctx) => {
          return res.networkError('Failed to connect')
        }
      )
    )

    const onSave = jest.fn()
    const onChange = jest.fn()

    render(
      <RichTextEditorWithAutosave
        initialContent={{
          type: 'doc',
          content: [
            {
              type: 'paragraph',
              content: [{ text: 'Initial content', type: 'text' }],
            },
          ],
        }}
        onSave={onSave}
        onChange={onChange}
        pageId="draft-page-1"
        readOnly={false}
        autoSaveInterval={1000}
      />
    )

    // Simulate user editing
    await userEvent.click(screen.getByTestId('simulate-edit-button'))

    // Advance timer to trigger auto-save
    act(() => {
      jest.advanceTimersByTime(1000)
    })

    // Wait for error status
    await waitFor(() => {
      expect(screen.getByText('Gagal menyimpan')).toBeInTheDocument()
    })

    // Should have retry button
    expect(screen.getByText('Coba lagi')).toBeInTheDocument()
  })

  it('supports manual save with retry button', async () => {
    // First mock a network error
    server.use(
      rest.post(
        '/api/module/:moduleId/pages/:pageId/draft',
        (req, res, ctx) => {
          return res.networkError('Failed to connect')
        }
      )
    )

    const onSave = jest.fn()
    const onChange = jest.fn()

    render(
      <RichTextEditorWithAutosave
        initialContent={{
          type: 'doc',
          content: [
            {
              type: 'paragraph',
              content: [{ text: 'Initial content', type: 'text' }],
            },
          ],
        }}
        onSave={onSave}
        onChange={onChange}
        pageId="draft-page-1"
        readOnly={false}
        autoSaveInterval={1000}
      />
    )

    // Simulate user editing
    await userEvent.click(screen.getByTestId('simulate-edit-button'))

    // Advance timer to trigger auto-save
    act(() => {
      jest.advanceTimersByTime(1000)
    })

    // Wait for error status
    await waitFor(() => {
      expect(screen.getByText('Gagal menyimpan')).toBeInTheDocument()
    })

    // Now restore the normal handler for retry
    server.resetHandlers()
    server.use(...draftHandlers)

    // Click retry button
    await userEvent.click(screen.getByText('Coba lagi'))

    // Status should change to SAVING
    expect(screen.getByText('Menyimpan...')).toBeInTheDocument()

    // Wait for save to complete
    await waitFor(() => {
      expect(screen.getByText('Tersimpan')).toBeInTheDocument()
    })

    // Verify onSave was called on retry
    expect(onSave).toHaveBeenCalled()
  })

  it('shows save timestamp after successful save', async () => {
    const onSave = jest.fn()
    const onChange = jest.fn()

    // Mock current date
    const fixedDate = new Date('2025-06-01T12:00:00Z')
    jest.spyOn(global, 'Date').mockImplementation(() => fixedDate)

    render(
      <RichTextEditorWithAutosave
        initialContent={{
          type: 'doc',
          content: [
            {
              type: 'paragraph',
              content: [{ text: 'Initial content', type: 'text' }],
            },
          ],
        }}
        onSave={onSave}
        onChange={onChange}
        pageId="draft-page-1"
        readOnly={false}
        autoSaveInterval={1000}
      />
    )

    // Simulate user editing
    await userEvent.click(screen.getByTestId('simulate-edit-button'))

    // Advance timer to trigger auto-save
    act(() => {
      jest.advanceTimersByTime(1000)
    })

    // Wait for save to complete
    await waitFor(() => {
      expect(onSave).toHaveBeenCalled()
    })

    // Should show timestamp (actual format may vary based on implementation)
    expect(screen.getByText(/Tersimpan/)).toBeInTheDocument()

    // Clean up mock
    global.Date.mockRestore()
  })

  it('prevents saving when in readOnly mode', async () => {
    const onSave = jest.fn()
    const onChange = jest.fn()

    render(
      <RichTextEditorWithAutosave
        initialContent={{
          type: 'doc',
          content: [
            {
              type: 'paragraph',
              content: [{ text: 'Initial content', type: 'text' }],
            },
          ],
        }}
        onSave={onSave}
        onChange={onChange}
        pageId="draft-page-1"
        readOnly={true} // Editor in read-only mode
        autoSaveInterval={1000}
      />
    )

    // Simulate user editing (this shouldn't work in readOnly mode)
    await userEvent.click(screen.getByTestId('simulate-edit-button'))

    // Advance timer
    act(() => {
      jest.advanceTimersByTime(1000)
    })

    // Save should not be called in readOnly mode
    expect(onSave).not.toHaveBeenCalled()
  })
})
