import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import User from '../models/user';
import generateToken from '../utils/generatorToken';

export const registerUser = async (req: Request, res: Response) => {
  try {
    const {
      firstName,
      lastName,
      email,
      phone,
      dob,
      password,
      preferences
    } = req.body;

    // Basic field validation
    if (!firstName || !lastName || !email || !phone || !dob || !password) {
      return res.status(400).json({ message: 'All required fields must be filled' });
    }

    if (preferences && !Array.isArray(preferences)) {
      return res.status(400).json({ message: 'Preferences must be an array' });
    }

    // Check if user already exists
    const existingEmail = await User.findOne({ email });
    if (existingEmail) {
      return res.status(409).json({ message: 'Email already in use' });
    }

    const existingPhone = await User.findOne({ phone });
    if (existingPhone) {
      return res.status(409).json({ message: 'Phone number already in use' });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    
    // Handle profile image (assuming multer middleware sets req.file)
    const profileImagePath = req.file ? `/uploads/${req.file.filename}`:null;

    // Create user
    const newUser = new User({
      firstName,
      lastName,
      email,
      phone,
      dob,
      password: hashedPassword,
      profileImage: profileImagePath,
      preferences: preferences || []
    });

    await newUser.save();

    return res.status(201).json({ message: 'User registered successfully' });

  } catch (error) {
    console.error('[Register Error]', error);
    return res.status(500).json({ message: 'Internal Server Error' });
  }
};

export const loginUser = async (req: Request, res: Response) => {
  const { email, phone, password } = req.body;

  // Validate input
  if ((!email && !phone) || !password) {
    return res.status(400).json({ 
      success: false,
      message: 'Please provide either email or phone number, and password' 
    });
  }

  try {
    // Build query condition based on provided identifier
    const queryCondition = email ? { email } : { phone };
    
    // Find user with either email or phone
    const user = await User.findOne(queryCondition);
    
    if (!user) {
      return res.status(400).json({ 
        success: false, 
        message: 'Invalid credentials' 
      });
    }

    // Compare password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ 
        success: false, 
        message: 'Invalid credentials' 
      });
    }

    // Generate authentication token
    const token = generateToken(user._id.toString());
    
    // Return success response with token and user info
    return res.json({ 
      success: true,
      token,
      user: {
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        phone: user.phone,
        // Don't include sensitive fields like password
      }
    });
  } catch (error: any) {
    console.error("Login error:", error.message);
    return res.status(500).json({ 
      success: false,
      message: 'Server error. Please try again later.' 
    });
  }
};