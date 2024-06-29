const express = require('express');
const router = express.Router();
const customerController = require('../controllers/customerController');

// Route for fetching all customer data for a specific store
router.get('/:storeId', customerController.getAllCustomersData);

// Route for getting all customers for a specific store
router.get('/:storeId/list', customerController.getAllCustomers);

// Routes for individual customer data
router.get('/:storeId/specific/:customerName', customerController.getCustomerDataByName);
router.delete('/:storeId/specific/:customerName', customerController.deleteCustomerData);

module.exports = router;
