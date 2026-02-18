const mongoose = require("mongoose");

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
        enum: ["active", "inactive", "closed"],
        default: "active",
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

const Account = mongoose.model("Account", accountSchema);
module.exports = Account;