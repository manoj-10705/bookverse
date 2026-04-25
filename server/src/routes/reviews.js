import express from 'express';
import { body, validationResult } from 'express-validator';
import Review from '../models/Review.js';
import Book from '../models/Book.js';
import User from '../models/User.js';
import auth from '../middleware/auth.js';
import { updateBookRating } from './books.js';
import { validateObjectId } from '../middleware/validate.js';

const router = express.Router();

// Get reviews for a book
router.get('/book/:bookId', validateObjectId('bookId'), async (req, res) => {
  try {
    const reviews = await Review.find({ bookId: req.params.bookId })
      .populate('userId', 'name displayName')
      .sort({ createdAt: -1 });

    const reviewsWithUserInfo = reviews.map(review => ({
      ...review.toObject(),
      userName: review.userId.displayName || review.userId.name
    }));

    res.json(reviewsWithUserInfo);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get reviews by user
router.get('/user/:userId?', auth, async (req, res) => {
  try {
    const userId = req.params.userId || req.user._id;
    
    const reviews = await Review.find({ userId })
      .populate('bookId', 'title author')
      .sort({ createdAt: -1 });

    const reviewsWithBookInfo = reviews.map(review => ({
      ...review.toObject(),
      bookTitle: review.bookId.title,
      bookAuthor: review.bookId.author
    }));

    res.json(reviewsWithBookInfo);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get user's review for a specific book
router.get('/book/:bookId/user', auth, validateObjectId('bookId'), async (req, res) => {
  try {
    const review = await Review.findOne({
      bookId: req.params.bookId,
      userId: req.user._id
    });

    res.json(review);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Add or update review
router.post('/', auth, [
  body('bookId').isMongoId().withMessage('Valid book ID is required'),
  body('rating').isInt({ min: 1, max: 5 }).withMessage('Rating must be between 1 and 5'),
  body('reviewText').optional().isLength({ max: 2000 }).withMessage('Review text must be less than 2000 characters')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { bookId, rating, reviewText } = req.body;

    // Check if book exists
    const book = await Book.findById(bookId);
    if (!book) {
      return res.status(404).json({ message: 'Book not found' });
    }

    // Check if user already has a review for this book
    let review = await Review.findOne({ bookId, userId: req.user._id });

    if (review) {
      // Update existing review
      review.rating = rating;
      review.reviewText = reviewText;
      review.isEdited = true;
      await review.save();
    } else {
      // Create new review
      review = new Review({
        bookId,
        userId: req.user._id,
        rating,
        reviewText
      });
      await review.save();

      // Update user's total reviews count
      await User.findByIdAndUpdate(req.user._id, {
        $inc: { totalReviews: 1 }
      });
    }

    // Update book's average rating
    await updateBookRating(bookId);

    res.json(review);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete review
router.delete('/:reviewId', auth, validateObjectId('reviewId'), async (req, res) => {
  try {
    const review = await Review.findById(req.params.reviewId);
    
    if (!review) {
      return res.status(404).json({ message: 'Review not found' });
    }

    if (review.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to delete this review' });
    }

    const bookId = review.bookId;
    await Review.findByIdAndDelete(req.params.reviewId);

    // Update user's total reviews count
    await User.findByIdAndUpdate(req.user._id, {
      $inc: { totalReviews: -1 }
    });

    // Update book's average rating
    await updateBookRating(bookId);

    res.json({ message: 'Review deleted successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;
