import React from 'react'

// Definisi tipe dasar
interface EditorOptions {
  onUpdate?: (props: { editor: MockEditor }) => void
  content?: StandardEditorContent | null
  extensions?: unknown[]
  [key: string]: unknown
}

// Definisikan tipe StandardEditorContent untuk mock
interface StandardEditorContent {
  type: string
  content: unknown[]
}

// Mock untuk Node yang digunakan oleh extension
const Node = {
  create: jest.fn().mockImplementation((config) => {
    return {
      ...config,
      // Tambahkan properti yang mungkin diakses oleh kode
      config,
      name: config.name || 'mock-node',
    }
  }),
}

// Mock Editor class
class MockEditor {
  constructor() {
    // Implementasi minimal
  }

  commands = {
    focus: () => this,
    blur: () => this,
    clearContent: () => this,
    setContent: jest.fn(),
    setEditable: jest.fn(),
  }

  isActive = jest.fn().mockReturnValue(false)
  getJSON = jest.fn().mockReturnValue({ type: 'doc', content: [] })
  getHTML = jest.fn().mockReturnValue('<p></p>')
  destroy = jest.fn()
  setEditable = jest.fn()
}

// Mock EditorContent component
const EditorContent: React.FC<{
  editor: MockEditor | null
  className?: string
}> = ({ editor, className }) => (
  <div data-testid="editor-content" className={className}>
    {editor ? 'Editor Content' : 'No Editor'}
  </div>
)

// Mock useEditor hook
const useEditor = (options: EditorOptions = {}) => {
  const [editor] = React.useState(() => new MockEditor())

  React.useEffect(() => {
    if (options.onUpdate) {
      options.onUpdate({ editor })
    }
    return () => {
      editor.destroy()
    }
  }, [editor, options])

  return editor
}

// Mock useCurrentEditor hook
const useCurrentEditor = () => {
  return { editor: new MockEditor() }
}

// Mock EditorProvider component
const EditorProvider: React.FC<{
  children?: React.ReactNode
  extensions?: unknown[]
  content?: StandardEditorContent | null
  slotBefore?: React.ReactNode
  slotAfter?: React.ReactNode
}> = ({ children, slotBefore, slotAfter }) => {
  return (
    <div data-testid="editor-provider">
      {slotBefore}
      <div data-testid="editor-content">Editor Content</div>
      {children}
      {slotAfter}
    </div>
  )
}

// Mock FloatingMenu component
const FloatingMenu: React.FC<{
  editor: MockEditor | null
  children?: React.ReactNode
}> = ({ children }) => <div data-testid="floating-menu">{children}</div>

// Mock BubbleMenu component
const BubbleMenu: React.FC<{
  editor: MockEditor | null
  children?: React.ReactNode
}> = ({ children }) => <div data-testid="bubble-menu">{children}</div>

// Mock extensions
const Color = { configure: () => ({}) }
const Highlight = { configure: () => ({}) }
const Link = {}
const Subscript = {}
const Superscript = {}
const TextAlign = { configure: () => ({}) }
const TextStyle = {}
const Typography = {}
const Underline = {}
const StarterKit = { configure: () => ({}) }
const Placeholder = { configure: () => ({}) }

// Mock extension/Image
const ImageExtension = {}

// Mock extension/ImagePlaceholder
// Sekarang kita sudah menambahkan Node.create, ImagePlaceholder bisa dibuat dengan benar
const ImagePlaceholder = {
  name: 'image-placeholder-mock',
  configure: () => ({}),
}

// Mock extension/SearchAndReplace
const SearchAndReplace = {}

// Mock untuk komponen toolbar dan menu
const EditorToolbar = () => (
  <div data-testid="editor-toolbar">Editor Toolbar</div>
)
const TipTapFloatingMenu = () => (
  <div data-testid="floating-menu">Floating Menu</div>
)
const FloatingToolbar = () => (
  <div data-testid="floating-toolbar">Floating Toolbar</div>
)

// Export semua mock component dan class
export {
  MockEditor as Editor,
  EditorContent,
  useEditor,
  useCurrentEditor,
  EditorProvider,
  FloatingMenu,
  BubbleMenu,
  Color,
  Highlight,
  Link,
  Subscript,
  Superscript,
  TextAlign,
  TextStyle,
  Typography,
  Underline,
  StarterKit,
  Placeholder,
  ImageExtension,
  ImagePlaceholder,
  SearchAndReplace,
  EditorToolbar,
  TipTapFloatingMenu,
  FloatingToolbar,
  // Export Node juga untuk memperbaiki referensi di ImagePlaceholder.tsx
  Node,
}

// Default export
export default {
  Editor: MockEditor,
  EditorContent,
  useEditor,
  useCurrentEditor,
  EditorProvider,
  FloatingMenu,
  BubbleMenu,
  Color,
  Highlight,
  Link,
  Subscript,
  Superscript,
  TextAlign,
  TextStyle,
  Typography,
  Underline,
  StarterKit,
  Placeholder,
  ImageExtension,
  ImagePlaceholder,
  SearchAndReplace,
  EditorToolbar,
  TipTapFloatingMenu,
  FloatingToolbar,
  Node,
}
