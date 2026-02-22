const Account = require('../models/account.model.js');
const User = require('../models/user.model.js');



// Create a new account

async function createAccountController(req,res){
    try {

    const user = req.user;

    const account = await Account.create({
        user: user._id
    })

    res.status(201).json({
        account
    })
  
    
} catch (error) {
        console.error("Error creating account:", error);
        res.status(500).json({ message: "Internal server error" });
    }
}

module.exports = {
    createAccountController,
};
