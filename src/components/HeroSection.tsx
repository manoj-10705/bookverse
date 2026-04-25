import React from 'react';
import { Search } from 'lucide-react';
import { motion } from 'framer-motion';

interface HeroSectionProps {
  searchQuery: string;
  setSearchQuery: (val: string) => void;
}

const HeroSection: React.FC<HeroSectionProps> = ({ searchQuery, setSearchQuery }) => {
  return (
    <div className="relative overflow-hidden bg-white dark:bg-dark-surface border-b border-gray-200 dark:border-dark-border mb-12 rounded-3xl glass-card premium-shadow animate-fade-in transition-colors duration-300">
      {/* Background decoration */}
      <div className="absolute top-0 right-0 -mt-20 -mr-20 w-80 h-80 bg-accent-primary rounded-full mix-blend-multiply filter blur-3xl opacity-20 dark:opacity-10 animate-blob"></div>
      <div className="absolute top-0 left-0 mt-20 -ml-20 w-80 h-80 bg-accent-secondary rounded-full mix-blend-multiply filter blur-3xl opacity-20 dark:opacity-10 animate-blob animation-delay-2000"></div>
      
      <div className="relative px-6 py-16 sm:px-12 sm:py-24 lg:py-32 lg:px-8">
        <div className="mx-auto max-w-4xl text-center">
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-4xl font-display font-bold tracking-tight text-gray-900 dark:text-white sm:text-6xl mb-6"
          >
            Discover Your Next <span className="text-gradient">Great Read</span>
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="mt-6 text-lg leading-8 text-gray-600 dark:text-gray-300 max-w-2xl mx-auto"
          >
            Join a community of readers to explore millions of books, share your thoughts, and track what you want to read next. 
          </motion.p>
          
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="mt-10 flex items-center justify-center gap-x-6 w-full max-w-2xl mx-auto"
          >
            <div className="relative w-full group">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <Search className="h-6 w-6 text-gray-400 group-focus-within:text-accent-primary transition-colors" />
              </div>
              <input
                type="text"
                className="block w-full pl-12 pr-4 py-4 rounded-full border-0 text-gray-900 dark:text-white dark:bg-dark-bg ring-1 ring-inset ring-gray-300 dark:ring-dark-border placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-accent-primary sm:text-lg sm:leading-6 premium-shadow glass transition-all"
                placeholder="Search books by title, author, or genre..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default HeroSection;
