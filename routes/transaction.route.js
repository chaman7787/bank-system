const express = require('express');
const {authMiddleware , authSystemUserMiddleware }  = require('../Middleware/auth.middleware.js');

const transactionController = require('../controllers/transaction.controller.js');
const router = express.Router();

// Create a new transaction
router.post('/create', authMiddleware, transactionController.createTransactionController);


//create initial transactions for testing
router.post('/create-initial', authSystemUserMiddleware, transactionController.createInitialFundsTransactions);

module.exports = router;