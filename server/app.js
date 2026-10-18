import express from 'express';
import authRoutes from './routes/authRoutes.js';
import movieRoutes from './routes/movieRoutes.js';
import roomRoutes from './routes/roomRoutes.js';
import aiRoutes from './routes/aiRoutes.js';
import historyRoutes from './routes/historyRoutes.js';
import freeMovieDbRoutes from './routes/freeMovieDbRoutes.js';
import { getDbStatus } from './config/db.js';

export const createApp = () => {
  const app = express();

  // Middleware for parsing JSON bodies
  app.use(express.json());

  // API Routes
  app.use('/api/auth', authRoutes);
  app.use('/api/movies', movieRoutes);
  app.use('/api/rooms', roomRoutes);
  app.use('/api/ai', aiRoutes);
  app.use('/api/history', historyRoutes);
  app.use('/api/imdb', freeMovieDbRoutes);

  // Health and System Status Endpoint
  app.get('/api/health', (req, res) => {
    const dbStatus = getDbStatus();
    res.json({
      status: 'ok',
      service: 'Netflix AI Watch Spaces API',
      database: dbStatus,
      geminiConfigured: !!process.env.GEMINI_API_KEY,
      timestamp: new Date().toISOString(),
    });
  });

  return app;
};
