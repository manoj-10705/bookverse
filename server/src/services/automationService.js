import cron from 'node-cron';
import axios from 'axios';
import Book from '../models/Book.js';

// All genres to cycle through when fetching books
const GENRES = [
  'Fiction', 'Non-Fiction', 'Mystery', 'Romance', 'Science Fiction',
  'Fantasy', 'Biography', 'History', 'Self-Help', 'Business',
  'Technology', 'Health', 'Travel', 'Cooking', 'Art',
  'Philosophy', 'Psychology', 'Poetry', 'Drama', 'Horror',
  'Thriller', 'Adventure', 'Children', 'Young Adult', 'Comics'
];

// Search terms per genre for variety
const SEARCH_TERMS = {
  'Fiction': ['bestseller fiction', 'literary fiction', 'contemporary novels'],
  'Non-Fiction': ['popular nonfiction', 'essays nonfiction', 'journalism books'],
  'Mystery': ['mystery detective', 'crime mystery novels', 'whodunit'],
  'Romance': ['romance novels', 'love stories books', 'contemporary romance'],
  'Science Fiction': ['science fiction space', 'sci-fi dystopian', 'cyberpunk novels'],
  'Fantasy': ['fantasy epic', 'dark fantasy novels', 'urban fantasy'],
  'Biography': ['biography memoir', 'autobiography', 'famous biographies'],
  'History': ['world history', 'historical nonfiction', 'ancient history books'],
  'Self-Help': ['self improvement', 'personal development', 'motivation books'],
  'Business': ['business strategy', 'entrepreneurship', 'leadership books'],
  'Technology': ['programming books', 'artificial intelligence', 'technology innovation'],
  'Health': ['health wellness', 'nutrition fitness', 'mental health books'],
  'Travel': ['travel adventure books', 'travel writing', 'world exploration'],
  'Cooking': ['cookbook recipes', 'culinary arts', 'baking books'],
  'Art': ['art history', 'modern art', 'photography books'],
  'Philosophy': ['philosophy classics', 'modern philosophy', 'stoicism'],
  'Psychology': ['psychology behavior', 'cognitive science', 'behavioral psychology'],
  'Poetry': ['poetry collection', 'modern poetry', 'classic poems'],
  'Drama': ['drama plays', 'theater scripts', 'dramatic literature'],
  'Horror': ['horror novels', 'gothic horror', 'supernatural fiction'],
  'Thriller': ['thriller suspense', 'psychological thriller', 'action thriller'],
  'Adventure': ['adventure novels', 'exploration books', 'survival stories'],
  'Children': ['children books', 'picture books kids', 'middle grade fiction'],
  'Young Adult': ['young adult fiction', 'YA fantasy', 'teen novels'],
  'Comics': ['graphic novels', 'manga', 'comic book series']
};

/**
 * Fetches books from Google Books API for a given search query.
 * Returns normalized book objects ready for DB insertion.
 */
async function fetchBooksFromGoogle(query, genre, maxResults = 10) {
  try {
    const startIndex = Math.floor(Math.random() * 20); // Random offset for variety
    const url = `https://www.googleapis.com/books/v1/volumes?q=${encodeURIComponent(query)}&maxResults=${maxResults}&startIndex=${startIndex}&langRestrict=en&orderBy=relevance&printType=books`;
    
    const response = await axios.get(url, { timeout: 10000 });

    if (!response.data?.items) {
      return [];
    }

    return response.data.items
      .filter(item => {
        const info = item.volumeInfo;
        // Only include books with a title, at least one author, and a description
        return info?.title && info?.authors?.length > 0 && info?.description;
      })
      .map(item => {
        const info = item.volumeInfo;
        
        // Extract ISBN
        const isbnObj = info.industryIdentifiers?.find(i => i.type === 'ISBN_13') ||
                        info.industryIdentifiers?.find(i => i.type === 'ISBN_10');
        const isbn = isbnObj?.identifier || '';

        // Get best available cover URL
        // Priority: OpenLibrary high-res (if ISBN exists) > Google thumbnail
        let coverUrl = '';
        if (isbn) {
          coverUrl = `https://covers.openlibrary.org/b/isbn/${isbn}-L.jpg`;
        } else if (info.imageLinks?.thumbnail) {
          coverUrl = info.imageLinks.thumbnail
            .replace('http:', 'https:')
            .replace('zoom=1', 'zoom=2'); // Request higher quality
        }

        // Skip books without any cover
        if (!coverUrl) return null;

        return {
          title: info.title,
          author: info.authors.join(', '),
          description: info.description.substring(0, 2000), // Trim long descriptions
          publishedYear: info.publishedDate ? parseInt(info.publishedDate.substring(0, 4)) : null,
          genre: genre,
          isbn: isbn,
          coverUrl: coverUrl,
          pageCount: info.pageCount || 0,
          externalId: item.id,
          source: 'external',
          averageRating: 0,
          totalReviews: 0
        };
      })
      .filter(Boolean); // Remove nulls (books without covers)
  } catch (error) {
    console.error(`  ⚠ Failed to fetch for query "${query}":`, error.message);
    return [];
  }
}

/**
 * Checks if a book already exists in the database by title+author or externalId.
 */
async function isDuplicate(book) {
  const existing = await Book.findOne({
    $or: [
      { externalId: book.externalId },
      ...(book.isbn ? [{ isbn: book.isbn }] : []),
      { title: book.title, author: book.author }
    ]
  });
  return !!existing;
}

/**
 * Main sync function - fetches books from all genres and inserts new ones.
 */
async function syncBooks() {
  console.log('\n📚 ═══════════════════════════════════════════');
  console.log('📚 Automation: Starting book synchronization...');
  console.log('📚 ═══════════════════════════════════════════');
  
  let totalAdded = 0;
  let totalSkipped = 0;

  for (const genre of GENRES) {
    const searchTerms = SEARCH_TERMS[genre] || [`${genre} books`];
    // Pick a random search term for variety each run
    const searchTerm = searchTerms[Math.floor(Math.random() * searchTerms.length)];

    console.log(`\n  📖 Fetching "${genre}" books (query: "${searchTerm}")...`);

    const books = await fetchBooksFromGoogle(searchTerm, genre, 5);
    let genreAdded = 0;

    for (const book of books) {
      try {
        const exists = await isDuplicate(book);
        if (exists) {
          totalSkipped++;
          continue;
        }

        await Book.create(book);
        genreAdded++;
        totalAdded++;
      } catch (err) {
        // Skip books that fail validation (e.g. missing required fields)
        console.error(`  ⚠ Skipped "${book.title}":`, err.message);
      }
    }

    console.log(`  ✅ ${genre}: Added ${genreAdded} new book(s)`);
    
    // Small delay between genres to avoid rate limiting
    await new Promise(resolve => setTimeout(resolve, 1000));
  }

  console.log('\n📚 ═══════════════════════════════════════════');
  console.log(`📚 Automation complete: ${totalAdded} added, ${totalSkipped} duplicates skipped`);
  console.log('📚 ═══════════════════════════════════════════\n');
  
  return { totalAdded, totalSkipped };
}

/**
 * Initialize the automation service.
 * - Runs an initial sync 30 seconds after server start.
 * - Then runs every 6 hours (at minute 0 of hours 0, 6, 12, 18).
 */
export function initAutomation() {
  console.log('🤖 Automation service initialized');
  console.log('   Schedule: Every 6 hours (0:00, 6:00, 12:00, 18:00)');

  // Initial sync shortly after startup (give DB time to be ready)
  setTimeout(async () => {
    console.log('🤖 Running initial book sync...');
    try {
      await syncBooks();
    } catch (err) {
      console.error('🤖 Initial sync failed:', err.message);
    }
  }, 15000); // 15 seconds after start

  // Schedule recurring sync every 6 hours
  cron.schedule('0 */6 * * *', async () => {
    console.log('🤖 Scheduled sync triggered');
    try {
      await syncBooks();
    } catch (err) {
      console.error('🤖 Scheduled sync failed:', err.message);
    }
  });
}

export default { initAutomation, syncBooks };
