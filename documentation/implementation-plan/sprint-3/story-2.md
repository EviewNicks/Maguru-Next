# User Story OPS-58: Fitur Pengelolaan User Untuk Admin

## 📋 Informasi Dasar

- **ID Story**: OPS-58
- **Judul**: Sebagai admin, saya ingin memberikan beberapa fitur untuk memudahkan memanage user
- **Estimasi**: 10 Story Points
- **Prioritas**: High
- **Assignee**: [Backend & Frontend Developer]
- **Terkait dengan**: Sprint 3
- **Dependensi**: OPS-147 (Prisma Schema Update), OPS-148 (RBAC Enhancement)

## 📝 Deskripsi

Sebagai admin, saya memerlukan fitur yang memudahkan manajemen user seperti melihat riwayat perubahan data user (audit log) dan antarmuka yang lebih baik untuk pengelolaan user. Hal ini akan membantu proses administrasi dan transparansi sistem.

### Nilai Bisnis

- Meningkatkan **transparansi dan akuntabilitas** dalam sistem dengan adanya jejak audit.
- Memungkinkan **investigasi cepat** terhadap perubahan data sensitif jika ada masalah.
- Menyediakan **antarmuka yang lebih efisien** untuk manajemen user, menghemat waktu admin.

### Konteks Teknis

- Aplikasi menggunakan:
  - **Clerk** untuk autentikasi user.
  - **Prisma** sebagai ORM untuk mengelola database.
  - **Next.js** dengan App Router untuk frontend.
  - **shadcn/ui** untuk komponen UI.
- Data user sensitif perlu dilacak setiap kali ada perubahan.
- Perlu mekanisme RBAC untuk membatasi akses ke data audit log.

## ✅ Acceptance Criteria

1. Setiap perubahan data user (email, role, status) dicatat secara otomatis di database.
2. Admin dapat melihat riwayat perubahan user via UI dan API dengan filter sederhana.
3. UI manajemen user diperbarui dengan tampilan yang lebih informatif dan responsif.
4. Data audit log hanya dapat diakses oleh user dengan role `admin`.
5. Sistem pencatatan history tidak mempengaruhi performa operasi utama (latency <300ms).
6. UI menampilkan perubahan data dalam waktu <10 detik tanpa refresh halaman.

## 📊 Definisi "Selesai"

- Skema Prisma telah diupdate dengan model `UserHistory`.
- Middleware Prisma untuk tracking perubahan telah diimplementasikan dan diuji.
- API endpoints untuk mengakses audit log telah dibuat dan diproteksi dengan RBAC.
- UI manajemen user yang baru telah diimplementasikan dan responsif di semua ukuran layar.
- Semua komponen UI telah melalui accessibility testing.
- Code coverage untuk unit dan integration test mencapai minimal 80%.
- Dokumentasi API dan UI telah diperbarui.
- Code review telah dilakukan dan semua komentar ditindaklanjuti.

## 🧩 Task Breakdown

1. **OPS-54**: Membuat sistem pelacakan riwayat perubahan data user (audit log) yang dapat diakses oleh admin (5 SP)

   - Mendesain skema database untuk history
   - Implementasi logging otomatis dengan Prisma middleware
   - Membuat API untuk akses riwayat
   - Implementasi strategi data retention
   - Pengujian dan keamanan

2. **OPS-146**: Updated UI Design Page Manage-User (5 SP)
   - Redesign UI layout tabel user
   - Integrasi real-time data dengan polling
   - Implementasi RBAC di UI
   - Integrasi audit log (history)
   - Responsiveness & accessibility testing

## 📚 Dokumentasi & Referensi

- [Prisma Middleware](https://www.prisma.io/docs/orm/prisma-client/client-extensions/middleware)
- [RBAC dengan Clerk](https://docs.clerk.dev/popular-guides/roles-permissions)
- [Jest Testing dengan Prisma](https://www.prisma.io/docs/guides/testing/unit-testing)
- [AWS S3 Cold Storage](https://aws.amazon.com/s3/storage-classes/) (untuk archiving audit log)
- [shadcn/ui Table Component](https://ui.shadcn.com/docs/components/table)
- [Accessibility Guidelines (WCAG AA)](https://www.w3.org/WAI/WCAG21/quickref/)

## ❓ Pertanyaan yang Sudah Terjawab

1. **Apakah Perlu Mencatat Perubahan oleh User Sendiri?**  
   Ya, kita akan mencatat **semua** perubahan, termasuk yang dilakukan oleh user itu sendiri.

2. **Bagaimana dengan Operasi Delete User?**  
   Operasi `delete` akan dicatat sebagai entri history khusus dengan flag `isDeleted: true`.

3. **Retention Period untuk Audit Log?**  
   Implementasikan retention period 1 tahun dengan archiving ke S3 untuk kebutuhan audit jangka panjang.

4. **Real-Time Update untuk UI?**  
   Gunakan polling setiap 10 detik untuk update UI tanpa refresh halaman penuh.

5. **Batasan Akses pada History?**  
   Hanya user dengan role `admin` yang dapat mengakses data history dan endpoint-nya dilindungi dengan RBAC.
