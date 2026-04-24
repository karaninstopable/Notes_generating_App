const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const User = require('./models/User');

const seed = async () => {
  await mongoose.connect(process.env.MONGO_URI);

  const existing = await User.findOne({ email: 'Notesadmin@example.com' });
  if (existing) {
    console.log('Admin already exists');
    process.exit();
  }

  await User.create({
    name: 'Note_Admin',
    email: 'Notesadmin@example.com',
    password: 'admin123',
    role: 'admin'
  });

  console.log(' Admin created: Notesadmin@example.com / admin123 !!');
  process.exit();
};

seed();