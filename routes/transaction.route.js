const express = require('express');
const authMiddleware = require('../Middleware/auth.middleware.js');
const authSystemUserMiddleware = require('../Middleware/auth.middleware.js');
const transactionController = require('../controllers/transaction.controller.js');
const router = express.Router();

// Create a new transaction
router.post('/create', authMiddleware, transactionController.createTransactionController);


//create initial transactions for testing
router.post('/create-initial', authSystemUserMiddleware, transactionController.createInitialTransactions);

module.exports = router;