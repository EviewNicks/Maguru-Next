import { render, screen, act } from '@testing-library/react'
import { RichTextEditor } from './RichTextEditor'
import { useEditor } from '@tiptap/react'
import React from 'react'

// Mock untuk stylesheet
jest.mock('@/styles/tiptap.css', () => ({}))

// Mock tiptap
jest.mock('@tiptap/react', () => {
  const original = jest.requireActual('../__tests__/__mocks__/tiptap.tsx')
  return original
})

// Mock extensions
jest.mock('@tiptap/extension-placeholder', () => {
  const original = jest.requireActual('../__tests__/__mocks__/tiptap.tsx')
  return original.Placeholder
})

jest.mock('@tiptap/extension-underline', () => {
  const original = jest.requireActual('../__tests__/__mocks__/tiptap.tsx')
  return original.Underline
})

jest.mock('@tiptap/extension-text-align', () => {
  const original = jest.requireActual('../__tests__/__mocks__/tiptap.tsx')
  return original.TextAlign
})

jest.mock('@tiptap/extension-image', () => {
  const original = jest.requireActual('../__tests__/__mocks__/tiptap.tsx')
  return original.Image
})

jest.mock('@tiptap/extension-link', () => {
  const original = jest.requireActual('../__tests__/__mocks__/tiptap.tsx')
  return original.Link
})

jest.mock('@tiptap/extension-color', () => {
  const original = jest.requireActual('../__tests__/__mocks__/tiptap.tsx')
  return original.Color
})

jest.mock('@tiptap/extension-text-style', () => {
  const original = jest.requireActual('../__tests__/__mocks__/tiptap.tsx')
  return original.TextStyle
})

jest.mock('@tiptap/extension-highlight', () => {
  const original = jest.requireActual('../__tests__/__mocks__/tiptap.tsx')
  return original.Highlight
})

jest.mock('@tiptap/starter-kit', () => {
  const original = jest.requireActual('../__tests__/__mocks__/tiptap.tsx')
  return original.StarterKit
})

// Mock komponen terkait extension ModulePageEditor
jest.mock('./ModulePageEditor/extension/Image', () => ({
  ImageExtension: {},
}))

jest.mock('./ModulePageEditor/extension/ImagePlaceholder', () => ({
  ImagePlaceholder: {},
}))

jest.mock('./ModulePageEditor/extension/SearchAndReplace', () => ({
  __esModule: true,
  default: {},
}))

jest.mock('./ModulePageEditor/extension/FloatingMenu', () => ({
  TipTapFloatingMenu: () => null,
}))

jest.mock('./ModulePageEditor/extension/FloatingToolbar', () => ({
  FloatingToolbar: () => null,
}))

jest.mock('./ModulePageEditor/toolbars/EditorToolbar', () => ({
  EditorToolbar: () => null,
}))

jest.mock('@/lib/utils', () => ({
  cn: (...args: string[]) => args.filter(Boolean).join(' '),
}))

jest.mock('@/features/manage-module/lib/content', () => ({
  content: '<p>Default content from mock</p>',
}))

describe('RichTextEditor', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should render the editor with default content', () => {
    render(<RichTextEditor />)

    // Verify TipTap editor is rendered
    expect(screen.getByTestId('mock-editor-content')).toBeInTheDocument()
    expect(screen.getByText('TipTap Editor Content')).toBeInTheDocument()
  })

  it('should initialize editor with provided content', () => {
    const mockContent = '<p>Initial content</p>'
    const mockSetContent = jest.fn()

    // Override the mock implementation for this test
    const mockGetHTML = jest.fn(() => mockContent)
    const mockSetEditable = jest.fn()
    const mockFocus = jest.fn()
    const mockSetContentFn = jest.fn()

    ;(useEditor as jest.Mock).mockImplementationOnce(() => ({
      isEmpty: jest.fn(() => false),
      getHTML: mockGetHTML,
      setEditable: mockSetEditable,
      commands: {
        focus: mockFocus,
        setContent: mockSetContentFn,
      },
      chain: () => ({
        focus: () => ({
          run: jest.fn(),
        }),
      }),
    }))

    render(
      <RichTextEditor initialContent={mockContent} onChange={mockSetContent} />
    )

    // Verify editor initialization
    expect(useEditor).toHaveBeenCalled()
    expect(screen.getByTestId('mock-editor-content')).toBeInTheDocument()
  })

  it('should call onChange when content changes', () => {
    const mockContent = '<p>Test content</p>'
    const mockSetContent = jest.fn()

    // Create a mock editor with a getHTML method that returns our content
    const mockGetHTML = jest.fn(() => mockContent)
    const mockIsEmpty = jest.fn(() => false)

    // Use the mock implementation
    ;(useEditor as jest.Mock).mockImplementation(() => ({
      isEmpty: mockIsEmpty,
      getHTML: mockGetHTML,
      setEditable: jest.fn(),
      commands: {
        focus: jest.fn(),
        setContent: jest.fn(),
      },
      chain: () => ({
        focus: () => ({
          run: jest.fn(),
        }),
      }),
    }))

    // Render the component with our mock functions
    render(
      <RichTextEditor initialContent={mockContent} onChange={mockSetContent} />
    )

    // Simulate a content change by manually triggering the useEffect that runs when editor changes
    act(() => {
      // Get the onUpdate function from the last call to useEditor
      const editorConfig = (useEditor as jest.Mock).mock.calls[
        (useEditor as jest.Mock).mock.calls.length - 1
      ][0]
      // Call onUpdate to simulate content change
      if (editorConfig.onUpdate) {
        editorConfig.onUpdate({
          editor: {
            isEmpty: mockIsEmpty,
            getHTML: mockGetHTML,
          },
        })
      }
    })

    // Verify onChange was called with the correct content
    expect(mockSetContent).toHaveBeenCalledWith(mockContent)
  })

  // Simplify the last test to just verify that useEditor is called with the correct initialContent
  it('should pass initialContent to useEditor', () => {
    const initialContent = '<p>Initial content</p>'
    const mockSetContent = jest.fn()

    // Reset the useEditor mock before testing
    ;(useEditor as jest.Mock).mockClear()

    render(
      <RichTextEditor
        initialContent={initialContent}
        onChange={mockSetContent}
      />
    )

    // Verify that useEditor was called with the correct initialContent
    expect(useEditor).toHaveBeenCalledWith(
      expect.objectContaining({
        content: initialContent,
      })
    )
  })
})
