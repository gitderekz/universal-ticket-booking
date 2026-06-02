// backend/src/routes/role.js
const express = require('express');
const router = express.Router();
const roleController = require('../controllers/roleController');
const authMiddleware = require('../middleware/authMiddleware');

router.get('/', roleController.listRoles);
router.get('/:id', roleController.getRole);
router.post('/', authMiddleware, roleController.createRole);
router.put('/:id', authMiddleware, roleController.updateRole);
router.delete('/:id', authMiddleware, roleController.deleteRole);

module.exports = router;