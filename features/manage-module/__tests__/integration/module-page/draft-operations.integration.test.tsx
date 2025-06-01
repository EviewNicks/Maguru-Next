import { rest } from 'msw'
import { setupServer } from 'msw/node'
import { renderHook, act, waitFor } from '@testing-library/react'
import mockDraftPages from '../../__mocks__/mockDraftPages'
import { draftHandlers } from '../../__mocks__/mockDraftHandlers'
import { ModulePageStatus } from '../../../types/modulePageSchema'

// Setup mock server
const server = setupServer(...draftHandlers)

// Mocking modulePageAdapter
jest.mock('../../../adapters/modulePageAdapter', () => ({
  ...jest.requireActual('../../../adapters/modulePageAdapter'),
  saveDraft: jest.fn().mockImplementation(async (pageId, content, authorId) => {
    const response = await fetch(
      `/api/module/module-test-1/pages/${pageId}/draft`,
      {
        method: 'POST',
        body: JSON.stringify({ content, authorId }),
        headers: { 'Content-Type': 'application/json' },
      }
    )
    const data = await response.json()
    return data.data
  }),
  getDraft: jest.fn().mockImplementation(async (pageId) => {
    const response = await fetch(
      `/api/module/module-test-1/pages/${pageId}/draft`
    )
    const data = await response.json()
    return data.success ? data.data : null
  }),
  publishDraft: jest.fn().mockImplementation(async (pageId) => {
    const response = await fetch(
      `/api/module/module-test-1/pages/${pageId}/draft`,
      {
        method: 'PATCH',
      }
    )
    const data = await response.json()
    return data.success ? data.data : null
  }),
  discardDraft: jest.fn().mockImplementation(async (pageId) => {
    const response = await fetch(
      `/api/module/module-test-1/pages/${pageId}/draft`,
      {
        method: 'DELETE',
      }
    )
    return response.ok
  }),
}))

// Mock useRichTextAutosave hook
jest.mock('../../../hooks/useRichTextAutosave', () => ({
  __esModule: true,
  default: jest.fn().mockImplementation(({ onChange, onSave }) => {
    return {
      handleEditorChange: (content) => {
        onChange?.(content)
        onSave?.(content)
      },
      saveStatus: 'saved',
      lastSaved: new Date(),
      setSaveStatus: jest.fn(),
      forceSave: jest.fn().mockImplementation(() => onSave?.()),
    }
  }),
}))

describe('Draft Operations Integration Tests', () => {
  // Setup before tests
  beforeAll(() => {
    server.listen()
  })

  // Reset handlers after each test
  afterEach(() => {
    server.resetHandlers()
    jest.clearAllMocks()
  })

  // Close server after all tests
  afterAll(() => {
    server.close()
  })

  describe('Save Draft Operation', () => {
    it('should save draft successfully', async () => {
      const modulePageAdapter = require('../../../adapters/modulePageAdapter')
      const pageId = 'draft-page-1'
      const content = {
        type: 'doc',
        content: [
          {
            type: 'paragraph',
            content: [{ text: 'Konten draft baru', type: 'text' }],
          },
        ],
      }
      const authorId = 'test-user-id'

      // Execute save draft
      const result = await modulePageAdapter.saveDraft(
        pageId,
        content,
        authorId
      )

      // Assertions
      expect(result).toBeDefined()
      expect(result.isDraft).toBe(true)
      expect(result.hasUnpublishedChanges).toBe(true)
      expect(result.draftData).toEqual(content)
      expect(result.lastEditBy).toBe(authorId)
      expect(result.draftSavedAt).toBeDefined()
    })

    it('should return null when saving draft for non-existent page', async () => {
      const modulePageAdapter = require('../../../adapters/modulePageAdapter')

      // Setup error mock for non-existent page
      server.use(
        rest.post(
          '/api/module/:moduleId/pages/non-existent-page/draft',
          (req, res, ctx) => {
            return res(
              ctx.status(404),
              ctx.json({ success: false, message: 'Halaman tidak ditemukan' })
            )
          }
        )
      )

      // Execute save draft for non-existent page
      const result = await modulePageAdapter.saveDraft(
        'non-existent-page',
        {},
        'test-user-id'
      )

      // Assertions
      expect(result).toBeNull()
    })
  })

  describe('Get Draft Operation', () => {
    it('should get draft successfully', async () => {
      const modulePageAdapter = require('../../../adapters/modulePageAdapter')
      const pageId = 'draft-page-2' // This page has a draft in the mock

      // Execute get draft
      const result = await modulePageAdapter.getDraft(pageId)

      // Assertions
      expect(result).toBeDefined()
      expect(result.isDraft).toBe(true)
      expect(result.hasUnpublishedChanges).toBe(true)
      expect(result.draftData).toBeDefined()
      expect(result.draftSavedAt).toBeDefined()
    })

    it('should return null when getting draft for page without draft', async () => {
      const modulePageAdapter = require('../../../adapters/modulePageAdapter')

      // Mock to return 404 for page without draft
      server.use(
        rest.get(
          '/api/module/:moduleId/pages/page-without-draft/draft',
          (req, res, ctx) => {
            return res(
              ctx.status(404),
              ctx.json({
                success: false,
                message: 'Tidak ada draft untuk halaman ini',
              })
            )
          }
        )
      )

      // Execute get draft
      const result = await modulePageAdapter.getDraft('page-without-draft')

      // Assertions
      expect(result).toBeNull()
    })
  })

  describe('Publish Draft Operation', () => {
    it('should publish draft successfully', async () => {
      const modulePageAdapter = require('../../../adapters/modulePageAdapter')
      const pageId = 'draft-page-2' // This page has a draft in the mock

      // Execute publish draft
      const result = await modulePageAdapter.publishDraft(pageId)

      // Assertions
      expect(result).toBeDefined()
      expect(result.isDraft).toBe(false)
      expect(result.hasUnpublishedChanges).toBe(false)
      expect(result.draftData).toBeNull()
      expect(result.status).toBe(ModulePageStatus.PUBLISHED)
      expect(result.version).toBe(2) // Version incremented
      expect(result.content).toEqual(mockDraftPages[1].draftData) // Content should now be the former draft content
    })

    it('should return null when publishing non-existent draft', async () => {
      const modulePageAdapter = require('../../../adapters/modulePageAdapter')

      // Mock for non-existent draft
      server.use(
        rest.patch(
          '/api/module/:moduleId/pages/page-without-draft/draft',
          (req, res, ctx) => {
            return res(
              ctx.status(400),
              ctx.json({
                success: false,
                message: 'Tidak ada draft untuk dipublikasikan',
              })
            )
          }
        )
      )

      // Execute publish draft
      const result = await modulePageAdapter.publishDraft('page-without-draft')

      // Assertions
      expect(result).toBeNull()
    })
  })

  describe('Discard Draft Operation', () => {
    it('should discard draft successfully', async () => {
      const modulePageAdapter = require('../../../adapters/modulePageAdapter')
      const pageId = 'draft-page-2' // This page has a draft in the mock

      // Execute discard draft
      const result = await modulePageAdapter.discardDraft(pageId)

      // Assertions
      expect(result).toBe(true)
    })

    it('should return false when discarding draft for non-existent page', async () => {
      const modulePageAdapter = require('../../../adapters/modulePageAdapter')

      // Mock for non-existent page
      server.use(
        rest.delete(
          '/api/module/:moduleId/pages/non-existent-page/draft',
          (req, res, ctx) => {
            return res(
              ctx.status(404),
              ctx.json({ success: false, message: 'Halaman tidak ditemukan' })
            )
          }
        )
      )

      // Execute discard draft
      const result = await modulePageAdapter.discardDraft('non-existent-page')

      // Assertions
      expect(result).toBe(false)
    })
  })
})
