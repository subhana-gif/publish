import { Request, Response } from 'express';
import User from '../models/user';
import bcrypt from 'bcryptjs';

// Get current user data
export const getCurrentUser = async (req: Request, res: Response) => {
  try {
    // req.user should be set by your authentication middleware
    if (!req.user) {
      return res.status(401).json({ error: 'Unauthorized - User not authenticated' });
    }
    
    const user = await User.findById(req.user.id).select('-password');
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    res.json(user);
  } catch (error) {
    console.error('Error fetching user data:', error);
    res.status(500).json({ error: 'Failed to fetch user data' });
  }
};

// Update personal information
export const updatePersonalInfo = async (req: Request, res: Response) => {
    const { firstName, lastName, email, phone, dob } = req.body;
    
    try {
      if (!req.user) {
        return res.status(401).json({ 
          error: 'Unauthorized',
          message: 'User not authenticated' 
        });
      }
  
      // Get current user data
      const currentUser = await User.findById(req.user.id);
      if (!currentUser) {
        return res.status(404).json({ 
          error: 'Not Found',
          message: 'User not found' 
        });
      }
  
      // Only check email if it's being changed
      if (email && email !== currentUser.email) {
        const existingUser = await User.findOne({ email });
        if (existingUser) {
          return res.status(400).json({ 
            error: 'Validation Error',
            message: 'Email already in use' 
          });
        }
      }
  
      // Only check phone if it's being changed
      if (phone && phone !== currentUser.phone) {
        const existingUser = await User.findOne({ phone });
        if (existingUser) {
          return res.status(400).json({ 
            error: 'Validation Error',
            message: 'Phone number already in use' 
          });
        }
      }
  
      const updateData: any = {
        firstName,
        lastName,
        email: email || currentUser.email,
        phone: phone || currentUser.phone,
        dob: dob ? new Date(dob) : currentUser.dob
      };
  
      if (req.file) {
        const relativePath = `/uploads/${req.file.filename}`;
        updateData.profileImage = relativePath;
      }
        
      const updatedUser = await User.findByIdAndUpdate(
        req.user.id,
        updateData,
        { new: true, runValidators: true }
      ).select('-password');
  
      res.json(updatedUser);
      } catch (error) {
      console.error('Error updating personal info:', error);
      res.status(400).json({ 
        error: 'Update Failed',
        message: error instanceof Error ? error.message : 'Failed to update personal information'
      });
    }
  };
// Update password
export const updatePassword = async (req: Request, res: Response) => {
    const { currentPassword, newPassword } = req.body;
    
    if (!currentPassword || !newPassword) {
      return res.status(400).json({ 
        error: 'Validation failed',
        message: 'Current and new password are required' 
      });
    }
  
    try {
      const user = await User.findById(req.user?.id).select('+password');
      if (!user) {
        return res.status(404).json({ 
          error: 'User not found',
          message: 'User not found' 
        });
      }
  
      const isMatch = await bcrypt.compare(currentPassword, user.password);
      if (!isMatch) {
        return res.status(400).json({ 
          error: 'Authentication failed',
          message: 'Current password is incorrect'
        });
      }
  
      if (newPassword.length < 8) {
        return res.status(400).json({ 
          error: 'Validation failed',
          message: 'Password must be at least 8 characters' 
        });
      }
  
          const salt = await bcrypt.genSalt(10);      
      user.password = await bcrypt.hash(newPassword, salt); // Changed from '10' to 10
      await user.save();
  
      res.json({ message: 'Password updated successfully' });
    } catch (error) {
      console.error('Error updating password:', error);
      res.status(400).json({ 
        error: 'Password update failed',
        message: error instanceof Error ? error.message : 'Failed to update password'
      });
    }
};

// Update preferences
export const updatePreferences = async (req: Request, res: Response) => {
  const { preferences } = req.body;
  
  if (!Array.isArray(preferences)) {
    return res.status(400).json({ error: 'Preferences must be an array' });
  }

  try {
    const updatedUser = await User.findByIdAndUpdate(
      req.user?.id,
      { preferences },
      { new: true }
    ).select('-password');

    if (!updatedUser) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json(updatedUser);
  } catch (error) {
    console.error('Error updating preferences:', error);
    res.status(400).json({ 
        error: 'Preferences update failed',
        message: error instanceof Error ? error.message : 'Failed to update preferences'
      });
  }
};