# **📋 Test Plan untuk Story-2: Manajemen Modul Akademik**

_(Menggabungkan IEEE 829 & Agile, Disesuaikan untuk Maguru)_

---

## **1. Test Plan ID & Metadata**

- **Nama Fitur**: Manajemen Modul Akademik
- **Sprint**: 2
- **Tanggal**: [DD/MM/YYYY]
- **Pemilik QA**: [Nama QA]
- **Referensi Dokumen**:
  - Vision Statement
  - Story-2.md
  - JIRA Task (OPS-28, OPS_29, OPS-140, OSP-141, OPS-133, OPS-134, OPS-135, OPS-136, OPS-137,OPS-139, OPS-134)

---

## **2. Introduction**

**Tujuan**:

- Memastikan fitur manajemen modul akademik **berfungsi end-to-end** sesuai visi Maguru.
- Validasi **pengalaman admin & mahasiswa** (akses modul, kolaborasi, keamanan).
- Mendeteksi risiko performa, keamanan, dan UX yang bertentangan dengan _human-centered approach_.
- Validasi integrasi fitur kritis: Multi-Page Content, Enhanced Metadata, Version Control, dan Human-Centered UX.

**Target Pengguna**:

- **Admin** (mengelola modul dengan prasyarat & konten kompleks)
- **Mahasiswa** (mengakses modul ACTIVE)

---

## **3. Test Objectives**

| **Aspek**              | **Objective**                                                                                                                             |
| ---------------------- | ----------------------------------------------------------------------------------------------------------------------------------------- |
| **Fungsionalitas**     | - CRUD modul, manajemen status, version control, dan audit trail berjalan.                                                                |
| **Keamanan**           | - Non-admin tidak bisa akses operasi kritikal; sanitasi input anti-XSS. - Sanitasi input, akses ilegal ke modul DRAFT, dan rate limiting. |
| **Kinerja**            | - Respons API <500ms untuk 10.000+ modul.                                                                                                 |
| **User Experience**    | - UI intuitif dengan validasi real-time dan feedback jelas.                                                                               |
| **Audit & Compliance** | - Semua perubahan modul tercatat dan _traceable_. - Audit trail queryable dengan filter user/action.                                      |
| **Error Handlinge**    | - Error response terstandarisasi dengan kode & pesan jelas.                                                                               |

---

## **4. Scope**

| **In-Scope**                             | **Out-of-Scope**              |
| ---------------------------------------- | ----------------------------- |
| CRUD Modul + Multi-Page Content          | Integrasi dengan fitur proyek |
| Manajemen Status (ACTIVE/DRAFT)          | Localization (multibahasa)    |
| Version Control & Rollback               | Pembelajaran AI Guru Maya     |
| Real-Time Status Propagation             | Mobile app testing            |
| Enhanced Metadata (prasyarat, referensi) |                               |
| Human-Centered Error Handling            |                               |

---

## **5. Test Approach**

### **A. Jenis Pengujian**

| **Jenis**               | **Tools**              | **Fokus**                                                             |
| ----------------------- | ---------------------- | --------------------------------------------------------------------- |
| **Functional Testing**  | Cypress, Jest, Postman | Uji alur lengkap: buat modul → ubah status → akses sebagai mahasiswa. |
| **Security Testing**    | OWASP ZAP, Manual      | Cek SQLi, XSS, akses ilegal ke modul DRAFT.                           |
| **Performance Testing** | k6, JMeter             | Load test API dan frontend dengan 1.000+ user simultan.               |
| **Usability Testing**   | Exploratory            | Evaluasi kemudahan UI untuk admin non-teknis.                         |
| **Regression Testing**  | Jest, Selenium         | Otomasi skrip untuk fitur kritis (CRUD, perubahan status).            |

### **B. Prioritas Berbasis Risiko**

- **High Risk**: Middleware otorisasi, validasi input, keamanan data,Multi-page content, error handling empatis.
- **Medium Risk**: Pagination, filter, audit trail, Version control UI
- **Low Risk**: Notifikasi UI.

---

## **6. Test Deliverables**

- **Test Cases (Contoh Gherkin):**

  ```gherkin
  Scenario: Admin mengubah status modul ke ACTIVE
    Given Admin memiliki token valid
    When PUT /api/module/123 dengan status="ACTIVE"
    Then Response status 200
    And Mahasiswa bisa mengakses modul 123
    And Log audit mencatat perubahan status

  Scenario: Mahasiswa mencoba akses modul DRAFT
    Given Modul 456 berstatus DRAFT
    When GET /api/module/456 oleh mahasiswa
    Then Response status 403
    And Pesan error "Modul tidak tersedia"

  Scenario: Admin upload file teori dengan format tidak valid
    When Upload file .exe ke modul "Ethical Hacking"
    Then UI menampilkan pesan: "Waduh, format file tidak didukung! Gunakan PDF/DOC/PNG ya 😊"

  Scenario: Mahasiswa gagal akses modul tanpa prasyarat
    Given Modul "AI Lanjut" membutuhkan prasyarat "Python Dasar"
    When Mahasiswa tanpa prasyarat mencoba enroll
    Then UI menampilkan: "Lengkapi modul Python Dasar dulu yuk! 🚀"

  ```

- **Traceability Matrix**:  
  | **AC** | **Test Case ID** |  
  |----------------------------|------------------|  
  | CRUD modul | TC-01 hingga TC-05 |  
  | Validasi status ACTIVE | TC-06, TC-07 |  
  | Audit trail lengkap | TC-08, TC-09 |  
  | Multi-page content | TC-10, TC-11 |  
  | Validasi metadata (prasyarat) | TC-12, TC-13 |  
  | Pesan error empatis | TC-14, TC-15 |
  | Audit trail queryable | TC-16, TC-17 |

---

#### **7. Entry & Exit Criteria**

| **Kriteria**        | **Entry Criteria**                      | **Exit Criteria**                  |
| ------------------- | --------------------------------------- | ---------------------------------- |
| **Memulai Testing** | - Semua task Story-2 deploy di staging. | - Semua test case dieksekusi.      |
|                     | - Data dummy 10.000 modul tersedia.     | - Critical/Blocker bug fixed.      |
| **Release ke Prod** | -                                       | - Test coverage ≥85%.              |
|                     | -                                       | - Rata-rata bug severity ≤ Medium. |

---

#### **8. Jadwal & Sumber Daya**

| **Task**             | **Tim**        | **Estimasi** |
| -------------------- | -------------- | ------------ |
| Test Case Design     | QA Engineer    | 3 Hari       |
| Manual + Otomasi     | QA + Developer | 5 Hari       |
| Load & Security Test | DevOps + QA    | 2 Hari       |
| Bug Retesting        | QA             | 2 Hari       |

---

#### **9. Risk & Mitigasi**

| **Risiko**                    | **Dampak** | **Mitigasi**                        |
| ----------------------------- | ---------- | ----------------------------------- |
| Performa lambat saat scaling  | High       | Optimasi indeks database + caching. |
| Bug keamanan (XSS/SQLi)       | Critical   | Lakukan pentest manual + OWASP ZAP. |
| UI tidak intuitif untuk admin | Medium     | Uji usability dengan user riil.     |
| File upload korup             | critical   | Validasi MIME type + ekstensi file. |
| Metadata tidak konsisten      | High       | Gunakan JSON Schema validasi.       |
| Pesan error tidak kontekstual | Medium     | Kolaborasi dengan UX Writer         |

---

#### **10. Approval**

| **Role**        | **Nama** | **Tanggal**  | **Tanda Tangan** |
| --------------- | -------- | ------------ | ---------------- |
| QA Lead         | [Nama]   | [DD/MM/YYYY] | ✍️               |
| Project Manager | [Nama]   | [DD/MM/YYYY] | ✍️               |

---

**🔍 Catatan Tambahan:**

- **Prioritas Pengujian**: Fokus pada integrasi backend-frontend dan keamanan.
- **Kolaborasi**: Gunakan **JIRA Dashboard** untuk memantau progres testing & bug.
- **Automation**: Reusable script untuk task seperti CRUD dan perubahan status.

**Lampiran**:

- [Postman Collection untuk Story-2](link-shareable-postman)
- [Contoh Laporan Load Test](contoh-load-test.pdf)
