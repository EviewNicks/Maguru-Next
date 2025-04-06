import { test, expect } from '@playwright/test'
import { AuthPages } from '../pages/authPages'
import { setupTestUser } from '../utils/auth-helpers'

test.describe('Logout Functionality', () => {
  let authPages: AuthPages

  test.beforeEach(async ({ page }) => {
    authPages = new AuthPages(page)
    await setupTestUser(page) // Setup pengguna yang sudah login
    await authPages.goToHomePage()
  })

  test('User can logout', async () => {
    // Verifikasi user button ada (pengguna sudah login)
    await authPages.verifyLoggedIn()

    // Lakukan logout
    await authPages.logout()

    // Verifikasi pengguna telah logout (tampilan login button)
    await expect(authPages.signInButton).toBeVisible()
  })
})
