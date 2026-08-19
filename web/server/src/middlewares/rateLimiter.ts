import { Request, Response, NextFunction } from 'express';
import { redisClient } from '@/services/redis';

export const rateLimiter = async (req: Request, res: Response, next: NextFunction) => {
  const ip = req.ip || req.socket.remoteAddress || 'unknown';
  const key = `rate_limit:${ip}`;

  try {
    const current = await redisClient.incr(key);

    // Set expiry on first request
    if (current === 1) {
      await redisClient.expire(key, 60); // 60 seconds
    }

    // Allow max 10 requests per minute
    if (current > 10) {
      return res.status(429).json({ error: 'Too many requests, please try again later.' });
    }

    next();
  } catch (error) {
    console.error('Redis rate limiter error:', error);
    // Fallback: allow request if Redis fails
    next();
  }
};
