import React, { useEffect, useState } from 'react';
import { Moon, Sun } from 'lucide-react';
import { motion } from 'framer-motion';

export const ThemeToggle = () => {
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    const isDarkMode = localStorage.getItem('theme') === 'dark' || 
      (!('theme' in localStorage) && window.matchMedia('(prefers-color-scheme: dark)').matches);
    
    setIsDark(isDarkMode);
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, []);

  const toggleTheme = () => {
    if (isDark) {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
      setIsDark(false);
    } else {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
      setIsDark(true);
    }
  };

  return (
    <button
      onClick={toggleTheme}
      className="p-2 rounded-full bg-gray-100 dark:bg-dark-surface dark:border dark:border-dark-border text-gray-800 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-800 transition-colors focus:outline-none focus:ring-2 focus:ring-accent-primary"
      aria-label="Toggle Dark Mode"
    >
      <div className="relative w-5 h-5">
        <motion.div
          initial={false}
          animate={{ scale: isDark ? 1 : 0, rotate: isDark ? 0 : 90 }}
          transition={{ type: 'spring', stiffness: 200, damping: 10 }}
          className="absolute inset-0"
        >
          <Moon size={20} />
        </motion.div>
        <motion.div
          initial={false}
          animate={{ scale: isDark ? 0 : 1, rotate: isDark ? -90 : 0 }}
          transition={{ type: 'spring', stiffness: 200, damping: 10 }}
          className="absolute inset-0 text-amber-500"
        >
          <Sun size={20} />
        </motion.div>
      </div>
    </button>
  );
};
