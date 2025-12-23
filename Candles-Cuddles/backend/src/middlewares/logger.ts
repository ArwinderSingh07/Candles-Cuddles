import pinoHttp from 'pino-http';
import { logger } from '../config/logger';

export const httpLogger = pinoHttp({
  logger,
  autoLogging: true,
  serializers: {
    req(req) {
      return {
        method: req.method,
        url: req.url,
        requestId: (req as any).requestId,
      };
    },
  },
});

