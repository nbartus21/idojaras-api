// Alkalmazás metrikák kezelése és nyilvántartása
import { MetricsData } from '../types';

export class MetricsService {
  private data: MetricsData;

  // Metrika adatok inicializálása
  constructor() {
    this.data = {
      cacheHits: 0,
      rateLimitExceeded: 0,
      apiCalls: {}
    };
  }

  // Cache találatok számának növelése
  incrementCacheHits(): void {
    this.data.cacheHits++;
  }

  // Rate limit túllépések számának növelése
  incrementRateLimitExceeded(): void {
    this.data.rateLimitExceeded++;
  }

  // API hívások számának növelése napi bontásban
  incrementApiCalls(): void {
    const today = new Date().toISOString().split('T')[0];

    if (!this.data.apiCalls[today]) {
      this.data.apiCalls[today] = 0;
    }

    this.data.apiCalls[today]++;
  }

  // Összes metrika adat lekérdezése
  getMetrics(): MetricsData {
    return this.data;
  }
}
