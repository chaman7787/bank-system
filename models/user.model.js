const mongoose = require('mongoose');
const bcrypt = require("bcrypt");

const userSchema = new mongoose.Schema({
name: {type: String, required: true }, 
email: { type: String,
     required: true,
      unique: [true ,"email already exists."],
      trim : true,
      lowercase: true,
      
     }, 
password: { type: String, 
    required: [true,"password must be required"],
    minlength: [6,"password should contain 6 character"],
    select:false
}, 

},
{
    timestamps: true
});

const User = mongoose.model('User', userSchema);
module.exports = User;