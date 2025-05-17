import express from 'express';
import path from 'path';
import { config } from './config';
import { createRateLimiter } from './middleware/rateLimiter';
import { errorHandler } from './middleware/errorHandler';
import { MetricsService } from './services/metricsService';
import { CacheService } from './services/cacheService';
import { WeatherService } from './services/weatherService';
import { WeatherController } from './controllers/weatherController';
import { MetricsController } from './controllers/metricsController';
import { createWeatherRoutes } from './routes/weatherRoutes';
import { createMetricsRoutes } from './routes/metricsRoutes';

// Szolgáltatások létrehozása
const metricsService = new MetricsService();
const cacheService = new CacheService(config.cacheTtl, metricsService);
const weatherService = new WeatherService(cacheService);

// Kontrollerek létrehozása
const weatherController = new WeatherController(weatherService);
const metricsController = new MetricsController(metricsService);

// Express alkalmazás létrehozása
const app = express();

// Middleware-ek
app.use(express.json());
app.use(express.static(path.join(__dirname, '../public')));
app.use('/weather', createRateLimiter(config.dailyRateLimit, metricsService));

// Alapvető útvonal
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../public/index.html'));
});

// API útvonalak
app.use('/weather', createWeatherRoutes(weatherController));
app.use('/metrics', createMetricsRoutes(metricsController));

// Hibakezelés
app.use(errorHandler);

// Szerver indítása
app.listen(config.port, () => {
  console.log(`Server running on port ${config.port}`);
});
