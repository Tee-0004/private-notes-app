import express from 'express';
import {
    signup,
    login,
    logout
} from '../controllers/authController.js';

import { authenticateUser } from '../middleware/authMiddleware.js';

const router = express.Router();

// User registration
router.post('/signup', signup);

// User login
router.post('/login', login);

// User logout
router.post('/logout', logout);

// Get the currently logged-in user
router.get('/me', authenticateUser, (req, res) => {
    res.status(200).json({
        user: req.user
    });
});

export default router;