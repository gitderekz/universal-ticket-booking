const express = require('express');
const router = express.Router();
const paymentController = require('../controllers/paymentController');
const authMiddleware = require('../middleware/authMiddleware');

router.post('/process', authMiddleware, paymentController.processPayment);
router.get('/booking/:bookingId', authMiddleware, paymentController.getPaymentByBooking);
router.get('/verify/:transactionReference', authMiddleware, paymentController.verifyPayment);
router.post('/callback/mpesa', paymentController.handleMPesaCallback);

module.exports = router;
