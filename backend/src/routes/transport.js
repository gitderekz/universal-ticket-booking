const express = require('express');
const router = express.Router();
const transportController = require('../controllers/transportController');
const authMiddleware = require('../middleware/authMiddleware');

router.get('/', transportController.listTransports);
router.post('/', authMiddleware, transportController.createTransport);

module.exports = router;
