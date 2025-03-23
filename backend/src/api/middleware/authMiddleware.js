import jwt from 'jsonwebtoken';
import { AuthenticationError } from '../utils/errors.js';
import { UserRepository } from '../database/repositories/UserRepository.js';
import { LoggingService } from '../services/LoggingService.js';
import config from '../config/app.config.js';

const userRepository = new UserRepository();
const logger = new LoggingService('AuthMiddleware');

export const authenticate = async (req, res, next) => {
  try {
    // Check if authorization header exists
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      throw new AuthenticationError('Authentication token required');
    }

    // Extract token
    const parts = authHeader.split(' ');
    if (parts.length !== 2 || parts[0] !== 'Bearer') {
      throw new AuthenticationError('Invalid token format');
    }

    const token = parts[1];

    // Verify token
    let decoded;
    try {
      decoded = jwt.verify(token, config.jwt.secret);
    } catch (error) {
      if (error.name === 'TokenExpiredError') {
        throw new AuthenticationError('Token expired');
      }
      throw new AuthenticationError('Invalid token');
    }

    // Get user from database
    const user = await userRepository.findById(decoded.id);
    if (!user) {
      throw new AuthenticationError('User not found');
    }

    // Check if user is active
    if (user.status !== 'active') {
      throw new AuthenticationError('User account is not active');
    }

    // Attach user to request
    req.user = {
      id: user.id,
      email: user.email,
      role: user.role,
      status: user.status
    };

    // Log authentication
    logger.info('User authenticated', { userId: user.id, email: user.email });

    next();
  } catch (error) {
    logger.error('Authentication failed', { error: error.message });
    next(error);
  }
};

export const generateTokens = (user) => {
  // Generate access token
  const accessToken = jwt.sign(
    { id: user.id, email: user.email, role: user.role },
    config.jwt.secret,
    { expiresIn: config.jwt.expiresIn }
  );

  // Generate refresh token
  const refreshToken = jwt.sign(
    { id: user.id },
    config.jwt.refreshSecret,
    { expiresIn: config.jwt.refreshExpiresIn }
  );

  return { accessToken, refreshToken };
};

export const refreshToken = async (refreshToken) => {
  try {
    // Verify refresh token
    const decoded = jwt.verify(refreshToken, config.jwt.refreshSecret);

    // Get user from database
    const user = await userRepository.findById(decoded.id);
    if (!user) {
      throw new AuthenticationError('User not found');
    }

    // Check if user is active
    if (user.status !== 'active') {
      throw new AuthenticationError('User account is not active');
    }

    // Generate new tokens
    const tokens = generateTokens(user);

    // Update refresh token in database
    await userRepository.updateRefreshToken(user.id, tokens.refreshToken);

    return tokens;
  } catch (error) {
    logger.error('Token refresh failed', { error: error.message });
    throw new AuthenticationError('Invalid refresh token');
  }
}; 