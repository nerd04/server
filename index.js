import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';

import connDB from './util/connDB.js';
import PostRouter from './routes/PostRoutes.js';
import VoteRouter from './routes/VoteRoutes.js';
import UserRouter from './routes/UserRoutes.js';
import AnswerRouter from './routes/AnswerRouter.js';

const app = express();
const PORT = process.env.PORT || 3000;

// ✅ Middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(cors({
  // origin: "http://localhost:5173",
  // credentials: true
}));

app.use(cookieParser());

// ✅ Routes
app.use("/api/users", UserRouter);
app.use("/api/posts", PostRouter);
app.use("/api/votes", VoteRouter);
app.use("/api/answers", AnswerRouter);

// ✅ Health check route
app.get('/', (req, res) => {
  res.send('🚀 API is running...');
});

// ✅ Global Error Handler
app.use((err, req, res, next) => {
  console.error("🔥 Error:", err.stack);

  res.status(500).json({
    success: false,
    message: "Internal Server Error"
  });
});

// ✅ Start server AFTER DB connection
const startServer = async () => {
  try {
    await connDB();

    app.listen(PORT, () => {
      console.log(`🚀 Server running on http://localhost:${PORT}`);
    });

  } catch (error) {
    console.error("❌ DB connection failed:", error.message);
    process.exit(1);
  }
};

startServer();