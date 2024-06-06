const express = require('express');
const router = express.Router();
const customerController = require('../controllers/customerController');

router.get('/', customerController.getAllCustomersData);
router.get('/:customerName', customerController.getCustomerDataByName);
router.get('/list', customerController.getAllCustomers);

module.exports = router;