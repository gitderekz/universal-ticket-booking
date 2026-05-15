const express = require('express');
const router = express.Router();
const activityInstanceController = require('../controllers/activityInstanceController');
const authMiddleware = require('../middleware/authMiddleware');

router.get('/', activityInstanceController.listActivityInstances);
router.get('/:id', activityInstanceController.getActivityInstance);
router.post('/', authMiddleware, activityInstanceController.createActivityInstance);

module.exports = router;