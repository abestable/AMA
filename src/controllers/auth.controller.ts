import { Request, Response } from 'express';
import { body, validationResult } from 'express-validator';
import { AuthService, RegisterData, LoginData } from '../services/auth.service';
import { AuthenticatedRequest } from '../middleware/auth';

export class AuthController {
  // Validation rules
  static registerValidation = [
    body('email')
      .isEmail()
      .normalizeEmail()
      .withMessage('Please provide a valid email address'),
    body('username')
      .isLength({ min: 3, max: 30 })
      .matches(/^[a-zA-Z0-9_]+$/)
      .withMessage('Username must be 3-30 characters and contain only letters, numbers, and underscores'),
    body('password')
      .isLength({ min: 8 })
      .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/)
      .withMessage('Password must be at least 8 characters and contain uppercase, lowercase, number, and special character'),
    body('firstName')
      .optional()
      .isLength({ min: 1, max: 50 })
      .withMessage('First name must be 1-50 characters'),
    body('lastName')
      .optional()
      .isLength({ min: 1, max: 50 })
      .withMessage('Last name must be 1-50 characters'),
  ];

  static loginValidation = [
    body('email')
      .isEmail()
      .normalizeEmail()
      .withMessage('Please provide a valid email address'),
    body('password')
      .notEmpty()
      .withMessage('Password is required'),
  ];

  static resetPasswordValidation = [
    body('email')
      .isEmail()
      .normalizeEmail()
      .withMessage('Please provide a valid email address'),
  ];

  static newPasswordValidation = [
    body('token')
      .notEmpty()
      .withMessage('Reset token is required'),
    body('password')
      .isLength({ min: 8 })
      .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/)
      .withMessage('Password must be at least 8 characters and contain uppercase, lowercase, number, and special character'),
  ];

  // Register new user
  static async register(req: Request, res: Response): Promise<void> {
    try {
      // Check validation errors
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        res.status(400).json({
          error: 'Validation failed',
          details: errors.array(),
        });
        return;
      }

      const data: RegisterData = req.body;
      const ipAddress = req.ip || req.connection.remoteAddress;
      const userAgent = req.get('User-Agent');

      const result = await AuthService.register(data, ipAddress, userAgent);

      res.status(201).json({
        message: 'User registered successfully',
        data: result,
      });
    } catch (error) {
      console.error('Registration error:', error);
      res.status(400).json({
        error: error instanceof Error ? error.message : 'Registration failed',
      });
    }
  }

  // Login user
  static async login(req: Request, res: Response): Promise<void> {
    try {
      // Check validation errors
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        res.status(400).json({
          error: 'Validation failed',
          details: errors.array(),
        });
        return;
      }

      const data: LoginData = req.body;
      const ipAddress = req.ip || req.connection.remoteAddress;
      const userAgent = req.get('User-Agent');

      const result = await AuthService.login(data, ipAddress, userAgent);

      res.status(200).json({
        message: 'Login successful',
        data: result,
      });
    } catch (error) {
      console.error('Login error:', error);
      res.status(401).json({
        error: error instanceof Error ? error.message : 'Login failed',
      });
    }
  }

  // Logout user
  static async logout(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const authHeader = req.headers.authorization;
      const token = authHeader && authHeader.split(' ')[1];

      if (token) {
        await AuthService.logout(token);
      }

      res.status(200).json({
        message: 'Logout successful',
      });
    } catch (error) {
      console.error('Logout error:', error);
      res.status(500).json({
        error: 'Logout failed',
      });
    }
  }

  // Refresh token
  static async refreshToken(req: Request, res: Response): Promise<void> {
    try {
      const authHeader = req.headers.authorization;
      const token = authHeader && authHeader.split(' ')[1];

      if (!token) {
        res.status(401).json({
          error: 'Token required',
        });
        return;
      }

      const result = await AuthService.refreshToken(token);

      res.status(200).json({
        message: 'Token refreshed successfully',
        data: result,
      });
    } catch (error) {
      console.error('Token refresh error:', error);
      res.status(401).json({
        error: error instanceof Error ? error.message : 'Token refresh failed',
      });
    }
  }

  // Request password reset
  static async requestPasswordReset(req: Request, res: Response): Promise<void> {
    try {
      // Check validation errors
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        res.status(400).json({
          error: 'Validation failed',
          details: errors.array(),
        });
        return;
      }

      const { email } = req.body;
      await AuthService.generatePasswordResetToken(email);

      // In a real application, you would send an email here
      res.status(200).json({
        message: 'Password reset instructions sent to your email',
      });
    } catch (error) {
      console.error('Password reset request error:', error);
      // Don't reveal if user exists or not
      res.status(200).json({
        message: 'Password reset instructions sent to your email',
      });
    }
  }

  // Reset password with token
  static async resetPassword(req: Request, res: Response): Promise<void> {
    try {
      // Check validation errors
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        res.status(400).json({
          error: 'Validation failed',
          details: errors.array(),
        });
        return;
      }

      const { token, password } = req.body;
      await AuthService.resetPassword(token, password);

      res.status(200).json({
        message: 'Password reset successfully',
      });
    } catch (error) {
      console.error('Password reset error:', error);
      res.status(400).json({
        error: error instanceof Error ? error.message : 'Password reset failed',
      });
    }
  }

  // Get current user profile
  static async getProfile(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({
          error: 'Authentication required',
        });
        return;
      }

      res.status(200).json({
        data: req.user,
      });
    } catch (error) {
      console.error('Get profile error:', error);
      res.status(500).json({
        error: 'Failed to get profile',
      });
    }
  }
}
