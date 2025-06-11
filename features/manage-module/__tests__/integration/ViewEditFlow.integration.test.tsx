import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import '@testing-library/jest-dom'
import { ModulePageView } from '../../components/ModulePageView'
import { ModulePageEdit } from '../../components/ModulePageEdit'
import { useRouter } from 'next/navigation'
import {
  ModulePage,
  ModulePageStatus,
  StandardEditorContent,
} from '../../types'
import { Editor } from '@tiptap/react'

// Mock Next.js router
jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
}))

// Mock ModulePageCRUDContext
const mockUseModulePageCRUDContext = jest.fn()
jest.mock('../../context/ModulePageCRUDContext', () => ({
  useModulePageCRUDContext: () => mockUseModulePageCRUDContext(),
}))

// Mock RichTextViewer
jest.mock('../../components/RichTextViewer', () => ({
  RichTextViewer: ({ content }: { content?: StandardEditorContent }) => (
    <div data-testid="rich-text-viewer">
      <div>Rich Text Viewer</div>
      <pre data-testid="viewer-content">{JSON.stringify(content)}</pre>
    </div>
  ),
}))

// Mock RichTextEditor
const mockEditorInstance = {
  getJSON: jest.fn(),
  destroy: jest.fn(),
  setEditable: jest.fn(),
}

jest.mock('../../components/RichTextEditor', () => ({
  RichTextEditor: ({
    onEditorReady,
  }: {
    onEditorReady?: (editor: Editor) => void
    pageId?: string
  }) => {
    React.useEffect(() => {
      if (onEditorReady) {
        onEditorReady(mockEditorInstance as unknown as Editor)
      }
    }, [onEditorReady])

    return <div data-testid="rich-text-editor">Rich Text Editor</div>
  },
}))

// Mock headers
jest.mock('../../components/ModulePageEditor/document/ViewHeader', () => ({
  ViewHeader: ({
    onSwitchToEdit,
  }: {
    moduleId: string
    pageId: string
    onSwitchToEdit: () => void
  }) => (
    <div data-testid="view-header">
      <button onClick={onSwitchToEdit} data-testid="header-edit-button">
        Edit
      </button>
    </div>
  ),
}))

jest.mock('../../components/ModulePageEditor/document/EditHeader', () => ({
  EditHeader: ({
    onSwitchToView,
  }: {
    moduleId: string
    pageId: string
    onSwitchToView: () => void
  }) => (
    <div data-testid="edit-header">
      <button onClick={onSwitchToView} data-testid="save-button">
        Save
      </button>
    </div>
  ),
}))

// Mock toast
jest.mock('sonner', () => ({
  toast: {
    success: jest.fn(),
    error: jest.fn(),
  },
}))

describe('View-Edit Flow Integration', () => {
  const mockPush = jest.fn()
  const mockSavePage = jest.fn().mockResolvedValue({})

  const mockPage: ModulePage = {
    id: 'page-123',
    moduleId: 'module-123',
    title: 'Test Page',
    content: {
      type: 'doc',
      content: [
        {
          type: 'paragraph',
          content: [{ type: 'text', text: 'Original content' }],
        },
      ],
    },
    status: ModulePageStatus.PUBLISHED,
    order: 1,
    createdAt: new Date('2023-01-01'),
    updatedAt: new Date('2023-01-01'),
    version: 1,
    type: 'content',
    isDraft: false,
    hasUnpublishedChanges: false,
  }

  const updatedContent: StandardEditorContent = {
    type: 'doc',
    content: [
      {
        type: 'paragraph',
        content: [{ type: 'text', text: 'Updated content' }],
      },
    ],
  }

  beforeEach(() => {
    jest.clearAllMocks()

    // Setup router mock
    ;(useRouter as jest.Mock).mockReturnValue({
      push: mockPush,
    })

    // Setup mock editor
    mockEditorInstance.getJSON.mockReturnValue(updatedContent)

    // Setup context mock
    mockUseModulePageCRUDContext.mockReturnValue({
      moduleId: 'module-123',
      pages: [mockPage],
      activePage: mockPage,
      isLoading: false,
      error: null,
      savePage: mockSavePage,
      getParsedEditorContent: jest.fn().mockReturnValue(mockPage.content),
    })
  })

  it('navigates from view mode to edit mode', async () => {
    render(<ModulePageView moduleId="module-123" pageId="page-123" />)

    // Wait for content to load
    await waitFor(() => {
      expect(screen.getByTestId('view-header')).toBeInTheDocument()
    })

    // Click edit button
    fireEvent.click(screen.getByTestId('header-edit-button'))

    // Verify navigation to edit mode
    expect(mockPush).toHaveBeenCalledWith(
      '/manage-module/module-123?pageId=page-123&mode=edit'
    )
  })

  it('saves content when navigating from edit mode to view mode', async () => {
    render(<ModulePageEdit moduleId="module-123" pageId="page-123" />)

    // Wait for editor to initialize
    await waitFor(() => {
      expect(screen.getByTestId('edit-header')).toBeInTheDocument()
    })

    // Click save button
    fireEvent.click(screen.getByTestId('save-button'))

    // Wait for save to complete
    await waitFor(() => {
      // Verify savePage was called
      expect(mockSavePage).toHaveBeenCalledWith({
        pageId: 'page-123',
        content: expect.anything(),
      })

      // Verify navigation to view mode
      expect(mockPush).toHaveBeenCalledWith(
        '/manage-module/module-123?pageId=page-123&mode=view'
      )
    })
  })

  it('maintains content consistency between view and edit modes', async () => {
    // First render view mode
    const { unmount } = render(
      <ModulePageView moduleId="module-123" pageId="page-123" />
    )

    // Wait for content to load in view mode
    await waitFor(() => {
      expect(screen.getByTestId('rich-text-viewer')).toBeInTheDocument()
    })

    // Unmount view component
    unmount()

    // Now render edit mode
    render(<ModulePageEdit moduleId="module-123" pageId="page-123" />)

    // Wait for editor to initialize
    await waitFor(() => {
      expect(screen.getByTestId('rich-text-editor')).toBeInTheDocument()
    })

    // Save changes
    fireEvent.click(screen.getByTestId('save-button'))

    // Wait for save to complete
    await waitFor(() => {
      expect(mockSavePage).toHaveBeenCalled()
    })

    // Update context with new content
    mockUseModulePageCRUDContext.mockReturnValue({
      moduleId: 'module-123',
      pages: [{ ...mockPage, content: updatedContent }],
      activePage: { ...mockPage, content: updatedContent },
      isLoading: false,
      error: null,
      savePage: mockSavePage,
      getParsedEditorContent: jest.fn().mockReturnValue(updatedContent),
    })

    // Render view mode again
    render(<ModulePageView moduleId="module-123" pageId="page-123" />)

    // Wait for content to load
    await waitFor(() => {
      expect(screen.getByTestId('rich-text-viewer')).toBeInTheDocument()
    })
  })
})
