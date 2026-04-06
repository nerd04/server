import mongoose from "mongoose";

const VoteSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true
    },

    targetType: {
      type: String,
      required: true,
      enum: ["Post", "Answer"]
    },

    targetId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      refPath: "targetType",
      index: true
    },

    // 🔥 Numeric voting system (better than strings)
    value: {
      type: Number,
      enum: [1, -1],
      required: true
    }

    // OPTIONAL (future moderation)
    // isDeleted: {
    //   type: Boolean,
    //   default: false
    // }

  },
  { timestamps: true }
);


// 🚫 Prevent duplicate voting
VoteSchema.index(
  { user: 1, targetId: 1, targetType: 1 },
  { unique: true }
);

// 📊 Fast lookup for votes on a target
VoteSchema.index({ targetId: 1, targetType: 1 });

export default mongoose.model("Vote", VoteSchema);