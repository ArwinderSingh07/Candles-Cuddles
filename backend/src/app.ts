import 'express-async-errors';
import express, { Request as ExpressRequest } from 'express';
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

const sentryDsn = env.SENTRY_DSN;
const sentryEnabled = Boolean(sentryDsn);

if (sentryDsn) {
  Sentry.init({
    dsn: sentryDsn,
    environment: env.NODE_ENV,
    tracesSampleRate: isProd ? 0.1 : 1,
    integrations: [Sentry.expressIntegration()],
  });
}

app.use(
  express.json({
    verify: (req, _res, buf) => {
      const request = req as ExpressRequest & { rawBody?: string };
      if (request.originalUrl?.startsWith('/api/v1/webhook/razorpay')) {
        request.rawBody = buf.toString();
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
  Sentry.setupExpressErrorHandler(app);
}
app.use(errorHandler);

export { app };

