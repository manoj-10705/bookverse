import React, { useState } from 'react';
import axios from 'axios';
import StarRating from './StarRating';

interface ReviewFormProps {
  bookId: string;
  onReviewAdded: () => void;
}

const ReviewForm: React.FC<ReviewFormProps> = ({ bookId, onReviewAdded }) => {
  const [rating, setRating] = useState(0);
  const [reviewText, setReviewText] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (rating === 0) {
      setError('Please select a rating');
      return;
    }

    setError('');
    setLoading(true);

    try {
      await axios.post('/api/reviews', {
        bookId,
        rating,
        reviewText: reviewText.trim() || undefined
      });

      onReviewAdded();
      setRating(0);
      setReviewText('');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to submit review');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-900 text-red-700 dark:text-red-400 px-4 py-3 rounded-xl">
          {error}
        </div>
      )}

      <div>
        <p className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Your Rating
        </p>
        <StarRating 
          rating={rating} 
          onRatingChange={setRating} 
          size="lg" 
        />
      </div>

      <div>
        <label htmlFor="reviewText" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Your Review
        </label>
        <textarea
          id="reviewText"
          value={reviewText}
          onChange={(e) => setReviewText(e.target.value)}
          rows={4}
          maxLength={2000}
          className="w-full px-4 py-3 border border-gray-300 dark:border-dark-border rounded-xl focus:ring-2 focus:ring-accent-primary focus:border-transparent dark:bg-dark-bg dark:text-white transition-all resize-none"
          placeholder="Share your thoughts about this book..."
        />
        <p className="text-xs text-gray-400 mt-1 text-right">{reviewText.length}/2000</p>
      </div>

      <div className="flex justify-end">
        <button
          type="submit"
          disabled={loading || rating === 0}
          className="px-6 py-2 bg-gradient-to-r from-accent-primary to-accent-secondary text-white rounded-lg hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-all premium-shadow font-medium"
        >
          {loading ? 'Submitting...' : 'Submit Review'}
        </button>
      </div>
    </form>
  );
};

export default ReviewForm;
