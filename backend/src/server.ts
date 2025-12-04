import 'dotenv/config';
import http from 'http';
import { app } from './app';
import { env } from './config/env';
import { connectMongo, disconnectMongo } from './lib/mongo';
import { logger } from './config/logger';

const port = Number(env.PORT);
const server = http.createServer(app);

const start = async () => {
  try {
    await connectMongo();
    server.listen(port, () => {
      logger.info(`API listening on port ${port}`);
    });
  } catch (error) {
    logger.error(error, 'Failed to start server');
    process.exit(1);
  }
};

const shutdown = async (signal: string) => {
  logger.info({ signal }, 'Shutting down');
  server.close(async () => {
    await disconnectMongo();
    process.exit(0);
  });
};

['SIGINT', 'SIGTERM'].forEach((signal) => {
  process.on(signal, () => shutdown(signal));
});

start();

