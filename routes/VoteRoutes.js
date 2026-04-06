import express from "express";
import authMiddleware from "../middlewares/authMiddleware.js";
import { vote } from "../controllers/VoteController.js";

const VoteRouter = express.Router();

/**
 * @route   POST /api/posts
 * @desc    Create a new post (question)
 * @access  Private
 **/
VoteRouter.post("/vote", authMiddleware, vote);

export default VoteRouter;
