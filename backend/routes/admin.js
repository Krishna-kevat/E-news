const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const User = require('../models/User');
const News = require('../models/News');

// Get all registered users (admin only)
router.get('/users', auth, async (req, res) => {
  if (!req.user || req.user.role !== 'admin') return res.status(403).json({ msg: 'Admin only' });
  try {
    const users = await User.find().select('-password').sort({ createdAt: -1 });
    // For each user, you might want to include their number of likes/comments; we will include direct info from News
    const data = await Promise.all(users.map(async u => {
      const liked = await News.countDocuments({ likes: u._id });
      const commented = await News.countDocuments({ 'comments.userId': u._id });
      return { user: u, likedCount: liked, commentedCount: commented };
    }));
    res.json(data);
  } catch (err) {
    console.error('Analytics Fetch Error:', err);
    res.status(500).json({ msg: 'Server error fetching user engagement data' });
  }
});

// Toggle Block/Unblock user (admin only)
router.patch('/users/:id/toggle-block', auth, async (req, res) => {
  if (!req.user || req.user.role !== 'admin') return res.status(403).json({ msg: 'Admin only' });
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ msg: 'User not found' });
    if (user.role === 'admin') return res.status(400).json({ msg: 'Cannot block An Administrator' });
    
    user.isBlocked = !user.isBlocked;
    await user.save();
    res.json({ msg: `User ${user.isBlocked ? 'blocked' : 'unblocked'} successfully`, isBlocked: user.isBlocked });
  } catch (err) {
    console.error('Toggle Block Error:', err);
    res.status(500).json({ msg: 'Server error updating user status' });
  }
});

// Get Analytics (admin only)
router.get('/analytics', auth, async (req, res) => {
  if (!req.user || req.user.role !== 'admin') return res.status(403).json({ msg: 'Admin only' });
  try {
    const totalUsers = await User.countDocuments();
    const articles = await News.find({}, { views: 1, category: 1 });
    const totalArticles = articles.length;

    // Manual summation for maximum robustness
    let totalViews = 0;
    let categories = {};

    articles.forEach(art => {
      totalViews += (art.views || 0);
      if (art.category) {
        categories[art.category] = (categories[art.category] || 0) + 1;
      }
    });

    let mostPopularCategory = 'N/A';
    let maxCount = -1;
    for (const cat in categories) {
      if (categories[cat] > maxCount) {
        maxCount = categories[cat];
        mostPopularCategory = cat;
      }
    }

    res.json({
      totalUsers,
      totalArticles,
      totalViews,
      mostPopularCategory
    });
  } catch (err) {
    console.error('Stats Calc Error:', err);
    res.status(500).json({ msg: 'Server error calculating platform analytics: ' + err.message });
  }
});

// Get all comments for moderation (admin only)
router.get('/comments', auth, async (req, res) => {
  if (!req.user || req.user.role !== 'admin') return res.status(403).json({ msg: 'Admin only' });
  try {
    const newsItems = await News.find({}, { title: 1, comments: 1 }).lean();
    let allComments = [];
    newsItems.forEach(item => {
      if (item.comments && item.comments.length > 0) {
        item.comments.forEach(c => {
          allComments.push({
            ...c,
            newsId: item._id,
            newsTitle: item.title
          });
        });
      }
    });
    // Sort by date descending
    allComments.sort((a, b) => new Date(b.date) - new Date(a.date));
    res.json(allComments);
  } catch (err) {
    console.error('Comments Fetch Error:', err);
    res.status(500).json({ msg: 'Server error syncing comments' });
  }
});

// Delete a comment (admin only)
router.delete('/comments/:newsId/:commentId', auth, async (req, res) => {
  if (!req.user || req.user.role !== 'admin') return res.status(403).json({ msg: 'Admin only' });
  try {
    const { newsId, commentId } = req.params;
    const news = await News.findById(newsId);
    if (!news) return res.status(404).json({ msg: 'News not found' });

    news.comments = news.comments.filter(c => c._id.toString() !== commentId);
    await news.save();
    res.json({ msg: 'Comment deleted successfully' });
  } catch (err) {
    console.error('Comment Delete Error:', err);
    res.status(500).json({ msg: 'Server error deleting comment' });
  }
});

// Get Saved Insights (admin only)
router.get('/saved-insights', auth, async (req, res) => {
  if (!req.user || req.user.role !== 'admin') return res.status(403).json({ msg: 'Admin only' });
  try {
    const users = await User.find({}, { savedArticles: 1 });
    const counts = {};
    users.forEach(u => {
      if (u.savedArticles && u.savedArticles.length > 0) {
        u.savedArticles.forEach(id => {
          counts[id] = (counts[id] || 0) + 1;
        });
      }
    });

    const newsIds = Object.keys(counts);
    const newsItems = await News.find({ _id: { $in: newsIds } }, { title: 1, category: 1, views: 1 }).lean();

    const data = newsItems.map(item => ({
      _id: item._id,
      title: item.title,
      category: item.category,
      views: (item.views || 0),
      saveCount: counts[item._id]
    }));

    // Sort by save count descending
    data.sort((a, b) => b.saveCount - a.saveCount);

    res.json(data);
  } catch (err) {
    console.error('Saved Insights Error:', err);
    res.status(500).json({ msg: 'Server error calculating saved insights' });
  }
});

module.exports = router;
