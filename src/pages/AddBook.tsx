import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Search, Loader2 } from 'lucide-react';

interface ExternalBook {
  externalId: string;
  title: string;
  author: string;
  description: string;
  publishedYear: number | null;
  genre: string;
  isbn: string;
  coverUrl: string;
  pageCount: number;
  source: string;
}

const AddBook: React.FC = () => {
  const [formData, setFormData] = useState({
    title: '',
    author: '',
    genre: '',
    description: '',
    coverUrl: '',
    isbn: '',
    publishedYear: '',
    pageCount: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  // Real-time search states
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [searchResults, setSearchResults] = useState<ExternalBook[]>([]);

  const navigate = useNavigate();

  const genres = [
    'Fiction', 'Non-Fiction', 'Mystery', 'Romance', 'Science Fiction',
    'Fantasy', 'Biography', 'History', 'Self-Help', 'Business',
    'Technology', 'Health', 'Travel', 'Cooking', 'Art'
  ];

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      if (searchQuery.trim().length > 2) {
        searchExternalBooks();
      } else {
        setSearchResults([]);
      }
    }, 500);

    return () => clearTimeout(delayDebounceFn);
  }, [searchQuery]);

  const searchExternalBooks = async () => {
    setIsSearching(true);
    try {
      const { data } = await axios.get(`/api/external-books/search?q=${searchQuery}`);
      setSearchResults(data);
    } catch (err) {
      console.error('Failed to search external books', err);
    } finally {
      setIsSearching(false);
    }
  };

  const selectBook = (book: ExternalBook) => {
    setFormData({
      title: book.title || '',
      author: book.author || '',
      genre: book.genre && genres.includes(book.genre) ? book.genre : 'Fiction',
      description: book.description || '',
      coverUrl: book.coverUrl || '',
      isbn: book.isbn || '',
      publishedYear: book.publishedYear ? book.publishedYear.toString() : '',
      pageCount: book.pageCount ? book.pageCount.toString() : ''
    });
    setSearchResults([]);
    setSearchQuery('');
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const bookData = {
        ...formData,
        publishedYear: formData.publishedYear ? parseInt(formData.publishedYear) : undefined,
        pageCount: formData.pageCount ? parseInt(formData.pageCount) : undefined
      };

      const res = await axios.post('/api/books', bookData);
      navigate(`/book/${res.data._id}`);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to add book');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      
      {/* Real-time Search Section */}
      <div className="bg-white rounded-lg shadow-sm p-6 dark:bg-dark-surface dark:border dark:border-dark-border">
        <h2 className="text-xl font-bold mb-4 dark:text-white">Quick Add from Web</h2>
        <div className="relative">
          <div className="flex bg-gray-50 border border-gray-300 rounded-lg dark:bg-dark-bg dark:border-dark-border overflow-hidden focus-within:ring-2 focus-within:ring-accent-primary">
            <span className="flex items-center pl-3 text-gray-500 dark:text-gray-400">
              <Search size={20} />
            </span>
            <input
              type="text"
              placeholder="Search by Title, Author, or ISBN..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-3 py-3 bg-transparent border-none focus:outline-none dark:text-white dark:placeholder-gray-500"
            />
            {isSearching && (
              <span className="flex items-center pr-3 text-accent-primary">
                <Loader2 size={20} className="animate-spin" />
              </span>
            )}
          </div>
          
          {/* Results Dropdown */}
          {searchResults.length > 0 && (
            <div className="absolute z-10 w-full mt-2 bg-white rounded-lg shadow-lg dark:bg-dark-surface dark:border dark:border-dark-border max-h-96 overflow-y-auto">
              {searchResults.map((book, idx) => (
                <div 
                  key={idx} 
                  onClick={() => selectBook(book)}
                  className="flex items-center p-3 border-b border-gray-100 dark:border-dark-border cursor-pointer hover:bg-gray-50 dark:hover:bg-dark-bg transition-colors"
                >
                  <div className="w-12 h-16 bg-gray-200 dark:bg-gray-800 rounded flex-shrink-0 overflow-hidden">
                    {book.coverUrl ? (
                      <img src={book.coverUrl} className="w-full h-full object-cover" alt="Cover" />
                    ) : (
                      <span className="h-full w-full flex items-center justify-center text-xs text-gray-500">No Img</span>
                    )}
                  </div>
                  <div className="ml-4 flex-1">
                    <h4 className="font-semibold text-gray-900 dark:text-white line-clamp-1">{book.title}</h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-1">{book.author}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-500">{book.publishedYear} • {book.isbn}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm p-6 dark:bg-dark-surface dark:border dark:border-dark-border">
        <h2 className="text-2xl font-bold mb-6 dark:text-white">Manual Details</h2>
        
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="title" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Title *
              </label>
              <input
                type="text"
                id="title"
                name="title"
                value={formData.title}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-accent-primary focus:border-transparent dark:bg-dark-bg dark:border-dark-border dark:text-white"
                placeholder="Enter book title"
              />
            </div>

            <div>
              <label htmlFor="author" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Author *
              </label>
              <input
                type="text"
                id="author"
                name="author"
                value={formData.author}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-accent-primary focus:border-transparent dark:bg-dark-bg dark:border-dark-border dark:text-white"
                placeholder="Enter author name"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="genre" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Genre *
              </label>
              <select
                id="genre"
                name="genre"
                value={formData.genre}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-accent-primary focus:border-transparent dark:bg-dark-bg dark:border-dark-border dark:text-white"
              >
                <option value="">Select a genre</option>
                {genres.map((genre) => (
                  <option key={genre} value={genre}>
                    {genre}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="publishedYear" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Published Year
              </label>
              <input
                type="number"
                id="publishedYear"
                name="publishedYear"
                value={formData.publishedYear}
                onChange={handleChange}
                min="1000"
                max={new Date().getFullYear()}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-accent-primary focus:border-transparent dark:bg-dark-bg dark:border-dark-border dark:text-white"
                placeholder="e.g., 2023"
              />
            </div>
          </div>

          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Description *
            </label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              required
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-accent-primary focus:border-transparent dark:bg-dark-bg dark:border-dark-border dark:text-white"
              placeholder="Enter book description"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="isbn" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                ISBN
              </label>
              <input
                type="text"
                id="isbn"
                name="isbn"
                value={formData.isbn}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-accent-primary focus:border-transparent dark:bg-dark-bg dark:border-dark-border dark:text-white"
                placeholder="Enter ISBN"
              />
            </div>

            <div>
              <label htmlFor="coverUrl" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Cover Image URL
              </label>
              <input
                type="url"
                id="coverUrl"
                name="coverUrl"
                value={formData.coverUrl}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-accent-primary focus:border-transparent dark:bg-dark-bg dark:border-dark-border dark:text-white"
                placeholder="Enter cover image URL"
              />
            </div>
          </div>
          
          <div className="flex gap-4 items-center">
            {formData.coverUrl && (
              <img src={formData.coverUrl} className="h-32 object-cover rounded shadow" alt="Preview"/>
            )}
          </div>

          <div className="flex justify-end space-x-4">
            <button
              type="button"
              onClick={() => navigate('/')}
              className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors dark:border-dark-border dark:text-gray-300 dark:hover:bg-dark-bg"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2 bg-gradient-to-r from-accent-primary to-accent-secondary text-white rounded-lg hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-md"
            >
              {loading ? 'Adding Book...' : 'Add Book'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddBook;
