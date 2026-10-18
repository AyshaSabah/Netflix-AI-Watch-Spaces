import http from 'http';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import express from 'express';
import { Server } from 'socket.io';
import { createApp } from './app.js';
import { connectDB } from './config/db.js';
import { setupSocketHandlers } from './services/socketService.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = process.env.PORT || 3000;

async function startServer() {
  // Connect to Database
  await connectDB();

  const app = createApp();
  const httpServer = http.createServer(app);

  // Initialize Socket.io
  const io = new Server(httpServer, {
    cors: {
      origin: '*',
      methods: ['GET', 'POST'],
    },
  });

  setupSocketHandlers(io);

  // Serve static files in production from dist
  const distPath = path.resolve(__dirname, '../dist');
  app.use(express.static(distPath));

  app.get('*', (req, res, next) => {
    // Avoid hijacking /api routes
    if (req.path.startsWith('/api')) {
      return next();
    }
    res.sendFile(path.join(distPath, 'index.html'), (err) => {
      if (err) {
        next();
      }
    });
  });

  httpServer.listen(PORT, '0.0.0.0', () => {
    console.log(`🍿 Netflix AI Watch Spaces server running at http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
});
