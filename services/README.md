# Test Reporters untuk Maguru

Direktori ini berisi custom reporters untuk Jest yang digunakan dalam proyek Maguru.

## Reporter yang Tersedia

1. **simpleJsonReporter.js** - Reporter JSON dasar yang menghasilkan laporan ringkas
2. **detailedJsonReporter.js** - Reporter JSON yang lebih detail untuk debugging mendalam

## Cara Menggunakan

### 1. Konfigurasi di `jest.config.js`

Tambahkan reporter ke konfigurasi Jest Anda:

```js
// jest.config.js
module.exports = {
  // ... konfigurasi lainnya
  reporters: [
    'default', // Tetap menggunakan reporter default
    ['<rootDir>/services/detailedJsonReporter.js', {}],
  ],
}
```

### 2. Menggunakan Reporter Secara Spesifik untuk Satu Kali Pengujian

Anda juga dapat menggunakan reporter spesifik hanya untuk satu kali pengujian:

```bash
# Menggunakan simpleJsonReporter
npx jest --reporters=default --reporters=<rootDir>/services/simpleJsonReporter.js

# Menggunakan detailedJsonReporter
npx jest --reporters=default --reporters=<rootDir>/services/detailedJsonReporter.js
```

### 3. Menjalankan Tests dengan Reporter

```bash
# Menjalankan semua test dengan reporter
npm run test:integration

# Menjalankan test spesifik dengan reporter
npm run test:integration -- -t "navigation"
```

## Hasil Reporter

Reporter akan menghasilkan file JSON di direktori `services/detailed-report/` dengan format nama:

- `TRP-SMP-{number}-{timestamp}.json` (simple reporter)
- `TRP-DTL-{number}-{timestamp}.json` (detailed reporter)

Format penamaan menggunakan:

- `TRP`: Awalan untuk Test Report
- `SMP` atau `DTL`: Jenis report (Simple atau Detailed)
- `{number}`: Nomor unik berdasarkan timestamp
- `{timestamp}`: Waktu pengujian dalam format ISO

## Keunggulan DetailedJsonReporter

Reporter detail (`detailedJsonReporter.js`) menyediakan informasi yang lebih lengkap, termasuk:

1. **Informasi Lingkungan** - OS, CPU, memori, versi Node.js
2. **Full Stack Trace** - Stack trace lengkap untuk error debugging
3. **Pola Kegagalan** - Analisis tipe error yang paling sering muncul
4. **Detail Per File Test** - Informasi runtime dan kinerja per file test
5. **Informasi Snapshot** - Status snapshot testing jika ada
6. **Lokasi Kegagalan** - Lokasi spesifik di mana kegagalan terjadi

Reporter ini sangat berguna untuk debugging masalah kompleks terutama di lingkungan CI/CD atau saat menjalankan test dalam jumlah besar.

## Penggunaan Output

Output JSON dapat digunakan untuk:

1. Analisis tren kegagalan test over time
2. Integrasi dengan dashboard atau tools visualisasi
3. Penyimpanan sejarah kinerja test
4. Identifikasi bottleneck pada test yang lambat
