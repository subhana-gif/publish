import jwt, { JwtPayload } from 'jsonwebtoken';
import { Request, Response, NextFunction } from 'express';

interface CustomJwtPayload extends JwtPayload {
  id: string;
  preferences: string[];
}

const verifyToken = (req: Request, res: Response, next: NextFunction): void => {
  const token = req.header('Authorization')?.split(' ')[1];

  if (!token) {
    res.status(401).json({ message: 'Access Denied' });
    return; // ✅ void
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET as string);

    if (typeof decoded === 'string') {
      res.status(401).json({ message: 'Invalid Token Payload' });
      return;
    }

    const { id, preferences } = decoded as CustomJwtPayload;
    req.user = { id, preferences, phone: null, email: null };

    next();
  } catch (err) {
    res.status(400).json({ message: 'Invalid Token' });
    return;
  }
};

export default verifyToken;
