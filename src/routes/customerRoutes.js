const express = require('express');
const router = express.Router();
const customerController = require('../controllers/customerController');

// Route for fetching all customer data
router.get('/', customerController.getAllCustomersData);

// Route for getting all customers
router.get('/list', customerController.getAllCustomers);

// Routes for individual customer data
router.get('/specific/:customerName', customerController.getCustomerDataByName);
router.delete('/specific/:customerName', customerController.deleteCustomerData);

module.exports = router;
