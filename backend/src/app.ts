import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import authRoutes from './routes/authRoutes';
import articleRoutes from './routes/articleRoutes';
import userRoutes from './routes/userRoutes';
import settings from './routes/settingsRoutes'
import { connectDB } from './config/db';
import path from 'path';

dotenv.config();
connectDB();

const app = express();
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

const corsOptions = {
  origin: 'https://publish-eosin.vercel.app', // Allow frontend domain
  methods: ['GET', 'POST'], // Allowed HTTP methods
  allowedHeaders: ['Content-Type', 'Authorization'], // Allowed headers
};

app.use(cors(corsOptions));
app.use('/api/auth', authRoutes);
app.use('/api/articles', articleRoutes);
app.use('/api/users', userRoutes);
app.use('/api/settings',settings)

export default app;
