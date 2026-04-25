import express from 'express';
import { body, validationResult } from 'express-validator';
import User from '../models/User.js';
import auth from '../middleware/auth.js';

const router = express.Router();

// Get user profile
router.get('/profile/:userId?', auth, async (req, res) => {
  try {
    const userId = req.params.userId || req.user._id;
    const user = await User.findById(userId).select('-password');
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const profileResponse = {
      id: user._id,
      name: user.name,
      displayName: user.displayName,
      bio: user.bio,
      favoriteGenres: user.favoriteGenres,
      totalReviews: user.totalReviews
    };

    // Only include email if user is requesting their own profile
    if (req.user._id.toString() === userId.toString()) {
      profileResponse.email = user.email;
    }

    res.json(profileResponse);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update user profile
router.put('/profile', auth, [
  body('displayName').optional().trim().isLength({ min: 2 }).withMessage('Display name must be at least 2 characters'),
  body('bio').optional().isLength({ max: 500 }).withMessage('Bio must be less than 500 characters'),
  body('favoriteGenres').optional().isArray().withMessage('Favorite genres must be an array')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { displayName, bio, favoriteGenres } = req.body;
    
    const user = await User.findByIdAndUpdate(
      req.user._id,
      { displayName, bio, favoriteGenres },
      { new: true }
    ).select('-password');

    res.json({
      id: user._id,
      name: user.name,
      email: user.email,
      displayName: user.displayName,
      bio: user.bio,
      favoriteGenres: user.favoriteGenres,
      totalReviews: user.totalReviews
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;
