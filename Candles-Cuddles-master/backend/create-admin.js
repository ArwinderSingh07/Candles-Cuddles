// Script to create the first admin user
// Run: node create-admin.js

const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const dotenv = require('dotenv');
const path = require('path');
const readline = require('readline');

// Load .env from project root
dotenv.config({ path: path.join(__dirname, '..', '.env') });

const AdminUserSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  passwordHash: { type: String, required: true },
  role: { type: String, enum: ['admin', 'staff'], default: 'admin' },
}, { timestamps: true });

const AdminUser = mongoose.models.AdminUser || mongoose.model('AdminUser', AdminUserSchema);

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

function question(prompt) {
  return new Promise((resolve) => {
    rl.question(prompt, resolve);
  });
}

async function createAdmin() {
  console.log('🔐 Admin User Creation Script\n');
  console.log('This script will create the first admin user.\n');

  try {
    // Connect to MongoDB
    const mongoUri = process.env.MONGODB_URI;
    if (!mongoUri) {
      console.error('❌ MONGODB_URI not found in .env file!');
      process.exit(1);
    }

    console.log('🔌 Connecting to MongoDB...');
    await mongoose.connect(mongoUri);
    console.log('✅ Connected to MongoDB\n');

    // Get admin details
    const email = await question('Enter admin email: ');
    if (!email || !email.includes('@')) {
      console.error('❌ Invalid email address');
      rl.close();
      await mongoose.disconnect();
      process.exit(1);
    }

    // Check if admin already exists
    const existing = await AdminUser.findOne({ email: email.toLowerCase() });
    if (existing) {
      console.log(`\n⚠️  Admin user with email ${email} already exists!`);
      const overwrite = await question('Do you want to update the password? (yes/no): ');
      if (overwrite.toLowerCase() !== 'yes') {
        console.log('Cancelled.');
        rl.close();
        await mongoose.disconnect();
        process.exit(0);
      }
    }

    const password = await question('Enter admin password (min 8 characters): ');
    if (!password || password.length < 8) {
      console.error('❌ Password must be at least 8 characters');
      rl.close();
      await mongoose.disconnect();
      process.exit(1);
    }

    const confirmPassword = await question('Confirm password: ');
    if (password !== confirmPassword) {
      console.error('❌ Passwords do not match');
      rl.close();
      await mongoose.disconnect();
      process.exit(1);
    }

    const roleChoice = await question('Role (admin/staff) [default: admin]: ');
    const role = roleChoice.toLowerCase() === 'staff' ? 'staff' : 'admin';

    // Hash password
    console.log('\n🔒 Hashing password...');
    const passwordHash = await bcrypt.hash(password, 10);

    // Create or update admin user
    if (existing) {
      existing.passwordHash = passwordHash;
      existing.role = role;
      await existing.save();
      console.log(`\n✅ Admin user updated successfully!`);
      console.log(`   Email: ${existing.email}`);
      console.log(`   Role: ${existing.role}`);
    } else {
      const admin = await AdminUser.create({
        email: email.toLowerCase(),
        passwordHash,
        role,
      });
      console.log(`\n✅ Admin user created successfully!`);
      console.log(`   ID: ${admin._id}`);
      console.log(`   Email: ${admin.email}`);
      console.log(`   Role: ${admin.role}`);
    }

    console.log('\n📝 Next steps:');
    console.log('   1. Use these credentials to log in at: POST /api/v1/admin/login');
    console.log('   2. You can now manage products and orders');
    console.log('   3. Create admin frontend to use this admin account\n');

  } catch (error) {
    console.error('\n❌ Error:', error.message);
    if (error.code === 11000) {
      console.error('   Admin user with this email already exists');
    }
    process.exit(1);
  } finally {
    rl.close();
    await mongoose.disconnect();
    console.log('👋 Disconnected from MongoDB');
  }
}

createAdmin();

