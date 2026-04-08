const jwt = require('jsonwebtoken');
const User = require('../models/User');

module.exports = async function(req, res, next) {
  const token = req.header('Authorization') ? req.header('Authorization').split(' ')[1] : null;
  if (!token) return res.status(401).json({ msg: 'No token, authorization denied' });

  try {
    const secret = req.app.locals.JWT_SECRET || 'enews_jwt_secret';
    const decoded = jwt.verify(token, secret);
    
    // Check if user exists and is not blocked
    const user = await User.findById(decoded.id);
    if (!user) return res.status(401).json({ msg: 'User no longer exists' });
    if (user.isBlocked) return res.status(403).json({ msg: 'Your account has been suspended' });

    req.user = decoded;
    next();
  } catch (err) {
    res.status(401).json({ msg: 'Token is not valid' });
  }
};
