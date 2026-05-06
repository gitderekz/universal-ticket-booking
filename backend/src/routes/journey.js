const express = require('express');
const router = express.Router();
const journeyController = require('../controllers/journeyController');

router.get('/search', journeyController.searchJourneys);
router.get('/:id', journeyController.getJourney);

module.exports = router;
