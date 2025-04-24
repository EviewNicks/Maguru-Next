import {
  getRoleWithCompat,
  isRoleAuthorized,
  addRoleDeprecationWarning,
} from './auth'

describe('Role Compatibility Helper', () => {
  describe('getRoleWithCompat', () => {
    it('should get role from publicMetadata', () => {
      // Arrange
      const user = {
        publicMetadata: {
          role: 'admin',
        },
      }

      // Act
      const result = getRoleWithCompat(user)

      // Assert
      expect(result).toBe('admin')
    })

    it('should get role from metaData (old format)', () => {
      // Arrange
      const user = {
        metaData: {
          role: 'dosen',
        },
      }

      // Act
      const result = getRoleWithCompat(user)

      // Assert
      expect(result).toBe('dosen')
    })

    it('should get role directly from user object', () => {
      // Arrange
      const user = {
        role: 'mahasiswa',
      }

      // Act
      const result = getRoleWithCompat(user)

      // Assert
      expect(result).toBe('mahasiswa')
    })

    it('should return default role if no role found', () => {
      // Arrange
      const user = {
        id: 'user_123',
        name: 'Test User',
      }

      // Act
      const result = getRoleWithCompat(user)

      // Assert
      expect(result).toBe('mahasiswa')
    })

    it('should handle null or undefined user', () => {
      // Act & Assert
      expect(getRoleWithCompat(null)).toBe('mahasiswa')
      expect(getRoleWithCompat(undefined)).toBe('mahasiswa')
    })
  })

  describe('isRoleAuthorized', () => {
    it('should return true when role is in required roles', () => {
      // Act & Assert
      expect(isRoleAuthorized('admin', ['admin', 'dosen'])).toBe(true)
      expect(isRoleAuthorized('dosen', ['admin', 'dosen'])).toBe(true)
    })

    it('should return false when role is not in required roles', () => {
      // Act & Assert
      expect(isRoleAuthorized('mahasiswa', ['admin', 'dosen'])).toBe(false)
    })
  })

  describe('addRoleDeprecationWarning', () => {
    it('should add warning when old role format is used (publicMetadata)', () => {
      // Arrange
      const response = {
        user: {
          id: 'user_123',
          publicMetadata: {
            role: 'admin',
          },
        },
      }

      // Act
      const result = addRoleDeprecationWarning(response)

      // Assert
      expect(result._warning).toBeDefined()
      expect(result._migration).toBeDefined()
    })

    it('should add warning when old role format is used (metaData)', () => {
      // Arrange
      const response = {
        user: {
          id: 'user_123',
          metaData: {
            role: 'admin',
          },
        },
      }

      // Act
      const result = addRoleDeprecationWarning(response)

      // Assert
      expect(result._warning).toBeDefined()
      expect(result._migration).toBeDefined()
    })

    it('should not add warning when new role format is used', () => {
      // Arrange
      const response = {
        user: {
          id: 'user_123',
          role: 'admin',
        },
      }

      // Act
      const result = addRoleDeprecationWarning(response)

      // Assert
      expect(result._warning).toBeUndefined()
      expect(result._migration).toBeUndefined()
    })
  })
})
