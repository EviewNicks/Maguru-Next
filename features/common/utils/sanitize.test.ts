import { sanitizeHtml, sanitizedMarkup } from './sanitize'
import DOMPurify from 'isomorphic-dompurify'

// Mock DOMPurify
jest.mock('isomorphic-dompurify', () => ({
  sanitize: jest.fn((content) => `sanitized:${content}`),
  setConfig: jest.fn(),
}))

describe('sanitize utils', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('sanitizeHtml', () => {
    it('should return empty string for null or undefined input', () => {
      expect(sanitizeHtml(null)).toBe('')
      expect(sanitizeHtml(undefined)).toBe('')
    })

    it('should sanitize HTML content', () => {
      const content = '<script>alert("XSS")</script>'
      sanitizeHtml(content)
      expect(DOMPurify.sanitize).toHaveBeenCalledWith(content)
    })
  })

  describe('sanitizedMarkup', () => {
    it('should return object with __html property', () => {
      const content = '<script>alert("XSS")</script>'
      const result = sanitizedMarkup(content)
      expect(result).toHaveProperty('__html')
      expect(DOMPurify.sanitize).toHaveBeenCalledWith(content)
    })

    it('should handle null or undefined input', () => {
      expect(sanitizedMarkup(null)).toEqual({ __html: '' })
      expect(sanitizedMarkup(undefined)).toEqual({ __html: '' })
    })
  })
})
