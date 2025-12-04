import mongoose from 'mongoose';
import { env } from '../config/env';
import { logger } from '../config/logger';

export const connectMongo = async () => {
  await mongoose.connect(env.MONGODB_URI);
  logger.info('Connected to MongoDB');
};

export const disconnectMongo = async () => {
  await mongoose.disconnect();
  logger.info('Disconnected from MongoDB');
};

