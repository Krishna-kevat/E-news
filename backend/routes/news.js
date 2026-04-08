const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const multer = require('multer');
const News = require('../models/News');
const auth = require('../middleware/auth');
const User = require('../models/User');
const path = require('path');

// Multer setup
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(__dirname, '..', 'uploads'));
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + '-' + file.originalname.replace(/\s+/g,'_'));
  }
});
const upload = multer({ storage });

// Get all news (public) - with search and filters
router.get('/', async (req, res) => {
  try {
    const { search, category, sort } = req.query;
    let query = {};

    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }

    if (category && category !== 'All') {
      query.category = category;
    }

    let newsQuery = News.find(query);

    if (sort === 'trending') {
      newsQuery = newsQuery.sort({ views: -1, createdAt: -1 });
    } else {
      newsQuery = newsQuery.sort({ createdAt: -1 });
    }

    const news = await newsQuery.exec();
    res.json(news);
  } catch (err) {
    console.error(err);
    res.status(500).send('Server error');
  }
});

// Get single news
router.get('/:id', async (req, res) => {
  try {
    const item = await News.findById(req.params.id);
    if (!item) return res.status(404).json({ msg: 'News not found' });
    
    // Increment views
    item.views = (item.views || 0) + 1;
    await item.save();
    
    res.json(item);
  } catch (err) {
    console.error(err);
    res.status(500).send('Server error');
  }
});

// Admin create news
router.post('/', [auth, upload.single('image'), body('title').isLength({ min: 3 }), body('description').isLength({ min: 10 }), body('category').notEmpty()], async (req, res) => {
  // only admin
  if (!req.user || req.user.role !== 'admin') return res.status(403).json({ msg: 'Admin only' });

  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

  try {
    const { title, description, category } = req.body;
    const imagePath = req.file ? '/uploads/' + req.file.filename : '';

    const author = { id: req.user.id, name: req.user.name, email: req.user.email };

    const news = new News({ title, description, category, image: imagePath, author });
    await news.save();
    res.json(news);
  } catch (err) {
    console.error(err);
    res.status(500).send('Server error');
  }
});

// Admin update news
router.put('/:id', [auth, upload.single('image')], async (req, res) => {
  if (!req.user || req.user.role !== 'admin') return res.status(403).json({ msg: 'Admin only' });

  try {
    const news = await News.findById(req.params.id);
    if (!news) return res.status(404).json({ msg: 'News not found' });

    const { title, description, category } = req.body;
    if (title) news.title = title;
    if (description) news.description = description;
    if (category) news.category = category;
    if (req.file) news.image = '/uploads/' + req.file.filename;

    await news.save();
    res.json(news);
  } catch (err) {
    console.error(err);
    res.status(500).send('Server error');
  }
});

// Admin delete
router.delete('/:id', auth, async (req, res) => {
  if (!req.user || req.user.role !== 'admin') return res.status(403).json({ msg: 'Admin only' });
  try {
    const news = await News.findById(req.params.id);
    if (!news) return res.status(404).json({ msg: 'News not found' });
    await News.deleteOne({ _id: req.params.id });
    res.json({ msg: 'News removed' });
  } catch (err) {
    console.error(err);
    res.status(500).send('Server error');
  }
});

// Like / unlike
router.post('/:id/like', auth, async (req, res) => {
  try {
    const news = await News.findById(req.params.id);
    if (!news) return res.status(404).json({ msg: 'News not found' });

    const userId = req.user.id;
    const already = news.likes.find(l => l.toString() === userId);
    if (already) {
      news.likes = news.likes.filter(l => l.toString() !== userId);
    } else {
      news.likes.push(userId);
    }
    await news.save();
    res.json({ likesCount: news.likes.length, liked: !already });
  } catch (err) {
    console.error(err);
    res.status(500).send('Server error');
  }
});

// Comment
router.post('/:id/comment', [auth, body('text').isLength({ min: 1 })], async (req, res) => {
  const errors = (require('express-validator').validationResult)(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

  try {
    const news = await News.findById(req.params.id);
    if (!news) return res.status(404).json({ msg: 'News not found' });

    const user = await User.findById(req.user.id);
    const comment = { userId: req.user.id, name: user.fullname, text: req.body.text };
    news.comments.push(comment);
    await news.save();
    res.json(news.comments);
  } catch (err) {
    console.error(err);
    res.status(500).send('Server error');
  }
});

module.exports = router;
