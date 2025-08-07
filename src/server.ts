import express from 'express';
import cors from 'cors';
import { securityConfig } from './config/security';
import {
  apiLimiter,
  securityHeaders,
  compressionMiddleware,
  sanitizeInput,
  requestLogger,
} from './middleware/security';
import authRoutes from './routes/auth.routes';

const app = express();

// Security middleware
app.use(securityHeaders);
app.use(compressionMiddleware);
app.use(sanitizeInput);
app.use(requestLogger);

// CORS configuration
app.use(cors({
  origin: securityConfig.cors.origin,
  credentials: securityConfig.cors.credentials,
}));

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Rate limiting for all routes
app.use('/api', apiLimiter);

// Health check endpoint
app.get('/health', (_req, res) => {
  res.status(200).json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    environment: securityConfig.server.nodeEnv,
  });
});

// API routes
app.use('/api/auth', authRoutes);

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    error: 'Route not found',
    path: req.originalUrl,
  });
});

// Global error handler
app.use((error: any, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error('Global error handler:', error);
  
  const statusCode = error.statusCode || 500;
  const message = error.message || 'Internal server error';
  
  res.status(statusCode).json({
    error: message,
    ...(securityConfig.server.nodeEnv === 'development' && { stack: error.stack }),
  });
});

// Start server
const PORT = securityConfig.server.port;

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📊 Environment: ${securityConfig.server.nodeEnv}`);
  console.log(`🔒 Security features enabled`);
});

export default app;
