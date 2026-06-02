// backend/src/routes/transportType.js
const express = require('express');
const router = express.Router();
const transportTypeController = require('../controllers/transportTypeController');
const authMiddleware = require('../middleware/authMiddleware');

router.get('/', transportTypeController.listTransportTypes);
router.post('/', authMiddleware, transportTypeController.createTransportType);
router.put('/:id', authMiddleware, transportTypeController.updateTransportType);
router.delete('/:id', authMiddleware, transportTypeController.deleteTransportType);

module.exports = router;