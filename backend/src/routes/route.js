const express = require('express');
const router = express.Router();
const routeController = require('../controllers/routeController');
const authMiddleware = require('../middleware/authMiddleware');

router.get('/', routeController.listRoutes);
router.post('/', authMiddleware, routeController.createRoute);

module.exports = router;
