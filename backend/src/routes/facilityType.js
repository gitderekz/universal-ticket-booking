// backend/src/routes/facilityType.js
const express = require('express');
const router = express.Router();
const facilityTypeController = require('../controllers/facilityTypeController');
const authMiddleware = require('../middleware/authMiddleware');

router.get('/', facilityTypeController.listFacilityTypes);
router.post('/', authMiddleware, facilityTypeController.createFacilityType);
router.put('/:id', authMiddleware, facilityTypeController.updateFacilityType);
router.delete('/:id', authMiddleware, facilityTypeController.deleteFacilityType);

module.exports = router;