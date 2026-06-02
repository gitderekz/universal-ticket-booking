// backend/src/routes/station.js
const express = require('express');
const router = express.Router();
const stationController = require('../controllers/stationController');
const authMiddleware = require('../middleware/authMiddleware');

router.get('/', stationController.listStations);
router.get('/:id', stationController.getStation);
router.post('/', authMiddleware, stationController.createStation);
router.put('/:id', authMiddleware, stationController.updateStation);
router.delete('/:id', authMiddleware, stationController.deleteStation);

module.exports = router;