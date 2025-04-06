import { test, expect } from '@playwright/test'
import { AuthPages } from '../pages/authPages'

test.describe('Login Functionality', () => {
  let authPages: AuthPages

  test.beforeEach(async ({ page }) => {
    authPages = new AuthPages(page)
    await authPages.goToHomePage()
  })

  test('User can open login modal', async () => {
    await authPages.openSignInModal()
    await expect(authPages.emailInput).toBeVisible()
  })

  test('User can login with valid credentials', async ({ page }) => {
    // Gunakan testid untuk testing
    test.skip(process.env.CI === 'true', 'Test akun tidak tersedia di CI')

    const testEmail = process.env.TEST_USER_EMAIL || 'test@example.com'
    const testPassword = process.env.TEST_USER_PASSWORD || 'password123'

    await authPages.openSignInModal()
    await authPages.fillSignInForm(testEmail, testPassword)

    // Verifikasi login berhasil
    await authPages.verifyLoggedIn()
  })

  test('Error message appears with invalid credentials', async () => {
    await authPages.openSignInModal()
    await authPages.fillSignInForm('invalid@example.com', 'wrongpassword')

    // Cek pesan error
    const errorMessage = authPages.page.getByText(
      'Invalid email or password'
    )
    await expect(errorMessage).toBeVisible()
  })
})
