const Transaction = require('../models/transaction.model.js');
const Leadger = require('../models/leadger.model.js');
const Account = require('../models/account.model.js');
const sendEmail = require("../services/email.service.js");
const mongoose = require('mongoose');

async function createTransactionController(req, res) {
  try {

    const { fromAccount, toAccount, amount, idempotencyKey } = req.body;

    if (!fromAccount || !toAccount || !amount || !idempotencyKey) {
      return res.status(400).json({
        message: "FromAccount, toAccount, amount and idempotencyKey are required"
      });
    }

    const fromUserAccount = await Account.findOne({ _id: fromAccount });
    const toUserAccount = await Account.findOne({ _id: toAccount });

    if (!fromUserAccount || !toUserAccount) {
      return res.status(400).json({
        message: "Invalid fromAccount or toAccount"
      });
    }

    const isTransactionAlreadyExists = await Transaction.findOne({
      idempotencyKey: idempotencyKey
    });

    if (isTransactionAlreadyExists) {
      if (isTransactionAlreadyExists.status === "COMPLETED") {
        return res.status(200).json({
          message: "Transaction already processed",
          transaction: isTransactionAlreadyExists
        });
      }

      if (isTransactionAlreadyExists.status === "PENDING") {
        return res.status(200).json({
          message: "Transaction is still processing"
        });
      }

      return res.status(400).json({
        message: `Transaction status is ${isTransactionAlreadyExists.status}`
      });
    }

    if (fromUserAccount.status !== "ACTIVE" || toUserAccount.status !== "ACTIVE") {
      return res.status(400).json({
        message: "Both accounts must be ACTIVE"
      });
    }

    const balance = await fromUserAccount.getBalance();

    if (balance < amount) {
      return res.status(400).json({
        message: `Insufficient balance. Current balance is ${balance}`
      });
    }

    let transaction;
    const session = await mongoose.startSession();

    try {

      await session.startTransaction();

      transaction = (await Transaction.create([{
        fromAccount,
        toAccount,
        amount,
        idempotencyKey,
        status: "PENDING"
      }], { session }))[0];

      await Leadger.create([{
        account: fromAccount,
        amount,
        transaction: transaction._id,
        type: "DEBIT"
      }], { session });

      // ❌ REMOVED 15 second delay (IMPORTANT FIX)

      await Leadger.create([{
        account: toAccount,
        amount,
        transaction: transaction._id,
        type: "CREDIT"
      }], { session });

      await Transaction.findOneAndUpdate(
        { _id: transaction._id },
        { status: "COMPLETED" },
        { session }
      );

      await session.commitTransaction();
      session.endSession();

      // ✅ ADDED SUCCESS RESPONSE (IMPORTANT FIX)
      return res.status(201).json({
        message: "Transaction completed successfully",
        transaction
      });

    } catch (error) {

      // ✅ ADDED ABORT + END SESSION
      await session.abortTransaction();
      session.endSession();

      console.error("Transaction Error:", error);

      return res.status(500).json({
        message: "Transaction failed, please retry"
      });
    }

  } catch (error) {
    console.error("Error creating transaction:", error);
    return res.status(500).json({ message: "Internal server error" });
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