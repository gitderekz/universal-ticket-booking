const express = require('express');
const router = express.Router();
const companyController = require('../controllers/companyController');
const authMiddleware = require('../middleware/authMiddleware');

router.get('/', companyController.listCompanies);
router.post('/', authMiddleware, companyController.createCompany);

module.exports = router;
