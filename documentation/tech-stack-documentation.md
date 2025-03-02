# Pendahuluan

## Tujuan
Dokumen ini dibuat untuk merangkum teknologi yang digunakan dalam pengembangan platform Maguru, termasuk alasan pemilihan teknologi dan cara elemen-elemen tersebut berinteraksi untuk mendukung kebutuhan pengguna.

## Cakupan
Dokumen ini mencakup:
- Teknologi yang digunakan untuk frontend, backend, dan database.
- Infrastruktur deployment dan CI/CD.
- Arsitektur sistem dan alur komunikasi data.
- Alasan pemilihan setiap teknologi, termasuk potensi optimasi masa depan.
- Praktik keamanan dan rencana pengembangan fitur lanjutan.

---

# Pilihan Teknologi

## **Frontend**
- **Framework**: Next.js (React)
- **Styling**: Tailwind CSS
- **Komponen UI**: shadcn/ui
- **State Management**: Redux
- **Autentikasi**: Clerk (untuk auth & user management)
- **Testing**: Jest (untuk unit testing)

## **Backend**
- **Runtime Environment**: Node.js
- **Framework**: Express.js
- **ORM**: Prisma
- **Database**: PostgreSQL
- **Caching**: Redis (jika diperlukan untuk optimasi di masa depan)
- **Testing**: Jest + Supertest (untuk unit & integration testing)

## **Deployment & DevOps**
- **Frontend Hosting**: Vercel
- **Backend Hosting**: Railway
- **CI/CD**: GitHub Actions
- **Environment Management**: Vercel Environment Variables, Railway Secrets

---

# Arsitektur Sistem

- **Tipe Arsitektur**: Monolitik (untuk tahap awal, bisa dieksplorasi ke microservices jika skala membesar)
- **Komunikasi Frontend-Backend**: REST API
- **Autentikasi**: Menggunakan Clerk untuk authentication, dengan middleware untuk role-based authorization
- **Data Flow**:  
  - Frontend berkomunikasi dengan backend melalui HTTP request → Backend mengakses database via Prisma → Mengembalikan respons ke frontend

## 🏗 **Bagian Utama**
### **User**: 
- Mengakses platform melalui browser.

### **Frontend (Next.js)**
- Mengirim permintaan HTTP ke backend.
- Berkomunikasi dengan Clerk untuk autentikasi.

### **Backend (Express.js + Node.js)**
- Mengelola permintaan dari frontend.
- Mengakses data di database melalui Prisma ORM.
- Mengelola caching dengan Redis (opsional untuk optimasi).

### **Database (PostgreSQL)**
- Menyimpan data pengguna, modul pembelajaran, progres belajar, role, dan status.

### **Layanan Hosting**
- **Frontend**: Vercel (auto-deploy dengan dukungan SSR).
- **Backend**: Railway (scalable dan mudah dikelola).
- **CI/CD**: GitHub Actions (untuk otomatisasi build, test, dan deploy).

## 🔀 **Aliran Data**
### **Login/Registrasi**
- User → Clerk (autentikasi) → Backend → Database

### **Progres Belajar**
- Frontend (tampilkan data pengguna) → Backend → Database → Frontend

### **Leaderboard (dengan caching)**
- Frontend → Backend → Redis (jika ada) → Database

---

# Alasan Pemilihan Teknologi

## **Next.js (React)**
- Mendukung Server-Side Rendering (SSR) dan Incremental Static Regeneration (ISR) untuk performa tinggi.
- Routing bawaan yang mempermudah pengelolaan halaman.
- Komunitas besar dan ekosistem kuat, mudah menemukan solusi saat ada kendala.

## **Tailwind CSS**
- Mempercepat proses styling dengan utility-first classes.
- Mengurangi kebutuhan file CSS terpisah, langsung diterapkan di komponen.

## **Redux**
- Mengelola state global untuk memudahkan sinkronisasi data antar komponen.
- Berguna untuk fitur seperti manajemen progres belajar atau notifikasi global.

## **Clerk (Auth Management)**
- Mengurangi kompleksitas pengelolaan autentikasi.
- Dukungan lengkap untuk session, token, dan pengelolaan role.

## **Node.js + Express.js**
- Cepat, ringan, dan cocok untuk membangun API REST.
- Dukungan ekosistem luas (middleware, library) mempercepat pengembangan.

## **PostgreSQL**
- Basis data relasional yang kuat dan stabil.
- Cocok untuk data terstruktur seperti user, progress belajar, dan leaderboard.

## **Redis (Opsional untuk caching)**
- Mengurangi load database untuk data yang sering diakses (misal, leaderboard).
- Mempercepat respons API dengan menyimpan data sementara di memori.

## **Vercel (Frontend Hosting)**
- Mudah diintegrasikan dengan Next.js.
- Auto-deploy dan optimasi performa bawaan.

## **Railway (Backend Hosting)**
- Deployment yang simpel dan mendukung scaling otomatis.
- Pengelolaan variabel environment yang praktis.

## **GitHub Actions (CI/CD)**
- Otomatisasi build, test, dan deployment saat ada perubahan kode.
- Memastikan fitur baru diuji sebelum dirilis ke production.

---

# Keamanan

- **Autentikasi**: Clerk dengan token JWT.
- **Otorisasi**: Middleware untuk membatasi akses berdasarkan role (RBAC).
- **Enkripsi Data**: Password dan data sensitif dienkripsi sebelum disimpan (jika ada).
- **Rate Limiting**: Mencegah brute force attack pada endpoint sensitif (akan diimplementasikan).
- **Helmet.js**: Mengamankan header HTTP untuk mencegah serangan umum.
- **CORS Policy**: Membatasi origin yang bisa mengakses API.

---

# Rencana Pengembangan

## ✅ **Sprint 1 (Done)**
- Setup autentikasi & CRUD user.
- Implementasi role & status management.
- CI/CD pipeline dengan GitHub Actions.

## 🔜 **Sprint 2 (Planned)**
- Modul pembelajaran interaktif.
- Quiz & sistem penilaian.
- Swagger untuk dokumentasi API otomatis.
- Monitoring & logging dengan tools seperti Sentry atau Logtail.

## 🚀 **Masa Depan**
- Migrasi ke microservices jika platform berkembang pesat.
- Eksplorasi GraphQL jika kebutuhan query makin kompleks.
- Implementasi caching agresif (Redis) untuk optimasi performa.

---

# Catatan Tambahan

- Untuk versi selanjutnya, bisa dieksplorasi **GraphQL** jika REST API mulai terlalu kompleks.
- **Swagger** bisa ditambahkan untuk dokumentasi API otomatis di sprint mendatang.
