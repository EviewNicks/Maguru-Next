Berikut breakdown **Task OPS-56: Webhook Auth with Clerk in Deployment to Vercel** beserta deskripsi dan subtask teknisnya:

---

### **Task OPS-56: Webhook Auth with Clerk in Deployment to Vercel**

**Deskripsi:**  
Mengimplementasikan webhook dari Clerk untuk otomatisasi update data user secara real-time di aplikasi yang terdeploy di Vercel. Webhook ini akan menangani event perubahan data user (email, nama, status) dari Clerk dan memastikan sinkronisasi dengan database via Prisma.

**Tujuan:**

- Memastikan perubahan data user di Clerk langsung terupdate ke database tanpa perlu operasi manual.
- Membuat sistem autentikasi webhook yang aman untuk mencegah request ilegal.

---

### **Breakdown Subtask:**

#### 1. **Setup Webhook di Dashboard Clerk**

- Buat webhook baru di [Clerk Dashboard](https://dashboard.clerk.com) dengan endpoint URL:  
  `https://[APP_DOMAIN]/api/clerk-webhook` (sesuaikan dengan domain Vercel).
- Pilih event yang relevan:
  - `user.created`
  - `user.updated`
  - `user.deleted`
- Generate **Secret Key** untuk validasi signature webhook (simpan sebagai `CLERK_WEBHOOK_SECRET`).

#### 2. **Implementasi API Route untuk Webhook**

- **File:** `/pages/api/clerk-webhook.js` (Next.js)
- **Fungsi:**
  - Validasi signature Clerk menggunakan `CLERK_WEBHOOK_SECRET`.
  - Proses payload event dan update data di database via Prisma.
- **Contoh Snippet:**

  ```javascript
  import { Webhook } from 'svix'
  import { PrismaClient } from '@prisma/client'

  const prisma = new PrismaClient()

  export default async function handler(req, res) {
    const payload = req.body
    const headers = req.headers
    const secret = process.env.CLERK_WEBHOOK_SECRET

    // Validasi signature
    const wh = new Webhook(secret)
    try {
      const verifiedPayload = wh.verify(payload, headers)
      // Proses event
      switch (verifiedPayload.type) {
        case 'user.updated':
          await prisma.user.update({
            where: { clerkUserId: verifiedPayload.data.id },
            data: {
              email: verifiedPayload.data.email_addresses[0].email_address,
              name: `${verifiedPayload.data.first_name} ${verifiedPayload.data.last_name}`,
              status: verifiedPayload.data.public_metadata?.status || 'active',
            },
          })
          break
        // Handle event lainnya (user.created, user.deleted)
      }
      res.status(200).json({ success: true })
    } catch (err) {
      console.error('Webhook error:', err)
      res.status(400).json({ error: 'Invalid signature' })
    }
  }
  ```

#### 3. **Konfigurasi Environment Variables di Vercel**

- Tambahkan variabel berikut di Vercel Project Settings:
  - `CLERK_WEBHOOK_SECRET`: Secret key dari Clerk.
  - `DATABASE_URL`: URL koneksi database untuk Prisma.
- Pastikan domain Vercel (misal: `*.vercel.app`) di-_whitelist_ di Clerk Dashboard → Webhook Settings.

#### 4. **Testing & Simulasi Webhook**

- Gunakan tool seperti **Webhook.site** atau **ngrok** untuk testing lokal.
- Trigger manual event di Clerk Dashboard (misal: edit user) dan pastikan data terupdate di database.
- Monitor log Vercel untuk memastikan tidak ada error.

#### 5. **Error Handling & Logging**

- Integrasi Sentry untuk menangkap error:
  ```javascript
  // Di dalam handler
  try { ... }
  catch (err) {
    Sentry.captureException(err);
    res.status(500).json({ error: 'Internal server error' });
  }
  ```
- Tambahkan pesan fallback di UI:  
  _"Perubahan data mungkin tertunda. Silakan refresh halaman jika data tidak muncul."_

#### 6. **Dokumentasi**

- Update `README.md` dengan:
  - Cara setup webhook di Clerk.
  - Daftar environment variables yang diperlukan.
  - Endpoint webhook dan event yang di-handle.

---

### **Acceptance Criteria:**

- [x] Webhook Clerk berhasil mengirim event ke endpoint Vercel (status 200).
- [x] Data user di database terupdate otomatis dalam <3 detik setelah perubahan di Clerk.
- [x] Request tanpa signature valid ditolak (status 400).
- [x] Error tercatat di Sentry dengan konteks yang jelas.
- [x] Dokumentasi tersedia di repo.

---

### **Catatan Penting:**

1. **Idempotensi:** Pastikan handler webhook dapat menerima event duplikat tanpa menyebabkan duplikasi data (gunakan `clerkUserId` sebagai referensi unik).
2. **Cold Start Vercel:** Jika terjadi latency, pertimbangkan untuk upgrade tier Vercel atau optimasi kode.
3. **Referensi:**
   - [Clerk Webhook Guide](https://docs.clerk.dev/popular-guides/webhooks)
   - [Prisma + Vercel Deployment](https://www.prisma.io/docs/guides/deployment/vercel)

---

**Prioritas:**

- Pastikan `CLERK_WEBHOOK_SECRET` dan `DATABASE_URL` sudah di-set sebelum deploy.
- Lakukan testing di staging environment sebelum production rollout.

Jika ada kesepakatan, task ini siap di-assign! 🛠️
