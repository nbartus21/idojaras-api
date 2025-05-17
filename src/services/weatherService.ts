// Időjárási adatok lekérdezése külső API-ból, cache kezeléssel
import axios from 'axios';
import { WeatherResponse, GeocodingResponse } from '../types';
import { CacheService } from './cacheService';

export class WeatherService {
  private cacheService: CacheService;

  // CacheService injektálása
  constructor(cacheService: CacheService) {
    this.cacheService = cacheService;
  }

  // Időjárási adatok lekérdezése város neve alapján
  // Cache-ből szolgálja ki, ha elérhető, egyébként API-ból kéri le
  async getWeatherByCity(city: string): Promise<WeatherResponse> {
    // Először ellenőrizzük a cache-t
    const cacheKey = `weather_${city.toLowerCase()}`;
    const cachedData = this.cacheService.get(cacheKey) as WeatherResponse | undefined;

    if (cachedData) {
      return {
        ...cachedData,
        fromCache: true
      };
    }

    // Ha nincs a cache-ben, lekérjük a koordinátákat
    const coordinates = await this.getCityCoordinates(city);

    if (!coordinates) {
      throw new Error(`City not found: ${city}`);
    }

    // Lekérjük az időjárást a koordináták alapján
    const weatherData = await this.getWeatherByCoordinates(
      coordinates.latitude,
      coordinates.longitude
    );

    // Mentjük a cache-be (fromCache mező nélkül)
    const { fromCache, ...dataToCache } = weatherData;
    this.cacheService.set(cacheKey, dataToCache);

    return {
      ...weatherData,
      fromCache: false
    };
  }

  // Város koordinátáinak lekérdezése a geocoding API-ból
  private async getCityCoordinates(city: string): Promise<{ latitude: number; longitude: number } | null> {
    try {
      const response = await axios.get<GeocodingResponse>(
        `https://geocoding-api.open-meteo.com/v1/search`,
        {
          params: {
            name: city,
            count: 1
          }
        }
      );

      if (response.data.results && response.data.results.length > 0) {
        const { latitude, longitude } = response.data.results[0];
        return { latitude, longitude };
      }

      return null;
    } catch (error) {
      console.error('Error getting city coordinates:', error);
      return null;
    }
  }

  // Időjárási adatok lekérdezése koordináták alapján
  private async getWeatherByCoordinates(latitude: number, longitude: number): Promise<WeatherResponse> {
    try {
      const response = await axios.get(
        `https://api.open-meteo.com/v1/forecast`,
        {
          params: {
            latitude,
            longitude,
            current_weather: true,
            hourly: 'temperature_2m,precipitation,weathercode,windspeed_10m'
          }
        }
      );

      return {
        ...response.data,
        fromCache: false
      };
    } catch (error) {
      console.error('Error getting weather data:', error);
      throw new Error('Failed to fetch weather data');
    }
  }
}
