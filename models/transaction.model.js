const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema({
   fromAccount: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Account",
        required: true,
        
    },
    toAccount: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Account",
        required: true,
       
    },
    amount: {
        type: Number,
        required: true, 
    },
    status: {
        type: String,
        enum: ["PENDING", "COMPLETED", "FAILED","REVERSED"],
        default: "PENDING",
    },
    idempotencyKey: {
        type: String,
        required: true,
        unique: true,
    },
},
{
    timestamps: true,
});

transactionSchema.index({ fromAccount: 1 });
transactionSchema.index({ toAccount: 1 });  
transactionSchema.index({ idempotencyKey: 1 });

const Transaction = mongoose.model("Transaction", transactionSchema);
module.exports = Transaction;