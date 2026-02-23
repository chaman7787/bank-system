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


async function getAllAccountsController(req,res){
    try {
        const user = req.user;
        const accounts = await Account.find({
            user: user._id
        })
        res.status(200).json({
            accounts
        })
    } catch (error) {
        console.error("Error fetching accounts:", error);
        res.status(500).json({ message: "Internal server error" });
    }
}

//get api to check particular account details of login user
async function getAccountBalanceController(req, res) {
    try {
          const { accountId } = req.params;

    const account = await Account.findOne({
        _id: accountId,
        user: req.user._id
    })

    if (!account) {
        return res.status(404).json({
            message: "Account not found"
        })
    }

    const balance = await account.getBalance();

    res.status(200).json({
        accountId: account._id,
        balance: balance
    })
    } catch (error) {
        console.error("Error fetching account balance:", error);
        res.status(500).json({ message: "Internal server error" });
    }
}

module.exports = {
    createAccountController,
    getAllAccountsController,
    getAccountBalanceController
};
