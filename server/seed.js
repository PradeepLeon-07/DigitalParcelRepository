require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');

const seed = async () => {
  await mongoose.connect(process.env.MONGO_URI);

  // Remove any existing admin so re-running always works
  await User.deleteMany({ role: 'admin' });

  const adminEmail = process.env.ADMIN_EMAIL;
  const adminPassword = process.env.ADMIN_PASSWORD;

  const admin = await User.create({
    name: 'Admin',
    rollNumber: 'ADMIN001',
    email: adminEmail,
    password: adminPassword,
    role: 'admin',
  });

  console.log('Admin created successfully');
  console.log('Email   :', admin.email);
  console.log('Password:', adminPassword);
  process.exit(0);
};

seed().catch((err) => { console.error(err); process.exit(1); });
