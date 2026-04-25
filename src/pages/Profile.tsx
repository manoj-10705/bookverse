import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import axios from 'axios';
import StarRating from '../components/StarRating';
import { Link } from 'react-router-dom';

interface UserReview {
  _id: string;
  bookId: {
    _id: string;
    title: string;
    author: string;
  };
  rating: number;
  reviewText?: string;
  createdAt: string;
}

const Profile: React.FC = () => {
  const { user } = useAuth();
  const [reviews, setReviews] = useState<UserReview[]>([]);
  const [loading, setLoading] = useState(true);
  const [profileData, setProfileData] = useState({
    displayName: '',
    bio: '',
    favoriteGenres: [] as string[]
  });

  const genres = [
    'Fiction', 'Non-Fiction', 'Mystery', 'Romance', 'Science Fiction',
    'Fantasy', 'Biography', 'History', 'Self-Help', 'Business',
    'Technology', 'Health', 'Travel', 'Cooking', 'Art'
  ];

  useEffect(() => {
    if (user) {
      fetchUserReviews();
      fetchUserProfile();
    }
  }, [user]);

  const fetchUserReviews = async () => {
    try {
      const response = await axios.get(`/api/reviews/user/${user?.id}`);
      setReviews(response.data);
    } catch (err) {
      console.error('Error fetching user reviews:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchUserProfile = async () => {
    try {
      const response = await axios.get(`/api/users/profile/${user?.id}`);
      const profile = response.data;
      setProfileData({
        displayName: profile.displayName || '',
        bio: profile.bio || '',
        favoriteGenres: profile.favoriteGenres || []
      });
    } catch (err) {
      console.error('Error fetching user profile:', err);
    }
  };

  const handleGenreToggle = (genre: string) => {
    setProfileData(prev => ({
      ...prev,
      favoriteGenres: prev.favoriteGenres.includes(genre)
        ? prev.favoriteGenres.filter(g => g !== genre)
        : [...prev.favoriteGenres, genre]
    }));
  };

  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await axios.put('/api/users/profile', profileData);
      alert('Profile updated successfully!');
    } catch (err) {
      console.error('Error updating profile:', err);
      alert('Failed to update profile');
    }
  };

  if (!user) return null;

  return (
    <div className="space-y-8">
      {/* Profile Header */}
      <div className="bg-white rounded-lg shadow-sm p-8">
        <div className="flex items-center space-x-6 mb-6">
          <div className="w-20 h-20 bg-blue-600 rounded-full flex items-center justify-center text-white text-2xl font-bold">
            {user.name.charAt(0).toUpperCase()}
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{user.name}</h1>
            <p className="text-gray-600">{user.email}</p>
            <p className="text-sm text-gray-500">{reviews.length} reviews written</p>
          </div>
        </div>

        {/* Profile Form */}
        <form onSubmit={handleProfileUpdate} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="displayName" className="block text-sm font-medium text-gray-700 mb-1">
                Display Name
              </label>
              <input
                type="text"
                id="displayName"
                value={profileData.displayName}
                onChange={(e) => setProfileData(prev => ({ ...prev, displayName: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="How should others see your name?"
              />
            </div>
          </div>

          <div>
            <label htmlFor="bio" className="block text-sm font-medium text-gray-700 mb-1">
              Bio
            </label>
            <textarea
              id="bio"
              value={profileData.bio}
              onChange={(e) => setProfileData(prev => ({ ...prev, bio: e.target.value }))}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Tell others about yourself..."
              maxLength={500}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Favorite Genres
            </label>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-2">
              {genres.map((genre) => (
                <button
                  key={genre}
                  type="button"
                  onClick={() => handleGenreToggle(genre)}
                  className={`px-3 py-2 text-sm rounded-lg border transition-colors ${
                    profileData.favoriteGenres.includes(genre)
                      ? 'bg-blue-600 text-white border-blue-600'
                      : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  {genre}
                </button>
              ))}
            </div>
          </div>

          <button
            type="submit"
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Update Profile
          </button>
        </form>
      </div>

      {/* User Reviews */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h2 className="text-xl font-semibold mb-6">My Reviews</h2>
        
        {loading ? (
          <div className="flex justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        ) : reviews.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-500 mb-4">You haven't written any reviews yet.</p>
            <Link 
              to="/" 
              className="text-blue-600 hover:text-blue-700"
            >
              Browse books to get started →
            </Link>
          </div>
        ) : (
          <div className="space-y-6">
            {reviews.map((review) => (
              <div key={review._id} className="flex flex-col md:flex-row bg-gray-50 dark:bg-dark-bg p-6 rounded-2xl border border-gray-100 dark:border-dark-border hover:shadow-md transition-shadow">
                <div className="md:w-1/4 mb-4 md:mb-0 md:mr-6 flex-shrink-0">
                  <Link to={`/book/${review.bookId?._id}`}>
                    <div className="aspect-[2/3] w-full max-w-[120px] bg-gray-200 dark:bg-gray-800 rounded-lg overflow-hidden premium-shadow mx-auto md:mx-0">
                      {review.bookId?.coverUrl ? (
                         <img 
                           src={review.bookId.coverUrl} 
                           alt={review.bookId.title} 
                           className="w-full h-full object-cover"
                         />
                      ) : (
                         <div className="w-full h-full flex items-center justify-center text-gray-400">
                           <Book className="h-8 w-8" />
                         </div>
                      )}
                    </div>
                  </Link>
                </div>
                
                <div className="flex-1">
                  <Link to={`/book/${review.bookId?._id}`} className="block group">
                    <h3 className="font-display font-bold text-xl text-gray-900 dark:text-white group-hover:text-accent-primary transition-colors mb-1">
                      {review.bookId?.title || 'Unknown Book'}
                    </h3>
                  </Link>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mb-3">
                    by {review.bookId?.author || 'Unknown Author'}
                  </p>
                  
                  <div className="flex items-center text-sm text-gray-500 dark:text-gray-400 mb-3 bg-white dark:bg-dark-surface w-fit px-3 py-1.5 rounded-lg border border-gray-100 dark:border-dark-border">
                    <span className="flex mr-2">
                       {Array(5).fill(0).map((_, i) => (
                         <span key={i} className={i < review.rating ? 'text-amber-400' : 'text-gray-300 dark:text-gray-600'}>
                           ★
                         </span>
                       ))}
                    </span>
                    {new Date(review.createdAt).toLocaleDateString()}
                  </div>
                  
                  {review.comment && (
                    <p className="text-gray-700 dark:text-gray-300 leading-relaxed bg-white dark:bg-dark-surface p-4 rounded-xl shadow-sm">
                      {review.comment}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Profile;
