process.env.NODE_ENV = 'test';
process.env.PORT = '4000';
process.env.MONGODB_URI = 'mongodb://localhost:27017/candles-test';
process.env.RAZORPAY_KEY_ID = 'rzp_test_key';
process.env.RAZORPAY_KEY_SECRET = 'testsecret';
process.env.RAZORPAY_WEBHOOK_SECRET = 'webhooksecret';
process.env.FRONTEND_URL = 'http://localhost:4173';
process.env.JWT_SECRET = 'testjwtsecret';
process.env.AWS_ACCESS_KEY_ID = 'test';
process.env.AWS_SECRET_ACCESS_KEY = 'test';
process.env.S3_BUCKET = 'candles-cuddles-test';
process.env.S3_REGION = 'ap-south-1';
process.env.ALLOWED_ORIGINS = 'http://localhost:4173';
// Email credentials (optional - tests will skip if not provided)
// process.env.EMAIL_USER = 'test@example.com';
// process.env.EMAIL_PASSWORD = 'testpassword';

