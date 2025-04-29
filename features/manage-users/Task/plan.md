# Rencana Implementasi Sub-task 2: Test-Driven Development (TDD) untuk UI

## Ringkasan Tujuan

Menerapkan metodologi Test-Driven Development (TDD) untuk semua komponen UI dalam modul `manage-users`, termasuk hooks, services, dan utils. Pendekatan ini akan memastikan bahwa setiap komponen memiliki test yang komprehensif, meningkatkan kualitas kode, dan meminimalisir regresi atau bug dalam pengembangan modul pengelolaan pengguna.

## Metrik Keberhasilan

- Unit Tests: Minimal 95% coverage ✅
- Integration Tests: Minimal 87% coverage 🔄
- E2E Tests: Minimal 80% coverage untuk alur utama ⏳
- Semua tests harus berjalan dan lulus sebelum perubahan kode di-commit

## Status Progress

- ✅ Unit Tests: 100% selesai (20 test suites, 130 tests, semua lulus)
- 🔄 Integration Tests: 0% (dalam persiapan)
- ⏳ E2E Tests: 0% (belum dimulai)
- 📊 Test Report: Selesai untuk Unit Tests

## Langkah-langkah Teknis

### 1. Persiapan Lingkungan Pengujian ✅

- [x] **Setup dan Verifikasi Testing Framework**

  - Verifikasi konfigurasi Jest dan React Testing Library
  - Pastikan transformers dan module mappings sudah dikonfigurasi dengan benar
  - Siapkan mock objects untuk dependencies eksternal (Redux, SWR, API, dll.)

- [x] **Konfigurasi Mock Service Worker (MSW)**

  - Setup MSW untuk digunakan dalam tests

- [x] **Siapkan Testing Utilities**
  - Buat file `test-utils.tsx` dengan custom render function

### 2. Unit Testing untuk Komponen UI ✅

- [x] Unit Tests untuk DataTable
- [x] Unit Tests untuk UserRoleCell
- [x] Unit Tests untuk EditUserDialog
- [x] Unit Tests untuk Dashboard & UI Elements
- [x] Unit Tests untuk hooks (useChartData, useSystemStatus, dll.)
- [x] Unit Tests untuk services & utilities (charts, formatters, dll.)

### 3. Testing untuk Hooks ✅

- [x] Unit Tests untuk useChartData Hook
- [x] Unit Tests untuk useSystemStatus Hook
- [x] Unit Tests untuk hooks data fetching lainnya

### 4. Testing untuk Services & Utilities ✅

- [x] Unit Tests untuk chart service
- [x] Unit Tests untuk formatter utils
- [x] Unit Tests untuk prisma-utils

### 5. Integration Testing 🔄 (FOKUS SAAT INI)

#### 5.1 UserTable + Filter Integration

- [ ] **Setup Integration Testing Environment**

  - Siapkan MSW server dengan handlers untuk semua API endpoints yang diperlukan
  - Buat common test utilities dan fixtures untuk integration testing
  - Setup test database atau mock data yang konsisten

- [ ] **Test File: UserTableFiltering.test.tsx**

  ```typescript
  // __tests__/integration/manage-users/UserTableFiltering.test.tsx
  import { render, screen, userEvent, waitFor } from '@testing-library/react'
  import UserTable from '@/features/manage-users/components/ui/UserTable'
  import { setupServer } from 'msw/node'
  import { rest } from 'msw'
  import { TestWrapper } from '@/test/test-utils'

  // Setup MSW server
  const handlers = [
    rest.get('/api/users', (req, res, ctx) => {
      const role = req.url.searchParams.get('role')
      const status = req.url.searchParams.get('status')
      const search = req.url.searchParams.get('search')

      // Return filtered data based on query params
      return res(ctx.json(getMockUsersResponse(role, status, search)))
    }),
  ]

  const server = setupServer(...handlers)

  beforeAll(() => server.listen())
  afterEach(() => server.resetHandlers())
  afterAll(() => server.close())

  describe('UserTable Integration with Filters', () => {
    it('displays data correctly when component mounts', async () => {
      // Render component and verify initial data loads correctly
    })

    it('filters data when role filter is changed', async () => {
      render(
        <TestWrapper>
          <UserTable />
        </TestWrapper>
      )

      // Wait for initial data to load
      await screen.findByText('User 1')

      // Change role filter
      const roleSelect = screen.getByLabelText('Filter by role')
      await userEvent.click(roleSelect)
      await userEvent.click(screen.getByText('Admin'))

      // Verify the API called with correct params and UI updates
      await waitFor(() => {
        expect(screen.getByText('Admin User')).toBeInTheDocument()
        expect(screen.queryByText('Student User')).not.toBeInTheDocument()
      })
    })

    it('filters data when status filter is changed', async () => {
      // Render component, change status filter, verify results
    })

    it('filters data when search input is used', async () => {
      // Render component, enter search term, verify results
    })

    it('resets all filters when reset button is clicked', async () => {
      // Render component, set filters, click reset, verify all filters cleared
    })

    it('shows loading state while fetching filtered results', async () => {
      // Verify loading state appears during data fetching
    })

    it('shows error message when API request fails', async () => {
      // Mock API error response, verify error message displays
    })

    it('maintains pagination state during filtering', async () => {
      // Test pagination interaction with filtering
    })
  })
  ```

- [ ] **Implement Mock Data Generation**

  ```typescript
  // __tests__/integration/manage-users/mocks/userData.ts
  import { faker } from '@faker-js/faker'

  export function generateMockUsers(count = 10) {
    return Array.from({ length: count }, (_, i) => ({
      id: faker.string.uuid(),
      name: faker.person.fullName(),
      email: faker.internet.email(),
      role: faker.helpers.arrayElement(['admin', 'mahasiswa', 'dosen']),
      status: faker.helpers.arrayElement(['active', 'inactive']),
      createdAt: faker.date.past().toISOString(),
      updatedAt: faker.date.recent().toISOString(),
    }))
  }

  export function getMockUsersResponse(role, status, search) {
    let users = generateMockUsers(20)

    if (role && role !== 'all') {
      users = users.filter((user) => user.role === role)
    }

    if (status && status !== 'all') {
      users = users.filter((user) => user.status === status)
    }

    if (search) {
      const searchLower = search.toLowerCase()
      users = users.filter(
        (user) =>
          user.name.toLowerCase().includes(searchLower) ||
          user.email.toLowerCase().includes(searchLower)
      )
    }

    return {
      users: users.slice(0, 10),
      metadata: { total: users.length },
    }
  }
  ```

#### 5.2 User Management Flow

- [ ] **Test File: UserManagementFlow.test.tsx** (mencakup Edit dan Delete Flow)

  ```typescript
  // __tests__/integration/manage-users/UserManagementFlow.test.tsx
  import { render, screen, userEvent, waitFor } from '@testing-library/react'
  import UserTable from '@/features/manage-users/components/ui/UserTable'
  import { setupServer } from 'msw/node'
  import { rest } from 'msw'
  import { TestWrapper } from '@/test/test-utils'

  // Setup handlers dan server MSW

  describe('User Management Flow', () => {
    describe('Edit User Flow', () => {
      it('allows editing a user role and updates the table', async () => {
        // Setup with MSW mocks for GET and PUT requests
        // 1. Render the UserTable component
        // 2. Find a user and click its role badge
        // 3. Verify edit dialog opens
        // 4. Change role in the dialog
        // 5. Submit the form
        // 6. Verify loading state shows
        // 7. Verify success toast appears
        // 8. Verify table updates with new role
      })

      it('allows editing a user status and updates the table', async () => {
        // Similar to above but testing status change
      })

      it('handles API errors gracefully during edit flow', async () => {
        // Similar flow but with MSW returning error responses
      })

      it('persists filter and pagination state after editing a user', async () => {
        // Test that filters and pagination remain after edit
      })

      it('shows validation errors for invalid input', async () => {
        // Test form validation in edit dialog
      })
    })

    describe('Delete User Flow', () => {
      it('displays confirmation modal when delete button is clicked', async () => {
        // Verify confirmation modal appears
      })

      it('removes user from table when deletion is confirmed', async () => {
        // Test complete deletion flow
      })

      it('keeps user in table when deletion is canceled', async () => {
        // Test cancellation of deletion
      })

      it('shows success notification after successful deletion', async () => {
        // Verify toast appears after deletion
      })

      it('handles API errors during deletion gracefully', async () => {
        // Test error handling during deletion
      })
    })
  })
  ```

#### 5.3 Dashboard Integration

- [ ] **Test File: DashboardIntegration.test.tsx**

  ```typescript
  // __tests__/integration/manage-users/DashboardIntegration.test.tsx
  import { render, screen, waitFor, userEvent } from '@testing-library/react'
  import { SystemOverview } from '@/features/manage-users/components/dashboard/SystemOverview'
  import { setupServer } from 'msw/node'
  import { rest } from 'msw'
  import { TestWrapper } from '@/test/test-utils'

  describe('Dashboard Integration', () => {
    describe('SystemOverview Integration', () => {
      it('fetches and displays stats data correctly', async () => {
        // Setup MSW with mock stats data
        // Render SystemOverview
        // Verify loading state appears
        // Verify data displays correctly after loading
        // Verify charts render with correct data
      })

      it('displays fallback metrics when stats data is empty', async () => {
        // Test empty data scenario
      })

      it('shows error message when stats API fails', async () => {
        // Test error state display
      })

      it('handles tab switching and data loading for each tab', async () => {
        // Test tab switching functionality
        // Performance tab
        // Processes tab
        // Users tab
        // Storage tab
      })

      it('handles refresh functionality', async () => {
        // Test the refresh button works and updates data
      })
    })

    describe('Chart Interactions', () => {
      it('renders charts with correct data from API', async () => {
        // Verify chart data matches API response
      })

      it('displays tooltips when hovering over chart elements', async () => {
        // Test chart interactive features
      })

      it('adjusts layout responsively based on viewport size', async () => {
        // Test responsive behavior
      })
    })
  })
  ```

- [ ] **Mock Data untuk Dashboard**

  ```typescript
  // __tests__/integration/manage-users/mocks/dashboardData.ts

  export function getMockStatsData() {
    return {
      statsMetrics: [
        {
          title: 'Total Users',
          value: 120,
          icon: 'Activity',
          trend: 'up',
          color: 'cyan',
          detail: '15 new this week',
        },
        {
          title: 'Active Users',
          value: 85,
          icon: 'Activity',
          trend: 'stable',
          color: 'purple',
          detail: '92% retention rate',
        },
        {
          title: 'User Growth',
          value: 14.5,
          icon: 'Activity',
          trend: 'up',
          color: 'blue',
          detail: '+3.2% from last month',
        },
      ],
    }
  }

  export function getMockSystemStatus() {
    return {
      cpuUsage: 65,
      memoryUsage: 78,
      networkStatus: 92,
      diskSpace: 43,
      processes: [
        {
          pid: '1234',
          name: 'system_core.exe',
          user: 'System',
          cpu: 5.2,
          memory: 345,
          status: 'Running',
        },
        {
          pid: '2345',
          name: 'database.exe',
          user: 'Admin',
          cpu: 12.5,
          memory: 1024,
          status: 'Running',
        },
        // ...more processes
      ],
      storage: [
        { name: 'System Drive (C:)', total: 512, used: 256, type: 'SSD' },
        { name: 'Data Drive (D:)', total: 1024, used: 512, type: 'HDD' },
        // ...more storage items
      ],
    }
  }
  ```

### 6. E2E Testing dengan Playwright ⏳ (DIRENCANAKAN)

#### 6.1 User Management E2E

- [ ] **Test Case: User Management Workflow**

  ```typescript
  // __tests__/e2e/manage-users/user-management.spec.ts
  import { test, expect } from '@playwright/test'

  test('complete user management workflow', async ({ page }) => {
    // Login (if required)
    // Navigate to user management
    // Test filtering
    // Test editing user
    // Test search
  })
  ```

#### 6.2 Dashboard View E2E

- [ ] **Test Case: Dashboard Navigation & Display**

  ```typescript
  // __tests__/e2e/manage-users/dashboard.spec.ts
  import { test, expect } from '@playwright/test'

  test('dashboard displays and functions correctly', async ({ page }) => {
    // Setup and login
    // Test navigation
    // Test system status display
    // Test interactive elements
  })
  ```

### 7. Test Coverage & Documentation 📊

- [x] **Setup dan Run Coverage Reports**

  ```bash
  # Command untuk generate coverage report
  jest --coverage
  ```

- [x] **Dokumentasi Pattern dan Strategy Testing**

  - Buat dokumentasi panduan testing di `/documentation/task/manage-users/report-test/test-plan-Unit.md`
  - Documentation unit test report di `/features/manage-users/Task/report/unit-test-report.md`

- [ ] **Test Report untuk Integration Testing** (direncanakan)

  - Buat test report untuk integration testing yang mencakup:
    - Metodologi dan pendekatan
    - Cakupan dan hasil
    - Rekomendasi perbaikan
  - Target lokasi: `/features/manage-users/Task/report/integration-test-report.md`

- [ ] **Update Modul Dokumentasi**
  - Update dokumentasi modul dengan status testing di `/documentation/task/manage-users/manage-users-docs.md`
  - Tambahkan hasil coverage test

## Jadwal Implementasi Terevisi

| Hari | Task                      | Milestone                                              |
| ---- | ------------------------- | ------------------------------------------------------ |
| 1-3  | Unit Testing (Selesai) ✅ | 20 test suites / 130 tests dengan coverage >95%        |
| 4-5  | Integration Testing 🔄    | 10 test suites dengan coverage >87%                    |
| 6    | E2E Testing ⏳            | 5 scenario tests dengan coverage untuk alur utama >80% |
| 7    | Dokumentasi & Finalisasi  | Laporan coverage & dokumentasi lengkap                 |

## File dan Komponen yang Perlu Diuji

### Komponen UI

1. **User Table & Komponennya**

   - `/features/manage-users/components/ui/UserTable.tsx`
   - `/features/manage-users/components/ui/UserTable/DataTable.tsx`
   - `/features/manage-users/components/ui/UserTable/UserRoleCell.tsx`
   - `/features/manage-users/components/ui/UserTable/UserActionCell.tsx`
   - `/features/manage-users/components/ui/UserTable/EditUserDialog.tsx`
   - `/features/manage-users/components/ui/UserTable/columns.tsx`

2. **Dashboard Components**

   - `/features/manage-users/components/dashboard/ClientSidebar.tsx`
   - `/features/manage-users/components/dashboard/CommunicationsLog.tsx`
   - `/features/manage-users/components/dashboard/Header.tsx`
   - `/features/manage-users/components/dashboard/LoadingOverlay.tsx`
   - `/features/manage-users/components/dashboard/RightSidebar.tsx`
   - `/features/manage-users/components/dashboard/SecurityAndAlerts.tsx`
   - `/features/manage-users/components/dashboard/Sidebar.tsx`
   - `/features/manage-users/components/dashboard/SystemOverview.tsx`

3. **UI Elements**
   - `/features/manage-users/components/ui/ActionButton.tsx`
   - `/features/manage-users/components/ui/AlertItem.tsx`
   - `/features/manage-users/components/ui/CommunicationItem.tsx`
   - `/features/manage-users/components/ui/MetricCard.tsx`
   - `/features/manage-users/components/ui/NavItem.tsx`
   - `/features/manage-users/components/ui/PerformanceChart.tsx`
   - `/features/manage-users/components/ui/ProcessRow.tsx`
   - `/features/manage-users/components/ui/StatusItem.tsx`
   - `/features/manage-users/components/ui/StorageItem.tsx`

### Hooks

1. **Data Fetching & State Management Hooks**
   - `/features/manage-users/hooks/useChartData.ts`
   - `/features/manage-users/hooks/useSystemStatus.ts`
   - `/features/manage-users/hooks/useUsers.ts`
   - `/features/manage-users/hooks/useUserActions.ts`
   - `/features/manage-users/hooks/useUserHistory.ts`
   - `/features/manage-users/hooks/useFilter.ts`
   - `/features/manage-users/hooks/usePagination.ts`

### Services & Utils

1. **Services**

   - `/features/manage-users/service/charts.ts`
   - `/features/manage-users/service/userService.ts`

2. **Utils**
   - `/features/manage-users/utils/formatters.ts`
   - `/features/manage-users/utils/validators.ts`
   - `/features/manage-users/utils/dataTransformers.ts`

## Hasil yang Diharapkan

1. **Test Coverage yang Tinggi**

   - Unit Tests: >95% coverage
   - Integration Tests: >87% coverage
   - E2E Tests: Minimal coverage untuk semua user flow utama

2. **Improved Code Quality**

   - Kode yang lebih maintainable dan robust
   - Refaktorisasi kode bermasalah yang ditemukan saat testing
   - Dokumentasi pattern testing yang jelas

3. **Test Report yang Komprehensif**

   - Laporan coverage test yang mendetail
   - Dokumentasi test cases yang dapat digunakan sebagai referensi

4. **Knowledge Transfer**
   - Tim memahami prinsip TDD dan dapat menerapkannya pada pengembangan selanjutnya
   - Standarisasi approach testing di seluruh modul aplikasi
