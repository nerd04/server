import mongoose from "mongoose";

const PostSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: 150
    },

    description: {
      type: String,
      required: true,
      maxlength: 5000
    },

    codeSnippet: {
      type: String,
      maxlength: 10000
    },

    image: {
      type: String
    },

    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true
    },

    topic: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Topic",
      required: true,
      index: true
    },

    tags: [
      {
        type: String,
        lowercase: true,
        trim: true,
        index: true
      }
    ],

    voteScore: {
      type: Number,
      default: 0,
      index: true
    },

    answerCount: {
      type: Number,
      default: 0
    },

    isResolved: {
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


// 🔍 TEXT SEARCH (ONLY ONE)
PostSchema.index({
  title: "text",
  description: "text"
});

// 📈 FEED PERFORMANCE
PostSchema.index({ isDeleted: 1, createdAt: -1 });

// 🔥 TRENDING / TOP POSTS
PostSchema.index({ voteScore: -1, createdAt: -1 });

// 📚 TOPIC FILTER
PostSchema.index({ topic: 1, createdAt: -1 });


export default mongoose.model("Post", PostSchema);