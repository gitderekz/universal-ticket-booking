const express = require('express');
const router = express.Router();
const activityController = require('../controllers/activityController');
const authMiddleware = require('../middleware/authMiddleware');

router.get('/', activityController.listActivities);
router.get('/:id', activityController.getActivity);
router.post('/', authMiddleware, activityController.createActivity);

module.exports = router;