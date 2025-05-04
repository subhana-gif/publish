import express, { Router, Request, Response } from 'express';
import {
  getCurrentUser,
  updatePersonalInfo,
  updatePassword,
  updatePreferences
} from '../controllers/settingsController';
import verifyToken from '../middleware/auth';
import upload from '../middleware/uploads';

const router: Router = express.Router();

// Apply authentication middleware to all settings routes
router.use(verifyToken);

// Get current user data
router.get('/', async (req: Request, res: Response) => {
  try {
    await getCurrentUser(req, res);
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Update personal information
router.patch('/personal', upload.single('profileImage'),async (req: Request, res: Response) => {
  try {
    await updatePersonalInfo(req, res);
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Update password
router.patch('/password', async (req: Request, res: Response) => {
  try {
    await updatePassword(req, res);
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Update preferences
router.patch('/preferences', async (req: Request, res: Response) => {
  try {
    await updatePreferences(req, res);
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;