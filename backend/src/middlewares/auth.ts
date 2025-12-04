import { NextFunction, Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { env } from '../config/env';

declare module 'express-serve-static-core' {
  interface Request {
    user?: {
      id: string;
      role: 'admin' | 'staff';
      email: string;
    };
  }
}

interface TokenPayload {
  sub: string;
  role: 'admin' | 'staff';
  email: string;
  iat: number;
  exp: number;
}

export const authenticate = (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) return res.status(401).json({ message: 'Missing Authorization header' });
  const token = authHeader.split(' ')[1];
  if (!token) return res.status(401).json({ message: 'Invalid Authorization header' });
  try {
    const payload = jwt.verify(token, env.JWT_SECRET) as TokenPayload;
    req.user = {
      id: payload.sub,
      role: payload.role,
      email: payload.email,
    };
    next();
  } catch {
    return res.status(401).json({ message: 'Invalid token' });
  }
};

export const requireRole = (roles: Array<'admin' | 'staff'>) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) return res.status(401).json({ message: 'Unauthorized' });
    if (!roles.includes(req.user.role)) return res.status(403).json({ message: 'Forbidden' });
    next();
  };
};

