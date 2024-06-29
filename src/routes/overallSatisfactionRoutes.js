const express = require('express');
const router = express.Router();
const overallSatisfactionController = require('../controllers/overallSatisfactionController');

router.get('/:storeId', overallSatisfactionController.getOverallSatisfactionData);

module.exports = router;
