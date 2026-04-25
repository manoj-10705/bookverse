# BookVerse

A modern, full-stack web application designed for book enthusiasts to discover, review, and manage their reading experiences. Built with the MERN stack (MongoDB, Express.js, React, Node.js) and styled with Tailwind CSS, BookVerse offers a seamless, responsive, and secure platform for managing a digital library.

## Key Features

- **Discover & Search:** Advanced search capabilities to explore books by title, author, or genre.
- **Community Reviews:** Rate books, write reviews, and read what others think.
- **User Authentication:** Secure JWT-based registration and login system with encrypted credentials.
- **Personalized Profiles:** Manage your account, track your reviews, and customize your reading preferences.

## Technology Stack

- **Frontend:** React 19, TypeScript, Vite, Tailwind CSS, Framer Motion
- **Backend:** Node.js, Express.js, JWT, Express-Validator
- **Database:** MongoDB, Mongoose

## Quick Setup

1. **Clone & Install Dependencies**
   ```bash
   git clone <repo-url>
   cd bookverse
   npm install
   npm run server:install
   ```

2. **Environment Configuration**
   Create a `.env` file in the `server` directory using `.env.example` as a template:
   ```bash
   MONGODB_URI=your_mongodb_uri
   JWT_SECRET=your_jwt_secret
   PORT=5000
   ```
   > **Note:** Never commit `.env` files to version control.

3. **Run Development Servers**
   ```bash
   npm run dev
   ```
   *Frontend running on http://localhost:5173 | Backend running on http://localhost:5000*

## License

This project is licensed under the MIT License.
