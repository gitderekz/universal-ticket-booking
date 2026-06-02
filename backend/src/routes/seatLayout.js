// backend/src/routes/seatLayout.js
const express = require('express');
const router = express.Router();
const seatLayoutController = require('../controllers/seatLayoutController');
const authMiddleware = require('../middleware/authMiddleware');

router.get('/', seatLayoutController.listSeatLayouts);
router.get('/:id', seatLayoutController.getSeatLayout);
router.post('/', authMiddleware, seatLayoutController.createSeatLayout);
router.put('/:id', authMiddleware, seatLayoutController.updateSeatLayout);
router.delete('/:id', authMiddleware, seatLayoutController.deleteSeatLayout);

module.exports = router;