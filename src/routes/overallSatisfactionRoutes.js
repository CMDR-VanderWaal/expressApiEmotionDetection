const express = require('express');
const router = express.Router();
const overallSatisfactionController = require('../controllers/overallSatisfactionController');

router.get('/', overallSatisfactionController.getOverallSatisfactionData);

module.exports = router;