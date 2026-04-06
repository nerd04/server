import mongoose from "mongoose";

const AnswerSchema = new mongoose.Schema(
  {
    content: {
      type: String,
      required: true,
      maxlength: 5000
    },

    codeSnippet: {
      type: String,
      maxlength: 10000
    },

    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true
    },

    post: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Post",
      required: true,
      index: true
    },

    voteScore: {
      type: Number,
      default: 0,
      index: true
    },

    isAccepted: {
      type: Boolean,
      default: false
    },

    isDeleted: {
      type: Boolean,
      default: false,
      index: true
    },

    isEdited: {
      type: Boolean,
      default: false
    }
  },
  { timestamps: true }
);


// 📌 Fetch answers per post efficiently
AnswerSchema.index({ post: 1, createdAt: -1 });

// 🔥 Sort by votes (top answers)
AnswerSchema.index({ post: 1, voteScore: -1 });

// ✅ Only ONE accepted answer per post
AnswerSchema.index(
  { post: 1, isAccepted: 1 },
  {
    unique: true,
    partialFilterExpression: { isAccepted: true }
  }
);


// 🛡️ Auto exclude deleted answers
AnswerSchema.pre(/^find/, function (next) {
  this.where({ isDeleted: false });
  next();
});

export default mongoose.model("Answer", AnswerSchema);