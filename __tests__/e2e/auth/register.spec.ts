import { test, expect } from '@playwright/test'
import { AuthPages } from '../pages/authPages'

test.describe('Registration Functionality', () => {
  let authPages: AuthPages

  test.beforeEach(async ({ page }) => {
    authPages = new AuthPages(page)
    await authPages.goToHomePage()
  })

  test('User can open registration modal', async () => {
    await authPages.openSignUpModal()
    await expect(authPages.emailInput).toBeVisible()
  })

  test('User can register with valid information', async ({ page }) => {
    // Skip in CI environment or production tests
    test.skip(process.env.CI === 'true', 'Registration test skipped in CI')

    const randomEmail = `test${Date.now()}@example.com`
    const password = 'SecurePassword123!'

    await authPages.openSignUpModal()

    // Isi form registrasi
    await authPages.emailInput.fill(randomEmail)
    await authPages.submitButton.click()
    await authPages.passwordInput.fill(password)
    await authPages.submitButton.click()

    // Lanjutkan dengan verifikasi dan pengisian data tambahan sesuai alur registrasi Clerk
    // ...

    // Verifikasi registrasi berhasil
    await authPages.verifyLoggedIn()
  })
})
