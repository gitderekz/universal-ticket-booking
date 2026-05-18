const express = require('express');
const router = express.Router();
const routeController = require('../controllers/routeController');
const authMiddleware = require('../middleware/authMiddleware');

router.get('/', routeController.listRoutes);
router.post('/', authMiddleware, routeController.createRoute);
router.put('/:id', authMiddleware, routeController.updateRoute);
router.delete('/:id', authMiddleware, routeController.deleteRoute);

module.exports = router;
