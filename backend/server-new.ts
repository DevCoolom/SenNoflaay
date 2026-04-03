/**
 * Main Server File
 * Uses modular routes and middleware for better maintainability
 * 
 * Architecture:
 * - Express server with modular routing
 * - PostgreSQL via Supabase for data persistence
 * - JWT for authentication
 * - Input validation and sanitization
 * - Comprehensive logging and error handling
 */

import express from 'express';
import 'dotenv/config';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import { fileURLToPath } from 'url';
import cors from 'cors';

// Import middleware
import { requestLogger, errorHandler, notFoundHandler, healthCheck } from './src/server/middleware/logger';

// Import routes
import authRoutes from './src/server/routes/auth';
import dataRoutes from './src/server/routes/data';
import membersRoutes from './src/server/routes/members';
import financeRoutes from './src/server/routes/finance';
import eventsRoutes from './src/server/routes/events';
import billsRoutes from './src/server/routes/bills';
import usersRoutes from './src/server/routes/users';
import settingsRoutes from './src/server/routes/settings';

// Import database init
import { initializeDatabase } from './src/server/db';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  try {
    // Initialize database connection
    await initializeDatabase();

    const app = express();
    const PORT = Number(process.env.PORT) || 3000; // ensure numeric for app.listen

    // === MIDDLEWARE ===

    // CORS for production domains
    app.use(
      cors({
        origin: process.env.ALLOWED_ORIGINS?.split(',') || ['http://localhost:3000', 'http://localhost:5173'],
        credentials: true,
      })
    );

    // Body parsing
    app.use(express.json({ limit: '10mb' }));
    app.use(express.urlencoded({ limit: '10mb', extended: true }));

    // Logging middleware
    app.use(requestLogger);

    // === HEALTH CHECK ===
    app.get('/health', healthCheck);

    // === API ROUTES ===

    // Auth routes (no authentication required)
    app.use('/api/auth', authRoutes);

    // Protected routes (require authentication)
    app.use('/api/data', dataRoutes);
    app.use('/api/members', membersRoutes);
    app.use('/api/finance', financeRoutes);
    app.use('/api/events', eventsRoutes);
    app.use('/api/bills', billsRoutes);
    app.use('/api/users', usersRoutes);
    app.use('/api/settings', settingsRoutes);

    // === STATIC FILES & VITE SETUP ===

    if (process.env.NODE_ENV !== 'production') {
      // Development: Use Vite dev server
      const vite = await createViteServer({
        server: { middlewareMode: true, hmr: false },
        appType: 'spa',
      });
      app.use(vite.middlewares);
    } else {
      // Production: Serve built files from frontend/dist
      app.use(express.static(path.join(__dirname, '../frontend/dist')));
      
      // SPA fallback
      app.get('/', (req, res) => {
        res.sendFile(path.join(__dirname, '../frontend/dist', 'index.html'));
      });
    }

    // === ERROR HANDLING ===

    // 404 handler
    app.use(notFoundHandler);

    // Global error handler (must be last)
    app.use(errorHandler);

    // === START SERVER ===

    app.listen(PORT, '0.0.0.0', () => {
      console.log(`
╔════════════════════════════════════════╗
║   Server running successfully!        ║
║   Environment: ${process.env.NODE_ENV || 'development'.padEnd(24)} ║
║   Port: ${PORT.toString().padEnd(29)}║
║   Database: PostgreSQL (Supabase)     ║
╚════════════════════════════════════════╝
      `);

      if (process.env.NODE_ENV === 'production') {
        console.log(`Frontend: ${process.env.FRONTEND_URL || 'http://localhost:3000'}`);
      } else {
        console.log('Access at: http://localhost:3000');
      }
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

startServer();
