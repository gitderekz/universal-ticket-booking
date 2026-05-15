const express = require('express');
const router = express.Router();
const facilityController = require('../controllers/facilityController');
const authMiddleware = require('../middleware/authMiddleware');

// Facility routes
router.get('/', facilityController.listFacilities);
router.get('/:id', facilityController.getFacility);
router.post('/', authMiddleware, facilityController.createFacility);
router.put('/:id', authMiddleware, facilityController.updateFacility);
router.delete('/:id', authMiddleware, facilityController.deleteFacility);

// Activity routes
router.get('/activities/list', facilityController.listActivities);
router.get('/activities/:id', facilityController.getActivity);
router.post('/activities', authMiddleware, facilityController.createActivity);
router.put('/activities/:id', authMiddleware, facilityController.updateActivity);
router.delete('/activities/:id', authMiddleware, facilityController.deleteActivity);

// Activity Instance routes
router.get('/instances/list', facilityController.listActivityInstances);
router.get('/instances/:id', facilityController.getActivityInstance);
router.post('/instances', authMiddleware, facilityController.createActivityInstance);
router.put('/instances/:id', authMiddleware, facilityController.updateActivityInstance);
router.delete('/instances/:id', authMiddleware, facilityController.deleteActivityInstance);

module.exports = router;