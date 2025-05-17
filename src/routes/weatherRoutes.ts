// Időjárási adatok lekérdezésére szolgáló útvonalak definiálása
import { Router } from 'express';
import { WeatherController } from '../controllers/weatherController';

export function createWeatherRoutes(weatherController: WeatherController): Router {
  const router = Router();

  // GET / - Időjárási adatok lekérdezése város alapján (query paraméter: city)
  router.get('/', (req, res) => weatherController.getWeather(req, res));

  return router;
}
