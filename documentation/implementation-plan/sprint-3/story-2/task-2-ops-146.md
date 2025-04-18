Berikut adalah breakdown **Task OPS-146: Updated UI Design Page Manage-User** dengan deskripsi, subtask teknis, dan rekomendasi implementasi:

---

### **Task OPS-146: Updated UI Design Page Manage-User**

**Assignee:** `@frontend-dev`  
**Reviewer:** `@ui-ux-reviewer`  
**Deadline:** `10 Juni 2024`  
**Story Points:** `5` (kompleksitas sedang)  
**Dependencies:**

- Membutuhkan API dari [OPS-54](https://eviewnicks-1738239611759.atlassian.net/browse/OPS-54) (Audit Log) dan [OPS-148](https://eviewnicks-1738239611759.atlassian.net/browse/OPS-148) (RBAC).
- Data user dari Prisma yang sudah dioptimasi ([OPS-147](https://eviewnicks-1738239611759.atlassian.net/browse/OPS-147)).

---

### **Deskripsi Task**

Mendesain ulang dan mengimplementasikan antarmuka halaman manajemen user yang mendukung real-time updates, RBAC, dan integrasi audit log untuk memudahkan admin mengelola user.

**Tujuan:**

1. Menampilkan data user dengan informasi lengkap (role, status, riwayat perubahan).
2. Memastikan perubahan data user (role/status) tercermin di UI secara real-time.
3. Membatasi akses UI berdasarkan role (hanya admin yang bisa edit/hapus).

---

### **Breakdown Subtask**

#### 1. **Redesign UI Layout** _(2 Hari)_

- **Komponen:**
  - Tabel user dengan kolom: Nama, Email, Role, Status, Terakhir Diupdate, Aksi (Edit/Delete/View History).
  - Filter berdasarkan role (`admin`, `mahasiswa`) dan status (`active`, `inactive`).
  - Tombol "View History" untuk menampilkan audit log (modal atau side panel).
- **Desain Figma:**
  - [Link ke desain Figma](https://www.figma.com/file/maguru-admin-dashboard) (perlu akses).
- **Contoh Struktur Komponen:**
  ```tsx
  <UserTable>
    <TableHeader columns={["Name", "Email", "Role", "Status", "Actions"]} />
    <TableBody data={users} renderRow={(user) => (
      <TableCell>{user.name}</TableCell>
      <TableCell>{user.email}</TableCell>
      <TableCell><RoleBadge role={user.role} /></TableCell>
      <TableCell><StatusIndicator status={user.status} /></TableCell>
      <TableCell>
        <EditButton onClick={() => openEditModal(user)} />
        <HistoryButton onClick={() => fetchHistory(user.id)} />
      </TableCell>
    )} />
  </UserTable>
  ```

#### 2. **Implementasi Test-Driven Development (TDD) untuk UI** _(1 Hari)_

- **Unit Tests untuk Komponen:**

  ```tsx
  // components/UserTable.test.tsx
  import { render, screen } from '@testing-library/react'
  import userEvent from '@testing-library/user-event'
  import { UserTable } from './UserTable'

  describe('UserTable Component', () => {
    const mockUsers = [
      {
        id: 'user1',
        name: 'John Doe',
        email: 'john@example.com',
        role: 'admin',
        status: 'active',
      },
      {
        id: 'user2',
        name: 'Jane Smith',
        email: 'jane@example.com',
        role: 'mahasiswa',
        status: 'inactive',
      },
    ]

    it('should render all user rows', () => {
      render(<UserTable users={mockUsers} currentUserRole="admin" />)

      expect(screen.getByText('John Doe')).toBeInTheDocument()
      expect(screen.getByText('Jane Smith')).toBeInTheDocument()
    })

    it('should show edit buttons only for admin users', () => {
      render(<UserTable users={mockUsers} currentUserRole="admin" />)

      // Admin should see edit buttons
      expect(screen.getAllByRole('button', { name: /edit/i })).toHaveLength(2)

      // Re-render as mahasiswa
      render(<UserTable users={mockUsers} currentUserRole="mahasiswa" />)

      // Mahasiswa should not see edit buttons
      expect(
        screen.queryByRole('button', { name: /edit/i })
      ).not.toBeInTheDocument()
    })

    it('should filter users when filter is applied', async () => {
      const user = userEvent.setup()
      render(<UserTable users={mockUsers} currentUserRole="admin" />)

      // Open filter dropdown
      await user.click(screen.getByRole('button', { name: /filter/i }))

      // Select 'admin' role filter
      await user.click(screen.getByRole('option', { name: /admin/i }))

      // Only admin user should be visible
      expect(screen.getByText('John Doe')).toBeInTheDocument()
      expect(screen.queryByText('Jane Smith')).not.toBeInTheDocument()
    })
  })
  ```

- **Integration Tests:**

  ```tsx
  // pages/manage-users.test.tsx
  import { render, screen, waitFor } from '@testing-library/react'
  import { ManageUsersPage } from './manage-users'
  import { SWRConfig } from 'swr'
  import * as usersApi from '@/services/users-api'

  // Mock API responses
  jest.mock('@/services/users-api')

  describe('Manage Users Page', () => {
    beforeEach(() => {
      // Mock API responses
      usersApi.getUsers.mockResolvedValue([
        { id: 'user1', name: 'John', role: 'admin' },
      ])
      usersApi.getUserHistory.mockResolvedValue([
        {
          id: 'hist1',
          field: 'role',
          oldValue: 'mahasiswa',
          newValue: 'admin',
        },
      ])
    })

    it('should load and display users', async () => {
      render(
        <SWRConfig value={{ provider: () => new Map() }}>
          <ManageUsersPage />
        </SWRConfig>
      )

      // Check loading state
      expect(screen.getByText(/loading/i)).toBeInTheDocument()

      // Check users are displayed after loading
      await waitFor(() => {
        expect(screen.getByText('John')).toBeInTheDocument()
      })
    })

    it('should show history modal when history button is clicked', async () => {
      render(
        <SWRConfig value={{ provider: () => new Map() }}>
          <ManageUsersPage />
        </SWRConfig>
      )

      // Wait for users to load
      await waitFor(() => {
        expect(screen.getByText('John')).toBeInTheDocument()
      })

      // Click history button
      userEvent.click(screen.getByRole('button', { name: /history/i }))

      // Check history modal is displayed
      await waitFor(() => {
        expect(screen.getByText(/role changed from/i)).toBeInTheDocument()
        expect(screen.getByText(/mahasiswa to admin/i)).toBeInTheDocument()
      })
    })
  })
  ```

#### 3. **Integrasi Real-Time Data** _(1.5 Hari)_

- **Polling Data:** Fetch data setiap 10 detik dari endpoint `/api/users` (implementasi di `useEffect` React).
  ```tsx
  const { data: users, refetch } = useSWR('/api/users', fetcher, {
    refreshInterval: 10000, // Polling setiap 10 detik
  })
  ```
- **Webhook Update:** Jika ada event dari Clerk (misal: user dihapus), tampilkan toast notifikasi:
  ```tsx
  // Contoh: Listen ke WebSocket/Socket.io (jika tersedia)
  socket.on('user-updated', (userId) => {
    refetch()
    toast.success(`User ${userId} diperbarui!`)
  })
  ```

#### 4. **Implementasi RBAC di UI** _(1 Hari)_

- Sembunyikan tombol edit/hapus untuk non-admin:
  ```tsx
  {user.role === 'admin' && (
    <EditButton onClick={...} />
  )}
  ```
- Proteksi rute halaman `/manage-users` dengan middleware Clerk:
  ```ts
  // pages/manage-users.tsx
  export const getServerSideProps = withServerAuth()
  ```

#### 5. **Integrasi Audit Log (History)** _(1 Hari)_

- Tambahkan modal untuk menampilkan riwayat perubahan dari endpoint `/api/admin/users/:id/history`:
  ```tsx
  const HistoryModal = ({ userId }) => {
    const { data: history } = useSWR(`/api/admin/users/${userId}/history`)
    return (
      <Modal>
        {history?.map((entry) => (
          <HistoryEntry
            key={entry.id}
            field={entry.field}
            oldValue={entry.oldValue}
            newValue={entry.newValue}
          />
        ))}
      </Modal>
    )
  }
  ```

#### 6. **Responsiveness & Accessibility Testing** _(1 Hari)_

- **Responsive Testing:**

  - Implementasi test untuk device viewport berbeda:

  ```typescript
  // utils/viewport-test.js
  import { render } from '@testing-library/react'

  const breakpoints = {
    mobile: 375,
    tablet: 768,
    desktop: 1440
  }

  export const renderWithViewport = (component, width) => {
    global.innerWidth = width
    global.dispatchEvent(new Event('resize'))
    return render(component)
  }

  describe('UserTable Responsive Layout', () => {
    it('should display as cards on mobile', () => {
      const { container } = renderWithViewport(<UserTable users={mockUsers} />, breakpoints.mobile)
      expect(container.querySelector('.user-table-card')).toBeInTheDocument()
      expect(container.querySelector('.user-table-grid')).not.toBeInTheDocument()
    })

    it('should display as table on desktop', () => {
      const { container } = renderWithViewport(<UserTable users={mockUsers} />, breakpoints.desktop)
      expect(container.querySelector('.user-table-grid')).toBeInTheDocument()
      expect(container.querySelector('.user-table-card')).not.toBeInTheDocument()
    })
  })
  ```

- **Accessibility Testing:**

  ```typescript
  import { axe, toHaveNoViolations } from 'jest-axe'
  expect.extend(toHaveNoViolations)

  it('should have no accessibility violations', async () => {
    const { container } = render(<UserTable users={mockUsers} />)
    const results = await axe(container)
    expect(results).toHaveNoViolations()
  })
  ```

#### 7. **Dokumentasi** _(0.5 Hari)_

- Update `README.md` dengan:
  - Struktur komponen UI.
  - Cara menambahkan filter/kolom baru.
  - Testing strategy dan coverage.

---

### **Acceptance Criteria**

- [x] Data user di UI terupdate dalam **10 detik** setelah perubahan.
- [x] Tombol edit/hapus hanya muncul untuk admin.
- [x] Audit log bisa diakses via modal dengan 1 klik.
- [x] UI responsif di layar ≥320px (mobile) dan ≤1440px (desktop).
- [x] Unit test coverage minimal 80% untuk komponen UI.
- [x] Tidak ada accessibility violations (WCAG AA).

---

### **Contoh UI Elements**

1. **Badge Role:**

   ```tsx
   const RoleBadge = ({ role }) => (
     <span
       className={`badge ${role === 'admin' ? 'bg-red-500' : 'bg-gray-500'}`}
     >
       {role}
     </span>
   )
   ```

2. **Status Indicator:**
   ```tsx
   const StatusIndicator = ({ status }) => (
     <div className="flex items-center">
       <div
         className={`w-3 h-3 rounded-full ${status === 'active' ? 'bg-green-500' : 'bg-gray-400'}`}
       />
       <span className="ml-2">{status}</span>
     </div>
   )
   ```

---

### **Catatan Penting**

1. **Error Handling:**

   - Tampilkan toast error jika polling gagal.

   ```tsx
   const { data: users, error } = useSWR('/api/users', fetcher)
   useEffect(() => {
     if (error) toast.error('Gagal memuat data user!')
   }, [error])
   ```

2. **Performance:**

   - Hindari re-render berlebihan dengan memoization (`React.memo` atau `useMemo`).
   - Gunakan virtualisasi untuk rendering daftar panjang (`react-virtualized` atau `react-window`).

3. **Accessibility (A11y):**

   - Pastikan semua elemen interaktif dapat diakses dengan keyboard.
   - Tambahkan atribut ARIA yang sesuai untuk modals dan dynamic content.
   - Pastikan contrast ratio warna memenuhi standar WCAG AA.

4. **Testing Strategy:**

   - Implementasikan TDD dengan menulis test terlebih dahulu sebelum implementasi UI.
   - Prioritaskan test untuk conditional rendering (RBAC) dan event handlers.

5. **Referensi:**
   - [Clerk UI Components](https://clerk.dev/docs/component-reference)
   - [SWR untuk Data Fetching](https://swr.vercel.app/)
   - [WCAG Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)
   - [React Testing Library](https://testing-library.com/docs/react-testing-library/intro/)

---

Task ini siap diassign ke `@frontend-dev`! 🎨
