import mongoose from "mongoose";

const CommentSchema = new mongoose.Schema({
  content: {
    type: String,
    required: true
  },

  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
    index: true
  },

  parentType: {
    type: String,
    required: true,
    enum: ["Post", "Answer"]
  },

  parentId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    refPath: "parentType",
    index: true
  },

  isDeleted: {
    type: Boolean,
    default: false
  }

}, { timestamps: true });

export default mongoose.model("Comment", CommentSchema);