const express = require('express');
const authController = require("../controllers/auth.controller.js");
const router = express.Router();


// register route
router.post("/register",authController.userRegisterController)

// login route
router.post("/login",authController.userLoginController)

// logout route
router.post("/logout",authController.userLogoutController)

module.exports = router;
