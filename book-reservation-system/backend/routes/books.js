const express = require('express');
const router = express.Router();
const isAdmin = require('../middleware/isAdmin');
const Book = require('../models/Book');
const auth = require('../middleware/auth');

// @route   GET /api/books
// @desc    Get all books
// @access  Public
router.get('/', async (req, res) => {
  try {
    const books = await Book.find().sort({ date: -1 });
    res.json(books);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   GET /api/books/:id
// @desc    Get book by ID
// @access  Public
router.get('/:id', async (req, res) => {
  try {
    const book = await Book.findById(req.params.id);
    if (!book) {
      return res.status(404).json({ msg: 'Book not found' });
    }
    res.json(book);
  } catch (err) {
    console.error(err.message);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ msg: 'Book not found' });
    }
    res.status(500).send('Server Error');
  }
});

// @route   POST /api/books
// @desc    Add a new book (admin only)
// @access  Private
router.post('/', auth, isAdmin, async (req, res) => {
  try {
    const { title, author, isbn, quantity } = req.body;

    const newBook = new Book({
      title,
      author,
      isbn,
      quantity,
      available: quantity
    });

    const book = await newBook.save();
    res.json(book);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   DELETE /api/books/:id
// @desc    Delete a book by ID (admin only)
// @access  Private
router.delete('/:id', auth, isAdmin, async (req, res) => {
  try {
    const book = await Book.findByIdAndDelete(req.params.id);

    if (!book) {
      return res.status(404).json({ msg: 'Book not found' });
    }

    res.json({ msg: 'Book removed' });
  } catch (err) {
    console.error('Delete book failed:', err.message);
    res.status(500).send('Server Error');
  }
});

module.exports = router;
