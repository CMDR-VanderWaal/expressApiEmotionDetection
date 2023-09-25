const express = require('express');
const router = express.Router();
const customerEmotionController = require('../controllers/customerEmotionController');
const validateTokenMiddleware = require('../middleware/validateTokenMiddleware'); // If authentication is needed

// Define API endpoints
router.get('/', validateTokenMiddleware, customerEmotionController.getAllCustomerEmotions);
router.get('/:documentId', validateTokenMiddleware, customerEmotionController.getCustomerEmotionById);

module.exports = router;
