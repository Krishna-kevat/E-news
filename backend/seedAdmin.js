const User = require('./models/User');
const bcrypt = require('bcryptjs');

module.exports = async function seedAdmin() {
  try {
    const adminEmail = process.env.ADMIN_EMAIL;
    const adminPassword = process.env.ADMIN_PASSWORD;

    if (!adminEmail || !adminPassword) {
      console.warn('Skipping admin skip: ADMIN_EMAIL or ADMIN_PASSWORD not set.');
      return;
    }

    const existing = await User.findOne({ email: adminEmail });
    if (existing) {
      console.log('Admin already exists');
      return;
    }

    const salt = await bcrypt.genSalt(10);
    const hashed = await bcrypt.hash(adminPassword, salt);

    const admin = new User({
      fullname: 'Admin Krishna',
      email: adminEmail,
      password: hashed,
      username: 'krishna_admin',
      gender: 'male',
      cno: '0000000000',
      role: 'admin'
    });

    await admin.save();
    console.log('Admin user created:', adminEmail);
  } catch (err) {
    console.error('seedAdmin error', err);
    throw err;
  }
};
