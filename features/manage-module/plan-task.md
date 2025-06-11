# Rencana Implementasi Auto-save Draft

## Fase 1: Setup Dasar (Selesai ✅)

- Implementasi API endpoint untuk menyimpan draft
- Implementasi service layer untuk komunikasi dengan API
- Implementasi hook dasar untuk auto-save

## Fase 2: Integrasi dengan Editor (Selesai ✅)

- Integrasi hook auto-save dengan TipTap Editor
- Implementasi indikator status penyimpanan
- Implementasi recovery draft jika ada

## Fase 3: Fitur Tambahan (Selesai ✅)

- Implementasi dialog konfirmasi saat meninggalkan halaman dengan perubahan belum tersimpan
- Implementasi fitur publish draft
- Implementasi fitur discard draft

## Fase 4: Mode View dan Edit (Selesai ✅)

- Refactor implementasi mode view dan edit mengikuti pendekatan Confluence
- Pisahkan komponen untuk mode view dan edit
- Implementasi navigasi berbasis URL untuk mode view dan edit
- Optimasi performa dengan menghilangkan editor aktif di mode view

## Fase 5: Testing dan Refinement (Dalam Proses 🔄)

- Implementasi unit test untuk komponen baru
- Implementasi integration test untuk alur kerja mode view/edit
- Implementasi E2E test untuk simulasi user flow
- Optimasi performa dan penyempurnaan UI

## Fase 6: Fitur Lanjutan (Direncanakan 📝)

- Implementasi sistem riwayat versi
- Implementasi fitur kolaborasi real-time
- Implementasi fitur komentar dan anotasi
- Integrasi dengan sistem notifikasi
