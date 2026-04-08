import mongoose from "mongoose";
import Answer from "../models/AnswerModel.js";
import Post from "../models/PostModel.js";


// ➕ CREATE ANSWER
const createAnswer = async (req, res) => {
  const session = await mongoose.startSession();

  try {
    session.startTransaction();

    const { content, codeSnippet, postId } = req.body;
    const userId = req.user._id;

    // ✅ Validation
    if (!content || !postId) {
      return res.status(400).json({
        success: false,
        message: "Content and postId are required"
      });
    }
    var post;
    try {
      post = await Post.findById(postId).where({ isDeleted: false }).session(session);
    } catch (queryError) {
      console.error("Query Error Details:", queryError);
      throw queryError;
    }
    if (!post) {
      return res.status(404).json({
        success: false,
        message: "Post not found"
      });
    }

    // ✅ Create answer
    const answer = await Answer.create(
      [
        {
          content,
          codeSnippet,
          post: postId,
          author: userId
        }
      ],
      { session }
    );

    // ✅ Increment answer count atomically
    await Post.findByIdAndUpdate(
      postId,
      { $inc: { answerCount: 1 } },
      { session }
    );

    await session.commitTransaction();
    session.endSession();

    return res.status(201).json({
      success: true,
      answer: answer[0]
    });

  } catch (error) {
    await session.abortTransaction();
    session.endSession();

    console.error("Create Answer Error:", error.message);
    console.error("Full Stack:", error.stack);

    return res.status(500).json({
      success: false,
      message: "Failed to create answer",
      error: error.message
    });
  }
};



// 📥 GET ANSWERS FOR A POST
const getAnswersByPost = async (req, res) => {
  try {
    const { postId } = req.params;

    const answers = await Answer.find({ post: postId })
      .populate("author", "name avatar")
      .sort({ isAccepted: -1, voteScore: -1, createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: answers.length,
      answers
    });

  } catch (error) {
    console.error("Fetch Answers Error:", error.message);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch answers"
    });
  }
};



// ✏️ UPDATE ANSWER
const updateAnswer = async (req, res) => {
  try {
    const { answerId } = req.params;
    const { content, codeSnippet } = req.body;
    const userId = req.user._id;

    const answer = await Answer.findById(answerId);

    if (!answer) {
      return res.status(404).json({
        success: false,
        message: "Answer not found"
      });
    }

    // 🔒 Only owner can edit
    if (answer.author.toString() !== userId.toString()) {
      return res.status(403).json({
        success: false,
        message: "Not authorized"
      });
    }

    // ✅ Update fields
    if (content) answer.content = content;
    if (codeSnippet) answer.codeSnippet = codeSnippet;

    answer.isEdited = true;

    await answer.save();

    return res.status(200).json({
      success: true,
      answer
    });

  } catch (error) {
    console.error("Update Answer Error:", error.message);

    return res.status(500).json({
      success: false,
      message: "Failed to update answer"
    });
  }
};



// ❌ DELETE ANSWER (SOFT DELETE)
const deleteAnswer = async (req, res) => {
  const session = await mongoose.startSession();

  try {
    session.startTransaction();

    const { answerId } = req.params;
    const userId = req.user._id;

    const answer = await Answer.findById(answerId).session(session);

    if (!answer) {
      return res.status(404).json({
        success: false,
        message: "Answer not found"
      });
    }

    // 🔒 Only owner can delete
    if (answer.author.toString() !== userId.toString()) {
      return res.status(403).json({
        success: false,
        message: "Not authorized"
      });
    }

    // ✅ Soft delete
    answer.isDeleted = true;
    await answer.save({ session });

    // ✅ Decrement answer count
    await Post.findByIdAndUpdate(
      answer.post,
      { $inc: { answerCount: -1 } },
      { session }
    );

    await session.commitTransaction();
    session.endSession();

    return res.status(200).json({
      success: true,
      message: "Answer deleted"
    });

  } catch (error) {
    await session.abortTransaction();
    session.endSession();

    console.error("Delete Answer Error:", error.message);

    return res.status(500).json({
      success: false,
      message: "Failed to delete answer"
    });
  }
};



// ✅ ACCEPT ANSWER (ONLY POST OWNER)
const acceptAnswer = async (req, res) => {
  const session = await mongoose.startSession();

  try {
    session.startTransaction();

    const { answerId } = req.params;
    const userId = req.user._id;

    const answer = await Answer.findById(answerId).session(session);

    if (!answer) {
      return res.status(404).json({
        success: false,
        message: "Answer not found"
      });
    }

    const post = await Post.findById(answer.post).where({ isDeleted: false }).session(session);

    // 🔒 Only post owner can accept
    if (post.author.toString() !== userId.toString()) {
      return res.status(403).json({
        success: false,
        message: "Only post owner can accept answer"
      });
    }

    // ❗ Remove previous accepted answer
    await Answer.updateMany(
      { post: post._id, isAccepted: true },
      { isAccepted: false },
      { session }
    );

    // ✅ Mark this as accepted
    answer.isAccepted = true;
    await answer.save({ session });

    // ✅ Mark post resolved
    post.isResolved = true;
    await post.save({ session });

    await session.commitTransaction();
    session.endSession();

    return res.status(200).json({
      success: true,
      message: "Answer accepted"
    });

  } catch (error) {
    await session.abortTransaction();
    session.endSession();

    console.error("Accept Answer Error:", error.message);

    return res.status(500).json({
      success: false,
      message: "Failed to accept answer"
    });
  }
};


export {
  createAnswer,
  getAnswersByPost,
  updateAnswer,
  deleteAnswer,
  acceptAnswer
};