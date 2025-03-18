import { NextApiRequest, NextApiResponse } from 'next';

type NextApiHandler = (req: NextApiRequest, res: NextApiResponse) => Promise<void> | void;

export interface AuthenticatedRequest extends NextApiRequest {
  user?: {
    id: string;
    role: string;
  };
}

export const isAdmin = (handler: NextApiHandler): NextApiHandler => {
  return async (req: NextApiRequest, res: NextApiResponse) => {
    const authReq = req as AuthenticatedRequest;
    
    if (!authReq.user) {
      return res.status(401).json({
        error: {
          code: 'UNAUTHORIZED',
          message: 'Autentikasi diperlukan untuk mengakses resource ini',
        },
      });
    }

    if (authReq.user.role !== 'ADMIN') {
      return res.status(403).json({
        error: {
          code: 'FORBIDDEN',
          message: 'Forbidden: Hanya admin yang diperbolehkan',
        },
      });
    }

    return handler(req, res);
  };
};
