const mongoose = require('mongoose');
const Transaction = require('./transaction.model');

const leadgerSchema = new mongoose.Schema({
    account: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Account",
        required: true,
        index: true,
        immutable: true,
    },
    amount: {
        type: Number,
        required: true,
        immutable: true,
    },
    transaction:{
        type: mongoose.Schema.Types.ObjectId,
        ref: "Transaction",
        required: true,
        index: true,
        immutable: true,
  },
    type: {
        type: String,
        enum: ["DEBIT", "CREDIT"],
        required: true,
        immutable: true,
    },
},
{
    timestamps: true,
}); 


function preventleadgerModification() {
    throw new Error("Leadger entries cannot be modified or deleted");
}
leadgerSchema.pre('findOneAndUpdate', preventleadgerModification);
leadgerSchema.pre('updateOne', preventleadgerModification);
leadgerSchema.pre('deleteOne', preventleadgerModification);
leadgerSchema.pre('deleteMany', preventleadgerModification);
leadgerSchema.pre('findOneAndDelete', preventleadgerModification);
leadgerSchema.pre('findOneAndRemove', preventleadgerModification);
leadgerSchema.pre("updateMany", preventleadgerModification);
 

const Leadger = mongoose.model("Leadger", leadgerSchema);
module.exports = Leadger;

