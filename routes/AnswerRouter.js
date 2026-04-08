import express from "express";
import authMiddleware from "../middlewares/authMiddleware.js";
import {
  createAnswer,
  getAnswersByPost,
  updateAnswer,
  deleteAnswer,
  acceptAnswer
} from "../controllers/AnswerController.js";

const AnswerRouter = express.Router();

AnswerRouter.post("/create", authMiddleware, createAnswer);
AnswerRouter.get("/:postId", getAnswersByPost);
AnswerRouter.put("/:answerId", authMiddleware, updateAnswer);
AnswerRouter.delete("/:answerId", authMiddleware, deleteAnswer);
AnswerRouter.patch("/accept/:answerId", authMiddleware, acceptAnswer);

export default AnswerRouter;