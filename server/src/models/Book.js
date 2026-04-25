import mongoose from 'mongoose';

const bookSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  author: {
    type: String,
    required: true,
    trim: true
  },
  genre: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true
  },
  coverUrl: {
    type: String
  },
  thumbnail: {
    type: String
  },
  pageCount: {
    type: Number
  },
  externalId: {
    type: String
  },
  source: {
    type: String,
    default: 'local'
  },
  isbn: {
    type: String,
    trim: true
  },
  publishedYear: {
    type: Number
  },
  averageRating: {
    type: Number,
    default: 0,
    min: 0,
    max: 5
  },
  totalReviews: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

// Create text index for search
bookSchema.index({ title: 'text', author: 'text', description: 'text' });

export default mongoose.model('Book', bookSchema);
