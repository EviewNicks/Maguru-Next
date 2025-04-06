import { Page } from '@playwright/test'

export async function setupTestUser(page: Page) {
  // Menyiapkan cookie atau storage untuk mensimulasikan session untuk testing
  const clerkToken = process.env.CLERK_TEST_TOKEN

  if (clerkToken) {
    await page.evaluate((token) => {
      localStorage.setItem('__clerk_client_jwt', token)
    }, clerkToken)
  }
}
