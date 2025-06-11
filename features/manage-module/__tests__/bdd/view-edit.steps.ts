import { loadFeature, defineFeature } from 'jest-cucumber'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import '@testing-library/jest-dom'
import { ModulePageView } from '../../components/ModulePageView'
import { ModulePageEdit } from '../../components/ModulePageEdit'
import { ModulePageCRUDProvider } from '../../context/ModulePageCRUDContext'
import { ModulePage, ModulePageStatus } from '../../types'

// Mock useRouter
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

// Mock useClerk
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
jest.mock('../../hooks/useModulePageData', () => ({
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

// Mock RichTextViewer and RichTextEditor
jest.mock('../../components/RichTextViewer', () => ({
  RichTextViewer: (props: { content: any; isLoading?: boolean }) => (
    <div data-testid="rich-text-viewer">
      <div>Rich Text Viewer</div>
      <pre data-testid="viewer-content">{JSON.stringify(props.content)}</pre>
    </div>
  ),
}))

jest.mock('../../components/RichTextEditor', () => ({
  RichTextEditor: (props: { pageId?: string; onEditorReady?: any }) => (
    <div data-testid="rich-text-editor">
      <div>Rich Text Editor</div>
      <button data-testid="mock-editor-ready" onClick={() => props.onEditorReady?.({
        getJSON: () => ({ type: 'doc', content: [{ type: 'paragraph', content: [{ type: 'text', text: 'Updated content' }] }] }),
        commands: { setContent: jest.fn() },
        setEditable: jest.fn(),
      })}>
        Simulate Editor Ready
      </button>
    </div>
  ),
}))

// Mock ViewHeader and EditHeader components
jest.mock('../../components/ModulePageEditor/document/ViewHeader', () => ({
  ViewHeader: (props: { moduleId: string; pageId: string; onSwitchToEdit: () => void }) => (
    <div data-testid="view-header">
      View Header (Module: {props.moduleId}, Page: {props.pageId})
      <button onClick={props.onSwitchToEdit} data-testid="header-edit-button">
        Edit from Header
      </button>
    </div>
  ),
}))

jest.mock('../../components/ModulePageEditor/document/EditHeader', () => ({
  EditHeader: (props: { moduleId: string; pageId: string; onSwitchToView: () => void }) => (
    <div data-testid="edit-header">
      Edit Header (Module: {props.moduleId}, Page: {props.pageId})
      <button onClick={props.onSwitchToView} data-testid="save-button">
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

// Load feature file
const feature = loadFeature('./features/manage-module/__tests__/bdd/ops-140-view-edit.feature')

defineFeature(feature, (test) => {
  // Mock data
  const mockActivePage: ModulePage = {
    id: 'page-456',
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

  // Create mock context with active page
  const setupMockContext = () => {
    const useModulePageDataMock = jest.requireMock('../../hooks/useModulePageData')
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
  }

  // Reset mocks before each test
  beforeEach(() => {
    jest.clearAllMocks()
    setupMockContext()
  })

  test('Melihat halaman modul', ({ given, and, when, then }) => {
    let moduleId: string
    let pageId: string

    given(/^saya berada di halaman modul dengan ID "(.*)"$/, (id) => {
      moduleId = id
    })

    and(/^halaman memiliki pageId "(.*)"$/, (id) => {
      pageId = id
    })

    when(/^halaman dimuat dengan mode "(.*)"$/, (mode) => {
      render(
        <ModulePageCRUDProvider moduleId={moduleId}>
          <ModulePageView moduleId={moduleId} pageId={pageId} />
        </ModulePageCRUDProvider>
      )
    })

    then(/^saya melihat konten halaman dalam format yang mudah dibaca$/, () => {
      expect(screen.getByTestId('rich-text-viewer')).toBeInTheDocument()
      expect(screen.getByText(/Rich Text Viewer/)).toBeInTheDocument()
    })

    and(/^saya melihat tombol edit di sudut kanan bawah$/, () => {
      expect(screen.getByRole('button', { name: /edit/i })).toBeInTheDocument()
    })
  })

  test('Mengedit halaman modul', ({ given, and, when, then }) => {
    let moduleId: string
    let pageId: string

    given(/^saya berada di halaman modul dengan ID "(.*)"$/, (id) => {
      moduleId = id
    })

    and(/^halaman memiliki pageId "(.*)"$/, (id) => {
      pageId = id
    })

    when(/^saya mengklik tombol edit$/, () => {
      render(
        <ModulePageCRUDProvider moduleId={moduleId}>
          <ModulePageView moduleId={moduleId} pageId={pageId} />
        </ModulePageCRUDProvider>
      )
      fireEvent.click(screen.getByRole('button', { name: /edit/i }))
    })

    then(/^URL berubah ke mode "(.*)"$/, (mode) => {
      expect(mockPush).toHaveBeenCalledWith(
        `/manage-module/${moduleId}?pageId=${pageId}&mode=${mode}`
      )
    })

    and(/^saya melihat editor rich text dengan toolbar$/, () => {
      // Render Edit component to check this step
      render(
        <ModulePageCRUDProvider moduleId={moduleId}>
          <ModulePageEdit moduleId={moduleId} pageId={pageId} />
        </ModulePageCRUDProvider>
      )
      expect(screen.getByTestId('rich-text-editor')).toBeInTheDocument()
    })

    and(/^saya melihat tombol save di sudut kanan bawah$/, () => {
      expect(screen.getByTestId('save-button')).toBeInTheDocument()
    })
  })

  test('Menyimpan perubahan dan kembali ke mode view', ({ given, when, and, then }) => {
    const moduleId = 'module-123'
    const pageId = 'page-456'
    const mockSavePage = jest.fn().mockResolvedValue({})

    given(/^saya berada di halaman modul dalam mode edit$/, () => {
      // Mock savePage function
      const useModulePageDataMock = jest.requireMock('../../hooks/useModulePageData')
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
        savePage: mockSavePage,
      })

      render(
        <ModulePageCRUDProvider moduleId={moduleId}>
          <ModulePageEdit moduleId={moduleId} pageId={pageId} />
        </ModulePageCRUDProvider>
      )
    })

    when(/^saya membuat perubahan pada konten$/, () => {
      // Simulate editor ready
      fireEvent.click(screen.getByTestId('mock-editor-ready'))
    })

    and(/^saya mengklik tombol save$/, async () => {
      fireEvent.click(screen.getByTestId('save-button'))
      await waitFor(() => expect(mockSavePage).toHaveBeenCalled())
    })

    then(/^perubahan disimpan ke server$/, () => {
      expect(mockSavePage).toHaveBeenCalledWith({
        pageId,
        content: expect.objectContaining({
          type: 'doc',
          content: expect.any(Array),
        }),
      })
    })

    and(/^URL berubah ke mode "(.*)"$/, (mode) => {
      expect(mockPush).toHaveBeenCalledWith(
        `/manage-module/${moduleId}?pageId=${pageId}&mode=${mode}`
      )
    })

    and(/^saya melihat notifikasi sukses$/, () => {
      const toast = require('sonner').toast
      expect(toast.success).toHaveBeenCalled()
    })

    and(/^saya melihat konten yang diperbarui dalam mode view$/, () => {
      // Render view mode to check updated content
      render(
        <ModulePageCRUDProvider moduleId={moduleId}>
          <ModulePageView moduleId={moduleId} pageId={pageId} />
        </ModulePageCRUDProvider>
      )
      expect(screen.getByTestId('rich-text-viewer')).toBeInTheDocument()
    })
  })
}) 