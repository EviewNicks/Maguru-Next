// __mocks__/clerk-mock.js
module.exports = {
    SignedIn: ({ children }) => <div data-testid="signed-in">{children}</div>,
    SignedOut: ({ children }) => <div data-testid="signed-out">{children}</div>,
    SignInButton: ({ children }) => <div data-testid="sign-in-button">{children}</div>,
    SignUpButton: ({ children }) => <div data-testid="sign-up-button">{children}</div>,
    useAuth: () => ({
      isSignedIn: true,
      userId: 'test-user-id'
    }),
    useUser: () => ({
      user: {
        id: 'test-user-id',
        fullName: 'Test User'
      }
    })
  }