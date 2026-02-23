const User = require('../models/user.model.js');

const bcrypt = require("bcrypt");
const jwt = require('jsonwebtoken')
const sendEmail = require("../services/email.service.js");
const dotenv = require('dotenv');
const TokenBlacklist = require('../models/tokenBlacklist.model.js');

dotenv.config();


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


    // ✅ Send welcome email (non-blocking style)
    sendEmail(
      email,
      "state Bank of india - Welcome to our banking family!",
      `Hi ${user.name}, your account has been created successfully.`,
      `<h3>Hi ${user.name} 👋</h3><p>Your account has been created successfully.</p>`
    ).catch((err) => {
      console.error("Welcome email failed:", err.message);
    });

    res.status(201).json({
      user: {
        _id: user._id,
        email: user.email,
        name: user.name,
        sendEmail: "Welcome email sent",
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

//logout controller

async function userLogoutController(req, res) {
  try {
    const token = req.cookies.token || req.headers.authorization?.split(" ")[1];
    if (!token) {
      return res.status(400).json({
        msg: "No token provided",
      });
    }
   

    await TokenBlacklist.create({
      token,
    }); 

    res.clearCookie("token");

    res.status(200).json({
      msg: "Logged out successfully",
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
    userLoginController,
    userLogoutController
}