# Project Requirements Document (PRD) - Maguru

## 1. Pendahuluan

### 1.1 Latar Belakang

Maguru adalah platform pembelajaran berbasis gamifikasi yang dirancang untuk memenuhi kebutuhan pembelajaran personal, interaktif, dan relevan bagi Generasi Z dan Alpha. Platform ini dikembangkan sebagai respons terhadap metode pembelajaran tradisional yang dianggap kurang efektif dalam menghadapi perkembangan teknologi, sehingga diharapkan dapat membantu pengguna mengembangkan keterampilan teknologi, soft skills, dan nilai-nilai kemanusiaan.

### 1.2 Tujuan Proyek

- **Misi**: Mengubah cara pembelajaran dengan menyediakan pengalaman belajar yang menyenangkan dan adaptif melalui gamifikasi.
- **Tujuan**: Memberikan solusi pembelajaran yang relevan, personal, dan interaktif sehingga pengguna dapat menguasai keterampilan penting di bidang teknologi dan soft skills.

### 1.3 Ruang Lingkup

- **Fitur Utama**: Sistem personalized learning path, modul pembelajaran interaktif, quiz, dan gamifikasi untuk memotivasi pengguna.
- **Target Pengguna**: Mahasiswa, fresh graduate, dan profesional muda di Indonesia yang tertarik pada teknologi, terutama AI, coding, dan IoT.
- **Batasan**: Pada tahap awal (Sprint 1), fokus dikembangkan pada autentikasi pengguna dan manajemen user oleh admin.

### 1.4 Keunggulan Kompetitif

- **Fokus Lokal**: Menyesuaikan kurikulum dengan kebutuhan industri teknologi di Indonesia.
- **Personalisasi Belajar**: Learning path yang menyesuaikan dengan kecepatan dan minat pengguna.
- **Aksesibilitas**: Platform ringan dan dapat diakses di berbagai perangkat tanpa kebutuhan spesifikasi tinggi.

---

## 2. Deskripsi Umum

### 2.1 Fitur Utama

#### 1. Personalized Learning Path

- Jalur belajar yang disesuaikan dengan minat dan level pengguna.
- Sub modul terstruktur dengan konsep graph/tree untuk menunjukkan hubungan antar topik.
- AI-powered feedback untuk merekomendasikan langkah belajar berikutnya.
- Visualisasi progress jangka panjang untuk memperlihatkan tahapan perkembangan pengguna.

#### 2. Gamifikasi & Reward System

- XP Points, Level, dan Badge untuk memotivasi pengguna.
- Leaderboard dengan cycle tertentu untuk membangun kompetisi sehat.
- Reward atau achievement setelah menyelesaikan modul atau quiz akhir.
- Dynamic XP distribution berdasarkan kompleksitas modul dan skor quiz.

#### 3. Study Group & Community

- Fitur untuk membentuk grup belajar dengan topik tertentu.
- Diskusi real-time dan kolaborasi proyek mini.
- Marketplace skill untuk memperkenalkan diri dan mencari tim untuk mengembangkan proyek bersama.
- Fitur showcase proyek untuk memamerkan hasil belajar dan proses kolaborasi.

#### 4. Konten Interaktif & Microlearning

- Modul interaktif dengan quiz singkat untuk memperkuat pemahaman.
- Mini challenge atau coding task untuk latihan langsung.
- Video pendek untuk materi yang lebih kompleks (misal: setup IDE, tutorial framework).
- Ujian akhir atau sertifikasi internal untuk mengukur kelayakan pengguna dalam suatu role.

#### 5. Progress Tracking & Role Mapping

- Visualisasi progress belajar dan skill yang dikuasai.
- Peta jalur karier berdasarkan role industri (misal: AI Engineer, Frontend Developer).
- Peringatan atau rekomendasi topik yang perlu diulang jika performa rendah di quiz tertentu.
- Rekomendasi AI untuk langkah berikutnya atau materi yang perlu diperdalam.

## 2.2 Asumsi dan Ketergantungan

- **Asumsi**: Pengguna memiliki akses internet yang stabil; platform akan menjadi solusi untuk pergeseran pembelajaran digital di Indonesia.
- **Ketergantungan**: Integrasi dengan Clerk untuk autentikasi, Supabase/Prisma untuk pengelolaan data, dan Next.js untuk framework front-end dan back-end.

---

## 3. Kebutuhan Fungsional

### 3.1 Spesifikasi Fungsional Utama

- **Autentikasi Pengguna**:

  - Pengguna dapat mendaftar dan login melalui Clerk.
  - Validasi sesi dan pengelolaan token secara otomatis.
  - Sinkronisasi data pengguna ke database melalui API.

- **Manajemen User oleh Admin**:

  - Admin dapat melihat daftar pengguna dengan data lengkap.
  - Fitur untuk menambah, mengedit, dan menghapus pengguna melalui API.
  - Konfirmasi dan validasi aksi CRUD.

- **Modul Pembelajaran**:

  - Pengguna dapat mengakses materi dan quiz interaktif.
  - Progress tracking dan rekomendasi materi (untuk pengembangan sprint selanjutnya).

- **Gamifikasi**:
  - **Poin**: Diberikan saat pengguna menyelesaikan modul, mengerjakan kuis, atau berpartisipasi dalam diskusi.
  - **Level**: Berdasarkan akumulasi poin, pengguna naik level yang membuka fitur tambahan atau materi eksklusif.
  - **Badge**: Penghargaan visual untuk milestone tertentu, bisa dipamerkan di profil pengguna.
  - **Leaderboard**: Papan peringkat untuk memotivasi pengguna, bisa disetel mingguan/bulanan.
  - **Motivasi Intrinsik**: Memberi rasa pencapaian dan mendorong pengguna untuk terus belajar.
  - **Kompetisi Sehat**: Leaderboard menumbuhkan semangat bersaing positif.
  - **Retensi Pengguna**: Reward dan level progresif membuat pengguna lebih lama bertahan.

---

## 4. Kebutuhan Non-Fungsional

- **Performa**: Aplikasi harus responsif dengan waktu load yang cepat, terutama pada saat autentikasi dan pengambilan data.
- **Keamanan**: Data pengguna dilindungi dengan enkripsi dan mekanisme autentikasi yang kuat. Hanya admin yang memiliki akses ke dashboard manajemen user.
- **Skalabilitas**: Arsitektur harus mendukung pertumbuhan pengguna secara horizontal, dengan kemampuan menampung peningkatan trafik melalui solusi cloud.
- **Kompatibilitas**: Aplikasi berbasis web yang dioptimalkan untuk desktop (khususnya laptop) dengan kemungkinan pengembangan mobile di masa depan.

---

## 5. Antarmuka Pengguna

### 5.1 Desain dan Spesifikasi Antarmuka

- **Halaman Login/Register**: Tampilan form yang sederhana dan terintegrasi dengan Clerk.
- **Dashboard Admin**:
  - Tabel interaktif dengan fitur pencarian, sorting, dan pagination untuk memudahkan pengelolaan user.
  - Dialog konfirmasi untuk aksi penting seperti edit atau hapus.
- **Halaman Modul Pembelajaran (Rencana)**:
  - Layout multi-halaman dengan navigasi jelas, progress bar, dan notifikasi pencapaian (untuk sprint selanjutnya).
- **Quiz UI**:
  - Desain form multiple choice dengan tampilan hasil skor dan pembahasan jawaban.

> _Catatan_: Detail desain akan dikembangkan di tahap desain dan dokumen ini akan diperbarui sesuai kebutuhan.

---

## 7. Metrik Keberhasilan

- **Pengguna Aktif Bulanan (MAU)**: Target 5.000 pengguna pada tahun pertama.
- **Tingkat Retensi**: 60% pengguna kembali dalam 30 hari.
- **Feedback Pengguna**: Skor kepuasan pengguna minimal 4/5.

---

## 8. Rencana Pengujian

- **Uji Performa**: Tes kecepatan load halaman dan response API.
- **Uji Keamanan**: Simulasi serangan untuk menguji ketahanan aplikasi.
- **Uji Pengalaman Pengguna**: Usability testing dengan pengguna target.

### Koneksi Lambat:

- Optimasi gambar, lazy loading, dan caching.
- Simulasi koneksi 3G saat uji performa.

### Perangkat Lama:

- Tes kompatibilitas pada laptop low-end dan smartphone entry-level.
- Reduksi animasi berat, optimasi ukuran bundle.

### Browser Non-Mainstream:

- Pengujian lintas browser (Opera, Edge, Firefox) selain Chrome.
- Pastikan UI tetap konsisten & tidak ada fungsi yang rusak.

---

## 9. Lampiran

- **Pendekatan Berbasis Feedback**:

  - **Sprint Review**: Mengumpulkan feedback pengguna setelah tiap sprint.
  - **Prioritas Berdasarkan Data**: Menganalisis metrik seperti user retention & modul completion rate untuk menentukan prioritas fitur baru.

- **Referensi**: Link ke dokumentasi eksternal (misalnya, dokumentasi Clerk, Prisma, dan Next.js).
