// __tests__/__mocks__/clerk-mock.tsx
import React from 'react'

const defaultExport = {
  SignedIn: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="signed-in">{children}</div>
  ),
  SignedOut: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="signed-out">{children}</div>
  ),
  SignIn: () => <div data-testid="sign-in">Sign In Component</div>,
  SignUp: () => <div data-testid="sign-up">Sign Up Component</div>,
  UserButton: () => <div data-testid="user-button">User Button</div>,
  useUser: () => ({
    isSignedIn: true,
    user: {
      id: 'test-user-id',
      fullName: 'Test User',
    }
  })
}

export default defaultExport
export const { SignedIn, SignedOut, SignIn, SignUp, UserButton, useUser } = defaultExport