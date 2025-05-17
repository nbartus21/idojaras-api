// API kérések számának korlátozása felhasználónként (X-User-Id)
// Napi limittel, metrikák gyűjtésével
import { Request, Response, NextFunction } from 'express';
import { RateLimiterMemory } from 'rate-limiter-flexible';
import { MetricsService } from '../services/metricsService';

export function createRateLimiter(points: number, metricsService: MetricsService) {
  // Napi időkorlát (24 óra másodpercben)
  const duration = 24 * 60 * 60;

  const rateLimiter = new RateLimiterMemory({
    points,
    duration,
    keyPrefix: 'weather_api_limit',
  });

  return async (req: Request, res: Response, next: NextFunction) => {
    const userId = req.header('X-User-Id');

    if (!userId) {
      return res.status(400).json({
        error: true,
        message: 'X-User-Id header is required'
      });
    }

    try {
      await rateLimiter.consume(userId);
      metricsService.incrementApiCalls();
      next();
    } catch (error) {
      metricsService.incrementRateLimitExceeded();

      res.status(429).json({
        error: true,
        message: 'Rate limit exceeded. Maximum 100 requests per day allowed.'
      });
    }
  };
}
