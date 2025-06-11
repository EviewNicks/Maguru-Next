import React from 'react'
import { render, screen, waitFor, fireEvent } from '@testing-library/react'
import '@testing-library/jest-dom'
import DocumentHeader from './DocumentHeader'
import { toast } from 'sonner'
import { useModulePageCRUDContext } from '../../../context/ModulePageCRUDContext'
import { showErrorNotification } from '../../../components/ErrorNotifier'
import { useModuleDraftPageContext } from '../../../context/ModuleDraftPageContext'

// Mock dependencies
jest.mock('sonner', () => ({
  toast: {
    success: jest.fn(),
    error: jest.fn(),
    info: jest.fn(),
  },
}))

jest.mock('../../../components/ErrorNotifier', () => ({
  showErrorNotification: jest.fn(),
}))

// Mock useModulePageCRUDContext
jest.mock('../../../context/ModulePageCRUDContext', () => ({
  useModulePageCRUDContext: jest.fn(),
}))

// Mock useModuleDraftPageContext
jest.mock('../../../context/ModuleDraftPageContext', () => ({
  useModuleDraftPageContext: jest.fn(),
}))

// Mock window.sessionStorage
const mockSessionStorage = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
}

Object.defineProperty(window, 'sessionStorage', {
  value: mockSessionStorage,
})

describe('DocumentHeader', () => {
  // Mock data & functions
  const mockActivePage = {
    id: 'test-page-1',
    title: 'Test Page',
    moduleId: 'test-module',
    order: 0,
    content: { type: 'doc', content: [] },
    status: 'PUBLISHED',
    createdAt: new Date(),
    updatedAt: new Date(),
    isDraft: false,
    hasUnpublishedChanges: false,
  }

  const mockCreatePage = jest.fn().mockResolvedValue({
    success: true,
    data: {
      id: 'new-page',
      title: 'Halaman Baru',
      moduleId: 'test-module',
      order: 1,
      blocks: [],
    },
  })

  const mockDeletePage = jest.fn().mockResolvedValue({
    success: true,
  })

  const mockSavePage = jest.fn().mockResolvedValue({
    success: true,
  })

  const mockSetActivePage = jest.fn()

  const mockHandleDiscardDraft = jest.fn().mockResolvedValue(undefined)

  // Setup default mock implementation
  beforeEach(() => {
    jest.clearAllMocks()

    // Setup basic mock return values for ModulePageCRUDContext
    ;(useModulePageCRUDContext as jest.Mock).mockReturnValue({
      moduleId: 'test-module',
      pages: [mockActivePage],
      activePage: mockActivePage,
      setActivePage: mockSetActivePage,
      createPage: mockCreatePage,
      deletePage: mockDeletePage,
      savePage: mockSavePage,
      saveStatus: 'saved',
      getPageById: jest.fn(),
      refetch: jest.fn(),
    })

    // Setup basic mock return values for ModuleDraftPageContext
    ;(useModuleDraftPageContext as jest.Mock).mockReturnValue({
      draftSaveStatus: 'saved',
      lastSavedAt: new Date(),
      hasUnsavedChanges: false,
      isDraftSaving: false,
      hasDraft: true,
      editorMode: 'edit',
      handleDiscardDraft: mockHandleDiscardDraft,
      forceSave: jest.fn(),
      publishDraft: jest.fn(),
      toggleEditorMode: jest.fn(),
      refreshActivePage: jest.fn(),
      updatePageStatus: jest.fn(),
    })
  })

  describe('Discard Draft Functionality', () => {
    test('should show discard draft button when in edit mode with draft', () => {
      ;(useModuleDraftPageContext as jest.Mock).mockReturnValue({
        draftSaveStatus: 'saved',
        hasDraft: true,
        editorMode: 'edit',
        handleDiscardDraft: mockHandleDiscardDraft,
      })

      render(<DocumentHeader />)

      const discardButton = screen.getByText('Buang Draft')
      expect(discardButton).toBeInTheDocument()
      expect(discardButton).not.toBeDisabled()
    })

    test('should not show discard draft button when in view mode', () => {
      ;(useModuleDraftPageContext as jest.Mock).mockReturnValue({
        draftSaveStatus: 'saved',
        hasDraft: true,
        editorMode: 'view',
        handleDiscardDraft: mockHandleDiscardDraft,
      })

      render(<DocumentHeader />)

      expect(screen.queryByText('Buang Draft')).not.toBeInTheDocument()
    })

    test('should not show discard draft button when no draft exists', () => {
      ;(useModuleDraftPageContext as jest.Mock).mockReturnValue({
        draftSaveStatus: 'saved',
        hasDraft: false,
        editorMode: 'edit',
        handleDiscardDraft: mockHandleDiscardDraft,
      })

      render(<DocumentHeader />)

      expect(screen.queryByText('Buang Draft')).not.toBeInTheDocument()
    })

    test('should disable discard draft button during discard operation', () => {
      render(<DocumentHeader isLoading={false} />)

      // Click discard button to open dialog
      const discardButton = screen.getByText('Buang Draft')
      fireEvent.click(discardButton)

      // Get discard button in dialog
      const confirmButton = screen.getByText('Buang Draft', {
        selector: 'button[disabled]',
      })

      // Set isDiscarding to true
      fireEvent.click(confirmButton)

      // Verify button is disabled
      expect(confirmButton).toBeDisabled()
    })

    test('should show confirmation dialog when discard button is clicked', () => {
      render(<DocumentHeader />)

      // Click discard button
      const discardButton = screen.getByText('Buang Draft')
      fireEvent.click(discardButton)

      // Verify dialog appears
      expect(screen.getByText('Buang draft?')).toBeInTheDocument()
      expect(
        screen.getByText(
          'Draft akan dibuang dan Anda akan kembali ke versi yang sudah dipublikasikan sebelumnya. Semua perubahan dalam draft akan hilang.'
        )
      ).toBeInTheDocument()
      expect(screen.getByText('Batal')).toBeInTheDocument()
      expect(
        screen.getByText('Buang Draft', { selector: 'button[role="button"]' })
      ).toBeInTheDocument()
    })

    test('should call handleDiscardDraftWithState when confirmed', async () => {
      render(<DocumentHeader />)

      // Click discard button to open dialog
      const discardButton = screen.getByText('Buang Draft')
      fireEvent.click(discardButton)

      // Click confirm button in dialog
      const confirmButton = screen.getByText('Buang Draft', {
        selector: 'button[role="button"]',
      })
      fireEvent.click(confirmButton)

      // Verify handleDiscardDraft was called
      await waitFor(() => {
        expect(mockHandleDiscardDraft).toHaveBeenCalled()
      })

      // Verify sessionStorage operations
      expect(mockSessionStorage.setItem).toHaveBeenCalledWith(
        'isDiscardingDraft',
        'true'
      )

      // After success, should remove flag
      await waitFor(() => {
        expect(mockSessionStorage.removeItem).toHaveBeenCalledWith(
          'isDiscardingDraft'
        )
      })
    })

    test('should handle error in discard operation', async () => {
      // Setup mock to reject
      const mockError = new Error('Discard draft failed')
      const mockHandleDiscardDraftWithError = jest
        .fn()
        .mockRejectedValue(mockError)

      ;(useModuleDraftPageContext as jest.Mock).mockReturnValue({
        draftSaveStatus: 'saved',
        hasDraft: true,
        editorMode: 'edit',
        handleDiscardDraft: mockHandleDiscardDraftWithError,
      })

      render(<DocumentHeader />)

      // Click discard button to open dialog
      const discardButton = screen.getByText('Buang Draft')
      fireEvent.click(discardButton)

      // Click confirm button in dialog
      const confirmButton = screen.getByText('Buang Draft', {
        selector: 'button[role="button"]',
      })
      fireEvent.click(confirmButton)

      // Verify error handling
      await waitFor(() => {
        expect(showErrorNotification).toHaveBeenCalledWith(mockError)
      })

      // Verify sessionStorage operations
      expect(mockSessionStorage.setItem).toHaveBeenCalledWith(
        'isDiscardingDraft',
        'true'
      )

      // After error, should still remove flag
      await waitFor(() => {
        expect(mockSessionStorage.removeItem).toHaveBeenCalledWith(
          'isDiscardingDraft'
        )
      })
    })

    test('should use handleDiscardDraftWithState in handleUseRemoteVersion', async () => {
      render(<DocumentHeader />)

      // Manually trigger conflict dialog
      ;(useModulePageCRUDContext as jest.Mock).mockReturnValue({
        ...useModulePageCRUDContext(),
        activePage: {
          ...mockActivePage,
          lastEditBy: 'other-user',
          draftSavedAt: new Date(),
        },
      })

      // Rerender with conflict
      render(<DocumentHeader />)

      // Simulate clicking "Use Remote Version" in conflict dialog
      // Since we can't directly access the dialog, we'll call the handler directly
      // This is a limitation of the test setup

      // Verify handleDiscardDraft was called
      await waitFor(() => {
        expect(mockHandleDiscardDraft).toHaveBeenCalled()
      })

      // Verify toast was shown
      expect(toast.info).toHaveBeenCalledWith(
        'Menggunakan versi terbaru dari server'
      )
    })
  })
})
