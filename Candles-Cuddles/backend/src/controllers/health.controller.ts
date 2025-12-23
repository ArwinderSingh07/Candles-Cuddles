import { Request, Response } from 'express';
import mongoose from 'mongoose';

export const liveness = (_req: Request, res: Response) => {
  res.json({ status: 'ok', uptime: process.uptime() });
};

export const readiness = (_req: Request, res: Response) => {
  const dbReady = mongoose.connection.readyState === 1;
  res.status(dbReady ? 200 : 503).json({ status: dbReady ? 'ready' : 'not-ready' });
};

