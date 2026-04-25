import express from 'express';
import { body, validationResult } from 'express-validator';
import Book from '../models/Book.js';
import Review from '../models/Review.js';
import auth from '../middleware/auth.js';
import { validateObjectId, sanitizeRequests } from '../middleware/validate.js';

const router = express.Router();
router.use(sanitizeRequests);

// Get all books with search and filter
router.get('/', async (req, res) => {
  try {
    const { search, genre, page = 1 } = req.query;
    const limit = Math.min(parseInt(req.query.limit) || 20, 100);
    let query = {};

    // Search functionality
    if (search) {
      query.$text = { $search: search };
    }

    // Genre filter
    if (genre) {
      query.genre = genre;
    }

    const books = await Book.find(query)
      .sort({ createdAt: -1 })
      .limit(limit)
      .skip((page - 1) * limit);

    const total = await Book.countDocuments(query);

    res.json({
      books,
      totalPages: Math.ceil(total / limit),
      currentPage: page
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get single book
router.get('/:id', validateObjectId('id'), async (req, res) => {
  try {
    const book = await Book.findById(req.params.id);
    if (!book) {
      return res.status(404).json({ message: 'Book not found' });
    }
    res.json(book);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get all genres
router.get('/meta/genres', async (req, res) => {
  try {
    const genres = await Book.distinct('genre');
    res.json(genres.sort());
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Add new book (protected)
router.post('/', auth, [
  body('title').trim().isLength({ min: 1 }).withMessage('Title is required'),
  body('author').trim().isLength({ min: 1 }).withMessage('Author is required'),
  body('genre').trim().isLength({ min: 1 }).withMessage('Genre is required'),
  body('description').trim().isLength({ min: 10 }).withMessage('Description must be at least 10 characters')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const allowedFields = {
      title: req.body.title,
      author: req.body.author,
      genre: req.body.genre,
      description: req.body.description,
      coverUrl: req.body.coverUrl,
      isbn: req.body.isbn,
      publishedYear: req.body.publishedYear
    };
    const book = new Book(allowedFields);
    await book.save();
    res.status(201).json(book);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update book rating (internal function called when reviews change)
export const updateBookRating = async (bookId) => {
  try {
    const reviews = await Review.find({ bookId });
    const totalReviews = reviews.length;
    const averageRating = totalReviews > 0 
      ? reviews.reduce((sum, review) => sum + review.rating, 0) / totalReviews
      : 0;

    await Book.findByIdAndUpdate(bookId, {
      averageRating: Math.round(averageRating * 10) / 10,
      totalReviews
    });
  } catch (error) {
    console.error('Error updating book rating:', error);
  }
};

export default router;
