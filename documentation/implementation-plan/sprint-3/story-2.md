Berikut breakdown untuk **Story-58** dan **Task OPS-54: Kebutuhan Track History Perubahan User**:

---

### **Story-58**  
**Judul:** Sebagai admin, saya ingin memberikan beberapa fitur untuk memudahkan memanage user.  
**Fokus Task OPS-54:** Membuat sistem pelacakan riwayat perubahan data user (audit log) yang dapat diakses oleh admin.  

---

### **Task OPS-54: Kebutuhan Track History Perubahan User**  
**Assignee:** `@backend-dev`  
**Reviewer:** `@tech-lead`  
**Deadline:** `7 Juni 2024`  
**Story Points:** `5`  
**Dependencies:**  
- Terkait dengan skema User di Prisma ([OPS-147](link-ke-ops147)).  
- Membutuhkan RBAC yang sudah diperbaiki ([OPS-148](link-ke-ops148)).  

---

### **Deskripsi Task**  
Membangun fitur pelacakan riwayat perubahan data user (email, role, status, dll.) untuk memudahkan admin memantau aktivitas dan mengaudit perubahan.  

**Tujuan:**  
1. Setiap perubahan data user dicatat secara otomatis (siapa, kapan, dan perubahan apa).  
2. Admin dapat melihat riwayat perubahan via dashboard atau API.  
3. Data history disimpan secara aman dan hanya bisa diakses oleh role `admin`.  

---

### **Breakdown Subtask**  
#### 1. **Mendesain Skema Database untuk History** *(1 hari)*  
   - Tambahkan model Prisma `UserHistory`:  
     ```prisma  
     model UserHistory {  
       id          String   @id @default(cuid())  
       userId      String   @map("user_id")  
       field       String   // Kolom yang diubah (contoh: "role", "status")  
       oldValue    String?  @map("old_value")  
       newValue    String?  @map("new_value")  
       changedBy   String   @map("changed_by") // clerkUserId admin  
       createdAt   DateTime @default(now()) @map("created_at")  

       @@index([userId])  
       @@map("user_histories")  
     }  
     ```  
   - Relasikan dengan model `User`:  
     ```prisma  
     model User {  
       // ...  
       histories UserHistory[]  
     }  
     ```  

#### 2. **Implementasi Logging Otomatis dengan Prisma Middleware** *(2 hari)*  
   - Gunakan Prisma middleware untuk menangkap event `update` pada model `User`:  
     ```typescript  
     // lib/prisma.ts  
     prisma.$use(async (params, next) => {  
       if (params.model === 'User' && params.action === 'update') {  
         const oldData = await prisma.user.findUnique({  
           where: { id: params.args.where.id }  
         });  

         const result = await next(params);  

         // Bandingkan oldData dan result untuk deteksi perubahan  
         for (const field of Object.keys(params.args.data)) {  
           if (oldData[field] !== result[field]) {  
             await prisma.userHistory.create({  
               data: {  
                 userId: oldData.id,  
                 field: field,  
                 oldValue: String(oldData[field]),  
                 newValue: String(result[field]),  
                 changedBy: params.args.data.updatedBy // Diambil dari input admin  
               }  
             });  
           }  
         }  
         return result;  
       }  
       return next(params);  
     });  
     ```  

#### 3. **Membuat API untuk Akses Riwayat** *(1.5 hari)*  
   - Endpoint:  
     - `GET /api/admin/users/:id/history` → Ambil riwayat perubahan user.  
     - `GET /api/admin/history → Filter riwayat (by date, field, dll.).  
   - Contoh response:  
     ```json  
     [  
       {  
         "field": "role",  
         "oldValue": "mahasiswa",  
         "newValue": "admin",  
         "changedBy": "user_123",  
         "createdAt": "2024-05-30T10:00:00Z"  
       }  
     ]  
     ```  

#### 4. **Pengujian dan Security** *(1 hari)*  
   - **Testing:**  
     - Admin mengubah role user → pastikan history tercatat.  
     - User non-admin akses endpoint history → harus ditolak (403).  
   - **Security:**  
     - Pastikan endpoint history dilindungi RBAC (hanya role `admin`).  
     - Sanitasi input untuk menghindari SQL injection.  

#### 5. **Dokumentasi** *(0.5 hari)*  
   - Tambahkan di `README.md`:  
     - Cara mengakses endpoint history.  
     - Contoh payload dan response.  

---

### **Acceptance Criteria**  
- [x] Setiap perubahan data user (via admin atau Clerk) mencatat history di database.  
- [x] Admin bisa melihat riwayat perubahan via API dengan filter sederhana.  
- [x] Data history tidak bisa diakses oleh user non-admin (test dengan Postman).  
- [x] Latency penambahan history <300ms (tidak mengganggu operasi utama).  

---

### **Contoh Kasus Penggunaan**  
1. **Admin mengubah role user dari `mahasiswa` ke `admin`:**  
   - Middleware Prisma mendeteksi perubahan field `role`.  
   - Catat event di `UserHistory` dengan `changedBy` = ID admin.  
2. **User mengubah email via Clerk:**  
   - Webhook Clerk memicu update → middleware Prisma juga mencatat history.  

---

### **Catatan Penting**  
1. **Performa:**  
   - Tambahkan indeks di kolom `userId` dan `createdAt` untuk query yang cepat.  
   - Jika volume history tinggi, pertimbangkan archiving ke cold storage.  
2. **Audit Trail:**  
   - Hash atau enkripsi field sensitif (misal: email lama) jika diperlukan.  
3. **Referensi:**  
   - [Prisma Middleware](https://www.prisma.io/docs/orm/prisma-client/client-extensions/middleware)  
   - [RBAC dengan Clerk](https://docs.clerk.dev/popular-guides/roles-permissions)  

---

### **Pertanyaan Klarifikasi (Jika Memungkinkan)**  
1. Apakah perlu mencatat perubahan yang dilakukan oleh **user itu sendiri** (misal: update email via profil)?  
2. Apakah perlu menyimpan history untuk operasi `delete` user?  
3. Apakah ada batasan retention period (misal: hapus history >1 tahun)?  

Jika jawaban tidak tersedia, asumsikan semua perubahan dicatat tanpa batasan retention.