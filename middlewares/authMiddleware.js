import jwt from "jsonwebtoken";
import UserModel from "../models/UserModel.js";

const authMiddleware = async (req, res, next) => {
  try {
    // ✅ Get token from cookie OR header
    let token = req.cookies?.token;

    if (!token && req.headers.authorization) {
      token = req.headers.authorization.split(" ")[1]; // Bearer token
    }
    console.log(token);

    // ❌ No token
    if (!token) {
      return res.status(401).json({
        success: false,
        message: "No token, authorization denied"
      });
    }

    // ✅ Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // ✅ Attach user safely
    req.user = {
      _id: decoded._id
    };
    console.log("Authenticated user ID:", req.user._id);

    next();

  } catch (error) {
    console.error("Auth Error:", error.message);

    if (error.name === "TokenExpiredError") {
      return res.status(401).json({
        success: false,
        message: "Token expired"
      });
    }

    return res.status(401).json({
      success: false,
      message: "Invalid token"
    });
  }
};

export default authMiddleware;