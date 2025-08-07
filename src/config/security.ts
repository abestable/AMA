import dotenv from 'dotenv';

dotenv.config();

export const securityConfig = {
  jwt: {
    secret: process.env['JWT_SECRET'] || 'fallback-secret-change-in-production',
    expiresIn: process.env['JWT_EXPIRES_IN'] || '24h',
  },
  bcrypt: {
    rounds: parseInt(process.env['BCRYPT_ROUNDS'] || '12'),
  },
  rateLimit: {
    windowMs: parseInt(process.env['RATE_LIMIT_WINDOW_MS'] || '900000'), // 15 minutes
    maxRequests: parseInt(process.env['RATE_LIMIT_MAX_REQUESTS'] || (process.env['NODE_ENV'] === 'test' ? '1000' : '100')),
  },
  cors: {
    origin: process.env['CORS_ORIGIN'] || 'http://localhost:3000',
    credentials: true,
  },
  server: {
    port: parseInt(process.env['PORT'] || '3001'),
    nodeEnv: process.env['NODE_ENV'] || 'development',
  },
} as const;

export default securityConfig;
