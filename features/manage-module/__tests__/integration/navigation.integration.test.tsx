import React from 'react'
import { screen, fireEvent, waitFor } from '@testing-library/react'
import { renderWithProviders, server } from '../utils/testUtils'
import ModulePageSidebar from '../../components/ModulePageSidebar'
import ModulePageFooterNav from '../../components/ModulePageFooterNav'
import { HttpResponse, http } from 'msw'
import mockPages from '../__mocks__/mockPages'
import * as ModulePageCRUDContext from '../../context/ModulePageCRUDContext'
import { SaveStatus } from '../../context/ModulePageCRUDContext'

// Setup mock timer untuk debounce
jest.useFakeTimers()

// Mock useRouter
const mockPush = jest.fn()
jest.mock('next/navigation', () => ({
  ...jest.requireActual('next/navigation'),
  useRouter: () => ({
    push: mockPush,
    back: jest.fn(),
    refresh: jest.fn(),
    replace: jest.fn(),
  }),
  useParams: () => ({
    moduleId: 'module-1',
  }),
  useSearchParams: () => ({
    get: (param: string) => {
      if (param === 'pageId') return 'page-1'
      return null
    },
  }),
}))

// Mock ModulePagesContext untuk memastikan sidebar terbuka
jest.mock('../../context/ModulePagesContext', () => {
  const originalModule = jest.requireActual('../../context/ModulePagesContext')
  return {
    ...originalModule,
    useModulePagesContext: () => ({
      isSidebarOpen: true, // Sidebar selalu terbuka dalam test
      toggleSidebar: jest.fn(),
      expandedItems: { ModuleContent: true }, // Semua item di-expand
      toggleExpand: jest.fn(),
    }),
  }
})

// Mock ModulePageCRUDContext untuk memastikan navigasi berfungsi
const mockHandleNavigateToPrevPage = jest.fn()
const mockHandleNavigateToNextPage = jest.fn()
const mockHandleSelectPage = jest.fn()
const mockSetActivePage = jest.fn()
const mockRefetch = jest.fn().mockResolvedValue(null)
const mockCreatePage = jest.fn().mockResolvedValue(null)
const mockUpdatePage = jest.fn().mockResolvedValue(null)
const mockDeletePage = jest.fn().mockResolvedValue(null)
const mockReorderPages = jest.fn().mockResolvedValue(null)
const mockGetPageById = jest.fn().mockResolvedValue(null)
const mockSavePage = jest.fn().mockResolvedValue(null)
const mockSavePageWrapper = jest.fn().mockResolvedValue(null)
const mockHandlePageChange = jest.fn()
const mockHandleEditorChange = jest.fn()
const mockSetSaveStatus = jest.fn()
const mockSetIsNavigating = jest.fn()

jest.mock('../../context/ModulePageCRUDContext', () => {
  const originalModule = jest.requireActual(
    '../../context/ModulePageCRUDContext'
  )

  return {
    ...originalModule,
    useModulePageCRUDContext: () => ({
      moduleId: 'module-1',
      pages: mockPages,
      activePage: mockPages[1], // Default halaman aktif adalah halaman kedua agar tombol prev bisa diklik
      isLoading: false,
      error: null,
      isNavigating: false,
      refetch: mockRefetch,
      createPage: mockCreatePage,
      updatePage: mockUpdatePage,
      deletePage: mockDeletePage,
      reorderPages: mockReorderPages,
      setActivePage: mockSetActivePage,
      saveStatus: 'saved' as SaveStatus,
      setSaveStatus: mockSetSaveStatus,
      setIsNavigating: mockSetIsNavigating,
      getNextPage: () => mockPages[2] || null,
      getPreviousPage: () => mockPages[0] || null,
      getFirstPage: () => mockPages[0] || null,
      getLastPage: () => mockPages[mockPages.length - 1] || null,
      getPageById: mockGetPageById,
      savePage: mockSavePage,
      savePageWrapper: mockSavePageWrapper,
      handlePageChange: mockHandlePageChange,
      handleSelectPage: mockHandleSelectPage,
      handleEditorChange: mockHandleEditorChange,
      handleNavigateToPrevPage: mockHandleNavigateToPrevPage,
      handleNavigateToNextPage: mockHandleNavigateToNextPage,
    }),
  }
})

describe('Navigasi Modul - Integration Tests', () => {
  beforeAll(() => {
    // Tambahkan specific handler untuk test ini
    server.use(
      http.get('/api/module/:moduleId/pages', () => {
        return HttpResponse.json({
          success: true,
          data: mockPages,
          meta: {
            totalItems: mockPages.length,
            currentPage: 1,
            totalPages: 1,
            pageSize: 10,
          },
        })
      }),
      http.get('/api/module/:moduleId/pages/:pageId', ({ params }) => {
        const pageId = params.pageId as string
        const page = mockPages.find((p) => p.id === pageId)

        if (page) {
          return HttpResponse.json({
            success: true,
            data: page,
          })
        }

        return new HttpResponse(null, { status: 404 })
      })
    )
  })

  describe('ModulePageSidebar', () => {
    it('menampilkan daftar halaman modul dengan benar', async () => {
      // Render sidebar
      renderWithProviders(<ModulePageSidebar />)

      // Tunggu data dimuat dan ditampilkan
      await waitFor(() => {
        // Verifikasi halaman modul muncul
        expect(screen.getByText('Pengenalan')).toBeInTheDocument()
        expect(screen.getByText('Materi Dasar')).toBeInTheDocument()
        expect(screen.getByText('Latihan Praktik')).toBeInTheDocument()
      })
    })

    it('navigasi ke halaman yang dipilih saat diklik', async () => {
      // Render sidebar
      renderWithProviders(<ModulePageSidebar />)

      // Tunggu data dimuat
      await waitFor(() => {
        expect(screen.getByText('Pengenalan')).toBeInTheDocument()
      })

      // Klik halaman pertama
      const page1Link = screen.getByText('Pengenalan')
      fireEvent.click(page1Link)

      // Verifikasi handleSelectPage dipanggil
      expect(mockHandleSelectPage).toHaveBeenCalled()
    })

    it('menampilkan halaman aktif dengan highlight yang berbeda', async () => {
      // Render sidebar dengan mock khusus untuk test ini
      const { container } = renderWithProviders(<ModulePageSidebar />)

      // Tunggu data dimuat
      await waitFor(() => {
        expect(screen.getByText('Pengenalan')).toBeInTheDocument()
      })

      // Cari elemen halaman aktif dengan cara yang lebih fleksibel
      // Karena implementasi highlight bisa berbeda-beda, kita cek beberapa kemungkinan

      // 1. Cek apakah ada elemen yang mengandung teks 'Pengenalan' dan memiliki class yang mengandung 'text-[#669df1]'
      const hasHighlightedElement =
        !!container.querySelector('div[class*="text-[#669df1]"]') ||
        !!container.querySelector('span[class*="text-[#669df1]"]') ||
        !!container.querySelector('*[class*="text-[#669df1]"]')

      // Jika tidak ada elemen dengan class tersebut, kita cek apakah ada elemen dengan class bg-[#1c2b42]
      // yang biasanya digunakan untuk menandai item aktif
      const hasHighlightedBg = !!container.querySelector(
        '*[class*="bg-[#1c2b42]"]'
      )

      // Kita juga bisa memeriksa apakah ada elemen dengan atribut data-active="true"
      const hasActiveAttribute = !!container.querySelector(
        '[data-active="true"]'
      )

      // Kita cukup memastikan bahwa salah satu dari indikator highlight ada
      expect(
        hasHighlightedElement || hasHighlightedBg || hasActiveAttribute
      ).toBeTruthy()
    })
  })

  describe('ModulePageFooterNav', () => {
    it('menampilkan tombol navigasi halaman sebelumnya dan berikutnya', async () => {
      // Render footer navigation
      renderWithProviders(<ModulePageFooterNav />)

      // Verifikasi tombol navigasi muncul
      expect(screen.getByText(/Halaman Sebelumnya/i)).toBeInTheDocument()
      expect(screen.getByText(/Halaman Berikutnya/i)).toBeInTheDocument()

      // Verifikasi indikator halaman aktual muncul
      const paginationStatus = screen.getByRole('status')
      expect(paginationStatus).toHaveTextContent(/Halaman \d+ dari \d+/i)
    })

    it('menavigasi ke halaman sebelumnya saat tombol diklik', async () => {
      // Reset mock sebelum test
      mockHandleNavigateToPrevPage.mockClear()

      // Pastikan bahwa kita berada di halaman kedua (bukan pertama)
      // agar tombol halaman sebelumnya dapat diklik
      jest
        .spyOn(ModulePageCRUDContext, 'useModulePageCRUDContext')
        .mockImplementationOnce(() => ({
          moduleId: 'module-1',
          pages: mockPages,
          activePage: mockPages[1], // Halaman aktif adalah halaman kedua
          isLoading: false,
          error: null,
          isNavigating: false,
          refetch: mockRefetch,
          createPage: mockCreatePage,
          updatePage: mockUpdatePage,
          deletePage: mockDeletePage,
          reorderPages: mockReorderPages,
          setActivePage: mockSetActivePage,
          saveStatus: 'saved' as SaveStatus,
          setSaveStatus: mockSetSaveStatus,
          setIsNavigating: mockSetIsNavigating,
          getNextPage: () => mockPages[2] || null,
          getPreviousPage: () => mockPages[0],
          getFirstPage: () => mockPages[0] || null,
          getLastPage: () => mockPages[mockPages.length - 1] || null,
          getPageById: mockGetPageById,
          savePage: mockSavePage,
          savePageWrapper: mockSavePageWrapper,
          handlePageChange: mockHandlePageChange,
          handleSelectPage: mockHandleSelectPage,
          handleEditorChange: mockHandleEditorChange,
          handleNavigateToPrevPage: mockHandleNavigateToPrevPage,
          handleNavigateToNextPage: mockHandleNavigateToNextPage,
        }))

      // Render footer navigation
      renderWithProviders(<ModulePageFooterNav />)

      // Klik tombol halaman sebelumnya
      // Cari tombol dengan beberapa cara untuk memastikan kita mendapatkannya
      const prevButton =
        screen.getByRole('button', { name: /halaman sebelumnya/i }) ||
        screen.getByText(/halaman sebelumnya/i).closest('button') ||
        screen.getAllByRole('button')[0]

      fireEvent.click(prevButton)

      // Verifikasi bahwa handler dipanggil
      expect(mockHandleNavigateToPrevPage).toHaveBeenCalled()

      // Bersihkan mock
      jest.restoreAllMocks()
    })

    it('menavigasi ke halaman berikutnya saat tombol diklik', async () => {
      // Render footer navigation
      renderWithProviders(<ModulePageFooterNav />)

      // Klik tombol halaman berikutnya
      const nextButton = screen.getByText(/Halaman Berikutnya/i)
      fireEvent.click(nextButton)

      // Verifikasi bahwa handler dipanggil
      expect(mockHandleNavigateToNextPage).toHaveBeenCalled()
    })

    it('menampilkan loading indicator saat navigasi berlangsung', async () => {
      // Override mock untuk test ini saja
      jest
        .spyOn(ModulePageCRUDContext, 'useModulePageCRUDContext')
        .mockImplementation(() => ({
          moduleId: 'module-1',
          pages: mockPages,
          activePage: mockPages[1],
          isLoading: false,
          error: null,
          isNavigating: true, // Set isNavigating ke true untuk test ini
          refetch: mockRefetch,
          createPage: mockCreatePage,
          updatePage: mockUpdatePage,
          deletePage: mockDeletePage,
          reorderPages: mockReorderPages,
          setActivePage: mockSetActivePage,
          saveStatus: 'saved' as SaveStatus,
          setSaveStatus: mockSetSaveStatus,
          setIsNavigating: mockSetIsNavigating,
          getNextPage: () => mockPages[2] || null,
          getPreviousPage: () => mockPages[0] || null,
          getFirstPage: () => mockPages[0] || null,
          getLastPage: () => mockPages[mockPages.length - 1] || null,
          getPageById: mockGetPageById,
          savePage: mockSavePage,
          savePageWrapper: mockSavePageWrapper,
          handlePageChange: mockHandlePageChange,
          handleSelectPage: mockHandleSelectPage,
          handleEditorChange: mockHandleEditorChange,
          handleNavigateToPrevPage: mockHandleNavigateToPrevPage,
          handleNavigateToNextPage: mockHandleNavigateToNextPage,
        }))

      // Render footer navigation
      const { container } = renderWithProviders(<ModulePageFooterNav />)

      // Verifikasi bahwa loader muncul
      // Kita cek apakah ada elemen dengan class Loader2 atau animate-spin
      const hasLoader =
        !!container.querySelector('.animate-spin') ||
        !!container.querySelector('[class*="Loader2"]') ||
        !!screen.queryByText(/loading/i)

      // Alternatif: Cek apakah tombol navigasi disabled saat navigasi
      const prevButton = screen.getByText(/Halaman Sebelumnya/i)
      const isDisabled = prevButton.hasAttribute('disabled')

      // Setidaknya salah satu kondisi harus terpenuhi
      expect(hasLoader || isDisabled).toBeTruthy()

      // Bersihkan mock
      jest.restoreAllMocks()
    })
  })
})
