// Metrikák lekérdezésére szolgáló útvonalak definiálása
import { Router } from 'express';
import { MetricsController } from '../controllers/metricsController';

export function createMetricsRoutes(metricsController: MetricsController): Router {
  const router = Router();

  // GET / - Összes metrika lekérdezése
  router.get('/', (req, res) => metricsController.getMetrics(req, res));

  return router;
}
