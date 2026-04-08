const express = require('express');
const path = require('path');
const cors = require('cors');
const helmet = require('helmet');
const mongoose = require('mongoose');
const seedAdmin = require('./seedAdmin');

// Security Check: Ensure sensitive variables are defined
const MONGO_URI = process.env.MONGO_URI;
const JWT_SECRET = process.env.JWT_SECRET;
const PORT = process.env.PORT || 5000;

if (!MONGO_URI || !JWT_SECRET) {
  console.error('FATAL ERROR: MONGO_URI or JWT_SECRET is not defined in environment variables.');
  process.exit(1);
}

const app = express();

// Security Middleware
app.use(helmet());
app.use(cors()); // In production, add a specific whitelist
app.use(express.json());

// static folder for uploaded images
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// make JWT_SECRET available via app.locals
app.locals.JWT_SECRET = JWT_SECRET;

// connect db
mongoose.connect(MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => {
    console.log('MongoDB connected:', MONGO_URI);
    // create uploads folder if not exists
    const uploadDir = path.join(__dirname, 'uploads');
    const fs = require('fs');
    if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir);
    // seed admin account
    seedAdmin().then(() => {
      console.log('Seed complete (admin).');
    }).catch(err => console.error('Seed admin error:', err));
  })
  .catch(err => {
    console.error('MongoDB connection error:', err.message);
  });

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/news', require('./routes/news'));
app.use('/api/admin', require('./routes/admin'));

// simple root
app.get('/', (req, res) => {
  res.send('ENEWS API is running.');
});

app.listen(PORT, () => {
  console.log(`Server started on port ${PORT}`);
});
