import express from 'express';
import { body, validationResult } from 'express-validator';
import Book from '../models/Book.js';
import Review from '../models/Review.js';
import auth from '../middleware/auth.js';

const router = express.Router();

// Get top overall books
router.get('/top', async (req, res) => {
  try {
    const books = await Book.find()
      .sort({ averageRating: -1, totalReviews: -1 })
      .limit(10);
    res.json(books);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get recent books
router.get('/recent', async (req, res) => {
  try {
    const books = await Book.find()
      .sort({ createdAt: -1 })
      .limit(10);
    res.json(books);
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

// Get all books with search and filter
router.get('/', async (req, res) => {
  try {
    const { search, genre, page = 1, limit = 20 } = req.query;
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
      .limit(limit * 1)
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
router.get('/:id', async (req, res) => {
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

    const book = new Book(req.body);
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
