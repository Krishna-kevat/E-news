const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const UserSchema = new Schema({
  fullname: { type: String, required: true },
  email:    { type: String, required: true, unique: true },
  password: { type: String, required: true },
  username: { type: String, required: true, unique: true },
  gender:   { type: String, enum: ['male','female','other'], required: true },
  cno:      { type: String, required: true },
  role:     { type: String, enum: ['user','admin'], default: 'user' },
  isBlocked:{ type: Boolean, default: false },
  savedArticles: [{ type: Schema.Types.ObjectId, ref: 'News' }],
  createdAt:{ type: Date, default: Date.now }
});

module.exports = mongoose.model('User', UserSchema);
