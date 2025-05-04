import { Request } from 'express';

declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        preferences?: string[];
        // Add other user properties you need
      }
    }
  }
}