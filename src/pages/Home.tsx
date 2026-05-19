import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import StarRating from '../components/StarRating';

interface Book {
  _id: string;
  title: string;
  author: string;
  genre: string;
  description: string;
  coverUrl?: string;
  averageRating: number;
  totalReviews: number;
}

const BookCard = ({ book }: { book: Book }) => (
  <Link
    to={`/book/${book._id}`}
    className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow overflow-hidden flex flex-col h-full"
  >
    <div className="aspect-[3/4] bg-gray-200 relative flex-shrink-0">
      {book.coverUrl ? (
        <img
          src={book.coverUrl}
          alt={book.title}
          className="w-full h-full object-cover"
        />
      ) : (
        <div className="w-full h-full flex items-center justify-center text-gray-400">
          <span className="text-4xl">📖</span>
        </div>
      )}
    </div>
    <div className="p-4 flex flex-col flex-grow">
      <h3 className="font-semibold text-gray-900 mb-1 line-clamp-2">
        {book.title}
      </h3>
      <p className="text-sm text-gray-600 mb-2">by {book.author}</p>
      <div className="mt-auto pt-2 flex items-center justify-between">
        <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded truncate max-w-[50%]">
          {book.genre}
        </span>
        <div className="flex items-center space-x-1 flex-shrink-0">
          <StarRating rating={book.averageRating} size="sm" readonly />
          <span className="text-xs text-gray-500">
            ({book.totalReviews})
          </span>
        </div>
      </div>
    </div>
  </Link>
);

const Home: React.FC = () => {
  const [topBooks, setTopBooks] = useState<Book[]>([]);
  const [recentBooks, setRecentBooks] = useState<Book[]>([]);
  const [filteredBooks, setFilteredBooks] = useState<Book[]>([]);

  const [genres, setGenres] = useState<string[]>([]);
  const [selectedGenre, setSelectedGenre] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  useEffect(() => {
    // Only fetch filtered books if there is an active search or genre filter
    if (selectedGenre || searchQuery) {
      fetchFilteredBooks();
    } else {
      setFilteredBooks([]);
    }
  }, [selectedGenre, searchQuery]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const [topRes, recentRes, genresRes] = await Promise.all([
        axios.get('/api/books/top'),
        axios.get('/api/books/recent'),
        axios.get('/api/books/meta/genres')
      ]);
      setTopBooks(topRes.data);
      setRecentBooks(recentRes.data);
      setGenres(genresRes.data);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchFilteredBooks = async () => {
    try {
      const params = new URLSearchParams();
      if (selectedGenre) params.append('genre', selectedGenre);
      if (searchQuery) params.append('search', searchQuery);

      const response = await axios.get(`/api/books?${params}`);
      setFilteredBooks(response.data.books);
    } catch (error) {
      console.error('Error fetching filtered books:', error);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  const isSearching = selectedGenre || searchQuery;

  return (
    <div className="space-y-10 pb-12">
      {/* Search and Filter */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <input
              type="text"
              placeholder="Search books by title, author, or description..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <div className="md:w-48">
            <select
              value={selectedGenre}
              onChange={(e) => setSelectedGenre(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">All Genres</option>
              {genres.map((genre) => (
                <option key={genre} value={genre}>
                  {genre}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {isSearching ? (
        /* Filtered Results View */
        <div className="space-y-6">
          <h2 className="text-2xl font-bold text-gray-900">Search Results</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-6">
            {filteredBooks.map((book) => (
              <BookCard key={book._id} book={book} />
            ))}
          </div>
          {filteredBooks.length === 0 && (
            <div className="text-center py-12 bg-white rounded-lg shadow-sm">
              <div className="mb-4 text-4xl">🔍</div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">No matches found</h3>
              <p className="text-gray-500">Try adjusting your search terms or filters.</p>
            </div>
          )}
        </div>
      ) : (
        /* Dashboard View */
        <div className="space-y-12">

          {/* Top Rated Books */}
          {topBooks.length > 0 && (
            <section>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900">Top Rated Books</h2>
                <div className="text-sm text-blue-600 hover:text-blue-800 font-medium cursor-pointer">
                  View all
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-6">
                {topBooks.slice(0, 5).map((book) => (
                  <BookCard key={book._id} book={book} />
                ))}
              </div>
            </section>
          )}

          {/* Recently Added Books */}
          {recentBooks.length > 0 && (
            <section>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900">Trending & Recent</h2>
                <div className="text-sm text-blue-600 hover:text-blue-800 font-medium cursor-pointer">
                  View all
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-6">
                {recentBooks.slice(0, 5).map((book) => (
                  <BookCard key={book._id} book={book} />
                ))}
              </div>
            </section>
          )}

          {topBooks.length === 0 && recentBooks.length === 0 && (
            <div className="text-center py-16 bg-white rounded-lg shadow-sm">
              <div className="mb-6 text-6xl">📚</div>
              <h3 className="text-2xl font-semibold text-gray-900 mb-2">Welcome to BookVerse!</h3>
              <p className="text-gray-500 mb-8 max-w-md mx-auto">
                The library is currently empty. Be the first to start the collection by adding your favorite books.
              </p>
              <Link
                to="/add-book"
                className="inline-flex items-center px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors shadow-sm"
              >
                Add First Book
              </Link>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Home;
