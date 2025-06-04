import React, { ReactNode } from 'react'
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react'
import {
  ModuleDraftPageProvider,
  useModuleDraftPageContext,
} from './ModuleDraftPageContext'
import { StandardEditorContent, ModulePage } from '../types'
import * as useRichTextAutosaveModule from '../hooks/draft/useRichTextAutosave'
import * as useDraftRecoveryModule from '../hooks/draft/useDraftRecovery'
import * as useUnsavedChangesPromptModule from '../hooks/draft/useUnsavedChangesPrompt'
import { modulePageAdapter } from '../adapters/modulePageAdapter'

// Mock dependencies
jest.mock('../../hooks/draft/useRichTextAutosave')
jest.mock('../../hooks/draft/useDraftRecovery')
jest.mock('../../hooks/draft/useUnsavedChangesPrompt')
jest.mock('../../adapters/modulePageAdapter')
jest.mock('@clerk/nextjs', () => ({
  useClerk: () => ({
    user: { id: 'test-user-id' },
  }),
}))

// Mock Editor
jest.mock('@tiptap/react', () => ({
  Editor: class MockEditor {
    commands = {
      clearContent: jest.fn().mockReturnThis(),
      setContent: jest.fn().mockReturnThis(),
    }
  },
}))

// Test component that uses the context
const TestComponent = () => {
  const {
    draftSaveStatus,
    formattedLastSaved,
    hasUnsavedChanges,
    hasDraft,
    showRecoveryDialog,
    showUnsavedChangesDialog,
    handleRecoverDraft,
    handleDiscardDraft,
    confirmNavigation,
    cancelNavigation,
    setEditor,
  } = useModuleDraftPageContext()

  return (
    <div>
      <div data-testid="status">{draftSaveStatus}</div>
      <div data-testid="has-unsaved">
        {hasUnsavedChanges ? 'true' : 'false'}
      </div>
      <div data-testid="has-draft">{hasDraft ? 'true' : 'false'}</div>
      <div data-testid="show-recovery">
        {showRecoveryDialog ? 'true' : 'false'}
      </div>
      <div data-testid="show-unsaved">
        {showUnsavedChangesDialog ? 'true' : 'false'}
      </div>
      <button data-testid="recover" onClick={() => handleRecoverDraft()}>
        Recover
      </button>
      <button data-testid="discard" onClick={() => handleDiscardDraft()}>
        Discard
      </button>
      <button data-testid="confirm" onClick={() => confirmNavigation()}>
        Confirm
      </button>
      <button data-testid="cancel" onClick={() => cancelNavigation()}>
        Cancel
      </button>
      <button
        data-testid="set-editor"
        onClick={() =>
          setEditor(new (jest.requireMock('@tiptap/react').Editor)())
        }
      >
        Set Editor
      </button>
    </div>
  )
}

// Wrapper component
const wrapper = ({ children }: { children: ReactNode }) => {
  const mockPage: ModulePage = {
    id: 'page-1',
    moduleId: 'module-1',
    title: 'Test Page',
    content: { type: 'doc', content: [] },
    order: 1,
    type: 'content',
    version: 1,
    status: 'PUBLISHED',
    createdAt: new Date(),
    updatedAt: new Date(),
    isDraft: false,
    hasUnpublishedChanges: false,
  }

  return (
    <ModuleDraftPageProvider activePage={mockPage} enabled={true}>
      {children}
    </ModuleDraftPageProvider>
  )
}

describe('ModuleDraftPageContext', () => {
  beforeEach(() => {
    jest.clearAllMocks()

    // Mock useRichTextAutosave
    jest.mocked(useRichTextAutosaveModule.useRichTextAutosave).mockReturnValue({
      saveStatus: 'saved',
      lastSavedAt: new Date(),
      formattedLastSaved: {
        timeAgo: '5 menit yang lalu',
        fullTime: '12:30:45',
      },
      hasUnsavedChanges: false,
      forceSave: jest.fn().mockResolvedValue(undefined),
      error: null,
      isSaving: false,
    })

    // Mock useDraftRecovery
    jest.mocked(useDraftRecoveryModule.useDraftRecovery).mockReturnValue({
      hasDraft: true,
      draftData: {
        draftData: { type: 'doc', content: [] } as StandardEditorContent,
        draftSavedAt: new Date(),
      } as unknown as ModulePage,
      isLoading: false,
      showRecoveryDialog: true,
      formattedDraftTime: '5 menit yang lalu',
      editorName: 'John Doe',
      checkDraft: jest.fn().mockResolvedValue(true),
      fetchDraft: jest.fn().mockResolvedValue({
        draftData: { type: 'doc', content: [] },
        draftSavedAt: new Date(),
      }),
      showRecovery: jest.fn(),
      handleRecover: jest.fn(),
      handleDiscard: jest.fn(),
      closeDialog: jest.fn(),
    })

    // Mock useUnsavedChangesPrompt
    jest
      .mocked(useUnsavedChangesPromptModule.useUnsavedChangesPrompt)
      .mockReturnValue({
        showDialog: true,
        handleConfirm: jest.fn(),
        handleCancel: jest.fn(),
        handleLinkClick: jest.fn(),
        routerWithConfirm: jest.fn() as any,
      })

    // Mock modulePageAdapter
    jest.mocked(modulePageAdapter.discardDraft).mockResolvedValue(true)
    jest
      .mocked(modulePageAdapter.publishDraft)
      .mockResolvedValue({} as ModulePage)
  })

  it('provides draft save status', () => {
    render(<TestComponent />, { wrapper })
    expect(screen.getByTestId('status')).toHaveTextContent('saved')
  })

  it('provides hasUnsavedChanges state', () => {
    render(<TestComponent />, { wrapper })
    expect(screen.getByTestId('has-unsaved')).toHaveTextContent('false')
  })

  it('provides hasDraft state', () => {
    render(<TestComponent />, { wrapper })
    expect(screen.getByTestId('has-draft')).toHaveTextContent('true')
  })

  it('provides showRecoveryDialog state', () => {
    render(<TestComponent />, { wrapper })
    expect(screen.getByTestId('show-recovery')).toHaveTextContent('true')
  })

  it('provides showUnsavedChangesDialog state', () => {
    render(<TestComponent />, { wrapper })
    expect(screen.getByTestId('show-unsaved')).toHaveTextContent('true')
  })

  it('calls handleRecoverDraft when recover button is clicked', async () => {
    const fetchDraftMock = jest.fn().mockResolvedValue({
      draftData: { type: 'doc', content: [] },
      draftSavedAt: new Date(),
    })

    jest.mocked(useDraftRecoveryModule.useDraftRecovery).mockReturnValue({
      ...jest.mocked(useDraftRecoveryModule.useDraftRecovery)(),
      fetchDraft: fetchDraftMock,
    })

    render(<TestComponent />, { wrapper })

    await act(async () => {
      fireEvent.click(screen.getByTestId('set-editor'))
    })

    await act(async () => {
      fireEvent.click(screen.getByTestId('recover'))
    })

    await waitFor(() => {
      expect(fetchDraftMock).toHaveBeenCalled()
    })
  })

  it('calls handleDiscardDraft when discard button is clicked', async () => {
    const handleDiscardMock = jest.fn()

    jest.mocked(useDraftRecoveryModule.useDraftRecovery).mockReturnValue({
      ...jest.mocked(useDraftRecoveryModule.useDraftRecovery)(),
      handleDiscard: handleDiscardMock,
    })

    render(<TestComponent />, { wrapper })

    await act(async () => {
      fireEvent.click(screen.getByTestId('discard'))
    })

    await waitFor(() => {
      expect(handleDiscardMock).toHaveBeenCalled()
    })
  })

  it('calls confirmNavigation when confirm button is clicked', async () => {
    const handleConfirmMock = jest.fn()

    jest
      .mocked(useUnsavedChangesPromptModule.useUnsavedChangesPrompt)
      .mockReturnValue({
        ...jest.mocked(useUnsavedChangesPromptModule.useUnsavedChangesPrompt)(),
        handleConfirm: handleConfirmMock,
      })

    render(<TestComponent />, { wrapper })

    await act(async () => {
      fireEvent.click(screen.getByTestId('confirm'))
    })

    await waitFor(() => {
      expect(handleConfirmMock).toHaveBeenCalled()
    })
  })

  it('calls cancelNavigation when cancel button is clicked', async () => {
    const handleCancelMock = jest.fn()

    jest
      .mocked(useUnsavedChangesPromptModule.useUnsavedChangesPrompt)
      .mockReturnValue({
        ...jest.mocked(useUnsavedChangesPromptModule.useUnsavedChangesPrompt)(),
        handleCancel: handleCancelMock,
      })

    render(<TestComponent />, { wrapper })

    await act(async () => {
      fireEvent.click(screen.getByTestId('cancel'))
    })

    await waitFor(() => {
      expect(handleCancelMock).toHaveBeenCalled()
    })
  })

  it('handles setting editor', async () => {
    const mockUseRichTextAutosave = jest.mocked(
      useRichTextAutosaveModule.useRichTextAutosave
    )

    render(<TestComponent />, { wrapper })

    await act(async () => {
      fireEvent.click(screen.getByTestId('set-editor'))
    })

    // Editor should be passed to useRichTextAutosave
    expect(mockUseRichTextAutosave).toHaveBeenCalledWith(
      expect.objectContaining({
        editor: expect.anything(),
      })
    )
  })
})
