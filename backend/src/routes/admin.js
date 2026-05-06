const express = require('express');
const router = express.Router();

router.get('/', (req, res) => {
  res.json({ message: 'Admin routes are not implemented yet.' });
});

module.exports = router;
