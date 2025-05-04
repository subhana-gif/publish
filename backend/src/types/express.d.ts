// src/types/express.d.ts
import * as express from 'express';

declare global {
  namespace Express {
    interface Request {
      user?: {
        phone: any;
        email: any;
        id: string;
        preferences: string[];  // Define it as an array of strings, or adjust to your specific use case
      };
    }
  }
}
