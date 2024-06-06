const express = require('express');
const router = express.Router();
const dateController = require('../controllers/dateController');

router.get('/:startDate/:endDate', dateController.getDateRangeData);

module.exports = router;