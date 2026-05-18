import mongoose from 'mongoose';
import dotenv from 'dotenv';
import axios from 'axios';
import Book from './models/Book.js';

dotenv.config();

async function fetchBooksFromGoogleBooks() {
  const query = 'subject:fiction';
  const maxResults = 40;
  // Note: Using the free tier without an API key might be rate-limited
  const url = `https://www.googleapis.com/books/v1/volumes?q=${query}&maxResults=${maxResults}`;

  try {
    const response = await axios.get(url);
    if (!response.data.items) {
      return [];
    }

    const books = response.data.items.map(item => {
      const volumeInfo = item.volumeInfo;
      return {
        title: volumeInfo.title || 'Unknown Title',
        author: volumeInfo.authors ? volumeInfo.authors.join(', ') : 'Unknown Author',
        genre: volumeInfo.categories ? volumeInfo.categories[0] : 'Fiction',
        description: volumeInfo.description || 'No description available.',
        coverUrl: volumeInfo.imageLinks?.thumbnail?.replace('http:', 'https:') || null,
        publishedYear: volumeInfo.publishedDate ? parseInt(volumeInfo.publishedDate.substring(0, 4)) : null,
      };
    });

    // Filter out books with missing required fields
    return books.filter(book => book.title && book.author && book.description);
  } catch (error) {
    console.error('Error fetching from Google Books:', error.message);
    return [];
  }
}

async function seedBooks() {
  try {
    const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/bookverse';
    await mongoose.connect(MONGODB_URI);
    
    console.log('Connected to MongoDB');
    
    // Check if books already exist
    const existingBooks = await Book.countDocuments();
    if (existingBooks > 0) {
      console.log('Books already exist in database');
      process.exit(0);
    }
    
    console.log('Fetching books from Google Books API...');
    let fetchedBooks = await fetchBooksFromGoogleBooks();

    if (fetchedBooks.length === 0) {
      console.log('Failed to fetch books from API, using fallback data...');
      fetchedBooks = [
        {
          title: "The Great Gatsby",
          author: "F. Scott Fitzgerald",
          genre: "Fiction",
          description: "A classic American novel set in the Jazz Age, exploring themes of wealth, love, and the American Dream through the eyes of narrator Nick Carraway.",
          coverUrl: "https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=300&h=400&fit=crop",
          publishedYear: 1925,
        },
        {
          title: "To Kill a Mockingbird",
          author: "Harper Lee",
          genre: "Fiction",
          description: "A gripping tale of racial injustice and childhood innocence in the American South, told through the eyes of Scout Finch.",
          coverUrl: "https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=300&h=400&fit=crop",
          publishedYear: 1960,
        }
      ];
    }

    // Insert sample books
    await Book.insertMany(fetchedBooks);
    console.log(`Seeded ${fetchedBooks.length} books successfully`);
    
    process.exit(0);
  } catch (error) {
    console.error('Error seeding books:', error);
    process.exit(1);
  }
}

seedBooks();
