import express from "express";
import { createPost } from "../controllers/PostController.js";
import authMiddleware from "../middlewares/authMiddleware.js";
import { vote } from "../controllers/VoteController.js";

const PostRouter = express.Router();

/**
 * @route   POST /api/posts
 * @desc    Create a new post (question)
 * @access  Private
 **/
PostRouter.route("/createpost").post(authMiddleware, createPost);

export default PostRouter;
