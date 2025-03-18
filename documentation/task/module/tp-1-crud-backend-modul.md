**📋 Test Plan untuk OPS-28: CRUD Backend Modul + Audit Trail**  
_(Berdasarkan IEEE 829 & Agile, Disesuaikan untuk Maguru)_

---

### **1. Test Plan ID & Metadata**

- **Nama Fitur**: CRUD Backend Modul + Audit Trail
- **Sprint**: 2
- **Tanggal**: [DD/MM/YYYY]
- **Pemilik QA**: [Nama QA]
- **Referensi Dokumen**:
  - Vision Statement
  - Story-2.md (Langkah 1)
  - JIRA OPS-28

---

### **2. Introduction**

**Tujuan**:

- Memastikan **endpoint CRUD modul** berfungsi sesuai AC dan visi _human-centered_ Maguru.
- Validasi **audit trail** untuk transparansi operasi admin.
- Meminimalisir risiko keamanan (XSS, SQL injection) dan performa lambat.

**Target Pengguna**:

- **Admin** (mengelola modul)
- **Mahasiswa** (hanya akses modul ACTIVE)

---

### **3. Test Objectives**

| **Aspek**          | **Objective**                                                                |
| ------------------ | ---------------------------------------------------------------------------- |
| **Fungsionalitas** | - CRUD modul berjalan sempurna dengan validasi input & middleware otorisasi. |
| **Keamanan**       | - Non-admin tidak bisa akses operasi kritikal (POST/PUT/DELETE).             |
| **Kinerja**        | - Respons API <300ms untuk 10.000+ modul (dengan indeks).                    |
| **Audit Trail**    | - Setiap operasi CRUD tercatat di log dengan user, action, dan timestamp.    |
| **Error Handling** | - Error response terstandarisasi dengan kode & pesan jelas.                  |

---

### **4. Scope**

| **In-Scope**                        | **Out-of-Scope**                  |
| ----------------------------------- | --------------------------------- |
| CRUD Modul (Backend)                | Frontend (OPS-29)                 |
| Validasi Input (Zod)                | Integrasi dengan fitur lain       |
| Middleware Otorisasi (Admin-only)   | Audit trail queryable (Langkah 9) |
| Audit Trail Dasar (Logging ke File) | Localization                      |

---

### **5. Test Approach**

#### **A. Jenis Pengujian**

| **Jenis**               | **Tools**         | **Strategi**                                                      |
| ----------------------- | ----------------- | ----------------------------------------------------------------- |
| **Functional Testing**  | Postman, Jest     | Uji semua operasi CRUD dengan valid/invalid input.                |
| **Security Testing**    | OWASP ZAP, Manual | Cek akses ilegal (non-admin), sanitasi input, dan error handling. |
| **Performance Testing** | k6                | Load test GET /api/module dengan 10.000 data.                     |
| **Audit Trail Testing** | Manual (Log File) | Verifikasi log operasi CRUD di file Winston/Pino.                 |

#### **B. Test Case Prioritas**

- **High**: Create/Update Modul, Middleware Otorisasi.
- **Medium**: Validasi Input (Zod), Error Handling.
- **Low**: Audit Trail Logging.

---

### **6. Test Deliverables**

- **Test Cases (Contoh Gherkin):**

  ```gherkin
  Scenario: Admin membuat modul baru
    Given Admin memiliki token valid
    When POST /api/module dengan title="Pengantar AI" dan status="DRAFT"
    Then Response status 201
    And Database menyimpan data baru
    And Log audit mencatat operasi CREATE

  Scenario: Mahasiswa mencoba menghapus modul
    Given User dengan role "MAHASISWA"
    When DELETE /api/module/123
    Then Response status 403
    And Pesan error "Forbidden: Hanya admin yang diperbolehkan."

  ```

- **Traceability Matrix**:  
  | **AC** | **Test Case ID** |  
  |--------------------------|------------------|  
  | Model Module dengan enum | TC-01, TC-02 |  
  | Validasi input Zod | TC-03, TC-04 |  
  | Middleware otorisasi | TC-05, TC-06 |

---

### **7. Entry & Exit Criteria**

| **Kriteria**        | **Entry Criteria**                   | **Exit Criteria**                   |
| ------------------- | ------------------------------------ | ----------------------------------- |
| **Memulai Testing** | - Endpoint sudah deploy di staging.  | - Semua test case dieksekusi.       |
|                     | - Database dengan 10.000 data dummy. | - Critical/Blocker bug sudah fixed. |
| **Release ke Prod** | -                                    | - Test coverage ≥90%.               |
|                     | -                                    | - Rata-rata respons API <300ms.     |

---

### **8. Jadwal & Sumber Daya**

| **Task**         | **Tim**     | **Estimasi Waktu** |
| ---------------- | ----------- | ------------------ |
| Test Case Design | QA Engineer | 1 Hari             |
| Manual Testing   | QA          | 2 Hari             |
| Load Testing     | DevOps + QA | 1 Hari             |
| Bug Retesting    | QA          | 1 Hari             |

---

### **9. Risk & Mitigasi**

| **Risiko**                     | **Dampak** | **Mitigasi**                           |
| ------------------------------ | ---------- | -------------------------------------- |
| Performa API lambat            | High       | Optimasi indeks database + caching.    |
| Bug validasi input tidak ketat | Critical   | Periksa ulang schema Zod.              |
| Audit trail tidak tercatat     | Medium     | Verifikasi log setelah setiap operasi. |

---

### **10. Approval**

| **Role**        | **Nama** | **Tanggal**  | **Tanda Tangan** |
| --------------- | -------- | ------------ | ---------------- |
| QA Lead         | [Nama]   | [DD/MM/YYYY] | ✍️               |
| Project Manager | [Nama]   | [DD/MM/YYYY] | ✍️               |

---

**🔍 Catatan Tambahan:**

- **Prioritas Test Case**: Fokus pada operasi CREATE dan middleware otorisasi karena dampaknya ke pengguna.
- **Kolaborasi**: Gunakan **Postman Shared Collection** untuk memudahkan developer mereproduksi skenario.
- **Automation Potensial**: Otomasi test case CRUD dengan **Jest** untuk regresi di sprint berikutnya.

**Lampiran**:

- [Postman Collection untuk OPS-28](link-shareable-postman)
- [Contoh Log Audit](contoh-log-audit.log)
