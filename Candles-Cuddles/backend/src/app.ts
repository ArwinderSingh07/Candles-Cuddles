import 'express-async-errors';
import express from 'express';
import helmet from 'helmet';
import compression from 'compression';
import cors from 'cors';
import * as Sentry from '@sentry/node';
import { env, isProd } from './config/env';
import { requestContext } from './middlewares/requestContext';
import { httpLogger } from './middlewares/logger';
import { createRateLimiter } from './middlewares/rateLimiter';
import { routes } from './routes';
import { errorHandler } from './middlewares/errorHandler';

const app = express();

const sentryEnabled = Boolean(env.SENTRY_DSN);

if (sentryEnabled) {
  Sentry.init({
    dsn: env.SENTRY_DSN,
    environment: env.NODE_ENV,
    tracesSampleRate: isProd ? 0.1 : 1,
  });
  app.use(Sentry.Handlers.requestHandler());
}

app.use(
  express.json({
    verify: (req, _res, buf) => {
      if (req.originalUrl.startsWith('/api/v1/webhook/razorpay')) {
        (req as any).rawBody = buf.toString();
      }
    },
  }),
);
app.use(express.urlencoded({ extended: true }));
app.use(helmet());
app.use(
  cors({
    origin: env.ALLOWED_ORIGINS ? env.ALLOWED_ORIGINS.split(',') : env.FRONTEND_URL,
    credentials: true,
  }),
);
app.use(compression());
app.use(requestContext);
app.use(httpLogger);
app.use(createRateLimiter());

app.use('/api/v1', routes);

if (sentryEnabled) {
  app.use(Sentry.Handlers.errorHandler());
}
app.use(errorHandler);

export { app };

