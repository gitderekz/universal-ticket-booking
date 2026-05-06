const express = require('express');
const router = express.Router();
const seatHoldController = require('../controllers/seatHoldController');
const authMiddleware = require('../middleware/authMiddleware');

router.post('/hold', authMiddleware, seatHoldController.holdSeats);
router.post('/release', authMiddleware, seatHoldController.releaseSeats);
router.get('/:journey_id/availability', seatHoldController.getAvailability);

module.exports = router;
