import {Router} from 'express';
import { getUserProfile, loginUser, registerUser } from '../controllers/UserController.js';
import authMiddleware from '../middlewares/authMiddleware.js';
import { createPost } from '../controllers/PostController.js';

const UserRouter = Router();

// Example route
UserRouter.route('/register').post(registerUser);
UserRouter.route('/login').post(loginUser);
UserRouter.route('/profile').get(authMiddleware, getUserProfile);

UserRouter.route('/broadcastpost').post(authMiddleware, createPost);
export default UserRouter;