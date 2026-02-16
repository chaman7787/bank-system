const User = require('../models/user.model.js');
const bcrypt = require("bcrypt");
const jwt = require('jsonwebtoken')
require('dotenv').config();
/* user register controller*/

async function userRegisterController(req, res) {
  try {
    const { email, name, password } = req.body;

    // Check existing user
    const isExist = await User.findOne({ email: email });
    if (isExist) {
      return res.status(422).json({
        msg: "User already exists with this email",
        status: "failed",
      });
    }

    // 🔐 Hash password
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Create user with hashed password
    const user = await User.create({
      email,
      name,
      password: hashedPassword,
    });

    // Generate JWT
    const token = jwt.sign(
      { userId: user._id },
      process.env.JWT_SECRET,
      { expiresIn: "3d" }
    );

    res.cookie("token", token, {
      httpOnly: true,
      secure: false, // true in production (HTTPS)
    });

    res.status(201).json({
      user: {
        _id: user._id,
        email: user.email,
        name: user.name,
      },
      token,
    });

  } catch (error) {
    res.status(500).json({
      msg: "Internal server error",
      error: error.message,
    });
  }
}

// login controller

async function userLoginController(req, res) {
  console.log(req.body);
  try {
    const { email, password } = req.body; 
    const user = await User.findOne({ email }).select("+password");

    if (!user) {
      return res.status(401).json({
        msg: "Invalid email or password",
        status: "failed",
      });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({
        msg: "Invalid email or password",
        status: "failed",
      });
    } 
    const token = jwt.sign(
      { userId: user._id },
      process.env.JWT_SECRET,
      { expiresIn: "3d" }
    );
    res.cookie("token", token, {
      httpOnly: true,
      secure: false, // true in production (HTTPS)
    }); 
    res.status(200).json({
      user: {
        _id: user._id,
        email: user.email,
        name: user.name,
      },
      token,
    }); 
      
 
}
catch (error) {
    res.status(500).json({
      msg: "Internal server error",
      error: error.message,
    });
  }
}


module.exports ={
    userRegisterController,
    userLoginController
}