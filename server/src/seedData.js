import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Book from './models/Book.js';

dotenv.config();

const sampleBooks = [
  {
    title: "1984",
    author: "George Orwell",
    genre: "Science Fiction",
    description: "A dystopian social science fiction novel about totalitarian control and the struggle for individual freedom in a surveillance state.",
    coverUrl: "https://covers.openlibrary.org/b/isbn/9780451524935-L.jpg",
    publishedYear: 1949,
    isbn: "9780451524935",
    pageCount: 328
  },
  {
    title: "To Kill a Mockingbird",
    author: "Harper Lee",
    genre: "Fiction",
    description: "A gripping tale of racial injustice and childhood innocence in the American South, told through the eyes of Scout Finch.",
    coverUrl: "https://covers.openlibrary.org/b/isbn/9780060935467-L.jpg",
    publishedYear: 1960,
    isbn: "9780060935467",
    pageCount: 281
  },
  {
    title: "Dune",
    author: "Frank Herbert",
    genre: "Science Fiction",
    description: "An epic science fiction novel set in a distant future amidst a feudal interstellar society, focusing on politics, religion, and ecology.",
    coverUrl: "https://covers.openlibrary.org/b/isbn/9780441172719-L.jpg",
    publishedYear: 1965,
    isbn: "9780441172719",
    pageCount: 896
  },
  {
    title: "The Great Gatsby",
    author: "F. Scott Fitzgerald",
    genre: "Fiction",
    description: "A classic American novel set in the Jazz Age, exploring themes of wealth, love, and the American Dream through the eyes of narrator Nick Carraway.",
    coverUrl: "https://covers.openlibrary.org/b/isbn/9780743273565-L.jpg",
    publishedYear: 1925,
    isbn: "9780743273565",
    pageCount: 180
  },
  {
    title: "Pride and Prejudice",
    author: "Jane Austen",
    genre: "Romance",
    description: "A romantic novel that critiques the British landed gentry at the end of the 18th century, following Elizabeth Bennet and Mr. Darcy.",
    coverUrl: "https://covers.openlibrary.org/b/isbn/9780141439518-L.jpg",
    publishedYear: 1813,
    isbn: "9780141439518",
    pageCount: 432
  },
  {
    title: "The Catcher in the Rye",
    author: "J.D. Salinger",
    genre: "Fiction",
    description: "A controversial coming-of-age story following teenager Holden Caulfield's experiences in New York City.",
    coverUrl: "https://covers.openlibrary.org/b/isbn/9780316769488-L.jpg",
    publishedYear: 1951,
    isbn: "9780316769488",
    pageCount: 277
  },
  {
    title: "The Lord of the Rings",
    author: "J.R.R. Tolkien",
    genre: "Fantasy",
    description: "An epic high fantasy novel following the quest to destroy the One Ring and defeat the Dark Lord Sauron.",
    coverUrl: "https://covers.openlibrary.org/b/isbn/9780544003415-L.jpg",
    publishedYear: 1954,
    isbn: "9780544003415",
    pageCount: 1178
  },
  {
    title: "Harry Potter and the Sorcerer's Stone",
    author: "J.K. Rowling",
    genre: "Fantasy",
    description: "The first book in the beloved series about a young wizard discovering his magical heritage and attending Hogwarts School.",
    coverUrl: "https://covers.openlibrary.org/b/isbn/9780590353403-L.jpg",
    publishedYear: 1997,
    isbn: "9780590353403",
    pageCount: 309
  },
  {
    title: "The Hobbit",
    author: "J.R.R. Tolkien",
    genre: "Fantasy",
    description: "A children's fantasy novel about Bilbo Baggins' unexpected journey with dwarves to reclaim their mountain home from a dragon.",
    coverUrl: "https://covers.openlibrary.org/b/isbn/9780547928227-L.jpg",
    publishedYear: 1937,
    isbn: "9780547928227",
    pageCount: 300
  },
  {
    title: "Sapiens: A Brief History of Humankind",
    author: "Yuval Noah Harari",
    genre: "Non-Fiction",
    description: "A thought-provoking exploration of human history from the Stone Age to the present, examining how Homo sapiens came to dominate the world.",
    coverUrl: "https://covers.openlibrary.org/b/isbn/9780062316097-L.jpg",
    publishedYear: 2011,
    isbn: "9780062316097",
    pageCount: 443
  }
];

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
    
    // Insert sample books
    await Book.insertMany(sampleBooks);
    console.log(`Seeded ${sampleBooks.length} books successfully`);
    
    process.exit(0);
  } catch (error) {
    console.error('Error seeding books:', error);
    process.exit(1);
  }
}

seedBooks();
