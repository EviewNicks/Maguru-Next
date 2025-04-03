import { test, expect, Page } from '@playwright/test'

/**
 * E2E Test untuk alur CRUD pada fitur Manajemen Modul
 * Fokus pada pengujian alur lengkap aplikasi dari perspektif pengguna
 */
test.describe('Manajemen Modul - Alur CRUD E2E Tests', () => {
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

  test('membuat modul baru dan memverifikasi keberhasilan', async ({
    page,
  }: {
    page: Page
  }) => {
    // Klik tombol tambah modul
    await page.click('button:has-text("Tambah Modul")')

    // Verifikasi modal form terbuka
    await expect(page.locator('h2:has-text("Tambah Modul")')).toBeVisible()

    // Mengisi form
    const testTitle = `Test Modul E2E ${Date.now()}`
    await page.fill('input[name="title"]', testTitle)
    await page.fill(
      'textarea[name="description"]',
      'Deskripsi modul yang dibuat melalui E2E test'
    )
    await page.selectOption('select[name="status"]', 'DRAFT')

    // Submit form
    await page.click('button:has-text("Simpan")')

    // Verifikasi notifikasi sukses
    await expect(
      page.locator('div:has-text("Modul berhasil dibuat")')
    ).toBeVisible()

    // Verifikasi modul muncul di tabel
    await page.fill('input[placeholder="Cari modul..."]', testTitle)
    await expect(page.locator(`td:has-text("${testTitle}")`)).toBeVisible()
  })

  test('mengedit modul yang ada dan memverifikasi perubahan', async ({
    page,
  }: {
    page: Page
  }) => {
    // Cari modul untuk diedit (modul teratas di tabel)
    const moduleTitle = await page
      .locator('tbody tr:first-child td:nth-child(1)')
      .textContent()

    // Klik tombol edit pada baris pertama
    await page
      .locator('tbody tr:first-child')
      .getByRole('button', { name: 'Edit' })
      .click()

    // Verifikasi modal form terbuka
    await expect(page.locator('h2:has-text("Edit Modul")')).toBeVisible()

    // Edit judul modul
    const newTitle = `Edited: ${moduleTitle} (${Date.now()})`
    await page.fill('input[name="title"]', newTitle)

    // Submit form
    await page.click('button:has-text("Simpan")')

    // Verifikasi notifikasi sukses
    await expect(
      page.locator('div:has-text("Modul berhasil diperbarui")')
    ).toBeVisible()

    // Verifikasi perubahan tercermin di tabel
    await page.fill('input[placeholder="Cari modul..."]', newTitle)
    await expect(page.locator(`td:has-text("${newTitle}")`)).toBeVisible()
  })

  test('menghapus modul dan memverifikasi penghapusan', async ({
    page,
  }: {
    page: Page
  }) => {
    // Catat judul modul teratas untuk verifikasi
    const moduleTitle = await page
      .locator('tbody tr:first-child td:nth-child(1)')
      .textContent()

    // Klik tombol hapus pada baris pertama
    await page
      .locator('tbody tr:first-child')
      .getByRole('button', { name: 'Delete' })
      .click()

    // Verifikasi dialog konfirmasi muncul
    await expect(page.locator('div:has-text("Konfirmasi Hapus")')).toBeVisible()

    // Konfirmasi penghapusan
    await page.click('button:has-text("Delete")')

    // Verifikasi notifikasi sukses
    await expect(
      page.locator('div:has-text("Modul berhasil dihapus")')
    ).toBeVisible()

    // Verifikasi modul tidak ada lagi di tabel
    await page.fill('input[placeholder="Cari modul..."]', moduleTitle || '')
    await expect(
      page.locator(`td:has-text("${moduleTitle}")`)
    ).not.toBeVisible()
  })
})
