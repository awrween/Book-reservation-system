const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Reservation = require('../models/Reservation');
const Book = require('../models/Book');

// @route   GET /api/reservations
// @desc    Get all reservations for a user
// @access  Private
router.get('/', auth, async (req, res) => {
  try {
    const reservations = await Reservation.find({ user: req.user.id }).populate('book');
    res.json(reservations);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   POST /api/reservations
// @desc    Make a new reservation and reduce book availability
// @access  Private
router.post('/', auth, async (req, res) => {
  try {
    const { bookId, startDate, endDate } = req.body;

    const book = await Book.findById(bookId);
    if (!book || book.available <= 0) {
      return res.status(400).json({ msg: 'Book not available for reservation' });
    }

    const newReservation = new Reservation({
      user: req.user.id,
      book: bookId,
      startDate,
      endDate
    });

    await newReservation.save();

    book.available -= 1;
    await book.save();

    res.json(newReservation);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// @route   DELETE /api/reservations/:id
// @desc    Cancel a reservation and update book availability
// @access  Private
router.delete('/:id', auth, async (req, res) => {
  try {
    const reservation = await Reservation.findById(req.params.id);

    if (!reservation) {
      return res.status(404).json({ msg: 'Reservation not found' });
    }

    // Ensure the user owns the reservation
    if (reservation.user.toString() !== req.user.id) {
      return res.status(401).json({ msg: 'Not authorized' });
    }

    // Increment book availability
    const book = await Book.findById(reservation.book);
    if (book) {
      book.available += 1;
      await book.save();
    }

    // Remove reservation
    await reservation.deleteOne();

    res.json({ msg: 'Reservation cancelled' });
  } catch (err) {
    console.error('Cancel reservation error:', err.message);
    res.status(500).send('Server Error');
  }
});

module.exports = router;
