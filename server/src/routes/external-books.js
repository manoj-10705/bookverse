import express from 'express';
import axios from 'axios';
import auth from '../middleware/auth.js';
import { sanitizeRequests } from '../middleware/validate.js';
import Book from '../models/Book.js';

const router = express.Router();
router.use(sanitizeRequests);

// Search external APIs for books
router.get('/search', auth, async (req, res) => {
  try {
    const { q } = req.query;
    if (!q) return res.status(400).json({ message: 'Query is required' });

    // Google Books API (no key needed for basic usage)
    const googleResponse = await axios.get(`https://www.googleapis.com/books/v1/volumes?q=${encodeURIComponent(q)}&maxResults=10`);
    
    if (!googleResponse.data || !googleResponse.data.items) {
       return res.json([]);
    }

    const books = googleResponse.data.items.map(item => {
      const info = item.volumeInfo;
      // Extract ISBN-13 or ISBN-10
      const isbnObj = info.industryIdentifiers?.find(i => i.type === 'ISBN_13') || 
                      info.industryIdentifiers?.find(i => i.type === 'ISBN_10');
      const isbn = isbnObj ? isbnObj.identifier : '';
      
      // Preferred cover: OpenLibrary High-Res. Fallback: Google Books thumbnail
      const coverUrl = isbn ? `https://covers.openlibrary.org/b/isbn/${isbn}-M.jpg` 
                       : (info.imageLinks?.thumbnail ? info.imageLinks.thumbnail.replace('http:', 'https:') : '');

      return {
        externalId: item.id,
        title: info.title || 'Unknown Title',
        author: info.authors ? info.authors.join(', ') : 'Unknown Author',
        description: info.description || 'No description available',
        publishedYear: info.publishedDate ? parseInt(info.publishedDate.substring(0, 4)) : null,
        genre: info.categories ? info.categories[0] : 'Fiction',
        isbn: isbn,
        coverUrl: coverUrl,
        pageCount: info.pageCount || 0,
        source: 'external'
      };
    });

    res.json(books);
  } catch (error) {
    console.error('Error searching external books:', error);
    res.status(500).json({ message: 'Error searching books' });
  }
});

export default router;
