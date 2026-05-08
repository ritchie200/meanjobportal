const mongoose = require('mongoose');
const connectDB = require('../config/db');
const User = require('../models/User');

const [name, email, password] = process.argv.slice(2);

if (!name || !email || !password) {
  console.error('Usage: npm run create-admin -- "Admin Name" admin@example.com "strong-password"');
  process.exit(1);
}

connectDB()
  .then(async () => {
    const existing = await User.findOne({ email }).select('+password');

    if (existing) {
      existing.name = name;
      existing.password = password;
      existing.role = 'admin';
      existing.isActive = true;
      await existing.save();
      console.log(`Updated admin user: ${email}`);
    } else {
      await User.create({
        name,
        email,
        password,
        role: 'admin'
      });
      console.log(`Created admin user: ${email}`);
    }
  })
  .catch((error) => {
    console.error(error.message);
    process.exitCode = 1;
  })
  .finally(async () => {
    await mongoose.disconnect();
  });
