import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { BookOpen, User, LogOut, PlusCircle } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { ThemeToggle } from './ThemeToggle';

const Header: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <header className="sticky top-0 z-50 glass-card mx-auto max-w-7xl mt-4 rounded-full px-6 py-3 flex items-center justify-between premium-shadow transition-all duration-300">
      <div className="flex items-center">
        <Link to="/" className="flex items-center space-x-2 text-gray-900 dark:text-white group">
          <div className="p-2 bg-gradient-to-br from-accent-primary to-accent-secondary rounded-full group-hover:shadow-[0_0_15px_rgba(99,102,241,0.5)] transition-all">
            <BookOpen className="h-6 w-6 text-white" />
          </div>
          <span className="text-2xl font-display font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-300">BookVerse</span>
        </Link>
      </div>

      <nav className="flex items-center space-x-1 sm:space-x-4">
        <ThemeToggle />
        
        {user ? (
          <>
            <Link
              to="/add-book"
              className="hidden sm:flex items-center space-x-1 text-gray-600 hover:text-accent-primary dark:text-gray-300 dark:hover:text-accent-primary px-3 py-2 rounded-md font-medium transition-colors"
            >
              <PlusCircle className="h-5 w-5" />
              <span>Add Book</span>
            </Link>
            <Link
              to="/profile"
              className="flex items-center space-x-1 text-gray-600 hover:text-accent-primary dark:text-gray-300 dark:hover:text-accent-primary px-3 py-2 rounded-md font-medium transition-colors"
            >
              <User className="h-5 w-5" />
              <span className="hidden sm:inline">Profile</span>
            </Link>
            <button
              onClick={handleLogout}
              className="flex items-center space-x-1 text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 px-3 py-2 rounded-md font-medium transition-colors"
            >
              <LogOut className="h-5 w-5" />
              <span className="hidden sm:inline">Logout</span>
            </button>
          </>
        ) : (
          <div className="flex items-center space-x-2">
            <Link
              to="/login"
              className="text-gray-600 hover:text-accent-primary dark:text-gray-300 dark:hover:text-accent-primary px-4 py-2 font-medium transition-colors"
            >
              Login
            </Link>
            <Link
              to="/register"
              className="bg-gradient-to-r from-accent-primary to-accent-secondary text-white px-5 py-2 rounded-full font-medium hover:opacity-90 transition-opacity premium-shadow"
            >
              Register
            </Link>
          </div>
        )}
      </nav>
    </header>
  );
};

export default Header;
