import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import StarRating from '../components/StarRating';
import ReviewForm from '../components/ReviewForm';
import { useAuth } from '../contexts/AuthContext';

interface Book {
  _id: string;
  title: string;
  author: string;
  genre: string;
  description: string;
  coverUrl?: string;
  isbn?: string;
  publishedYear?: number;
  pageCount?: number;
  averageRating: number;
  totalReviews: number;
}

interface Review {
  _id: string;
  userId: {
    _id: string;
    name: string;
    displayName?: string;
  };
  rating: number;
  reviewText?: string;
  createdAt: string;
}

const BookDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [book, setBook] = useState<Book | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (id) {
      fetchBookDetails();
      fetchReviews();
    }
  }, [id]);

  const fetchBookDetails = async () => {
    try {
      const response = await axios.get(`/api/books/${id}`);
      setBook(response.data);
    } catch (err) {
      setError('Failed to load book details');
    }
  };

  const fetchReviews = async () => {
    try {
      const response = await axios.get(`/api/reviews/book/${id}`);
      setReviews(response.data);
    } catch (err) {
      console.error('Failed to load reviews:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleReviewAdded = () => {
    fetchBookDetails();
    fetchReviews();
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error || !book) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-semibold text-gray-900 mb-4">Book Not Found</h2>
        <p className="text-gray-600 mb-6">{error || 'The book you are looking for does not exist.'}</p>
        <button onClick={() => navigate('/')} className="text-blue-600 hover:text-blue-700">
          ← Back to Books
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto animate-fade-in pb-12">
      <button
        onClick={() => navigate('/')}
        className="mb-6 flex items-center text-gray-600 hover:text-accent-primary dark:text-gray-400 dark:hover:text-accent-primary transition-colors"
      >
        <span className="mr-2">&larr;</span> Back to Books
      </button>

      <div className="bg-white dark:bg-dark-surface rounded-3xl premium-shadow overflow-hidden mb-8 border border-transparent dark:border-dark-border">
        <div className="md:flex">
          <div className="md:w-1/3 bg-gray-50 dark:bg-dark-bg p-8 flex justify-center items-center">
            {book.coverUrl ? (
              <img
                src={book.coverUrl}
                alt={book.title}
                className="w-full max-w-[240px] rounded-xl shadow-2xl premium-shadow"
              />
            ) : (
              <div className="w-full max-w-[240px] aspect-[2/3] bg-gray-200 dark:bg-gray-800 rounded-xl flex items-center justify-center text-gray-400">
                <span className="text-6xl">📖</span>
              </div>
            )}
          </div>
          
          <div className="md:w-2/3 p-8">
            <div className="flex justify-between items-start">
              <div>
                <h1 className="text-3xl font-display font-bold text-gray-900 dark:text-white mb-2">
                  {book.title}
                </h1>
                <p className="text-xl text-gray-600 dark:text-gray-300 mb-4 font-medium">
                  {book.author}
                </p>
              </div>
              <span className="bg-accent-primary/10 text-accent-primary dark:bg-accent-primary/20 dark:text-accent-glow px-3 py-1 rounded-full text-sm font-medium uppercase tracking-wider">
                {book.genre}
              </span>
            </div>

            <div className="flex items-center space-x-4 mb-6">
              <div className="flex items-center">
                <span className="text-2xl text-amber-400 mr-2 drop-shadow-[0_0_2px_rgba(251,191,36,0.8)]">★</span>
                <span className="text-xl font-bold text-gray-900 dark:text-white">
                  {book.averageRating.toFixed(1)}
                </span>
                <span className="text-sm text-gray-500 dark:text-gray-400 ml-2">
                  ({book.totalReviews} reviews)
                </span>
              </div>
            </div>

            <div className="prose prose-blue dark:prose-invert max-w-none">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2 font-display">Synopsis</h3>
              <p className="text-gray-600 dark:text-gray-300 leading-relaxed whitespace-pre-line">
                {book.description}
              </p>
            </div>

            <div className="mt-8 grid grid-cols-2 gap-4 border-t border-gray-100 dark:border-dark-border pt-6">
              {book.isbn && (
                <div>
                  <h4 className="text-xs text-gray-500 dark:text-gray-400 uppercase font-semibold">ISBN</h4>
                  <p className="text-gray-900 dark:text-white font-medium">{book.isbn}</p>
                </div>
              )}
              {book.publishedYear && (
                <div>
                  <h4 className="text-xs text-gray-500 dark:text-gray-400 uppercase font-semibold">Published</h4>
                  <p className="text-gray-900 dark:text-white font-medium">{book.publishedYear}</p>
                </div>
              )}
              {book.pageCount && (
                <div>
                  <h4 className="text-xs text-gray-500 dark:text-gray-400 uppercase font-semibold">Pages</h4>
                  <p className="text-gray-900 dark:text-white font-medium">{book.pageCount}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Reviews Section */}
      <div className="bg-white dark:bg-dark-surface rounded-3xl premium-shadow p-8 border border-transparent dark:border-dark-border">
        <h2 className="text-2xl font-display font-bold text-gray-900 dark:text-white mb-6">Reviews & Ratings</h2>
        
        {user ? (
          <div className="mb-8 border-b border-gray-100 dark:border-dark-border pb-8">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Write a Review</h3>
            <ReviewForm bookId={book._id} onReviewAdded={handleReviewAdded} />
          </div>
        ) : (
          <div className="bg-gray-50 dark:bg-dark-bg rounded-xl p-6 mb-8 text-center border border-gray-100 dark:border-dark-border">
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              Please log in to share your thoughts on this book.
            </p>
            <button
              onClick={() => navigate('/login')}
              className="bg-gray-900 dark:bg-white text-white dark:text-gray-900 px-6 py-2 rounded-lg hover:opacity-90 transition-opacity font-medium"
            >
              Log In
            </button>
          </div>
        )}

        <div className="space-y-6">
          {reviews.length === 0 ? (
            <p className="text-gray-500 dark:text-gray-400 text-center py-8">
              No reviews yet. Be the first to review this book!
            </p>
          ) : (
            reviews.map((review) => (
              <div key={review._id} className="bg-gray-50 dark:bg-dark-bg p-6 rounded-2xl border border-gray-100 dark:border-dark-border">
                <div className="flex justify-between items-start mb-3">
                  <div className="flex items-center">
                    <div className="w-10 h-10 bg-gradient-to-br from-accent-primary to-accent-secondary rounded-full flex items-center justify-center text-white font-bold mr-3 shadow-md">
                      {review.userId.displayName ? review.userId.displayName.charAt(0).toUpperCase() : review.userId.name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900 dark:text-white">
                        {review.userId.displayName || review.userId.name}
                      </h4>
                      <div className="flex items-center text-xs text-gray-500 dark:text-gray-400 mt-1">
                        <span className="flex mr-2">
                          {Array(5).fill(0).map((_, i) => (
                            <span key={i} className={i < review.rating ? 'text-amber-400' : 'text-gray-300 dark:text-gray-600'}>
                              ★
                            </span>
                          ))}
                        </span>
                        {new Date(review.createdAt).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                </div>
                {review.reviewText && (
                  <p className="text-gray-700 dark:text-gray-300 mt-4 leading-relaxed whitespace-pre-line bg-white dark:bg-dark-surface p-4 rounded-xl">
                    {review.reviewText}
                  </p>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default BookDetail;
