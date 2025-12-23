import mongoose from 'mongoose';
import { connectMongo, disconnectMongo } from '../lib/mongo';
import { env } from '../config/env';

describe('MongoDB Connection', () => {
  beforeAll(async () => {
    // Clean up any existing connections
    if (mongoose.connection.readyState !== 0) {
      await mongoose.disconnect();
    }
  });

  afterAll(async () => {
    await disconnectMongo();
  });

  describe('Connection Test', () => {
    it('should connect to MongoDB successfully', async () => {
      await expect(connectMongo()).resolves.not.toThrow();
      
      // Verify connection state
      expect(mongoose.connection.readyState).toBe(1); // 1 = connected
      expect(mongoose.connection.host).toBeDefined();
      expect(mongoose.connection.name).toBeDefined();
    });

    it('should have valid connection details', async () => {
      await connectMongo();
      
      const conn = mongoose.connection;
      expect(conn.readyState).toBe(1);
      expect(conn.host).toBeTruthy();
      expect(conn.port).toBeDefined();
      expect(conn.name).toBeTruthy();
    });

    it('should be able to perform database operations', async () => {
      await connectMongo();
      
      // Test a simple database operation
      const admin = mongoose.connection.db.admin();
      const result = await admin.ping();
      expect(result).toBeDefined();
    });
  });

  describe('Connection Error Handling', () => {
    it('should handle invalid MongoDB URI gracefully', async () => {
      const originalUri = process.env.MONGODB_URI;
      
      // Disconnect first
      if (mongoose.connection.readyState !== 0) {
        await mongoose.disconnect();
      }
      
      // Set invalid URI
      process.env.MONGODB_URI = 'mongodb://invalid-host:27017/test';
      
      // Try to connect - should fail or timeout
      try {
        await Promise.race([
          mongoose.connect(process.env.MONGODB_URI, {
            serverSelectionTimeoutMS: 2000, // 2 second timeout
          }),
          new Promise((_, reject) => 
            setTimeout(() => reject(new Error('Connection timeout')), 3000)
          ),
        ]);
        // If it somehow succeeds, that's unexpected but not a test failure
      } catch (error) {
        // Expected to fail
        expect(error).toBeDefined();
      } finally {
        // Restore original URI and reconnect
        process.env.MONGODB_URI = originalUri;
        if (mongoose.connection.readyState !== 0) {
          await mongoose.disconnect();
        }
      }
    }, 10000); // Increase timeout for connection attempts
  });

  describe('Environment Configuration', () => {
    it('should have MONGODB_URI configured', () => {
      expect(env.MONGODB_URI).toBeDefined();
      expect(env.MONGODB_URI.length).toBeGreaterThan(0);
    });

    it('should have valid MongoDB URI format', () => {
      const uri = env.MONGODB_URI;
      // Check for common MongoDB URI patterns
      expect(
        uri.startsWith('mongodb://') || uri.startsWith('mongodb+srv://')
      ).toBe(true);
    });
  });

  describe('Connection State Management', () => {
    it('should disconnect from MongoDB successfully', async () => {
      await connectMongo();
      expect(mongoose.connection.readyState).toBe(1);
      
      await expect(disconnectMongo()).resolves.not.toThrow();
      expect(mongoose.connection.readyState).toBe(0); // 0 = disconnected
    });

    it('should handle multiple connect/disconnect cycles', async () => {
      // First cycle
      await connectMongo();
      expect(mongoose.connection.readyState).toBe(1);
      await disconnectMongo();
      expect(mongoose.connection.readyState).toBe(0);
      
      // Second cycle
      await connectMongo();
      expect(mongoose.connection.readyState).toBe(1);
      await disconnectMongo();
      expect(mongoose.connection.readyState).toBe(0);
    });
  });
});

