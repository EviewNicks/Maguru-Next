## 1. Pendahuluan

### Tujuan

Dokumen ini bertujuan untuk mengatur standar pengembangan frontend pada proyek Maguru agar kode tetap konsisten, mudah dipahami, scalable, dan sesuai dengan praktik terbaik.

Dokumen ini dirancang untuk developer frontend, baik baru maupun yang berpengalaman, untuk memastikan konsistensi dan kualitas kode pada proyek Maguru. Dokumen ini melengkapi panduan lain seperti Design System dan Backend Guidelines.

### Scope

Panduan ini mencakup gaya penulisan kode, state management, optimasi performa, testing, dan alat bantu seperti linting & formatting.

### Proses Update & Review

- **Update Berkala**: Guideline ini akan dievaluasi dan diupdate setiap akhir sprint saat retrospektif.
- **Penanggung Jawab**: Frontend Lead bertanggung jawab mengumpulkan masukan tim dan memperbarui guideline.
- **Pengumuman Perubahan**: Setiap update guideline akan diumumkan melalui Slack dan didokumentasikan di Confluence.

---

## 2. Konvensi Kode

### Penamaan File & Folder

- **camelCase** untuk file TypeScript/JavaScript: `userProfile.tsx`
- **kebab-case** untuk folder: `user-profile/`
- **PascalCase** untuk komponen: `UserCard.tsx`

### Styling & CSS

- Gunakan **Tailwind CSS** sebagai standar utama.
- Hindari **inline CSS** kecuali untuk dynamic styles sederhana.
- Warna brand dan background sesuai yang telah disepakati.
- Gunakan **CSS Modules** (`.module.css`) untuk styling spesifik komponen.
- Kategorikan class Tailwind berdasarkan fungsinya: layout, spacing, typography, dll.

### Typography

- **Font utama**: Inter, Playfair Display, dan Code Snippet.
- Gunakan skala responsif Tailwind (`text-sm`, `text-lg`, `text-2xl`, dll.).
- Pastikan kontras warna sesuai standar aksesibilitas (WCAG AA minimal).

### Komentar & Dokumentasi

Gunakan komentar singkat untuk menjelaskan blok kode yang kompleks atau algoritma yang tidak langsung jelas.
Gunakan **JSDoc atau TypeScript** untuk mendokumentasikan fungsi dan komponen:

```tsx
/**
 * Komponen untuk menampilkan kartu pengguna
 * @param {string} name - Nama pengguna
 * @param {string} role - Peran pengguna (admin, mahasiswa, dll.)
 */
const UserCard: React.FC<{ name: string; role: string }> = ({ name, role }) => {
  return (
    <div className="p-4 border rounded-lg">
      <h2 className="text-xl font-bold">{name}</h2>
      <p className="text-gray-500">{role}</p>
    </div>
  )
}
```

Pastikan fungsi yang diekspos memiliki deskripsi singkat, parameter, dan return value jika relevan.
Untuk komponen yang kompleks, tambahkan komentar untuk menjelaskan logika utama atau state yang dikelola.

### Best Practice

- Simpan **satu komponen utama per file** dan beri nama file sesuai dengan nama komponen.
- Gunakan **variabel warna dan font** untuk konsistensi desain.
- Hindari menggunakan `!important` dalam styling kecuali benar-benar diperlukan.
- Pastikan komentar relevan dan diperbarui jika ada perubahan signifikan pada logika kode.

---

## 3. State Management

### Pilihan State Management

- **Context API**: Untuk state global yang sederhana dan tidak memerlukan banyak aksi kompleks.
- **Redux Toolkit**: Untuk state yang lebih kompleks, melibatkan banyak entitas, atau perlu pengelolaan yang terstruktur.
- **Zustand**: Alternatif ringan untuk state management jika Redux terlalu kompleks.

### Best Practice

- Gunakan **Redux** untuk state yang sering berubah atau melibatkan banyak entitas yang saling terkait.
- Buat **slice terpisah** untuk setiap fitur agar lebih modular.
- Gunakan `useSelector` secara spesifik untuk menghindari re-render berlebihan.
- Hindari menyimpan state yang bisa langsung dihitung dari data lain.

### Contoh Penggunaan Context API

```tsx
import { createContext, useContext, useState, ReactNode } from 'react'

const ThemeContext = createContext({
  theme: 'light',
  setTheme: (theme: string) => {},
})

export const ThemeProvider = ({ children }: { children: ReactNode }) => {
  const [theme, setTheme] = useState('light')
  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  )
}

export const useTheme = () => useContext(ThemeContext)
```

### Contoh Penggunaan Redux Toolkit

```tsx
import { createSlice, configureStore } from '@reduxjs/toolkit'

const counterSlice = createSlice({
  name: 'counter',
  initialState: { value: 0 },
  reducers: {
    increment: (state) => {
      state.value += 1
    },
    decrement: (state) => {
      state.value -= 1
    },
  },
})

export const { increment, decrement } = counterSlice.actions

export const store = configureStore({
  reducer: {
    counter: counterSlice.reducer,
  },
})
```

Dengan contoh ini, developer bisa lebih mudah memahami kapan harus memilih **Context API** atau **Redux** sesuai kebutuhan fitur. 🚀

## 4. Best Practise untuk Next.js

- Gunakan `getStaticProps` untuk data statis yang jarang berubah.
- Gunakan `getServerSideProps` untuk data yang perlu diambil saat request.
- Pisahkan logika berat dari komponen ke dalam hooks atau utilitas.
- Manfaatkan Next.js Image Optimization untuk performa gambar yang lebih baik.
- Gunakan Middleware untuk pengamanan atau validasi global.
- Manfaatkan Edge Functions untuk meningkatkan kecepatan eksekusi di server.

### Best Practice:

- Hindari fetch data langsung di komponen; gunakan hooks untuk pemisahan concern.
- Gunakan dynamic import untuk memuat komponen berat secara lazy.
- Prioritaskan SSR hanya jika benar-benar diperlukan untuk mengurangi waktu respon server.
- Gunakan ISR (Incremental Static Regeneration) untuk update data yang lebih efisien.

---

## 5. Performance Optimization

- Hindari re-render berlebihan dengan `React.memo`, `useMemo`, dan `useCallback`.
- Gunakan lazy loading untuk gambar dan komponen berat.
- Gunakan TanStack Query untuk caching data yang di-fetch.
- Optimalkan penggunaan React DevTools dan profiler.
- Pastikan ukuran bundle tetap kecil dengan analisis menggunakan `next build --profile`.

### Best Practice:

- Gunakan profiler React untuk mengidentifikasi bottleneck performa.
- Minimalkan jumlah re-render dengan menghindari passing props yang tidak perlu.
- Gunakan code-splitting dan lazy loading pada halaman besar.
- Gunakan `fast-deep-equal` untuk membandingkan state yang kompleks sebelum memicu re-render.

---

## 6. Testing

- **Unit Test**: Gunakan Jest untuk menguji logika komponen secara terisolasi.
- **Integration Test**: Gunakan React Testing Library untuk menguji interaksi antarkomponen.
- **E2E Test**: Gunakan Cypress atau Playwright untuk menguji alur pengguna secara menyeluruh.

### Best Practice:

- Pastikan coverage testing minimal 80%.
- Pisahkan file test sesuai fitur dan gunakan nama yang mencerminkan skenario yang diuji.
- Gunakan mock API atau library seperti `msw` untuk simulasi request pada pengujian.
- Buat test yang mencakup skenario edge case untuk menghindari bug tersembunyi.
- Gunakan test snapshot untuk mendeteksi perubahan UI yang tidak disengaja.

---

## 7. Linting & Formatting

- **Prettier**: Untuk format otomatis.
- **ESLint**: Untuk quality control kode.
- **cSpell**: Untuk spell checking (bahasa Inggris & Indonesia).
- **Husky & lint-staged**: Untuk memastikan linting berjalan sebelum commit.

### Tambahan aturan linting:

- **Accessibility** (`eslint-plugin-jsx-a11y`) untuk aksesibilitas.
- **Import sorting** (`eslint-plugin-import`) untuk keteraturan.
- **Unused imports & variables**: Hindari import atau variabel yang tidak terpakai untuk mengurangi beban aplikasi.
- **ESLint Rules Custom**: Disesuaikan dengan kebutuhan proyek agar lebih ketat dalam best practices.

### Best Practice:

- Jalankan linting sebelum commit menggunakan pre-commit hooks.
- Pastikan tidak ada peringatan ESLint saat build.
- Gunakan lint-staged untuk otomatis melint file yang berubah sebelum push ke repository.
- Gunakan `prettier-plugin-tailwindcss` untuk mengurutkan class Tailwind secara otomatis.

---

## 8. Catatan Tambahan

- Dokumentasi tambahan dapat mengacu ke sumber eksternal seperti dokumentasi resmi Next.js, Tailwind CSS, dan Redux Toolkit.
- Jika proyek ini memiliki Design System, pastikan untuk merujuk ke dokumentasi Design System agar styling dan komponen selaras.
- Developer frontend diharapkan mengikuti guideline ini untuk menjaga kualitas dan konsistensi kode.
- Review kode secara berkala untuk memastikan kepatuhan terhadap guideline.
- Berikan komentar pada kode yang kompleks untuk memudahkan developer lain memahami alur logika.
- Gunakan Storybook untuk dokumentasi dan pengujian komponen UI secara visual.
