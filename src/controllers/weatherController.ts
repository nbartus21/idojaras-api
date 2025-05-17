// Időjárási adatok kezelésére szolgáló kontroller
import { Request, Response } from 'express';
import { WeatherService } from '../services/weatherService';

export class WeatherController {
  private weatherService: WeatherService;

  // WeatherService injektálása
  constructor(weatherService: WeatherService) {
    this.weatherService = weatherService;
  }

  // Időjárási adatok lekérése város alapján
  // Hibakezelést tartalmaz a hiányzó város paraméter és szerver hibák esetére
  async getWeather(req: Request, res: Response): Promise<void> {
    try {
      const city = req.query.city as string;

      if (!city) {
        res.status(400).json({
          error: true,
          message: 'City parameter is required'
        });
        return;
      }

      const weatherData = await this.weatherService.getWeatherByCity(city);
      res.json(weatherData);
    } catch (error) {
      console.error('Error in weather controller:', error);
      res.status(500).json({
        error: true,
        message: error instanceof Error ? error.message : 'Internal server error'
      });
    }
  }
}
