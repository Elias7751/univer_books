require('dotenv').config();
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import path from 'path';

import authRoutes from './routes/auth.routes';
import academicRoutes from './routes/academic.routes';
import documentRoutes from './routes/document.routes';
import userRoutes from './routes/user.routes';
import './bot/telegram.bot';
import './bot/rep.bot'; // Initialize Telegram Bot

const app = express();
const port = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(helmet());
app.use(morgan('dev'));
app.use(express.json());

// Serve static files from uploads directory
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Basic Route
app.get('/', (req, res) => {
  res.send('Univer API is running...');
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/academic', academicRoutes);
app.use('/api/documents', documentRoutes);
app.use('/api/users', userRoutes);
app.use('/api/admin', require('./routes/admin.routes').default);

// Start Server
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
