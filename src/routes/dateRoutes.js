const express = require('express');
const router = express.Router();
const dateController = require('../controllers/dateController');

router.get('/:storeId/:startDate/:endDate', dateController.getDateRangeData);

module.exports = router;
