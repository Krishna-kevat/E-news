const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const auth = require('../middleware/auth');

// Register
router.post('/register', [
  body('fullname').isLength({ min: 3 }).withMessage('Full name must be at least 3 characters'),
  body('email').isEmail().withMessage('Please provide a valid email address'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  body('username').isLength({ min: 3 }).withMessage('Username must be at least 3 characters'),
  body('gender').isIn(['male','female','other']).withMessage('Select a valid gender'),
  body('cno').isMobilePhone().withMessage('Provide a valid contact number')
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

  const { fullname, email, password, username, gender, cno } = req.body;
  try {
    let user = await User.findOne({ email });
    if (user) return res.status(400).json({ msg: 'User with this email already exists' });
    let user2 = await User.findOne({ username });
    if (user2) return res.status(400).json({ msg: 'Username already taken' });

    const salt = await bcrypt.genSalt(10);
    const hashed = await bcrypt.hash(password, salt);

    user = new User({ fullname, email, password: hashed, username, gender, cno });
    await user.save();

    const payload = { id: user._id, role: user.role, email: user.email, name: user.fullname };
    const token = jwt.sign(payload, req.app.locals.JWT_SECRET || 'enews_jwt_secret', { expiresIn: '7d' });

    res.json({ token, user: { id: user._id, fullname: user.fullname, email: user.email, username: user.username, role: user.role, cno: user.cno, gender: user.gender } });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// Login
router.post('/login', [
  body('email').isEmail().withMessage('Enter a valid email'),
  body('password').exists().withMessage('Password is required')
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ msg: 'Invalid credentials' });

    if (user.isBlocked) return res.status(403).json({ msg: 'Your account has been suspended. Please contact support.' });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ msg: 'Invalid credentials' });

    const payload = { id: user._id, role: user.role, email: user.email, name: user.fullname };
    const token = jwt.sign(payload, req.app.locals.JWT_SECRET || 'enews_jwt_secret', { expiresIn: '7d' });

    res.json({ token, user: { id: user._id, fullname: user.fullname, email: user.email, username: user.username, role: user.role, cno: user.cno, gender: user.gender } });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// Get profile
router.get('/profile', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    res.json(user);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// Update profile
router.put('/profile', auth, [
  body('fullname').isLength({ min: 3 }).withMessage('Full name must be at least 3 characters'),
  body('email').isEmail().withMessage('Please provide a valid email address'),
  body('cno').isMobilePhone().withMessage('Provide a valid contact number')
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

  const { fullname, email, cno } = req.body;
  try {
    let user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ msg: 'User not found' });

    // Check if email is already taken by another user
    if (email !== user.email) {
      const emailExists = await User.findOne({ email });
      if (emailExists) return res.status(400).json({ msg: 'Email already in use' });
    }

    user.fullname = fullname;
    user.email = email;
    user.cno = cno;

    await user.save();
    res.json({ id: user._id, fullname: user.fullname, email: user.email, username: user.username, role: user.role, cno: user.cno, gender: user.gender });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// Save / Unsave Article
router.post('/save/:id', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ msg: 'User not found' });

    const articleId = req.params.id;
    const isSaved = user.savedArticles.includes(articleId);

    if (isSaved) {
      user.savedArticles = user.savedArticles.filter(id => id.toString() !== articleId);
    } else {
      user.savedArticles.push(articleId);
    }

    await user.save();
    res.json({ saved: !isSaved, count: user.savedArticles.length });
  } catch (err) {
    console.error(err);
    res.status(500).send('Server error');
  }
});

// Get Saved Articles
router.get('/saved', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).populate('savedArticles');
    if (!user) return res.status(404).json({ msg: 'User not found' });
    res.json(user.savedArticles);
  } catch (err) {
    console.error(err);
    res.status(500).send('Server error');
  }
});

module.exports = router;
