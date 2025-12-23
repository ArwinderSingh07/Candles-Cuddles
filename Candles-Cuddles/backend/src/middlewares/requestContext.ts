import { NextFunction, Request, Response } from 'express';
import { randomUUID } from 'crypto';

declare module 'express-serve-static-core' {
  interface Request {
    requestId?: string;
  }
}

export const requestContext = (req: Request, _res: Response, next: NextFunction) => {
  req.requestId = req.headers['x-request-id']?.toString() ?? randomUUID();
  next();
};

