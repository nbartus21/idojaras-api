// Globális hibakezelő middleware
// Elkapja az alkalmazásban nem kezelt hibákat és egységes hibaüzenetet küld vissza
import { Request, Response, NextFunction } from 'express';

export function errorHandler(err: any, req: Request, res: Response, next: NextFunction) {
  console.error('Unhandled error:', err);

  // 500-as hibakód küldése JSON válaszban
  res.status(500).json({
    error: true,
    message: 'Internal server error'
  });
}
