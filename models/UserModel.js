import mongoose from "mongoose";

const UserSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },

  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
    index: true
  },

  password: {
    type: String,
    required: true,
    minlength: 6,
    select: false
  },

  role: {
    type: String,
    enum: ["student", "admin"],
    default: "student"
  },

  points: {
    type: Number,
    default: 0
  },

  badges: [{
    type: String
  }],

  avatar: {
    type: String,
    default: ""
  }

}, { timestamps: true });

export default mongoose.model("User", UserSchema);