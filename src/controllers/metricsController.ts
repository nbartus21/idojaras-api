// Metrikák kezelésére szolgáló kontroller
import { Request, Response } from 'express';
import { MetricsService } from '../services/metricsService';

export class MetricsController {
  private metricsService: MetricsService;

  // MetricsService injektálása
  constructor(metricsService: MetricsService) {
    this.metricsService = metricsService;
  }

  // Metrikák lekérése és visszaküldése JSON formátumban
  getMetrics(req: Request, res: Response): void {
    const metrics = this.metricsService.getMetrics();
    res.json(metrics);
  }
}
