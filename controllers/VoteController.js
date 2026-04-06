import mongoose from "mongoose";
import Vote from "../models/VoteModel.js";
import Post from "../models/PostModel.js";
import Answer from "../models/AnswerModel.js";

const vote = async (req, res) => {
  const session = await mongoose.startSession();

  try {
    session.startTransaction();

    const userId = req.user._id;
    const { targetId, targetType, value } = req.body;

    // ✅ Validation
    if (!targetId || !targetType || ![1, -1].includes(value)) {
      return res.status(400).json({
        success: false,
        message: "Invalid vote data"
      });
    }

    // ✅ Select model dynamically
    const Model = targetType === "Post" ? Post : Answer;

    const target = await Model.findById(targetId).session(session);

    if (!target) {
      return res.status(404).json({
        success: false,
        message: `${targetType} not found`
      });
    }

    // ✅ Find existing vote
    const existingVote = await Vote.findOne({
      user: userId,
      targetId,
      targetType
    }).session(session);

    let scoreChange = 0;

    // 🧠 CASE 1: No previous vote
    if (!existingVote) {
      await Vote.create(
        [{ user: userId, targetId, targetType, value }],
        { session }
      );

      scoreChange = value;
    }

    // 🧠 CASE 2: Same vote → REMOVE (toggle)
    else if (existingVote.value === value) {
      await existingVote.deleteOne({ session });

      scoreChange = -value;
    }

    // 🧠 CASE 3: Change vote
    else {
      const oldValue = existingVote.value;

      existingVote.value = value;
      await existingVote.save({ session });

      scoreChange = value - oldValue; // IMPORTANT
    }

    // ✅ Update voteScore atomically
    target.voteScore += scoreChange;
    await target.save({ session });

    await session.commitTransaction();
    session.endSession();

    return res.status(200).json({
      success: true,
      voteScore: target.voteScore
    });

  } catch (error) {
    await session.abortTransaction();
    session.endSession();

    console.error("Vote Error:", error.message);

    return res.status(500).json({
      success: false,
      message: "Voting failed"
    });
  }
};

export { vote };