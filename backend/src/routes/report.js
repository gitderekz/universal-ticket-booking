const express = require('express');
const router = express.Router();

router.get('/', (req, res) => {
  res.json({ message: 'Report routes are not implemented yet.' });
});

module.exports = router;
