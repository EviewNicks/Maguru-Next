import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import {
  ModuleDraftPageProvider,
  useModuleDraftPageContext,
} from './ModuleDraftPageContext'
import { ModulePage, ModulePageStatus } from '../types'
import { modulePageAdapter } from '../adapters/modulePageAdapter'
import { toast } from 'sonner'
import { showErrorNotification } from '../components/ErrorNotifier'

// Mock dependencies
jest.mock('@tiptap/react', () => ({
  Editor: class MockEditor {
    isEditable = true
    commands = {
      clearContent: jest.fn().mockReturnThis(),
      setContent: jest.fn().mockReturnThis(),
    }
    setEditable = jest.fn()
  },
}))

jest.mock('../adapters/modulePageAdapter', () => ({
  modulePageAdapter: {
    discardDraft: jest.fn(),
    getPage: jest.fn(),
    getParsedEditorContent: jest.fn(),
    invalidateDraftCache: jest.fn(),
    invalidatePageCache: jest.fn(),
  },
}))

jest.mock('sonner', () => ({
  toast: {
    success: jest.fn(),
    error: jest.fn(),
    info: jest.fn(),
  },
}))

jest.mock('../components/ErrorNotifier', () => ({
  showErrorNotification: jest.fn(),
}))

jest.mock('@clerk/nextjs', () => ({
  useClerk: () => ({
    user: { id: 'test-user-id', fullName: 'Test User' },
  }),
}))

// Mock untuk ModulePageCRUDContext
jest.mock('./ModulePageCRUDContext', () => ({
  useModulePageCRUDContext: () => ({
    getPageById: jest.fn().mockResolvedValue({
      id: 'page-1',
      moduleId: 'module-1',
      title: 'Test Page',
      content: { type: 'doc', content: [] },
      status: ModulePageStatus.PUBLISHED,
    }),
    refetch: jest.fn().mockResolvedValue(undefined),
  }),
}))

// Test component yang menggunakan context
const TestComponent = () => {
  const {
    draftSaveStatus,
    hasUnsavedChanges,
    hasDraft,
    showRecoveryDialog,
    showUnsavedChangesDialog,
    handleRecoverDraft,
    handleDiscardDraft,
    confirmNavigation,
    cancelNavigation,
    setEditor,
    editorMode,
    refreshActivePage,
  } = useModuleDraftPageContext()

  return (
    <div>
      <div data-testid="status">{draftSaveStatus}</div>
      <div data-testid="editor-mode">{editorMode}</div>
      <div data-testid="has-unsaved">
        {hasUnsavedChanges ? 'true' : 'false'}
      </div>
      <div data-testid="has-draft">{hasDraft ? 'true' : 'false'}</div>
      <div data-testid="show-recovery">
        {showRecoveryDialog ? 'true' : 'false'}
      </div>
      <div data-testid="show-unsaved">
        {showUnsavedChangesDialog ? 'true' : 'false'}
      </div>
      <button data-testid="recover" onClick={() => handleRecoverDraft()}>
        Recover
      </button>
      <button data-testid="discard" onClick={() => handleDiscardDraft()}>
        Discard
      </button>
      <button data-testid="confirm" onClick={() => confirmNavigation()}>
        Confirm
      </button>
      <button data-testid="cancel" onClick={() => cancelNavigation()}>
        Cancel
      </button>
      <button data-testid="refresh" onClick={() => refreshActivePage(true)}>
        Refresh
      </button>
      <button
        data-testid="set-editor"
        onClick={() =>
          setEditor(new (jest.requireMock('@tiptap/react').Editor)())
        }
      >
        Set Editor
      </button>
    </div>
  )
}

// Wrapper component
const renderWithProvider = (activePage: ModulePage | null = null) => {
  const mockPage: ModulePage = activePage || {
    id: 'page-1',
    moduleId: 'module-1',
    title: 'Test Page',
    content: { type: 'doc', content: [] },
    order: 1,
    type: 'content',
    version: 1,
    status: ModulePageStatus.PUBLISHED,
    createdAt: new Date(),
    updatedAt: new Date(),
    isDraft: false,
    hasUnpublishedChanges: false,
  }

  return render(
    <ModuleDraftPageProvider activePage={mockPage} enabled={true}>
      <TestComponent />
    </ModuleDraftPageProvider>
  )
}

describe('ModuleDraftPageContext', () => {
  // Reset mocks before each test
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('handleDiscardDraft', () => {
    test('should return early if pageId is not available', async () => {
      // Render with null activePage
      renderWithProvider(null)

      // Click discard button
      fireEvent.click(screen.getByTestId('discard'))

      // Wait for async operations
      await waitFor(() => {
        // Verify adapter was not called
        expect(modulePageAdapter.discardDraft).not.toHaveBeenCalled()
      })
    })

    test('should call adapter.discardDraft with correct pageId', async () => {
      // Setup mock response
      ;(modulePageAdapter.discardDraft as jest.Mock).mockResolvedValueOnce({
        success: true,
        data: {
          id: 'page-1',
          moduleId: 'module-1',
          title: 'Test Page',
          content: { type: 'doc', content: [] },
          status: ModulePageStatus.PUBLISHED,
          isDraft: false,
          hasUnpublishedChanges: false,
        },
      })

      // Render with activePage
      renderWithProvider()

      // Click discard button
      fireEvent.click(screen.getByTestId('discard'))

      // Wait for async operations
      await waitFor(() => {
        // Verify adapter was called with correct pageId
        expect(modulePageAdapter.discardDraft).toHaveBeenCalledWith('page-1')
      })
    })

    test('should show error notification if adapter.discardDraft fails', async () => {
      // Setup mock error
      const mockError = new Error('Discard draft failed')

      // Setup mock implementation
      ;(modulePageAdapter.discardDraft as jest.Mock).mockRejectedValueOnce(
        mockError
      )

      // Render with activePage
      renderWithProvider()

      // Click discard button
      fireEvent.click(screen.getByTestId('discard'))

      // Wait for async operations
      await waitFor(() => {
        // Verify error notification was shown
        expect(showErrorNotification).toHaveBeenCalledWith(mockError)
      })
    })

    test('should show success toast if discard is successful', async () => {
      // Setup mock response
      ;(modulePageAdapter.discardDraft as jest.Mock).mockResolvedValueOnce({
        success: true,
        data: {
          id: 'page-1',
          moduleId: 'module-1',
          title: 'Test Page',
          content: { type: 'doc', content: [] },
          status: ModulePageStatus.PUBLISHED,
          isDraft: false,
          hasUnpublishedChanges: false,
        },
      })

      // Render with activePage
      renderWithProvider()

      // Click discard button
      fireEvent.click(screen.getByTestId('discard'))

      // Wait for async operations
      await waitFor(() => {
        // Verify success toast was shown
        expect(toast.success).toHaveBeenCalledWith('Draft berhasil dibuang')
      })
    })

    test('should update editor mode to view after successful discard', async () => {
      // Setup mock response
      ;(modulePageAdapter.discardDraft as jest.Mock).mockResolvedValueOnce({
        success: true,
        data: {
          id: 'page-1',
          moduleId: 'module-1',
          title: 'Test Page',
          content: { type: 'doc', content: [] },
          status: ModulePageStatus.PUBLISHED,
          isDraft: false,
          hasUnpublishedChanges: false,
        },
      })

      // Setup mock for getPage
      ;(modulePageAdapter.getPage as jest.Mock).mockResolvedValueOnce({
        id: 'page-1',
        moduleId: 'module-1',
        title: 'Test Page',
        content: { type: 'doc', content: [] },
        status: ModulePageStatus.PUBLISHED,
      })

      // Setup mock for getParsedEditorContent
      ;(
        modulePageAdapter.getParsedEditorContent as jest.Mock
      ).mockReturnValueOnce({
        type: 'doc',
        content: [
          {
            type: 'paragraph',
            content: [{ type: 'text', text: 'Published content' }],
          },
        ],
      })

      // Render with activePage in edit mode
      renderWithProvider({
        id: 'page-1',
        moduleId: 'module-1',
        title: 'Test Page',
        content: { type: 'doc', content: [] },
        order: 1,
        type: 'content',
        version: 1,
        status: ModulePageStatus.DRAFT,
        createdAt: new Date(),
        updatedAt: new Date(),
        isDraft: true,
        hasUnpublishedChanges: true,
      })

      // Set editor
      fireEvent.click(screen.getByTestId('set-editor'))

      // Verify initial editor mode
      expect(screen.getByTestId('editor-mode').textContent).toBe('edit')

      // Click discard button
      fireEvent.click(screen.getByTestId('discard'))

      // Wait for async operations
      await waitFor(() => {
        // Verify editor mode changed to view
        expect(screen.getByTestId('editor-mode').textContent).toBe('view')
      })
    })

    test('should refresh page data after successful discard', async () => {
      // Setup mock response
      ;(modulePageAdapter.discardDraft as jest.Mock).mockResolvedValueOnce({
        success: true,
        data: {
          id: 'page-1',
          moduleId: 'module-1',
          title: 'Test Page',
          content: { type: 'doc', content: [] },
          status: ModulePageStatus.PUBLISHED,
          isDraft: false,
          hasUnpublishedChanges: false,
        },
      })

      // Render with activePage
      renderWithProvider()

      // Click discard button
      fireEvent.click(screen.getByTestId('discard'))

      // Wait for async operations
      await waitFor(() => {
        // Verify refetch was called
        expect(
          jest.requireMock('./ModulePageCRUDContext').useModulePageCRUDContext()
            .refetch
        ).toHaveBeenCalled()
      })
    })
  })
})
