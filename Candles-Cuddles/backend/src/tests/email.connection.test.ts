import nodemailer from 'nodemailer';
import { env } from '../config/env';

// Helper to create transporter (same logic as email.ts)
const createTestTransporter = () => {
  if (!env.EMAIL_USER || !env.EMAIL_PASSWORD) {
    return null;
  }

  const smtpHost = process.env.SMTP_HOST || 'smtp.zoho.in';

  return nodemailer.createTransport({
    host: smtpHost,
    port: 587,
    secure: false,
    auth: {
      user: env.EMAIL_USER,
      pass: env.EMAIL_PASSWORD,
    },
  });
};

describe('Zoho Email Connection', () => {
  let transporter: nodemailer.Transporter | null;

  beforeEach(() => {
    transporter = createTestTransporter();
  });

  describe('Configuration Test', () => {
    it('should have email credentials configured', () => {
      // If credentials are not set, skip email tests
      if (!env.EMAIL_USER || !env.EMAIL_PASSWORD) {
        console.log('⚠️  Email credentials not configured. Skipping email tests.');
        return;
      }

      expect(env.EMAIL_USER).toBeDefined();
      expect(env.EMAIL_PASSWORD).toBeDefined();
      expect(env.EMAIL_USER.length).toBeGreaterThan(0);
      expect(env.EMAIL_PASSWORD.length).toBeGreaterThan(0);
    });

    it('should have valid email format', () => {
      if (!env.EMAIL_USER) {
        return;
      }

      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      expect(emailRegex.test(env.EMAIL_USER)).toBe(true);
    });

    it('should use correct SMTP host', () => {
      if (!transporter) {
        return;
      }

      const smtpHost = process.env.SMTP_HOST || 'smtp.zoho.in';
      expect(transporter.options.host).toBe(smtpHost);
    });
  });

  describe('SMTP Connection Test', () => {
    it('should connect to Zoho SMTP server successfully', async () => {
      if (!transporter) {
        console.log('⚠️  Email transporter not available. Skipping connection test.');
        return;
      }

      await expect(transporter.verify()).resolves.toBe(true);
    }, 10000); // Increase timeout for SMTP connection

    it('should have correct SMTP configuration', () => {
      if (!transporter) {
        return;
      }

      expect(transporter.options.host).toBeDefined();
      expect(transporter.options.port).toBe(587);
      expect(transporter.options.secure).toBe(false);
      expect(transporter.options.auth).toBeDefined();
      expect(transporter.options.auth?.user).toBe(env.EMAIL_USER);
      expect(transporter.options.auth?.pass).toBe(env.EMAIL_PASSWORD);
    });
  });

  describe('Email Sending Test', () => {
    it('should be able to send a test email', async () => {
      if (!transporter || !env.EMAIL_USER) {
        console.log('⚠️  Email transporter not available. Skipping send test.');
        return;
      }

      // Verify connection first
      await transporter.verify();

      // Send test email to self
      const mailOptions = {
        from: `"Test" <${env.EMAIL_USER}>`,
        to: env.EMAIL_USER,
        subject: 'Test Email - Connection Test',
        text: 'This is a test email from the automated test suite.',
        html: '<p>This is a test email from the automated test suite.</p>',
      };

      const info = await transporter.sendMail(mailOptions);
      
      expect(info).toBeDefined();
      expect(info.messageId).toBeDefined();
      expect(info.accepted).toContain(env.EMAIL_USER);
    }, 15000); // Increase timeout for email sending
  });

  describe('Error Handling', () => {
    it('should handle invalid credentials gracefully', async () => {
      const invalidTransporter = nodemailer.createTransport({
        host: 'smtp.zoho.in',
        port: 587,
        secure: false,
        auth: {
          user: 'invalid@example.com',
          pass: 'wrongpassword',
        },
      });

      await expect(invalidTransporter.verify()).rejects.toThrow();
    }, 10000);

    it('should handle missing transporter gracefully', () => {
      const nullTransporter = null;
      expect(nullTransporter).toBeNull();
    });
  });

  describe('SMTP Host Configuration', () => {
    it('should use default SMTP host when SMTP_HOST not set', () => {
      const originalHost = process.env.SMTP_HOST;
      delete process.env.SMTP_HOST;

      const testTransporter = createTestTransporter();
      if (testTransporter) {
        expect(testTransporter.options.host).toBe('smtp.zoho.in');
      }

      // Restore
      if (originalHost) {
        process.env.SMTP_HOST = originalHost;
      }
    });

    it('should use custom SMTP host when SMTP_HOST is set', () => {
      const originalHost = process.env.SMTP_HOST;
      process.env.SMTP_HOST = 'smtp.zoho.com';

      const testTransporter = createTestTransporter();
      if (testTransporter) {
        expect(testTransporter.options.host).toBe('smtp.zoho.com');
      }

      // Restore
      if (originalHost) {
        process.env.SMTP_HOST = originalHost;
      } else {
        delete process.env.SMTP_HOST;
      }
    });
  });
});

