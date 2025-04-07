import { Page, Locator, expect } from '@playwright/test'

export class AuthPages {
  readonly page: Page
  readonly signInButton: Locator
  readonly signUpButton: Locator
  readonly emailInput: Locator
  readonly passwordInput: Locator
  readonly submitButton: Locator
  readonly userButton: Locator

  constructor(page: Page) {
    this.page = page
    this.signInButton = page.getByRole('button', { name: 'Login' })
    this.signUpButton = page.getByRole('button', { name: 'register' })
    this.emailInput = page.getByLabel('Email address')
    this.passwordInput = page.getByLabel('Password')
    this.submitButton = page.getByRole('button', {
      name: 'Continue',
      exact: true,
    })
    this.userButton = page
      .locator('button')
      .filter({ has: page.locator('[data-testid="user-button"]') })
  }

  async goToHomePage() {
    await this.page.goto('/')
  }

  async openSignInModal() {
    await this.signInButton.click()
  }

  async openSignUpModal() {
    await this.signUpButton.click()
  }

  async fillSignInForm(email: string, password: string) {
    await this.emailInput.fill(email)
    await this.submitButton.click()
    await this.passwordInput.fill(password)
    await this.submitButton.click()
  }

  async verifyLoggedIn() {
    await expect(this.userButton).toBeVisible()
  }

  async logout() {
    await this.userButton.click()
    await this.page.getByRole('link', { name: 'Log out' }).click()
  }
}
