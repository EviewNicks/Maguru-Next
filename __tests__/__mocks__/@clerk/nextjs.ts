export const auth = jest.fn(() => ({
  userId: 'test_user_id',
  claims: { role: 'admin' },
}))

export const currentUser = jest.fn(() => ({
  id: 'test_user_id',
  emailAddresses: [{ emailAddress: 'test@example.com' }],
  firstName: 'Test',
  lastName: 'User',
}))
