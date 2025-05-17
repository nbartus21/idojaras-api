// Alkalmazás konfigurációs beállításai
// Környezeti változókból vagy alapértelmezett értékekből
import dotenv from 'dotenv';

dotenv.config();

export const config = {
  port: process.env.PORT || 3000,                                     // Szerver port
  cacheTtl: parseInt(process.env.CACHE_TTL || '600', 10),            // Cache élettartam (10 perc)
  dailyRateLimit: parseInt(process.env.DAILY_RATE_LIMIT || '100', 10) // Napi kérés limit
};
