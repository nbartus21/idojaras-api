// Időjárási API válasz típusa
// Open-Meteo API-tól érkező adatok struktúrája
export interface WeatherResponse {
  latitude: number;
  longitude: number;
  timezone: string;
  current_weather?: {
    temperature: number;
    windspeed: number;
    winddirection: number;
    weathercode: number;
    time: string;
  };
  hourly?: {
    time: string[];
    temperature_2m?: number[];
    precipitation?: number[];
    weathercode?: number[];
    windspeed_10m?: number[];
    // további paraméterek...
  };
  fromCache?: boolean; // Jelzi, hogy az adat cache-ből származik-e
}

// Geocoding API válasz típusa
// Város keresés eredményének struktúrája
export interface GeocodingResponse {
  results?: {
    id: number;
    name: string;
    latitude: number;
    longitude: number;
    country: string;
    timezone: string;
    // további mezők...
  }[];
}

// Metrika adatok típusa
// Az alkalmazás teljesítményének és használatának követésére
export interface MetricsData {
  cacheHits: number;           // Cache találatok száma
  rateLimitExceeded: number;   // Rate limit túllépések száma
  apiCalls: {                  // API hívások száma napi bontásban
    [date: string]: number;
  };
}
