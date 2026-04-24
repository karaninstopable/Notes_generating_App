const mongoose = require('mongoose');
require('dotenv').config();

const User = require('./models/User');

const seed = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to MongoDB');

    const existing = await User.findOne({ email: 'admin@example.com' });
    if (existing) {
      console.log('⚠️  Admin already exists — login with admin@example.com / admin123');
      process.exit(0);
    }

    await User.create({
      name: 'Admin',
      email: 'admin@example.com',
      password: 'admin123',
      role: 'admin',
    });

    console.log('✅ Admin created successfully!');
    console.log('📧 Email:    admin@example.com');
    console.log('🔑 Password: admin123');
    console.log('⚠️  Change the password after first login!');
    process.exit(0);
  } catch (err) {
    console.error('❌ Seed failed:', err.message);
    process.exit(1);
  }
};

seed();