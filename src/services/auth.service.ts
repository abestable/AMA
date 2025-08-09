import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { prisma } from '../config/database';
import { securityConfig } from '../config/security';
import crypto from 'crypto';

export interface RegisterData {
  email: string;
  username: string;
  password: string;
  firstName?: string;
  lastName?: string;
}

export interface LoginData {
  email: string;
  password: string;
}

export interface AuthResponse {
  user: {
    id: string;
    email: string;
    username: string;
    firstName: string | undefined;
    lastName: string | undefined;
    role: string;
  };
  token: string;
  expiresAt: Date;
}

export class AuthService {
  // Hash password with bcrypt
  private static async hashPassword(password: string): Promise<string> {
    return bcrypt.hash(password, securityConfig.bcrypt.rounds);
  }

  // Verify password
  private static async verifyPassword(password: string, hash: string): Promise<boolean> {
    return bcrypt.compare(password, hash);
  }

  // Generate JWT token with proper typing and jti (sessionId)
  private static generateToken(userId: string, sessionId: string, expiresInSeconds: number): string {
    const payload: jwt.JwtPayload = {
      sub: userId,
      jti: sessionId,
    };
    return jwt.sign(payload, securityConfig.jwt.secret, { expiresIn: expiresInSeconds });
  }

  // Create session
  private static async createSession(
    userId: string,
    sessionId: string,
    expiresAt: Date,
    ipAddress?: string,
    userAgent?: string
  ): Promise<void> {
    await prisma.session.create({
      data: {
        userId,
        token: sessionId,
        expiresAt,
        ipAddress: ipAddress || null,
        userAgent: userAgent || null,
      },
    });
  }

  // Log login attempt
  private static async logLoginAttempt(
    email: string,
    success: boolean,
    userId?: string,
    ipAddress?: string,
    userAgent?: string
  ): Promise<void> {
    await prisma.loginAttempt.create({
      data: {
        email,
        success,
        userId: userId || null,
        ipAddress: ipAddress || '',
        userAgent: userAgent || null,
      },
    });
  }

  // Register new user
  static async register(data: RegisterData, ipAddress?: string, userAgent?: string): Promise<AuthResponse> {
    const { email, username, password, firstName, lastName } = data;

    // Check if user already exists
    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [
          { email },
          { username },
        ],
      },
    });

    if (existingUser) {
      throw new Error('User with this email or username already exists');
    }

    // Hash password
    const hashedPassword = await this.hashPassword(password);

    // Create user
    const user = await prisma.user.create({
      data: {
        email,
        username,
        password: hashedPassword,
        firstName: firstName || null,
        lastName: lastName || null,
      },
    });

    // Compute session expiry aligned with JWT_EXPIRES_IN
    const expiresAt = this.computeExpiryDate(securityConfig.jwt.expiresIn);
    const sessionId = this.generateSessionId();
    const token = this.generateToken(user.id, sessionId, this.computeExpirySeconds(securityConfig.jwt.expiresIn));
    await this.createSession(user.id, sessionId, expiresAt, ipAddress, userAgent);

    // Log successful registration
    await this.logLoginAttempt(email, true, user.id, ipAddress, userAgent);

    return {
      user: {
        id: user.id,
        email: user.email,
        username: user.username,
        firstName: user.firstName || undefined,
        lastName: user.lastName || undefined,
        role: user.role,
      },
      token,
      expiresAt,
    };
  }

  // Login user
  static async login(data: LoginData, ipAddress?: string, userAgent?: string): Promise<AuthResponse> {
    const { email, password } = data;

    // Find user
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user || !user.isActive) {
      await this.logLoginAttempt(email, false, undefined, ipAddress, userAgent);
      throw new Error('Invalid credentials or account disabled');
    }

    // Verify password
    const isValidPassword = await this.verifyPassword(password, user.password);
    if (!isValidPassword) {
      await this.logLoginAttempt(email, false, user.id, ipAddress, userAgent);
      throw new Error('Invalid credentials');
    }

    // Generate token and session
    const expiresAt = this.computeExpiryDate(securityConfig.jwt.expiresIn);
    const sessionId = this.generateSessionId();
    const token = this.generateToken(user.id, sessionId, this.computeExpirySeconds(securityConfig.jwt.expiresIn));
    await this.createSession(user.id, sessionId, expiresAt, ipAddress, userAgent);

    // Update last login
    await prisma.user.update({
      where: { id: user.id },
      data: { lastLogin: new Date() },
    });

    // Log successful login
    await this.logLoginAttempt(email, true, user.id, ipAddress, userAgent);

    return {
      user: {
        id: user.id,
        email: user.email,
        username: user.username,
        firstName: user.firstName || undefined,
        lastName: user.lastName || undefined,
        role: user.role,
      },
      token,
      expiresAt,
    };
  }

  // Logout user
  static async logout(token: string): Promise<void> {
    await prisma.session.updateMany({
      where: { token },
      data: { isValid: false },
    });
  }

  // Refresh token
  static async refreshToken(token: string): Promise<AuthResponse> {
    const session = await prisma.session.findFirst({
      where: {
        token,
        isValid: true,
        expiresAt: {
          gt: new Date(),
        },
      },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            username: true,
            firstName: true,
            lastName: true,
            role: true,
            isActive: true,
          },
        },
      },
    });

    if (!session || !session.user || !session.user.isActive) {
      throw new Error('Invalid or expired session');
    }

    // Generate new token
    const expiresAt = this.computeExpiryDate(securityConfig.jwt.expiresIn);
    const newSessionId = this.generateSessionId();
    const newToken = this.generateToken(session.user.id, newSessionId, this.computeExpirySeconds(securityConfig.jwt.expiresIn));
    
    // Invalidate old session and create new one
    await prisma.session.update({
      where: { id: session.id },
      data: { isValid: false },
    });

    await this.createSession(
      session.user.id,
      newSessionId,
      expiresAt,
      session.ipAddress || undefined,
      session.userAgent || undefined
    );

    return {
      user: {
        id: session.user.id,
        email: session.user.email,
        username: session.user.username,
        firstName: session.user.firstName || undefined,
        lastName: session.user.lastName || undefined,
        role: session.user.role,
      },
      token: newToken,
      expiresAt,
    };
  }

  // Generate password reset token
  static async generatePasswordResetToken(email: string): Promise<string> {
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      throw new Error('User not found');
    }

    const resetToken = crypto.randomBytes(32).toString('hex');
    const resetExpires = new Date();
    resetExpires.setHours(resetExpires.getHours() + 1); // 1 hour

    await prisma.user.update({
      where: { id: user.id },
      data: {
        passwordResetToken: resetToken,
        passwordResetExpires: resetExpires,
      },
    });

    return resetToken;
  }

  // Reset password
  static async resetPassword(token: string, newPassword: string): Promise<void> {
    const user = await prisma.user.findFirst({
      where: {
        passwordResetToken: token,
        passwordResetExpires: {
          gt: new Date(),
        },
      },
    });

    if (!user) {
      throw new Error('Invalid or expired reset token');
    }

    const hashedPassword = await this.hashPassword(newPassword);

    await prisma.user.update({
      where: { id: user.id },
      data: {
        password: hashedPassword,
        passwordResetToken: null,
        passwordResetExpires: null,
      },
    });
  }

  // Helpers
  private static generateSessionId(): string {
    return crypto.randomBytes(16).toString('hex');
  }

  private static computeExpiryDate(expiresIn: string | number): Date {
    const now = Date.now();
    let ms: number;
    if (typeof expiresIn === 'number') {
      ms = expiresIn * 1000;
    } else {
      // handle strings like '24h', '15m', '7d'
      const match = /^(\d+)([smhd])$/.exec(expiresIn);
      if (!match) {
        // Fallback to 24h
        ms = 24 * 60 * 60 * 1000;
      } else {
        const value = parseInt(match[1], 10);
        const unit = match[2];
        const multipliers: Record<string, number> = { s: 1000, m: 60 * 1000, h: 60 * 60 * 1000, d: 24 * 60 * 60 * 1000 };
        ms = value * multipliers[unit];
      }
    }
    return new Date(now + ms);
  }

  private static computeExpirySeconds(expiresIn: string | number): number {
    const date = this.computeExpiryDate(expiresIn);
    const seconds = Math.ceil((date.getTime() - Date.now()) / 1000);
    return Math.max(seconds, 1);
  }
}
