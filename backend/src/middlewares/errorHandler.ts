import { NextFunction, Request, Response } from 'express';
import { ZodError } from 'zod';
import { logger } from '../config/logger';

interface AppError extends Error {
  statusCode?: number;
  details?: unknown;
}

export const errorHandler = (err: AppError, req: Request, res: Response, _next: NextFunction) => {
  const status = err.statusCode ?? 500;
  const payload: Record<string, unknown> = {
    message: err.message ?? 'Internal server error',
    requestId: req.requestId,
  };

  if (err instanceof ZodError) {
    payload.errors = err.issues;
  } else if (err.details) {
    payload.details = err.details;
  }

  if (status >= 500) {
    logger.error(
      {
        err,
        requestId: req.requestId,
      },
      err.message,
    );
  } else {
    logger.warn(
      {
        err,
        requestId: req.requestId,
      },
      err.message,
    );
  }

  res.status(status).json(payload);
};

