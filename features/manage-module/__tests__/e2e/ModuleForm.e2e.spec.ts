import { test, expect, Page } from '@playwright/test'

/**
 * E2E Test untuk validasi form modul
 * Fokus pada pengujian validasi input dan handling error
 */
test.describe('Manajemen Modul - Validasi Form E2E Tests', () => {
  test.beforeEach(async ({ page }: { page: Page }) => {
    // Login sebagai admin (prasyarat)
    await page.goto('/auth/login')
    await page.fill('input[name="email"]', 'admin@example.com')
    await page.fill('input[name="password"]', 'password123')
    await page.click('button[type="submit"]')

    // Navigasi ke halaman manajemen modul dan buka form
    await page.goto('/admin/module')
    await page.click('button:has-text("Tambah Modul")')

    // Verifikasi modal form terbuka
    await expect(page.locator('h2:has-text("Tambah Modul")')).toBeVisible()
  })

  test('validasi judul yang terlalu pendek', async ({
    page,
  }: {
    page: Page
  }) => {
    // Isi judul terlalu pendek (< 5 karakter)
    await page.fill('input[name="title"]', 'Abc')
    await page.click('button:has-text("Simpan")')

    // Verifikasi pesan error untuk judul pendek
    await expect(page.locator('text=Judul minimal 5 karakter')).toBeVisible()
  })

  test('validasi judul yang terlalu panjang', async ({
    page,
  }: {
    page: Page
  }) => {
    // Isi judul terlalu panjang (> 100 karakter)
    const longTitle = 'A'.repeat(101)
    await page.fill('input[name="title"]', longTitle)
    await page.click('button:has-text("Simpan")')

    // Verifikasi pesan error untuk judul panjang
    await expect(page.locator('text=Judul maksimal 100 karakter')).toBeVisible()
  })

  test('validasi form kosong', async ({ page }: { page: Page }) => {
    // Biarkan form kosong dan submit
    await page.click('button:has-text("Simpan")')

    // Verifikasi pesan error untuk judul yang kosong
    await expect(page.locator('text=Judul harus diisi')).toBeVisible()
  })

  test('validasi input XSS di judul dan deskripsi', async ({
    page,
  }: {
    page: Page
  }) => {
    // Isi form dengan konten yang berpotensi berbahaya
    await page.fill(
      'input[name="title"]',
      'Modul Test <script>alert("XSS")</script>'
    )
    await page.fill(
      'textarea[name="description"]',
      'Deskripsi <img src="x" onerror="alert(\'XSS\')">'
    )

    // Submit form
    await page.click('button:has-text("Simpan")')

    // Tunggu sampai form ditutup dan data muncul di tabel
    await expect(page.locator('h2:has-text("Tambah Modul")')).not.toBeVisible()

    // Cari modul yang baru ditambahkan
    await page.fill('input[placeholder="Cari modul..."]', 'Modul Test')

    // Verifikasi data muncul di tabel dan aman dari XSS
    const cellContent = await page
      .locator('td:has-text("Modul Test")')
      .innerHTML()

    // Konten tidak boleh mengandung script tag
    expect(cellContent).not.toContain('<script>')
    expect(cellContent).not.toContain('onerror=')
  })

  test('validasi status tidak valid', async ({ page }: { page: Page }) => {
    // Isi form dengan data valid kecuali status
    await page.fill('input[name="title"]', 'Modul Test Valid')
    await page.fill('textarea[name="description"]', 'Deskripsi modul valid')

    // Hack: Coba set status tidak valid (dengan manipulasi DOM)
    // Catatan: Ini butuh page.evaluate() karena kita perlu mengubah pilihan select secara langsung
    await page.evaluate(() => {
      const select = document.querySelector('select[name="status"]')
      if (select) {
        // @ts-expect-error Mengubah nilai select secara langsung
        select.value = 'INVALID_STATUS'
        // Trigger event untuk notify React
        select.dispatchEvent(new Event('change', { bubbles: true }))
      }
    })

    // Submit form
    await page.click('button:has-text("Simpan")')

    // Harusnya muncul error, tapi di UI mungkin tidak dirender jika validasi ada di backend
    // Alternatif verifikasi: Cek form tidak tertutup, yang berarti validasi gagal
    await expect(page.locator('h2:has-text("Tambah Modul")')).toBeVisible()
  })

  test('form bisa ditutup dengan tombol cancel', async ({
    page,
  }: {
    page: Page
  }) => {
    // Isi sebagian form
    await page.fill('input[name="title"]', 'Modul Test Cancel')

    // Klik tombol Cancel
    await page.click('button:has-text("Cancel")')

    // Verifikasi form tertutup
    await expect(page.locator('h2:has-text("Tambah Modul")')).not.toBeVisible()

    // Verifikasi data tidak ditambahkan (cari di tabel)
    await page.fill('input[placeholder="Cari modul..."]', 'Modul Test Cancel')
    // Harusnya tidak ada hasil
    await expect(page.locator('text=Belum ada data modul')).toBeVisible()
  })
})
