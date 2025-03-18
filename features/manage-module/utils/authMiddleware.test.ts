import { NextApiRequest, NextApiResponse } from 'next';
import { isAdmin, AuthenticatedRequest } from './authMiddleware';

describe('Auth Middleware', () => {
  let mockReq: Partial<AuthenticatedRequest>;
  let mockRes: Partial<NextApiResponse>;
  let mockHandler: jest.Mock;
  let mockJson: jest.Mock;
  let mockStatus: jest.Mock;

  beforeEach(() => {
    mockJson = jest.fn().mockReturnValue({});
    mockStatus = jest.fn().mockReturnValue({ json: mockJson });
    mockRes = {
      status: mockStatus,
      json: mockJson,
    };
    mockHandler = jest.fn();
    mockReq = {};
  });

  describe('isAdmin middleware', () => {
    it('should call the handler when user is admin', async () => {
      // Arrange
      mockReq.user = {
        id: 'admin-id',
        role: 'ADMIN',
      };

      const middleware = isAdmin(mockHandler);

      // Act
      await middleware(mockReq as NextApiRequest, mockRes as NextApiResponse);

      // Assert
      expect(mockHandler).toHaveBeenCalledWith(mockReq, mockRes);
      expect(mockStatus).not.toHaveBeenCalled();
      expect(mockJson).not.toHaveBeenCalled();
    });

    it('should return 401 when user is not authenticated', async () => {
      // Arrange
      mockReq.user = undefined;

      const middleware = isAdmin(mockHandler);

      // Act
      await middleware(mockReq as NextApiRequest, mockRes as NextApiResponse);

      // Assert
      expect(mockHandler).not.toHaveBeenCalled();
      expect(mockStatus).toHaveBeenCalledWith(401);
      expect(mockJson).toHaveBeenCalledWith({
        error: {
          code: 'UNAUTHORIZED',
          message: 'Autentikasi diperlukan untuk mengakses resource ini',
        },
      });
    });

    it('should return 403 when user is not admin', async () => {
      // Arrange
      mockReq.user = {
        id: 'user-id',
        role: 'USER',
      };

      const middleware = isAdmin(mockHandler);

      // Act
      await middleware(mockReq as NextApiRequest, mockRes as NextApiResponse);

      // Assert
      expect(mockHandler).not.toHaveBeenCalled();
      expect(mockStatus).toHaveBeenCalledWith(403);
      expect(mockJson).toHaveBeenCalledWith({
        error: {
          code: 'FORBIDDEN',
          message: 'Forbidden: Hanya admin yang diperbolehkan',
        },
      });
    });
  });
});
