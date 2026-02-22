const Transaction = require('../models/transaction.model.js');
const Leadger = require('../models/leadger.model.js');
const Account = require('../models/account.model.js');
const sendEmail = require("../services/email.service.js");
const mongoose = require('mongoose');

async function createTransactionController(req, res) {
    try {

        //validate user authentication
        const { fromAccount, toAccount, amount, idempotencyKey } = req.body;

        // Validate input
        if (!fromAccount || !toAccount || !amount || !idempotencyKey) {
            return res.status(400).json({ message: "Missing required fields" });
        }       
        // Check if accounts exist

        const fromAcc = await Account.findOne({
            _id: fromAccount,
        })

        const toAcc = await Account.findOne({
            _id: toAccount,
        })

        if(!fromAcc || !toAcc){
            return res.status(404).json({ message: "One or both accounts not found" });
        }


    // validate idempotency key
        const isTransactionAlreadyExists = await Transaction.findOne({ idempotencyKey : idempotencyKey });
        if (isTransactionAlreadyExists.status === "COMPLETED") {
            return res.status(400).json({ 
                message: "Transaction with this idempotency key already exists",
                transaction: isTransactionAlreadyExists,
             });
        }

        if(isTransactionAlreadyExists.status === "PENDING"){
            return res.status(400).json({ 
                message: "Transaction with this idempotency key is already in progress",
                transaction: isTransactionAlreadyExists,
             });
        }
        if(isTransactionAlreadyExists.status === "FAILED"){
            return res.status(400).json({ 
                message: "Transaction with this idempotency key has failed. Please try again with a new idempotency key.",
             });
        }

        if(isTransactionAlreadyExists.status === "REVERSED"){
            return res.status(400).json({ 
                message: "Transaction with this idempotency key has been reversed. Please try again with a new idempotency key.",
             });
        }


        //check account status

        if(fromAcc.status !== "ACTIVE" || toAcc.status !== "ACTIVE"){
            return res.status(400).json({ message: "Both accounts must be active to perform a transaction" });
        }


        //check sufficient balance
        const balance = await fromAcc.getBalance();
        if(balance < amount){
            return res.status(400).json({ message: `Insufficient balance in the from account . Current balance is ${balance} and requested amount is ${amount}`});

        }


        //create transaction
        const session = await mongoose.startSession();
        session.startTransaction();


        const transaction = new Transaction.create({
            fromAccount,
            toAccount,
            amount,
            idempotencyKey,
            status: "PENDING",
        }, { session });

        const debitLeadgerEntry = new Leadger.create({  
            account: fromAccount,
            type: "DEBIT",
            amount,
        }, { session });


        const creditLeadgerEntry = new Leadger.create({
            account: toAccount,
            type: "CREDIT",
            amount,
        }, { session });

        transaction.status = "COMPLETED";
        await transaction.save({ session });


        await session.commitTransaction();
        session.endSession();


        //send email notification to both account holders
        const fromUserEmail = fromAcc.user.email;
        const toUserEmail = toAcc.user.email;
        
        await sendEmail(fromUserEmail, "Transaction Alert", `An amount of ${amount} has been debited from your account ${fromAccount}. Transaction ID: ${transaction._id}`);
        await sendEmail(toUserEmail, "Transaction Alert", `An amount of ${amount} has been credited to your account ${toAccount}. Transaction ID: ${transaction._id}`); 
        return res.status(201).json({ message: "Transaction completed successfully", transaction });

            
            
        

}catch (error) {
        console.error("Error creating transaction:", error);
        res.status(500).json({ message: "Internal server error" });
    }
}


async function createInitialFundsTransactions(req, res) {

try {
          const { toAccount, amount, idempotencyKey } = req.body

    if (!toAccount || !amount || !idempotencyKey) {
        return res.status(400).json({
            message: "toAccount, amount and idempotencyKey are required"
        })
    }

    const toUserAccount = await Account.findOne({
        _id: toAccount,
    })

    if (!toUserAccount) {
        return res.status(400).json({
            message: "Invalid toAccount"
        })
    }

    const fromUserAccount = await Account.findOne({
        user: req.user._id
    })

    if (!fromUserAccount) {
        return res.status(400).json({
            message: "System user account not found"
        })
    }


    const session = await mongoose.startSession()
    session.startTransaction()

    const transaction = new Transaction({
        fromAccount: fromUserAccount._id,
        toAccount,
        amount,
        idempotencyKey,
        status: "PENDING"
    })

    const debitLedgerEntry = await  Leadger.create([ {
        account: fromUserAccount._id,
        amount: amount,
        transaction: transaction._id,
        type: "DEBIT"
    } ], { session })

    const creditLedgerEntry = await Leadger.create([ {
        account: toAccount,
        amount: amount,
        transaction: transaction._id,
        type: "CREDIT"
    } ], { session })

    transaction.status = "COMPLETED"
    await transaction.save({ session })

    await session.commitTransaction()
    session.endSession()

    return res.status(201).json({
        message: "Initial funds transaction completed successfully",
        transaction: transaction
    })
}catch (error) {
        console.error("Error creating initial transactions:", error);
        res.status(500).json({ message: "Internal server error" });
    }
}

module.exports = {
    createTransactionController,
    createInitialFundsTransactions
};