const express = require('express');
const router = express.Router();
const bookingController = require('../controllers/bookingController');
const authMiddleware = require('../middleware/authMiddleware');

router.get('/', authMiddleware, bookingController.listBookings);
router.post('/', authMiddleware, bookingController.createBooking);
router.patch('/:id/status', authMiddleware, bookingController.updateBookingStatus);

module.exports = router;

