# Sprint 4

**Periode:** 29/3 hingga 11/4/2025  
**Fokus:** Manajemen Konten Modul Mikro, Version Control, dan Peningkatan Kualitas Modul
**Tambahan:** Penerapan **Test-Driven Development (TDD)**, dengan unit, integration, dan E2E testing.

---

## 🎯 Sprint Goals

- **Manajemen Konten Modul Mikro:** CRUD multi-page dan metadata.
- **Version Control:** Fitur fallback ke versi sebelumnya untuk konten modul.
- **Peningkatan Kualitas:** TDD untuk meningkatkan stabilitas & mutu fitur modul.

---

## 📅 Timeline

| Minggu     | Fokus Utama                                                     |
| ---------- | --------------------------------------------------------------- |
| 29/3 - 4/4 | Implementasi CRUD multi-page & metadata modul, setup versioning |
| 5/4 - 11/4 | Integrasi version control, pengujian TDD, dan UI multi-page     |

---

## 🧩 EPIC-9 – Module Learning

### 🔹 User Story OPS-143

📎 [Lihat di Jira](https://eviewnicks-1738239611759.atlassian.net/jira/software/projects/OPS/boards/1?selectedIssue=OPS-143)

_Sebagai admin, saya ingin membuat dan mengelola page konten dari metadata agar module learning dapat dibuat._

#### Task:

- **OPS-140:** Manajemen Konten Multi-Page (CRUD modul & sub-halaman)  
  🔗 [Link Task](https://eviewnicks-1738239611759.atlassian.net/browse/OPS-140)

  - **Assignee:** [Backend/Frontend Developer]
  - **Estimasi:** 8 Story Points
  - **Status:** 🟡 On Progress
  - **Acceptance Criteria:**
    - Admin dapat membuat, mengedit, dan menghapus modul beserta sub-halaman.
    - Metadata modul dapat diatur dan diupdate.
    - Perubahan langsung tampil untuk user.
    - Validasi input dan error handling berjalan baik.

- **OPS-133:** Pengelolaan Status Module (published, draft, archived)  
  🔗 [Link Task](https://eviewnicks-1738239611759.atlassian.net/browse/OPS-133)
  - **Assignee:** [Backend/Frontend Developer]
  - **Estimasi:** 5 Story Points
  - **Status:** 🟡 On Progress
  - **Acceptance Criteria:**
    - Admin dapat mengubah status modul (published, draft, archived).
    - Status modul terlihat jelas di UI.
    - Hanya modul berstatus published yang tampil ke user.

---

### 🔹 User Story OPS-144

_Sebagai admin, saya ingin memiliki fitur version agar konten pembelajaran sebelumnya dapat digunakan jika versi sekarang tidak efektif._

- **OPS-134:** Implementasi Version Control pada konten modul  
  🔗 [Link Task](https://eviewnicks-1738239611759.atlassian.net/browse/OPS-134)
  - **Assignee:** [Backend Developer]
  - **Estimasi:** 8 Story Points
  - **Status:** 🟡 On Progress
  - **Acceptance Criteria:**
    - Setiap perubahan konten tercatat sebagai version.
    - Admin dapat rollback ke versi sebelumnya.
    - History version dapat diakses dan dikelola.
    - Integrasi dengan workflow Git/branch/tagging.

---

## 🧪 Test Plan

### Unit Testing

- Pengujian fungsi CRUD modul & sub-halaman
- Pengujian version control pada konten modul
- Pengujian status modul (published/draft/archived)

### Integration Testing

- Integrasi CRUD modul dengan database & UI
- Integrasi version control dengan workflow admin
- Integrasi status modul dengan tampilan user

### E2E Testing

- Alur lengkap pembuatan, update, dan rollback modul
- Navigasi multi-page dan pengelolaan status modul
- Simulasi error handling dan validasi input

---

## 🔗 Dependencies & Risks

### ✅ Dependencies:

- **Headless CMS/DB Schema:** Endpoint CRUD modul dan metadata.
- **Authentication (Clerk):** Untuk akses admin.
- **CI/CD & Vercel:** Deploy pipeline harus mendukung migrasi schema tanpa downtime.
- **Version Control:** Git workflow & storage (branch/tagging) untuk konten modul.

### ⚠️ Risks & Challenges:

- **Konflik versi konten:**
  - _Mitigasi:_ Terapkan workflow Git-Flow dengan branch `content/version-x.y`.
- **Integrasi multi-page UI:**
  - _Mitigasi:_ TDD untuk tiap komponen page, mocking data dengan MSW.
- **Deployment rollback:**
  - _Mitigasi:_ Data migration scripts teruji, backup konten sebelum release.

---

## ✅ Definition of Done (DoD)

Sebuah task dianggap selesai jika:

- Semua fitur telah diuji dan berfungsi tanpa error.
- Admin bisa create/edit/delete modul & sub-halaman; perubahan langsung tampil untuk user.
- Setiap perubahan konten tercatat sebagai version; admin dapat rollback ke versi sebelumnya.
- Unit & integration tests untuk setiap API & React component; coverage ≥ 80% untuk modul utama.
- Multi-page navigation berjalan lancar; status modul (published/draft/archived) terlihat jelas.
- Kode telah direview dan di-merge ke branch utama.
- Pipeline deploy lulus semua step.
- Dokumentasi teknis telah diperbarui untuk mencerminkan perubahan yang dilakukan.
- Semua acceptance criteria terpenuhi dan diverifikasi oleh QA.

---

## 🔍 Sprint Retrospective & 📌 Next Steps

### 🔄 Evaluasi Sprint:

- ✅ **Keberhasilan:**
  - Modul multi-page CRUD selesai, version control berfungsi.
- ⚠️ **Tantangan:**
  - Penanganan migrasi schema dan integrasi Git workflow konten.

### 🧭 Rencana Sprint Berikutnya:

- **Visual Learning Path:** Implementasi graph/tree untuk modul interaktif.
- **Quiz Lanjutan:** Tambahkan format soal baru (essay, drag-drop).
- **Analytics & Gamifikasi:** Integrasi progress analytics dan badge based on version rollback metrics.

---

## 📚 Dokumentasi & Referensi

- [OPS-143 (Jira)](https://eviewnicks-1738239611759.atlassian.net/jira/software/projects/OPS/boards/1?selectedIssue=OPS-143)
- [OPS-140 (Jira)](https://eviewnicks-1738239611759.atlassian.net/browse/OPS-140)
- [OPS-133 (Jira)](https://eviewnicks-1738239611759.atlassian.net/browse/OPS-133)
- [OPS-134 (Jira)](https://eviewnicks-1738239611759.atlassian.net/browse/OPS-134)
- [OPS-9 (Jira)](https://eviewnicks-1738239611759.atlassian.net/browse/OPS-9)
- [Dokumentasi Clerk Webhook](https://clerk.com/docs/integration/webhooks)
- [Vercel Serverless Functions](https://vercel.com/docs/concepts/functions/serverless-functions)
- [Prisma Client in Serverless](https://www.prisma.io/docs/guides/performance-and-optimization/connection-management#serverless-environments-faas)
- [How To Manage Version Control In eLearning Development](https://elearningindustry.com/version-control-in-elearning-development-manage?utm_source=chatgpt.com)
