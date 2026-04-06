import UserModel from "../models/UserModel.js";
import bcrypt from "bcrypt";
import generateToken from "../util/genToken.js";

// 🔐 REGISTER USER
const registerUser = async (req, res) => {
  try {
    let { name, email, password } = req.body;

    // Normalize safely
    name = typeof name === "string" ? name.trim() : "";
    email = typeof email === "string" ? email.toLowerCase().trim() : "";

    // Validation
    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: "All fields are required"
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: "Password must be at least 6 characters"
      });
    }

    // Check existing user
    const existingUser = await UserModel.findOne({ email }).lean();
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: "Email already registered"
      });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const newUser = await UserModel.create({
      name,
      email,
      password: hashedPassword
    });

    // Generate token safely
    let token;
    try {
      token = generateToken({ _id: newUser._id });
    } catch (err) {
      console.error("Token Error:", err.message);
      return res.status(500).json({
        success: false,
        message: "Token generation failed"
      });
    }

    // Remove password without extra DB hit
    const user = newUser.toObject();
    delete user.password;

    // Set cookie
    res.cookie("token", token, {
      httpOnly: true,
      secure: false,//process.env.NODE_ENV === "production",
      sameSite: "Lax",
      maxAge: 7 * 24 * 60 * 60 * 1000
    });

    return res.status(201).json({
      success: true,
      user
    });

  } catch (error) {
    console.error("Register Error:", error.message);

    // Handle duplicate key explicitly
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: "Email already exists"
      });
    }

    return res.status(500).json({
      success: false,
      message: "Server error"
    });
  }
};



// 🔑 LOGIN USER
const loginUser = async (req, res) => {
  try {
    let { email, password } = req.body;

    email = typeof email === "string" ? email.toLowerCase().trim() : "";

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Email and password required"
      });
    }

    const user = await UserModel.findOne({ email }).select("+password");

    if (!user) {
      return res.status(400).json({
        success: false,
        message: "Invalid credentials"
      });
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(400).json({
        success: false,
        message: "Invalid credentials"
      });
    }

    let token;
    try {
      token = generateToken({ _id: user._id });
    } catch (err) {
      console.error("Token Error:", err.message);
      return res.status(500).json({
        success: false,
        message: "Token generation failed"
      });
    }

    // Remove password safely
    const safeUser = user.toObject();
    delete safeUser.password;

    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "Strict",
      maxAge: 7 * 24 * 60 * 60 * 1000
    });

    return res.status(200).json({
      success: true,
      user: safeUser
    });

  } catch (error) {
    console.error("Login Error:", error.message);

    return res.status(500).json({
      success: false,
      message: "Server error"
    });
  }
};



// 👤 GET PROFILE
const getUserProfile = async (req, res) => {
  try {
    console.log("User ID from token:", req.user?._id);
    if (!req.user?._id) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized"
      });
    }

    const user = await UserModel.findById(req.user._id).select("-password");

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found"
      });
    }

    return res.status(200).json({
      success: true,
      user
    });

  } catch (error) {
    console.error("Profile Error:", error.message);

    return res.status(500).json({
      success: false,
      message: "Server error"
    });
  }
};

export { registerUser, loginUser, getUserProfile };