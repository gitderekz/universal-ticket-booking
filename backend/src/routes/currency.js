// backend/src/routes/currency.js
const express = require('express');
const router = express.Router();
const currencyController = require('../controllers/currencyController');
const authMiddleware = require('../middleware/authMiddleware');

router.get('/', currencyController.listCurrencies);
router.get('/:id', currencyController.getCurrency);
router.post('/', authMiddleware, currencyController.createCurrency);
router.put('/:id', authMiddleware, currencyController.updateCurrency);
router.delete('/:id', authMiddleware, currencyController.deleteCurrency);

module.exports = router;