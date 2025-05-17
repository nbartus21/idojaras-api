// Memória alapú gyorsítótár szolgáltatás metrika követéssel
import NodeCache from 'node-cache';
import { MetricsService } from './metricsService';

export class CacheService {
  private cache: NodeCache;
  private metricsService: MetricsService;

  // Cache inicializálása megadott élettartammal (TTL)
  constructor(ttl: number, metricsService: MetricsService) {
    this.cache = new NodeCache({ stdTTL: ttl });
    this.metricsService = metricsService;
  }

  // Érték lekérése a cache-ből és találat rögzítése a metrikákban
  get(key: string): any {
    const value = this.cache.get(key);
    if (value) {
      this.metricsService.incrementCacheHits();
    }
    return value;
  }

  // Érték mentése a cache-be
  set(key: string, value: any): void {
    this.cache.set(key, value);
  }
}
