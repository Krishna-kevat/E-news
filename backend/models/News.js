const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const CommentSchema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: 'User' },
  name: String,
  text: String,
  date: { type: Date, default: Date.now }
});

const NewsSchema = new Schema({
  title: { type: String, required: true },
  image: { type: String }, // path to /uploads/...
  description: { type: String, required: true },
  category: { type: String, required: true },
  author: {
    id: { type: Schema.Types.ObjectId, ref: 'User' },
    name: String,
    email: String
  },
  likes: [{ type: Schema.Types.ObjectId, ref: 'User' }],
  comments: [CommentSchema],
  views: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('News', NewsSchema);
