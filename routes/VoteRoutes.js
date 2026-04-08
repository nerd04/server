import express from "express";
import authMiddleware from "../middlewares/authMiddleware.js";
import { vote } from "../controllers/VoteController.js";

const VoteRouter = express.Router();


VoteRouter.post("/vote", authMiddleware, vote);

export default VoteRouter;
