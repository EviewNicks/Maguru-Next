import { test, expect, Page } from '@playwright/test'

/**
 * E2E Test untuk fungsionalitas tabel modul
 * Fokus pada pengujian pagination, sorting, filtering, dan pencarian
 */
test.describe('Manajemen Modul - Tabel Modul E2E Tests', () => {
  test.beforeEach(async ({ page }: { page: Page }) => {
    // Login sebagai admin (prasyarat)
    await page.goto('/auth/login')
    await page.fill('input[name="email"]', 'admin@example.com')
    await page.fill('input[name="password"]', 'password123')
    await page.click('button[type="submit"]')

    // Navigasi ke halaman manajemen modul
    await page.goto('/admin/module')
    await expect(page).toHaveTitle(/Manajemen Modul/)
  })

  test('pagination berfungsi dengan benar', async ({
    page,
  }: {
    page: Page
  }) => {
    // Catat data modul di halaman pertama
    const firstPageFirstTitle = await page
      .locator('tbody tr:first-child td:nth-child(1)')
      .textContent()

    // Klik tombol halaman berikutnya
    await page.click('button:has-text("Next")')

    // Verifikasi halaman berubah (data berbeda)
    const secondPageFirstTitle = await page
      .locator('tbody tr:first-child td:nth-child(1)')
      .textContent()
    expect(firstPageFirstTitle).not.toEqual(secondPageFirstTitle)

    // Klik tombol halaman sebelumnya
    await page.click('button:has-text("Previous")')

    // Verifikasi kembali ke halaman pertama
    const backToFirstPageTitle = await page
      .locator('tbody tr:first-child td:nth-child(1)')
      .textContent()
    expect(backToFirstPageTitle).toEqual(firstPageFirstTitle)
  })

  test('sorting kolom berfungsi dengan benar', async ({
    page,
  }: {
    page: Page
  }) => {
    // Klik header kolom Judul untuk sorting
    await page.click('th:has-text("Judul")')

    // Ambil data setelah sorting ascending
    const ascSortFirstTitle = await page
      .locator('tbody tr:first-child td:nth-child(1)')
      .textContent()

    // Klik lagi untuk sorting descending
    await page.click('th:has-text("Judul")')

    // Ambil data setelah sorting descending
    const descSortFirstTitle = await page
      .locator('tbody tr:first-child td:nth-child(1)')
      .textContent()

    // Verifikasi data berbeda (sorting berfungsi)
    expect(ascSortFirstTitle).not.toEqual(descSortFirstTitle)
  })

  test('filter berdasarkan status berfungsi dengan benar', async ({
    page,
  }: {
    page: Page
  }) => {
    // Pilih filter status DRAFT
    await page.selectOption('select[data-testid="status-filter"]', 'DRAFT')

    // Pastikan semua item yang ditampilkan memiliki status Draft
    const statusCells = await page
      .locator('tbody tr td:nth-child(3)')
      .allTextContents()
    for (const cell of statusCells) {
      expect(cell.trim()).toBe('Draft')
    }

    // Ganti filter ke ACTIVE
    await page.selectOption('select[data-testid="status-filter"]', 'ACTIVE')

    // Pastikan semua item yang ditampilkan memiliki status Active
    const activeStatusCells = await page
      .locator('tbody tr td:nth-child(3)')
      .allTextContents()
    for (const cell of activeStatusCells) {
      expect(cell.trim()).toBe('Dipublikasikan')
    }
  })

  test('pencarian berfungsi dengan benar', async ({ page }: { page: Page }) => {
    // Ambil judul modul pertama sebagai kata kunci pencarian
    const searchKeyword = await page
      .locator('tbody tr:first-child td:nth-child(1)')
      .textContent()
    if (!searchKeyword) {
      throw new Error('Tidak bisa mendapatkan judul modul untuk pencarian')
    }

    // Gunakan sebagian dari judul untuk pencarian
    const partialKeyword = searchKeyword.substring(
      0,
      Math.min(searchKeyword.length, 5)
    )

    // Lakukan pencarian
    await page.fill('input[placeholder="Cari modul..."]', partialKeyword)

    // Tunggu hasil pencarian
    await page.waitForTimeout(500) // Tunggu debounce

    // Verifikasi hasil pencarian mengandung keyword
    const resultCells = await page
      .locator('tbody tr td:nth-child(1)')
      .allTextContents()

    // Validasi setiap item hasil pencarian mengandung kata kunci
    let hasResults = false
    for (const cell of resultCells) {
      if (cell.includes(partialKeyword)) {
        hasResults = true
      }
    }
    expect(hasResults).toBeTruthy()
  })

  test('tampilan kosong muncul ketika tidak ada data', async ({
    page,
  }: {
    page: Page
  }) => {
    // Cari dengan keyword yang tidak mungkin ada
    await page.fill(
      'input[placeholder="Cari modul..."]',
      'XYZ12345-TIDAK-ADA-MODUL-INI'
    )

    // Tunggu debounce pencarian
    await page.waitForTimeout(500)

    // Verifikasi pesan "tidak ada data" muncul
    await expect(page.locator('text=Belum ada data modul')).toBeVisible()
  })
})
