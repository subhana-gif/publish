import express, { Request, Response } from 'express';
import { registerUser, loginUser } from '../controllers/authController';
import upload from '../middleware/uploads';

const router = express.Router();

// Wrap handlers in async middleware to properly handle Promise returns
router.post('/register', upload.single('profileImage'), async (req: Request, res: Response) => {
    try {
        await registerUser(req, res);
    } catch (error) {
        res.status(500).json({ error: 'Registration failed' });
    }
});

router.post('/login', async (req: Request, res: Response) => {
    try {
        await loginUser(req, res);
    } catch (error) {
        res.status(500).json({ error: 'Login failed' });
    }
});

export default router;
