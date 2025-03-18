import { NextApiRequest, NextApiResponse } from 'next';
import { z } from 'zod';

type NextApiHandler = (req: NextApiRequest, res: NextApiResponse) => Promise<void> | void;

export const validateRequest = (schema: z.ZodSchema) => {
  return (handler: NextApiHandler): NextApiHandler => {
    return async (req: NextApiRequest, res: NextApiResponse) => {
      try {
        const body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
        const validatedBody = await schema.parseAsync(body);
        req.body = validatedBody;
        return handler(req, res);
      } catch (error) {
        if (error instanceof z.ZodError) {
          return res.status(400).json({
            error: {
              code: 'VALIDATION_ERROR',
              message: 'Validasi input gagal',
              details: error.errors,
            },
          });
        }
        
        return res.status(500).json({
          error: {
            code: 'INTERNAL_SERVER_ERROR',
            message: 'Terjadi kesalahan internal',
          },
        });
      }
    };
  };
};
