const mongoose = require('mongoose');

const tokenBlacklistSchema = new mongoose.Schema({
    token: {
        type: String,
        required: true,
        unique: true,
    },
  
},
{
    timestamps: true,
});


tokenBlacklistSchema.index({ createdAt: 1 }, {
    expireAfterSeconds: 60 * 60 * 24 * 3 // 3 days
})
const TokenBlacklist = mongoose.model("TokenBlacklist", tokenBlacklistSchema);
module.exports = TokenBlacklist;
