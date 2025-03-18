import { NextApiRequest, NextApiResponse } from 'next';
import { z } from 'zod';
import { validateRequest } from './validateRequest';

describe('validateRequest middleware', () => {
  let mockReq: Partial<NextApiRequest>;
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
    mockReq = {
      body: {},
    };
  });

  it('should call the handler when validation passes', async () => {
    // Arrange
    const schema = z.object({
      name: z.string(),
      age: z.number(),
    });
    
    mockReq.body = {
      name: 'John Doe',
      age: 30,
    };

    const middleware = validateRequest(schema)(mockHandler);

    // Act
    await middleware(mockReq as NextApiRequest, mockRes as NextApiResponse);

    // Assert
    expect(mockHandler).toHaveBeenCalledWith(mockReq, mockRes);
    expect(mockStatus).not.toHaveBeenCalled();
    expect(mockJson).not.toHaveBeenCalled();
  });

  it('should parse string body to JSON', async () => {
    // Arrange
    const schema = z.object({
      name: z.string(),
      age: z.number(),
    });
    
    mockReq.body = JSON.stringify({
      name: 'John Doe',
      age: 30,
    });

    const middleware = validateRequest(schema)(mockHandler);

    // Act
    await middleware(mockReq as NextApiRequest, mockRes as NextApiResponse);

    // Assert
    expect(mockHandler).toHaveBeenCalledWith(
      expect.objectContaining({
        body: {
          name: 'John Doe',
          age: 30,
        },
      }),
      mockRes
    );
  });

  it('should return 400 status with validation error details when validation fails', async () => {
    // Arrange
    const schema = z.object({
      name: z.string(),
      age: z.number().min(18, 'Harus berusia minimal 18 tahun'),
    });
    
    mockReq.body = {
      name: 'John Doe',
      age: 16,
    };

    const middleware = validateRequest(schema)(mockHandler);

    // Act
    await middleware(mockReq as NextApiRequest, mockRes as NextApiResponse);

    // Assert
    expect(mockHandler).not.toHaveBeenCalled();
    expect(mockStatus).toHaveBeenCalledWith(400);
    expect(mockJson).toHaveBeenCalledWith({
      error: {
        code: 'VALIDATION_ERROR',
        message: 'Validasi input gagal',
        details: expect.arrayContaining([
          expect.objectContaining({
            message: 'Harus berusia minimal 18 tahun',
          }),
        ]),
      },
    });
  });

  it('should return 500 status when an unexpected error occurs', async () => {
    // Arrange
    const schema = z.object({
      name: z.string(),
    });
    
    // Simulate an error that's not a ZodError
    jest.spyOn(schema, 'parseAsync').mockImplementation(() => {
      throw new Error('Unexpected error');
    });
    
    mockReq.body = {
      name: 'John Doe',
    };

    const middleware = validateRequest(schema)(mockHandler);

    // Act
    await middleware(mockReq as NextApiRequest, mockRes as NextApiResponse);

    // Assert
    expect(mockHandler).not.toHaveBeenCalled();
    expect(mockStatus).toHaveBeenCalledWith(500);
    expect(mockJson).toHaveBeenCalledWith({
      error: {
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Terjadi kesalahan internal',
      },
    });
  });
});
