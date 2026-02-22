const express = require('express');
const {authMiddleware}  = require('../Middleware/auth.middleware.js');
const accountController = require('../controllers/account.controller.js');

const router = express.Router();

// Create a new account
router.post('/create', authMiddleware,accountController.createAccountController);





module.exports = router;