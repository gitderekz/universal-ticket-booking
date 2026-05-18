const express = require('express');
const router = express.Router();
const journeyController = require('../controllers/journeyController');
const authMiddleware = require('../middleware/authMiddleware');

router.get('/search', journeyController.searchJourneys);
router.get('/by-route', journeyController.getJourneysByRoute);
router.get('/:id', journeyController.getJourney);
router.post('/', authMiddleware, journeyController.createJourney);
router.put('/:id', authMiddleware, journeyController.updateJourney);
router.delete('/:id', authMiddleware, journeyController.deleteJourney);

module.exports = router;
