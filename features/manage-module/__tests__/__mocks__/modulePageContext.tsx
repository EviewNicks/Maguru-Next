import { useContext, createContext, ReactNode } from 'react'
import { ModulePage, ModulePageStatus } from '../../types'

// Default mock values
const defaultPages: ModulePage[] = [
  {
    id: 'page1',
    title: 'Mock Page 1',
    moduleId: 'module1',
    order: 0,
    status: ModulePageStatus.DRAFT,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: 'page2',
    title: 'Mock Page 2',
    moduleId: 'module1',
    order: 1,
    status: ModulePageStatus.PUBLISHED,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
]

const defaultPageContext = {
  pages: defaultPages,
  activePage: defaultPages[0],
  setActivePage: jest.fn(),
  expandedItems: { SPRINT: true, ModulePages: true },
  toggleExpand: jest.fn(),
  isEditingTitle: false,
  setIsEditingTitle: jest.fn(),
  savePage: jest.fn(),
  moduleName: 'Mock Module',
  moduleId: 'module1',
  isSaving: false,
  error: null,
}

export const ModulePageContext = createContext(defaultPageContext)

export const useModulePageContext = () => useContext(ModulePageContext)

export const ModulePageProvider = ({
  children,
  mockValues = {},
}: {
  children: ReactNode
  mockValues?: Partial<typeof defaultPageContext>
}) => {
  const contextValue = {
    ...defaultPageContext,
    ...mockValues,
  }

  return (
    <ModulePageContext.Provider value={contextValue}>
      {children}
    </ModulePageContext.Provider>
  )
}

export default {
  ModulePageContext,
  ModulePageProvider,
  useModulePageContext,
  defaultPageContext,
}
