import { NextApiRequest, NextApiResponse } from 'next';
import { AuthenticatedRequest } from './authMiddleware';

type NextApiHandler = (req: NextApiRequest, res: NextApiResponse) => Promise<void> | void;

// Ini adalah implementasi sederhana untuk logging
// Pada implementasi sebenarnya, gunakan library seperti Winston atau Pino
const logger = {
  info: (message: string) => {
    console.log(`[INFO] ${new Date().toISOString()} - ${message}`);
    // Pada implementasi sebenarnya, log ke file atau database
  },
  error: (message: string) => {
    console.error(`[ERROR] ${new Date().toISOString()} - ${message}`);
    // Pada implementasi sebenarnya, log ke file atau database
  }
};

export const auditMiddleware = (handler: NextApiHandler): NextApiHandler => {
  return async (req: NextApiRequest, res: NextApiResponse) => {
    const authReq = req as AuthenticatedRequest;
    const userId = authReq.user?.id || 'anonymous';
    const method = req.method || 'UNKNOWN';
    const url = req.url || 'UNKNOWN';
    const body = req.body ? JSON.stringify(req.body) : 'no-body';
    
    // Log request
    logger.info(
      JSON.stringify({
        type: 'API_REQUEST',
        userId,
        method,
        url,
        body: method === 'GET' ? 'omitted' : body,
        timestamp: new Date().toISOString(),
      })
    );

    // Buat wrapper untuk res.json untuk mencatat respons
    const originalJson = res.json;
    res.json = function(body) {
      // Log response
      logger.info(
        JSON.stringify({
          type: 'API_RESPONSE',
          userId,
          method,
          url,
          statusCode: res.statusCode,
          timestamp: new Date().toISOString(),
        })
      );
      
      return originalJson.call(this, body);
    };

    return handler(req, res);
  };
};
