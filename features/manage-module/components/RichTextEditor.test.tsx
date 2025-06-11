import React from 'react'
import { render, screen, act, waitFor } from '@testing-library/react'
import '@testing-library/jest-dom'
import { RichTextEditor } from './RichTextEditor'

// Mock ModulePageCRUDContext
jest.mock('../context/ModulePageCRUDContext', () => {
  const mockHandleEditorChange = jest.fn()

  return {
    useModulePageCRUDContext: () => ({
      activePage: {
        id: 'page-123',
        content: { type: 'doc', content: [] },
      },
      handleEditorChange: mockHandleEditorChange,
      getParsedEditorContent: jest.fn(),
    }),
  }
})

// Mock Next.js hooks
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
    back: jest.fn(),
    forward: jest.fn(),
  }),
}))

// Mock ErrorBoundary
jest.mock('./ErrorBoundary', () => ({
  ErrorBoundary: ({ children, fallback }) => {
    return <div data-testid="error-boundary">{children}</div>
  },
}))

// Mock komponen yang diimpor oleh RichTextEditor
jest.mock('../components/ModulePageEditor/toolbars/EditorToolbar', () => ({
  EditorToolbar: () => <div data-testid="editor-toolbar">Editor Toolbar</div>,
}))

jest.mock('../components/ModulePageEditor/extension/FloatingMenu', () => ({
  TipTapFloatingMenu: () => (
    <div data-testid="floating-menu">Floating Menu</div>
  ),
}))

jest.mock('../components/ModulePageEditor/extension/FloatingToolbar', () => ({
  FloatingToolbar: () => (
    <div data-testid="floating-toolbar">Floating Toolbar</div>
  ),
}))

// Mock Editor dan EditorContent dari @tiptap/react
jest.mock('@tiptap/react', () => {
  const MockEditor = jest.fn().mockImplementation(() => ({
    commands: {
      setContent: jest.fn(),
    },
    getJSON: jest.fn().mockReturnValue({ type: 'doc', content: [] }),
    destroy: jest.fn(),
  }))

  return {
    Editor: MockEditor,
    EditorContent: ({ editor }) => (
      <div data-testid="editor-content">
        {editor ? 'Editor Content' : 'Loading Editor...'}
      </div>
    ),
    useEditor: () => MockEditor(),
  }
})

// Mock extensions
jest.mock('@tiptap/extension-color', () => ({
  Color: { configure: () => ({}) },
}))
jest.mock('@tiptap/extension-highlight', () => ({
  __esModule: true,
  default: { configure: () => ({}) },
}))
jest.mock('@tiptap/extension-link', () => ({ __esModule: true, default: {} }))
jest.mock('@tiptap/extension-subscript', () => ({
  __esModule: true,
  default: {},
}))
jest.mock('@tiptap/extension-superscript', () => ({
  __esModule: true,
  default: {},
}))
jest.mock('@tiptap/extension-text-align', () => ({
  __esModule: true,
  default: { configure: () => ({}) },
}))
jest.mock('@tiptap/extension-text-style', () => ({
  __esModule: true,
  default: {},
}))
jest.mock('@tiptap/extension-typography', () => ({
  __esModule: true,
  default: {},
}))
jest.mock('@tiptap/extension-underline', () => ({
  __esModule: true,
  default: {},
}))
jest.mock('@tiptap/starter-kit', () => ({
  __esModule: true,
  default: { configure: () => ({}) },
}))
jest.mock('@tiptap/extension-placeholder', () => ({
  __esModule: true,
  default: { configure: () => ({}) },
}))

// Mock custom extensions
jest.mock('../components/ModulePageEditor/extension/Image', () => ({
  ImageExtension: {},
}))
jest.mock('../components/ModulePageEditor/extension/ImagePlaceholder', () => ({
  ImagePlaceholder: {},
}))
jest.mock('../components/ModulePageEditor/extension/SearchAndReplace', () => ({
  __esModule: true,
  default: {},
}))

// Mock untuk Lucide-React icons
jest.mock('lucide-react', () => ({
  AlertTriangle: () => <div data-testid="alert-icon" />,
  RefreshCw: () => <div data-testid="refresh-icon" />,
  Loader2: () => <div data-testid="loader-icon" />,
}))

// Mock untuk Button dari UI
jest.mock('@/components/ui/button', () => ({
  Button: ({ children, onClick }) => (
    <button data-testid="ui-button" onClick={onClick}>
      {children}
    </button>
  ),
}))

describe('RichTextEditor', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('renders loading state when editor is not initialized', () => {
    render(<RichTextEditor />)

    expect(screen.getByTestId('editor-content')).toBeInTheDocument()
  })

  it('initializes editor with correct content from props', async () => {
    const initialContent = {
      type: 'doc',
      content: [
        {
          type: 'paragraph',
          content: [{ type: 'text', text: 'Test content' }],
        },
      ],
    }
    const onEditorReady = jest.fn()

    render(
      <RichTextEditor
        initialContent={initialContent}
        onEditorReady={onEditorReady}
      />
    )

    // Verify onEditorReady callback was called
    await waitFor(() => {
      expect(onEditorReady).toHaveBeenCalled()
    })
  })

  it('calls onChange prop when content changes', async () => {
    const onChange = jest.fn()

    render(<RichTextEditor onChange={onChange} pageId="page-123" />)

    // Simulate editor update
    await waitFor(() => {
      const { Editor } = require('@tiptap/react')
      const editorInstance = (Editor as jest.Mock).mock.results[0].value
      const onUpdateCallback = (Editor as jest.Mock).mock.calls[0][0].onUpdate

      act(() => {
        onUpdateCallback({ editor: editorInstance })
      })

      expect(onChange).toHaveBeenCalled()
    })
  })

  it('renders editor UI components when editor is initialized', async () => {
    render(<RichTextEditor />)

    // Wait for editor to be initialized
    await waitFor(() => {
      expect(screen.getByTestId('editor-content')).toBeInTheDocument()
      expect(screen.getByTestId('editor-toolbar')).toBeInTheDocument()
      expect(screen.getByTestId('floating-menu')).toBeInTheDocument()
      expect(screen.getByTestId('floating-toolbar')).toBeInTheDocument()
    })
  })

  it('destroys editor on unmount', async () => {
    const { unmount } = render(<RichTextEditor />)

    // Wait for editor to be initialized
    await waitFor(() => {
      expect(screen.getByTestId('editor-content')).toBeInTheDocument()
    })

    // Get the mock editor instance
    const { Editor } = require('@tiptap/react')
    const editorInstance = (Editor as jest.Mock).mock.results[0].value

    // Unmount component
    unmount()

    // Verify editor.destroy was called
    expect(editorInstance.destroy).toHaveBeenCalled()
  })

  it('handles errors gracefully', async () => {
    // Mock console.error to suppress expected error messages
    jest.spyOn(console, 'error').mockImplementation(() => {})

    // Mock Editor constructor to throw an error
    const { Editor } = require('@tiptap/react')
    ;(Editor as jest.Mock).mockImplementationOnce(() => {
      throw new Error('Editor initialization failed')
    })

    render(<RichTextEditor />)

    // Editor should still render without crashing
    expect(screen.getByTestId('error-boundary')).toBeInTheDocument()

    // Restore console.error
    jest.restoreAllMocks()
  })
})
