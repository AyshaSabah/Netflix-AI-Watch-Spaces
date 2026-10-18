import http from 'http';
import path from 'path';
import { fileURLToPath } from 'url';
import express from 'express';
import dotenv from 'dotenv';
import { Server } from 'socket.io';
import { createApp } from './server/app.js';
import { connectDB } from './server/config/db.js';
import { setupSocketHandlers } from './server/services/socketService.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Robust port & host determination:
// Priority: 1. CLI --port, 2. env PORT (ignoring Nginx proxy port 8080), 3. fallback to 3000
let PORT = 3000;
const portArgIdx = process.argv.indexOf('--port');
if (portArgIdx !== -1 && process.argv[portArgIdx + 1]) {
  const p = Number(process.argv[portArgIdx + 1]);
  if (!isNaN(p) && p > 0) PORT = p;
} else if (process.env.PORT) {
  const envPort = Number(process.env.PORT);
  if (!isNaN(envPort) && envPort > 0 && envPort !== 8080) {
    PORT = envPort;
  }
}

let HOST = '0.0.0.0';
const hostArgIdx = process.argv.indexOf('--host');
if (hostArgIdx !== -1 && process.argv[hostArgIdx + 1]) {
  HOST = process.argv[hostArgIdx + 1];
}

async function startServer() {
  // Connect to DB asynchronously so server starts listening instantly
  connectDB().catch((err) => console.error('Database connection notice:', err));

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

  // In production, serve built frontend
  if (process.env.NODE_ENV === 'production') {
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));

    app.get('*', (req, res, next) => {
      if (req.path.startsWith('/api')) {
        return next();
      }
      res.sendFile(path.join(distPath, 'index.html'));
    });
  } else {
    // In development, mount Vite's dev server middleware
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: {
        middlewareMode: true,
        hmr: false, // HMR disabled in AI Studio environment
      },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  }

  httpServer.listen(PORT, HOST, () => {
    console.log(`🍿 Netflix AI Watch Spaces server running at http://${HOST}:${PORT}`);
    console.log(`  ➜  Local:   http://localhost:${PORT}/`);
    console.log(`  ➜  Network: http://${HOST}:${PORT}/`);
  });

  // Graceful shutdown
  const shutdown = () => {
    httpServer.close(() => process.exit(0));
  };
  process.on('SIGINT', shutdown);
  process.on('SIGTERM', shutdown);
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
