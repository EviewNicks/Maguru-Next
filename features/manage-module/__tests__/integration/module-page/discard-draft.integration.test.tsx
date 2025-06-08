import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import '@testing-library/jest-dom'
import DocumentHeader from '../../../components/ModulePageEditor/document/DocumentHeader'
import { ModuleDraftPageProvider } from '../../../context/ModuleDraftPageContext'
import { ModulePageCRUDProvider } from '../../../context/ModulePageCRUDContext'
import { ModulePage, ModulePageStatus } from '../../../types'
import { modulePageAdapter } from '../../../adapters/modulePageAdapter'
import { toast } from 'sonner'
import { showErrorNotification } from '../../../components/ErrorNotifier'

// Mock dependencies
jest.mock('sonner', () => ({
  toast: {
    success: jest.fn(),
    error: jest.fn(),
    info: jest.fn(),
  },
}))

jest.mock('../../../components/ErrorNotifier', () => ({
  showErrorNotification: jest.fn(),
}))

jest.mock('../../../adapters/modulePageAdapter', () => ({
  modulePageAdapter: {
    discardDraft: jest.fn(),
    getPage: jest.fn(),
    getParsedEditorContent: jest.fn(),
    invalidateDraftCache: jest.fn(),
    invalidatePageCache: jest.fn(),
  },
}))

// Mock window.sessionStorage
const mockSessionStorage = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
}

Object.defineProperty(window, 'sessionStorage', {
  value: mockSessionStorage,
})

// Mock clerk
jest.mock('@clerk/nextjs', () => ({
  useClerk: () => ({
    user: { id: 'test-user-id', fullName: 'Test User' },
  }),
}))

// Integration test wrapper component
const IntegrationWrapper = ({
  activePage,
  mockDiscardDraft = jest.fn().mockResolvedValue({
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
  }),
}: {
  activePage: ModulePage
  mockDiscardDraft?: jest.Mock
}) => {
  // Mock adapter functions for integration test
  ;(modulePageAdapter.discardDraft as jest.Mock) = mockDiscardDraft

  return (
    <ModulePageCRUDProvider
      moduleId={activePage.moduleId}
      initialActivePage={activePage}
    >
      <ModuleDraftPageProvider activePage={activePage} enabled={true}>
        <DocumentHeader
          title={activePage.title}
          pageId={activePage.id}
          saveStatus="saved"
          hasDraft={true}
        />
      </ModuleDraftPageProvider>
    </ModulePageCRUDProvider>
  )
}

describe('Discard Draft Integration', () => {
  // Reset mocks before each test
  beforeEach(() => {
    jest.clearAllMocks()
  })

  test('End-to-end flow: discard draft button click to successful discard', async () => {
    // Setup test page with draft
    const mockPage: ModulePage = {
      id: 'page-1',
      moduleId: 'module-1',
      title: 'Test Page with Draft',
      content: { type: 'doc', content: [] },
      order: 1,
      type: 'content',
      version: 1,
      status: ModulePageStatus.DRAFT,
      createdAt: new Date(),
      updatedAt: new Date(),
      isDraft: true,
      hasUnpublishedChanges: true,
      draftData: { type: 'doc', content: [] },
      draftSavedAt: new Date(),
      lastEditBy: 'test-user-id',
    }

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

    // Render component with integration wrapper
    render(<IntegrationWrapper activePage={mockPage} />)

    // Verify discard button is shown
    const discardButton = screen.getByText('Buang Draft')
    expect(discardButton).toBeInTheDocument()

    // Click discard button to open dialog
    fireEvent.click(discardButton)

    // Verify dialog appears
    expect(screen.getByText('Buang draft?')).toBeInTheDocument()

    // Click confirm button in dialog
    const confirmButton = screen.getByText('Buang Draft', {
      selector: 'button[role="button"]',
    })
    fireEvent.click(confirmButton)

    // Verify adapter was called
    await waitFor(() => {
      expect(modulePageAdapter.discardDraft).toHaveBeenCalledWith('page-1')
    })

    // Verify sessionStorage operations
    expect(mockSessionStorage.setItem).toHaveBeenCalledWith(
      'isDiscardingDraft',
      'true'
    )

    // After success, should remove flag and show toast
    await waitFor(() => {
      expect(mockSessionStorage.removeItem).toHaveBeenCalledWith(
        'isDiscardingDraft'
      )
      expect(toast.success).toHaveBeenCalledWith('Draft berhasil dibuang')
    })
  })

  test('Error handling: adapter returns error during discard', async () => {
    // Setup test page with draft
    const mockPage: ModulePage = {
      id: 'page-1',
      moduleId: 'module-1',
      title: 'Test Page with Draft',
      content: { type: 'doc', content: [] },
      order: 1,
      type: 'content',
      version: 1,
      status: ModulePageStatus.DRAFT,
      createdAt: new Date(),
      updatedAt: new Date(),
      isDraft: true,
      hasUnpublishedChanges: true,
      draftData: { type: 'doc', content: [] },
      draftSavedAt: new Date(),
      lastEditBy: 'test-user-id',
    }

    // Mock error response
    const mockError = new Error('Discard draft failed')
    const mockDiscardDraftWithError = jest.fn().mockRejectedValue(mockError)

    // Render component with integration wrapper and error mock
    render(
      <IntegrationWrapper
        activePage={mockPage}
        mockDiscardDraft={mockDiscardDraftWithError}
      />
    )

    // Click discard button to open dialog
    const discardButton = screen.getByText('Buang Draft')
    fireEvent.click(discardButton)

    // Click confirm button in dialog
    const confirmButton = screen.getByText('Buang Draft', {
      selector: 'button[role="button"]',
    })
    fireEvent.click(confirmButton)

    // Verify error handling
    await waitFor(() => {
      expect(showErrorNotification).toHaveBeenCalledWith(mockError)
    })

    // Verify sessionStorage operations
    expect(mockSessionStorage.setItem).toHaveBeenCalledWith(
      'isDiscardingDraft',
      'true'
    )

    // After error, should still remove flag
    await waitFor(() => {
      expect(mockSessionStorage.removeItem).toHaveBeenCalledWith(
        'isDiscardingDraft'
      )
    })
  })

  test('State changes: editor mode should change after successful discard', async () => {
    // Setup test page with draft
    const mockPage: ModulePage = {
      id: 'page-1',
      moduleId: 'module-1',
      title: 'Test Page with Draft',
      content: { type: 'doc', content: [] },
      order: 1,
      type: 'content',
      version: 1,
      status: ModulePageStatus.DRAFT,
      createdAt: new Date(),
      updatedAt: new Date(),
      isDraft: true,
      hasUnpublishedChanges: true,
      draftData: { type: 'doc', content: [] },
      draftSavedAt: new Date(),
      lastEditBy: 'test-user-id',
    }

    // Render component with integration wrapper
    render(<IntegrationWrapper activePage={mockPage} />)

    // Click discard button to open dialog
    const discardButton = screen.getByText('Buang Draft')
    fireEvent.click(discardButton)

    // Click confirm button in dialog
    const confirmButton = screen.getByText('Buang Draft', {
      selector: 'button[role="button"]',
    })
    fireEvent.click(confirmButton)

    // Verify adapter was called
    await waitFor(() => {
      expect(modulePageAdapter.discardDraft).toHaveBeenCalledWith('page-1')
    })

    // After success, "Edit" button should appear (indicating view mode)
    await waitFor(() => {
      // The edit button appears when in view mode
      expect(screen.getByText('Edit')).toBeInTheDocument()
      // Discard button should no longer be visible
      expect(screen.queryByText('Buang Draft')).not.toBeInTheDocument()
    })
  })
})
