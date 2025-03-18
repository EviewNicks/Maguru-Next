import { NextApiRequest, NextApiResponse } from 'next';
import { auditMiddleware } from './auditMiddleware';
import { AuthenticatedRequest } from './authMiddleware';

describe('Audit Middleware', () => {
  let mockReq: Partial<AuthenticatedRequest>;
  let mockRes: Partial<NextApiResponse>;
  let mockHandler: jest.Mock;
  let consoleLogSpy: jest.SpyInstance;
  let consoleErrorSpy: jest.SpyInstance;

  beforeEach(() => {
    mockRes = {
      json: jest.fn().mockReturnValue({}),
      statusCode: 200,
    };
    mockHandler = jest.fn();
    mockReq = {
      method: 'GET',
      url: '/api/module',
      body: {},
    };

    // Spy on console methods
    consoleLogSpy = jest.spyOn(console, 'log').mockImplementation();
    consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();
  });

  afterEach(() => {
    consoleLogSpy.mockRestore();
    consoleErrorSpy.mockRestore();
  });

  it('should log request information when handler is called', async () => {
    // Arrange
    mockReq.user = {
      id: 'user-id',
      role: 'ADMIN',
    };

    const middleware = auditMiddleware(mockHandler);

    // Act
    await middleware(mockReq as NextApiRequest, mockRes as NextApiResponse);

    // Assert
    expect(mockHandler).toHaveBeenCalledWith(mockReq, mockRes);
    expect(consoleLogSpy).toHaveBeenCalledWith(
      expect.stringContaining('[INFO]')
    );
    expect(consoleLogSpy).toHaveBeenCalledWith(
      expect.stringContaining('API_REQUEST')
    );
    expect(consoleLogSpy).toHaveBeenCalledWith(
      expect.stringContaining('user-id')
    );
    expect(consoleLogSpy).toHaveBeenCalledWith(
      expect.stringContaining('GET')
    );
    expect(consoleLogSpy).toHaveBeenCalledWith(
      expect.stringContaining('/api/module')
    );
  });

  it('should log anonymous for unauthenticated requests', async () => {
    // Arrange
    mockReq.user = undefined;

    const middleware = auditMiddleware(mockHandler);

    // Act
    await middleware(mockReq as NextApiRequest, mockRes as NextApiResponse);

    // Assert
    expect(mockHandler).toHaveBeenCalledWith(mockReq, mockRes);
    expect(consoleLogSpy).toHaveBeenCalledWith(
      expect.stringContaining('anonymous')
    );
  });

  it('should log response information when res.json is called', async () => {
    // Arrange
    mockReq.user = {
      id: 'user-id',
      role: 'ADMIN',
    };

    const middleware = auditMiddleware(mockHandler);

    // Act
    await middleware(mockReq as NextApiRequest, mockRes as NextApiResponse);
    
    // Simulate response
    mockRes.json!({ data: 'test' });

    // Assert
    expect(consoleLogSpy).toHaveBeenCalledWith(
      expect.stringContaining('API_RESPONSE')
    );
    expect(consoleLogSpy).toHaveBeenCalledWith(
      expect.stringContaining('200')
    );
  });

  it('should omit request body for GET requests', async () => {
    // Arrange
    mockReq.method = 'GET';
    mockReq.body = { sensitive: 'data' };

    const middleware = auditMiddleware(mockHandler);

    // Act
    await middleware(mockReq as NextApiRequest, mockRes as NextApiResponse);

    // Assert
    expect(consoleLogSpy).toHaveBeenCalledWith(
      expect.stringContaining('omitted')
    );
    expect(consoleLogSpy).not.toHaveBeenCalledWith(
      expect.stringContaining('sensitive')
    );
  });

  it('should log request body for non-GET requests', async () => {
    // Arrange
    mockReq.method = 'POST';
    mockReq.body = { title: 'Test Module' };

    const middleware = auditMiddleware(mockHandler);

    // Act
    await middleware(mockReq as NextApiRequest, mockRes as NextApiResponse);

    // Assert
    expect(consoleLogSpy).toHaveBeenCalledWith(
      expect.stringContaining('Test Module')
    );
  });
});
