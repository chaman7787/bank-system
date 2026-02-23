const express = require('express');
const { authMiddleware } = require('../Middleware/auth.middleware.js');
const accountController = require('../controllers/account.controller.js');

const router = express.Router();

console.log('authMiddleware:', typeof authMiddleware);
console.log('createAccountController:', typeof accountController.createAccountController);
console.log('getAllAccountsController:', typeof accountController.getAllAccountsController);

// Create a new account
router.post('/create', authMiddleware,accountController.createAccountController);

//get all  accounts of login user

router.get('/all', authMiddleware,accountController.getAllAccountsController);

//get api to check particular account details of login user
// Get account balance for a specific account of the logged-in user
router.get('/balance/:accountId', authMiddleware, accountController.getAccountBalanceController);








module.exports = router;