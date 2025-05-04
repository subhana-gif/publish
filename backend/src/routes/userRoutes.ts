import express from 'express';
import { getUserProfile, updateUserPreferences, updateUserProfile } from '../controllers/userController';
import verifyToken from '../middleware/auth';

const router = express.Router();

// Get user profile
router.get('/', verifyToken, async (req, res, next) => {
  try {
    await getUserProfile(req, res);
  } catch (error) {
    next(error);
  }
});

// Update user profile information
router.put('/profile', verifyToken, async (req, res, next) => {
  try {
    await updateUserProfile(req, res);
  } catch (error) {
    next(error);
  }
});

// Update user preferences
router.put('/preferences', verifyToken, async (req, res, next) => {
  try {
    await updateUserPreferences(req, res);
  } catch (error) {
    next(error);
  }
});

export default router;
