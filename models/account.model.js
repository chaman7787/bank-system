const mongoose = require("mongoose");
const Leadger = require("../models/leadger.model.js");

const accountSchema = new mongoose.Schema({
    user:{
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
        index: true,
    },
     accountNumber: {
        type: String,
        unique: true,
        required: true,
    },
    status: {
        type: String,
        enum: ["ACTIVE", "INACTIVE", "CLOSED"],
        default: "ACTIVE",
    },
   
    currency: {
        type: String,
        default: "INR",
    },
},
{
    timestamps: true,
});     

accountSchema.index({ user: 1,status: 1 });

accountSchema.methods.getBalance = async function() {
    const BalanceData = await Leadger.aggregate([
        { $match: { account: this._id } },
        { $group: { 
            _id: null, 
            totalDebit: {
                 $sum: { $cond: [ { $eq: ["$type", "DEBIT"] }, "$amount", 0 ] }
                },
            totalCredit: {
                 $sum: { $cond: [ { $eq: ["$type", "CREDIT"] }, "$amount", 0 ] }
                },
        } },
        {
            $project: {
                _id: 0,
                balance: { $subtract: ["$totalCredit", "$totalDebit"] }
            }
        }
           
    ])

    if(BalanceData.length === 0){
        return 0;
    }
    return BalanceData[0].balance;
}

const Account = mongoose.model("Account", accountSchema);
module.exports = Account;