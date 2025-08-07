import { Router } from 'express';
import { AuthController } from '../controllers/auth.controller';
import { authenticateToken } from '../middleware/auth';
import { authLimiter } from '../middleware/security';
import { PrismaClient } from '@prisma/client';

const router = Router();
const prisma = new PrismaClient();

// Apply rate limiting to auth routes
router.use(authLimiter);

// Public routes
router.post('/register', AuthController.registerValidation, AuthController.register);
router.post('/login', AuthController.loginValidation, AuthController.login);
router.post('/refresh-token', AuthController.refreshToken);
router.post('/forgot-password', AuthController.resetPasswordValidation, AuthController.requestPasswordReset);
router.post('/reset-password', AuthController.newPasswordValidation, AuthController.resetPassword);

// Protected routes
router.post('/logout', authenticateToken, AuthController.logout);
router.get('/profile', authenticateToken, AuthController.getProfile);

// Test endpoint to clear login attempts (only in test mode)
router.post('/test/clear-login-attempts', async (req, res) => {
  if (process.env.NODE_ENV !== 'test') {
    return res.status(404).json({ error: 'Not found' });
  }
  
  try {
    await prisma.loginAttempt.deleteMany({});
    return res.json({ message: 'Login attempts cleared' });
  } catch (error) {
    console.error('Error clearing login attempts:', error);
    return res.status(500).json({ error: 'Failed to clear login attempts' });
  }
});

// Test endpoint to reset database (only in test mode)
router.post('/test/reset-database', async (req, res) => {
  if (process.env.NODE_ENV !== 'test') {
    return res.status(404).json({ error: 'Not found' });
  }
  
  try {
    // Clear all data except users (to keep test credentials)
    await prisma.loginAttempt.deleteMany({});
    await prisma.session.deleteMany({});
    await prisma.auditLog.deleteMany({});
    
    return res.json({ message: 'Database reset for testing' });
  } catch (error) {
    console.error('Error resetting database:', error);
    return res.status(500).json({ error: 'Failed to reset database' });
  }
});

export default router;
