Berikut adalah breakdown **Task OPS-146: Updated UI Design Page Manage-User** dengan deskripsi, subtask teknis, dan rekomendasi implementasi:

---

### **Task OPS-146: Updated UI Design Page Manage-User**

**Assignee:** `@frontend-dev`  
**Reviewer:** `@ui-ux-reviewer`  
**Deadline:** `10 Juni 2024`  
**Story Points:** `5` (kompleksitas sedang)  
**Dependencies:**

- Membutuhkan API dari [OPS-54](link-ke-ops54) (Audit Log) dan [OPS-148](link-ke-ops148) (RBAC).
- Data user dari Prisma yang sudah dioptimasi ([OPS-147](link-ke-ops147)).

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
  - [Link ke desain Figma](#) (pastikan responsif untuk mobile/desktop).
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

#### 2. **Integrasi Real-Time Data** _(1.5 Hari)_

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

#### 3. **Implementasi RBAC di UI** _(1 Hari)_

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

#### 4. **Integrasi Audit Log (History)** _(1 Hari)_

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

#### 5. **Testing & Responsiveness** _(1 Hari)_

- **Test Case:**
  1.  Admin mengubah role user → UI update tanpa refresh.
  2.  User non-admin tidak melihat tombol edit/hapus.
  3.  Audit log menampilkan perubahan dengan benar.
- **Responsiveness:**
  - Pastikan tabel bisa di-scroll horizontal di mobile.
  - Gunakan library seperti `react-responsive` atau CSS media queries.

#### 6. **Dokumentasi** _(0.5 Hari)_

- Update `README.md` dengan:
  - Struktur komponen UI.
  - Cara menambahkan filter/kolom baru.

---

### **Acceptance Criteria**

- [x] Data user di UI terupdate dalam **10 detik** setelah perubahan.
- [x] Tombol edit/hapus hanya muncul untuk admin.
- [x] Audit log bisa diakses via modal dengan 1 klik.
- [x] UI responsif di layar ≥320px (mobile) dan ≤1440px (desktop).

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

3. **Referensi:**
   - [Clerk UI Components](https://clerk.dev/docs/component-reference)
   - [SWR untuk Data Fetching](https://swr.vercel.app/)

---

Task ini siap diassign ke `@frontend-dev`! 🎨
