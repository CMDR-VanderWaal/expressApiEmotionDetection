const express = require('express');
const router = express.Router();
const customerEmotionController = require('../controllers/customerEmotionController');
//const validateTokenMiddleware = require('../middleware/validateTokenMiddleware'); // If authentication is needed


// Define API endpoints
router.get('/', customerEmotionController.getAllCustomerEmotions);
router.get('/customer/:customerName', customerEmotionController.getCustomerEmotionByName);
router.get('/date/:startDate/:endDate', customerEmotionController.getCustomerEmotionByDateRange);




// router.get('/',  customerEmotionController.getAllCustomerEmotions);
// router.get('/:documentId', customerEmotionController.getCustomerEmotionById);

module.exports = router;
