import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { Book as BookIcon } from 'lucide-react';
import HeroSection from '../components/HeroSection';

interface Book {
  _id: string;
  title: string;
  author: string;
  genre: string;
  coverUrl: string;
  averageRating: number;
  totalReviews: number;
}

const Home: React.FC = () => {
  const [books, setBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [genreFilter, setGenreFilter] = useState('');

  const genres = [
    'Fiction', 'Non-Fiction', 'Mystery', 'Romance', 'Science Fiction',
    'Fantasy', 'Biography', 'History', 'Self-Help'
  ];

  useEffect(() => {
    fetchBooks();
  }, [search, genreFilter]);

  const fetchBooks = async () => {
    try {
      setLoading(true);
      
      const params = new URLSearchParams();
      if (search) params.append('search', search);
      if (genreFilter) params.append('genre', genreFilter);
      
      const response = await axios.get(`/api/books?${params.toString()}`);
      setBooks(response.data.books);
    } catch (error) {
      console.error('Failed to fetch books', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8 animate-slide-up">
      <HeroSection searchQuery={search} setSearchQuery={setSearch} />

      <div className="flex flex-col md:flex-row justify-between items-center gap-4 mb-8">
        <h2 className="text-3xl font-display font-bold text-gray-900 dark:text-white">Trending Books</h2>
        
        <div className="flex gap-2 p-1 bg-white dark:bg-dark-surface rounded-xl premium-shadow overflow-x-auto w-full md:w-auto scrollbar-hide py-2 px-2">
          <button
            onClick={() => setGenreFilter('')}
            className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-all ${
              genreFilter === '' 
                ? 'bg-accent-primary text-white shadow-md' 
                : 'text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-dark-bg'
            }`}
          >
            All Genres
          </button>
          {genres.map(genre => (
            <button
              key={genre}
              onClick={() => setGenreFilter(genre)}
              className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-all ${
                genreFilter === genre 
                  ? 'bg-accent-primary text-white shadow-md' 
                  : 'text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-dark-bg'
              }`}
            >
              {genre}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
          {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(i => (
            <div key={i} className="animate-pulse bg-white dark:bg-dark-surface rounded-2xl shadow-sm p-4">
              <div className="bg-gray-200 dark:bg-gray-800 rounded-xl aspect-[2/3] w-full mb-4"></div>
              <div className="h-4 bg-gray-200 dark:bg-gray-800 rounded w-3/4 mb-2"></div>
              <div className="h-3 bg-gray-200 dark:bg-gray-800 rounded w-1/2"></div>
            </div>
          ))}
        </div>
      ) : books.length === 0 ? (
        <div className="text-center py-20 bg-white dark:bg-dark-surface rounded-3xl premium-shadow">
          <div className="mx-auto w-24 h-24 bg-gray-50 dark:bg-dark-bg rounded-full flex items-center justify-center mb-4">
            <BookIcon className="h-12 w-12 text-gray-400" />
          </div>
          <h3 className="text-xl font-medium text-gray-900 dark:text-white mb-2">No books found</h3>
          <p className="text-gray-500 dark:text-gray-400">Try adjusting your search or filters</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
          {books.map((book) => (
            <Link 
              key={book._id} 
              to={`/book/${book._id}`}
              className="group bg-white dark:bg-dark-surface rounded-2xl overflow-hidden premium-shadow hover-lift border border-transparent dark:border-dark-border flex flex-col"
            >
              <div className="aspect-[2/3] w-full overflow-hidden bg-gray-100 dark:bg-dark-bg relative">
                {book.coverUrl ? (
                  <img 
                    src={book.coverUrl} 
                    alt={book.title} 
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                    loading="lazy"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-400">
                    <BookIcon className="h-12 w-12" />
                  </div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                
                <div className="absolute top-2 right-2 bg-black/50 backdrop-blur-md text-white text-xs font-bold px-2 py-1 rounded-full flex items-center gap-1">
                  <span className="text-amber-400 font-sans">★</span> {book.averageRating.toFixed(1)}
                </div>
              </div>
              
              <div className="p-4 flex-grow flex flex-col justify-between">
                <div>
                  <h3 className="font-display font-semibold text-gray-900 dark:text-white line-clamp-1 mb-1 group-hover:text-accent-primary transition-colors">
                    {book.title}
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-1 mb-2">
                    {book.author}
                  </p>
                </div>
                <div className="flex justify-between items-center mt-3 pt-3 border-t border-gray-100 dark:border-dark-border">
                  <span className="inline-block px-2 py-1 bg-gray-50 dark:bg-dark-bg text-[10px] font-medium text-gray-600 dark:text-gray-300 rounded uppercase tracking-wider">
                    {book.genre}
                  </span>
                  <span className="text-xs text-gray-400 dark:text-gray-500">
                    {book.totalReviews} reviews
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
};

export default Home;
