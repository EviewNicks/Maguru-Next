# E2E Test Plan - Autentikasi Pengguna

**Versi:** 1.0.0  
**Pemilik:** Tim Frontend  
**Terakhir Diperbarui:** 2023-08-12

---

## 1. Pendahuluan

### 1.1 Tujuan

Dokumen ini menjelaskan strategi, cakupan, dan prosedur pengujian End-to-End (E2E) untuk fitur **Autentikasi Pengguna** menggunakan Clerk, dengan tujuan memastikan fungsionalitas sesuai spesifikasi dan kebutuhan pengguna.

### 1.2 Ruang Lingkup

| Diuji ✅                             | Tidak Diuji ❌                                    |
| ------------------------------------ | ------------------------------------------------- |
| - Login (Modal dan Redirect)         | - Performa ekstrem (load testing)                 |
| - Registrasi dan verifikasi email    | - Keamanan mendalam (penetration testing)         |
| - Logout                             | - Integrasi dengan layanan eksternal selain Clerk |
| - Autentikasi dengan social provider |                                                   |

---

## 2. Lingkungan Pengujian

| Komponen        | Detail                          |
| --------------- | ------------------------------- |
| **Environment** | Local Development/Staging       |
| **URL**         | `http://localhost:3000`         |
| **Tools**       | Playwright v1.40+, Node.js v18+ |
| **Browser**     | Chromium, Firefox, WebKit       |

### 2.1 Struktur File Testing

```
/__tests__
  └── e2e
       ├── auth/
       │     ├── login.spec.ts
       │     ├── register.spec.ts
       │     └── logout.spec.ts
       ├── fixtures/
       │     └── auth-mocks.ts
       ├── pages/
       │     └── authPages.ts
       └── utils/
             └── auth-helpers.ts
```

---

## 3. Fitur yang Diuji

| Fitur        | Prioritas | Deskripsi Singkat                      |
| ------------ | --------- | -------------------------------------- |
| Login Modal  | High      | Validasi login melalui modal pop-up    |
| Registrasi   | High      | Validasi alur registrasi pengguna baru |
| Logout       | Medium    | Proses keluar dari sistem              |
| Auth Session | High      | Persistensi dan validitas session      |

---

## 4. Strategi Pengujian

### 4.1 Metode

- **Jenis Pengujian:** Regression, smoke testing.
- **Kriteria Kelulusan:**
  - 100% skenario happy path pass.
  - Maksimal 5% flaky test.
  - Seluruh browser utama (Chrome, Firefox, Safari) berfungsi.

### 4.2 Kriteria Kegagalan

- Test dihentikan jika:
  - Terdapat critical bug yang memblokir alur utama.
  - Kegagalan di >30% test case.
  - Error terus-menerus pada satu browser tertentu.

---

## 5. Skenario Pengujian

| ID   | Deskripsi                           | Langkah                                                                    | Data Uji                                               | Kriteria Sukses                        |
| ---- | ----------------------------------- | -------------------------------------------------------------------------- | ------------------------------------------------------ | -------------------------------------- |
| TC01 | Membuka modal login                 | 1. Klik tombol login di navbar                                             | N/A                                                    | Modal login ditampilkan                |
| TC02 | Login dengan kredensial valid       | 1. Buka modal login<br>2. Isi email & password<br>3. Klik Continue         | `test@example.com`<br>`password123`                    | User berhasil login, UserButton muncul |
| TC03 | Login dengan kredensial tidak valid | 1. Buka modal login<br>2. Isi email & password invalid<br>3. Klik Continue | `invalid@example.com`<br>`wrongpass`                   | Pesan error muncul                     |
| TC04 | Membuka modal registrasi            | 1. Klik tombol register di navbar                                          | N/A                                                    | Modal registrasi ditampilkan           |
| TC05 | Registrasi dengan info valid        | 1. Buka modal registrasi<br>2. Isi form dengan data valid<br>3. Submit     | `test${timestamp}@example.com`<br>`SecurePassword123!` | User berhasil terdaftar                |
| TC06 | Logout dari aplikasi                | 1. Klik UserButton<br>2. Klik Log out                                      | N/A                                                    | User logout, SignInButton muncul       |

---

## 6. Manajemen Data

### 6.1 Data Input

- **Test User Account:** Akun khusus untuk testing dengan email dan password yang disimpan sebagai environment variables.
- **Random Email:** Untuk test registrasi, gunakan email dinamis dengan timestamp untuk menghindari konflik.

### 6.2 Cleanup

```typescript
// Contoh: Setup dengan localStorage untuk simulasi session
beforeEach(async ({ page }) => {
  const clerkToken = process.env.CLERK_TEST_TOKEN
  if (clerkToken) {
    await page.evaluate((token) => {
      localStorage.setItem('__clerk_client_jwt', token)
    }, clerkToken)
  }
})
```

---

## 7. Jadwal & Sumber Daya

| Task                       | Timeline | Penanggung Jawab  |
| -------------------------- | -------- | ----------------- |
| Persiapan Test Environment | 1 Hari   | Tim DevOps        |
| Implementasi Test          | 3 Hari   | Tim Frontend      |
| Eksekusi & Debugging       | 2 Hari   | Tim QA + Frontend |

---

## 8. Risiko & Mitigasi

| Risiko                    | Dampak | Mitigasi                                               |
| ------------------------- | ------ | ------------------------------------------------------ |
| Clerk API tidak stabil    | High   | Gunakan mock/intercept untuk API Clerk                 |
| Test user tidak konsisten | Medium | Gunakan environment variables & dedicated test account |
| Flaky tests pada CI       | Medium | Menggunakan retry mechanism & memperpanjang timeout    |

---

## 9. Pelaporan

**Format**: HTML Report (Playwright built-in)

**Metrik**:

- Pass/fail rate per browser
- Screenshot untuk test gagal
- Trace viewer untuk debugging

**Lokasi Report**:

- Local: `./services/playwright-report/`
- CI: Disimpan sebagai artifact

---

## 10. Persetujuan

| Pihak         | Tanda Tangan | Tanggal    |
| ------------- | ------------ | ---------- |
| QA Lead       | [Digital]    | 2023-08-15 |
| Frontend Lead | [Digital]    | 2023-08-15 |

---

## Catatan

- Pastikan memiliki test user yang stabil untuk pengujian login.
- Siapkan environment variables di `.env.test.local` dengan format:

```
TEST_USER_EMAIL=your_test_email@example.com
TEST_USER_PASSWORD=your_test_password
CLERK_TEST_TOKEN=your_clerk_test_token
```

- Jalankan test menggunakan: `npx playwright test`
- Lihat report dengan: `npx playwright show-report`
