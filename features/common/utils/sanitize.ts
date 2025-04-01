import DOMPurify from 'isomorphic-dompurify'

/**
 * Sanitizes HTML content to prevent XSS attacks
 * @param content Content to sanitize (string or undefined)
 * @returns Sanitized HTML content
 */
export const sanitizeHtml = (content: string | undefined | null): string => {
  if (!content) return ''
  return DOMPurify.sanitize(content)
}

/**
 * Sanitizes markup content to be used in dangerouslySetInnerHTML
 * @param content Content to sanitize
 * @returns Object with __html property containing sanitized content
 */
export const sanitizedMarkup = (content: string | undefined | null) => {
  return { __html: sanitizeHtml(content) }
}

/**
 * Configure DOMPurify with specific options
 * This should be called during application initialization
 */
export const configureDOMPurify = () => {
  // Configure DOMPurify options globally
  // You can add custom options here
  DOMPurify.setConfig({
    ADD_ATTR: ['target'], // Allow target attribute for links
    FORBID_TAGS: ['script', 'style', 'iframe'], // Block these tags
    FORBID_ATTR: ['onerror', 'onload', 'onclick'], // Block these attributes
  })
}
