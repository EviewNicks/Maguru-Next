import React from 'react'
import { render, screen, fireEvent } from '@testing-library/react'
import '@testing-library/jest-dom'
import { ModulePageView } from './ModulePageView'
import { ModulePageCRUDProvider } from '../context/ModulePageCRUDContext'
import { ModulePage, StandardEditorContent, ModulePageStatus } from '../types'

// Mock dependencies
const mockPush = jest.fn()
jest.mock('next/navigation', () => ({
  useRouter: jest.fn(() => ({
    push: mockPush,
    replace: jest.fn(),
    back: jest.fn(),
    forward: jest.fn(),
    refresh: jest.fn(),
    prefetch: jest.fn(),
  })),
}))

// Mock untuk Clerk
jest.mock('@clerk/nextjs', () => ({
  useClerk: () => ({
    user: {
      id: 'test-user-id',
      fullName: 'Test User',
      username: 'testuser',
    },
  }),
}))

// Mock ModulePageData hook yang digunakan oleh ModulePageCRUDProvider
jest.mock('../hooks/useModulePageData', () => ({
  useModulePageData: jest.fn().mockReturnValue({
    pagesQuery: {
      data: [],
      isLoading: false,
      error: null,
      refetch: jest.fn().mockResolvedValue({}),
    },
    getPage: jest.fn(),
    getParsedEditorContent: jest.fn().mockReturnValue({
      type: 'doc',
      content: [
        {
          type: 'paragraph',
          content: [{ type: 'text', text: 'Parsed content' }],
        },
      ],
    }),
    createPage: jest.fn().mockResolvedValue({}),
    updatePage: jest.fn().mockResolvedValue({}),
    deletePage: jest.fn().mockResolvedValue({}),
    reorderPages: jest.fn().mockResolvedValue({}),
    saveEditorContent: jest.fn().mockResolvedValue({}),
    checkHasDraft: jest.fn().mockResolvedValue(false),
    getDraft: jest.fn().mockResolvedValue(null),
  }),
}))

// Mock modulePageAdapter
jest.mock('../adapters/modulePageAdapter', () => ({
  modulePageAdapter: {
    discardDraft: jest.fn().mockResolvedValue({ data: {}, success: true }),
    publishDraft: jest.fn().mockResolvedValue({}),
    hasDraft: jest.fn().mockResolvedValue(false),
    getParsedEditorContent: jest.fn().mockReturnValue({
      type: 'doc',
      content: [
        {
          type: 'paragraph',
          content: [{ type: 'text', text: 'Parsed content' }],
        },
      ],
    }),
  },
}))

jest.mock('./ModulePageEditor/document/ViewHeader', () => ({
  ViewHeader: ({
    moduleId,
    pageId,
    onSwitchToEdit,
  }: {
    moduleId: string
    pageId: string
    onSwitchToEdit: () => void
  }) => (
    <div data-testid="view-header">
      View Header (Module: {moduleId}, Page: {pageId})
      <button onClick={onSwitchToEdit} data-testid="header-edit-button">
        Edit from Header
      </button>
    </div>
  ),
}))

jest.mock('./RichTextViewer', () => ({
  RichTextViewer: ({
    content,
    isLoading,
  }: {
    content?: StandardEditorContent
    isLoading?: boolean
  }) => (
    <div data-testid="rich-text-viewer">
      {isLoading ? 'Loading...' : 'Content Viewer'}
      <pre>{JSON.stringify(content)}</pre>
    </div>
  ),
}))

// Mock context
const mockActivePage: ModulePage = {
  id: 'page-123',
  title: 'Test Page',
  content: {
    type: 'doc',
    content: [
      { type: 'paragraph', content: [{ type: 'text', text: 'Test content' }] },
    ],
  },
  status: ModulePageStatus.PUBLISHED,
  moduleId: 'module-123',
  order: 1,
  createdAt: new Date('2025-06-08'),
  updatedAt: new Date('2025-06-08'),
  version: 1,
  type: 'content',
  isDraft: false,
  hasUnpublishedChanges: false,
}

describe('ModulePageView', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('renders correctly with all components', () => {
    // Override useModulePageData untuk mengembalikan data modul yang diinginkan
    const useModulePageDataMock = jest.requireMock('../hooks/useModulePageData')
    useModulePageDataMock.useModulePageData.mockReturnValue({
      pagesQuery: {
        data: [mockActivePage],
        isLoading: false,
        error: null,
        refetch: jest.fn().mockResolvedValue({}),
      },
      getPage: jest.fn().mockResolvedValue(mockActivePage),
      getParsedEditorContent: jest.fn().mockReturnValue({
        type: 'doc',
        content: [
          {
            type: 'paragraph',
            content: [{ type: 'text', text: 'Parsed content' }],
          },
        ],
      }),
      createPage: jest.fn().mockResolvedValue({}),
      updatePage: jest.fn().mockResolvedValue({}),
      deletePage: jest.fn().mockResolvedValue({}),
      reorderPages: jest.fn().mockResolvedValue({}),
      saveEditorContent: jest.fn().mockResolvedValue({}),
      checkHasDraft: jest.fn().mockResolvedValue(false),
      getDraft: jest.fn().mockResolvedValue(null),
    })

    render(
      <ModulePageCRUDProvider moduleId="module-123">
        <ModulePageView moduleId="module-123" pageId="page-123" />
      </ModulePageCRUDProvider>
    )

    // Verify header is rendered
    expect(screen.getByTestId('view-header')).toBeInTheDocument()
    expect(
      screen.getByText(/Module: module-123, Page: page-123/)
    ).toBeInTheDocument()

    // Verify content viewer is rendered
    expect(screen.getByTestId('rich-text-viewer')).toBeInTheDocument()

    // Verify edit button is rendered
    expect(screen.getByRole('button', { name: /edit/i })).toBeInTheDocument()
  })

  it('navigates to edit mode when edit button is clicked', () => {
    // Override useModulePageData untuk mengembalikan data modul yang diinginkan
    const useModulePageDataMock = jest.requireMock('../hooks/useModulePageData')
    useModulePageDataMock.useModulePageData.mockReturnValue({
      pagesQuery: {
        data: [mockActivePage],
        isLoading: false,
        error: null,
        refetch: jest.fn().mockResolvedValue({}),
      },
      getPage: jest.fn().mockResolvedValue(mockActivePage),
      getParsedEditorContent: jest.fn().mockReturnValue({
        type: 'doc',
        content: [
          {
            type: 'paragraph',
            content: [{ type: 'text', text: 'Parsed content' }],
          },
        ],
      }),
      createPage: jest.fn().mockResolvedValue({}),
      updatePage: jest.fn().mockResolvedValue({}),
      deletePage: jest.fn().mockResolvedValue({}),
      reorderPages: jest.fn().mockResolvedValue({}),
      saveEditorContent: jest.fn().mockResolvedValue({}),
      checkHasDraft: jest.fn().mockResolvedValue(false),
      getDraft: jest.fn().mockResolvedValue(null),
    })

    render(
      <ModulePageCRUDProvider moduleId="module-123">
        <ModulePageView moduleId="module-123" pageId="page-123" />
      </ModulePageCRUDProvider>
    )

    // Click the floating edit button
    fireEvent.click(screen.getByRole('button', { name: /edit/i }))

    // Verify router.push was called with the correct URL
    expect(mockPush).toHaveBeenCalledWith(
      '/manage-module/module-123?pageId=page-123&mode=edit'
    )
  })

  it('navigates to edit mode when header edit button is clicked', () => {
    // Override useModulePageData untuk mengembalikan data modul yang diinginkan
    const useModulePageDataMock = jest.requireMock('../hooks/useModulePageData')
    useModulePageDataMock.useModulePageData.mockReturnValue({
      pagesQuery: {
        data: [mockActivePage],
        isLoading: false,
        error: null,
        refetch: jest.fn().mockResolvedValue({}),
      },
      getPage: jest.fn().mockResolvedValue(mockActivePage),
      getParsedEditorContent: jest.fn().mockReturnValue({
        type: 'doc',
        content: [
          {
            type: 'paragraph',
            content: [{ type: 'text', text: 'Parsed content' }],
          },
        ],
      }),
      createPage: jest.fn().mockResolvedValue({}),
      updatePage: jest.fn().mockResolvedValue({}),
      deletePage: jest.fn().mockResolvedValue({}),
      reorderPages: jest.fn().mockResolvedValue({}),
      saveEditorContent: jest.fn().mockResolvedValue({}),
      checkHasDraft: jest.fn().mockResolvedValue(false),
      getDraft: jest.fn().mockResolvedValue(null),
    })

    render(
      <ModulePageCRUDProvider moduleId="module-123">
        <ModulePageView moduleId="module-123" pageId="page-123" />
      </ModulePageCRUDProvider>
    )

    // Click the edit button in the header
    fireEvent.click(screen.getByTestId('header-edit-button'))

    // Verify router.push was called with the correct URL
    expect(mockPush).toHaveBeenCalledWith(
      '/manage-module/module-123?pageId=page-123&mode=edit'
    )
  })

  it('passes correct content to RichTextViewer', () => {
    // Override useModulePageData untuk mengembalikan data modul yang diinginkan
    const mockGetParsedEditorContent = jest.fn().mockReturnValue({
      type: 'doc',
      content: [
        {
          type: 'paragraph',
          content: [{ type: 'text', text: 'Parsed content' }],
        },
      ],
    })

    const useModulePageDataMock = jest.requireMock('../hooks/useModulePageData')
    useModulePageDataMock.useModulePageData.mockReturnValue({
      pagesQuery: {
        data: [mockActivePage],
        isLoading: false,
        error: null,
        refetch: jest.fn().mockResolvedValue({}),
      },
      getPage: jest.fn().mockResolvedValue(mockActivePage),
      getParsedEditorContent: mockGetParsedEditorContent,
      createPage: jest.fn().mockResolvedValue({}),
      updatePage: jest.fn().mockResolvedValue({}),
      deletePage: jest.fn().mockResolvedValue({}),
      reorderPages: jest.fn().mockResolvedValue({}),
      saveEditorContent: jest.fn().mockResolvedValue({}),
      checkHasDraft: jest.fn().mockResolvedValue(false),
      getDraft: jest.fn().mockResolvedValue(null),
    })

    render(
      <ModulePageCRUDProvider moduleId="module-123">
        <ModulePageView moduleId="module-123" pageId="page-123" />
      </ModulePageCRUDProvider>
    )

    // Verify the parsed content is passed to RichTextViewer
    expect(screen.getByText(/Parsed content/)).toBeInTheDocument()
  })

  it('shows loading state when activePage is not available', () => {
    // Override useModulePageData untuk mengembalikan data modul null (loading)
    const useModulePageDataMock = jest.requireMock('../hooks/useModulePageData')
    useModulePageDataMock.useModulePageData.mockReturnValue({
      pagesQuery: {
        data: [],
        isLoading: true,
        error: null,
        refetch: jest.fn().mockResolvedValue({}),
      },
      getPage: jest.fn().mockResolvedValue(null),
      getParsedEditorContent: jest.fn().mockReturnValue({
        type: 'doc',
        content: [],
      }),
      createPage: jest.fn().mockResolvedValue({}),
      updatePage: jest.fn().mockResolvedValue({}),
      deletePage: jest.fn().mockResolvedValue({}),
      reorderPages: jest.fn().mockResolvedValue({}),
      saveEditorContent: jest.fn().mockResolvedValue({}),
      checkHasDraft: jest.fn().mockResolvedValue(false),
      getDraft: jest.fn().mockResolvedValue(null),
    })

    render(
      <ModulePageCRUDProvider moduleId="module-123">
        <ModulePageView moduleId="module-123" pageId="page-123" />
      </ModulePageCRUDProvider>
    )

    // Verify loading state is shown
    expect(screen.getByText('Loading...')).toBeInTheDocument()
  })
})
