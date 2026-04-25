import React from 'react';
import { BookOpen, Heart } from 'lucide-react';
import { Link } from 'react-router-dom';

const Footer: React.FC = () => {
  return (
    <footer className="bg-white dark:bg-dark-surface border-t border-gray-200 dark:border-dark-border py-12 mt-20 transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="col-span-1 md:col-span-2">
            <Link to="/" className="flex items-center space-x-2 text-primary dark:text-white mb-4 transition-colors">
              <BookOpen className="h-8 w-8 text-accent-primary" />
              <span className="text-2xl font-display font-bold tracking-tight">BookVerse</span>
            </Link>
            <p className="text-gray-500 dark:text-gray-400 max-w-sm">
              Discover your next great read, share reviews with the community, and keep track of your literary journey.
            </p>
          </div>
          
          <div>
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white uppercase tracking-wider mb-4">Platform</h3>
            <ul className="space-y-3 text-gray-500 dark:text-gray-400">
              <li><Link to="/" className="hover:text-accent-primary transition-colors">Browse Books</Link></li>
              <li><Link to="/add-book" className="hover:text-accent-primary transition-colors">Add a Book</Link></li>
              <li><Link to="/profile" className="hover:text-accent-primary transition-colors">Your Profile</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white uppercase tracking-wider mb-4">Connect</h3>
            <div className="flex space-x-4 text-gray-400">
              <a href="https://github.com/ganymede323/bookverse" target="_blank" rel="noreferrer" className="hover:text-accent-primary transition-colors">
                <span className="sr-only">GitHub</span>
                <span className="font-bold">GitHub</span>
              </a>
            </div>
          </div>
        </div>
        
        <div className="mt-12 pt-8 border-t border-gray-200 dark:border-dark-border flex flex-col md:flex-row justify-between items-center text-sm text-gray-400">
          <p>© {new Date().getFullYear()} BookVerse. All rights reserved.</p>
          <p className="flex items-center mt-4 md:mt-0">
            Made with <Heart className="h-4 w-4 mx-1 text-red-500" /> for book lovers
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
