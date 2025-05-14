import React from 'react'

// Mock for useEditor hook
export const useEditor = jest.fn(() => ({
  isEmpty: jest.fn(() => false),
  getHTML: jest.fn(() => '<p>Mocked content</p>'),
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

// Mock for EditorContent component
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const EditorContent = ({ editor }: { editor: any }) => (
  <div data-testid="mock-editor-content">
    <div>TipTap Editor Content</div>
    <div data-testid="editor-html">
      {editor?.getHTML ? editor.getHTML() : '<p>Default mock content</p>'}
    </div>
  </div>
)

// Helper untuk membuat mock extension dengan configure method
const createExtensionMock = (name: string) => {
  const extensionMock = jest.fn(() => ({
    name,
  }))

  extensionMock.configure = jest.fn(() => ({
    name,
    options: {},
  }))

  return extensionMock
}

// Mock for Extensions
export const StarterKit = createExtensionMock('starterKit')
export const Placeholder = createExtensionMock('placeholder')
export const Underline = createExtensionMock('underline')
export const TextAlign = createExtensionMock('textAlign')
export const Image = createExtensionMock('image')
export const Link = createExtensionMock('link')
export const Color = createExtensionMock('color')
export const TextStyle = createExtensionMock('textStyle')
export const Highlight = createExtensionMock('highlight')
export const Typography = createExtensionMock('typography')
export const Subscript = createExtensionMock('subscript')
export const Superscript = createExtensionMock('superscript')

export default {
  useEditor,
  EditorContent,
  StarterKit,
  Placeholder,
  Underline,
  TextAlign,
  Image,
  Link,
  Color,
  TextStyle,
  Highlight,
  Typography,
  Subscript,
  Superscript,
}
