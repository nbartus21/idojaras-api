# Időjárás API Proxy

Ez egy egyszerű HTTP API proxy szolgáltatás, amely az Open-Meteo időjárás API-t hívja meg, és:
- Cache-eli a lekérdezéseket 10 percre
- Korlátozza a napi felhasználói kérésszámot (100/nap)
- Diagnosztikai információt ad a válaszban arról, hogy az adat cache-ből érkezett-e vagy sem

## Indítás

### Követelmények
- Node.js (14+ verzió)
- npm

### Telepítés
```bash
# Függőségek telepítése
npm install

# Alkalmazás build-elése
npm run build
```

### Környezeti változók
A következő környezeti változók állíthatók be (`.env` fájlban):
- `PORT`: Az alkalmazás portja (alapértelmezett: 3000)
- `CACHE_TTL`: Cache élettartama másodpercben (alapértelmezett: 600 - 10 perc)
- `DAILY_RATE_LIMIT`: Napi kérésszám limit felhasználónként (alapértelmezett: 100)

### Futtatás
```bash
# Fejlesztői módban
npm run dev

# Éles módban
npm start
```

## API Végpontok

### GET /weather?city={city_name}
Időjárás adatok lekérdezése város neve alapján.

#### Paraméterek
- `city`: A város neve (kötelező)

#### Fejlécek
- `X-User-Id`: Felhasználói azonosító (kötelező)

#### Válasz
```json
{
  "latitude": 47.5,
  "longitude": 19.04,
  "timezone": "Europe/Budapest",
  "current_weather": {
    "temperature": 24.3,
    "windspeed": 5.2,
    "winddirection": 220,
    "weathercode": 1,
    "time": "2023-09-10T15:00"
  },
  "hourly": {
    "time": ["2023-09-10T00:00", "2023-09-10T01:00", ...],
    "temperature_2m": [15.2, 14.8, ...],
    "precipitation": [0, 0, ...],
    "weathercode": [0, 0, ...],
    "windspeed_10m": [3.1, 3.0, ...]
  },
  "fromCache": true
}
```

### GET /metrics
Diagnosztikai információk lekérdezése.

#### Válasz
```json
{
  "cacheHits": 15,
  "rateLimitExceeded": 3,
  "apiCalls": {
    "2023-09-10": 45,
    "2023-09-11": 23
  }
}
```

## Fejlesztői megjegyzések

- A megoldás az Open-Meteo ingyenes API-ját használja, ami nem igényel API kulcsot
- A cache réteg memóriában tárol, így újraindítás után a cache üres lesz
- A rate limiter szintén memóriában tárol, így újraindítás után a számlálók nullázódnak
- A cache kulcsok a városneveken alapulnak (kis- és nagybetű érzéketlen)
- A rendszer moduláris felépítésű, könnyen kiterjeszthető és módosítható

## Licence
MIT


# Időjárás API Proxy - Részletes dokumentáció

## Tartalomjegyzék
- [Bevezetés](#bevezetés)
- [Telepítés és indítás](#telepítés-és-indítás)
- [Backend architektúra](#backend-architektúra)
- [Frontend részletek](#frontend-részletek)
- [API dokumentáció](#api-dokumentáció)
- [Használati példák](#használati-példák)
- [Hibaelhárítás](#hibaelhárítás)
- [Bővítési lehetőségek](#bővítési-lehetőségek)

## Bevezetés

Az Időjárás API Proxy egy egyszerű HTTP API proxy szolgáltatás, amely egy külső időjárás API-t (Open-Meteo) hív meg, és különböző többletszolgáltatásokat nyújt hozzá:

- **Cache mechanizmus**: A válaszokat városonként cache-eli 10 percre, így csökkentve a külső API terhelését és gyorsítva a válaszidőt.
- **Rate limiting**: Korlátozza a napi felhasználói kérésszámot (alapértelmezetten 100 kérés/nap/felhasználó) az X-User-Id header alapján.
- **Diagnosztikai információ**: A válaszban jelzi, hogy az adat cache-ből érkezett-e vagy sem.
- **Metrikák**: Követi és megjeleníti a használati statisztikákat.
- **Felhasználói felület**: Modern, Tailwind CSS alapú frontend a könnyű használathoz.

Az alkalmazás Node.js alapú, TypeScript nyelven íródott, Express keretrendszerrel, így biztosítva a típusbiztonságot és a jó strukturáltságot.

## Telepítés és indítás

### Követelmények
- Node.js (14.x vagy újabb)
- npm vagy yarn

### Telepítés
1. Klónozd a repót vagy töltsd le a forráskódot
   ```bash
   git clone <repo-url>
   cd idojaras-app
   ```

2. Telepítsd a függőségeket
   ```bash
   npm install
   ```

3. Fordítsd le a TypeScript kódot
   ```bash
   npm run build
   ```

4. Indítsd el a szervert
   ```bash
   npm start
   ```

### Környezeti változók
Az alkalmazás a következő környezeti változókat használja, amelyeket egy `.env` fájlban is megadhatsz:

- `PORT`: Az alkalmazás portja (alapértelmezett: 3000)
- `CACHE_TTL`: Cache élettartama másodpercben (alapértelmezett: 600)
- `DAILY_RATE_LIMIT`: Napi kérésszám limit felhasználónként (alapértelmezett: 100)

Példa `.env` fájl:
```
PORT=3001
CACHE_TTL=600
DAILY_RATE_LIMIT=100
```

## Backend architektúra

### Projekt struktúra
```
idojaras-app/
├── src/                    # Forráskód
│   ├── controllers/        # API kontroller osztályok
│   │   ├── weatherController.ts
│   │   └── metricsController.ts
│   ├── middleware/         # Express middleware-ek
│   │   ├── rateLimiter.ts  # Rate limiting megvalósítás
│   │   └── errorHandler.ts # Globális hibakezelő
│   ├── services/           # Üzleti logika
│   │   ├── weatherService.ts  # Időjárás adatok lekérdezése
│   │   ├── cacheService.ts    # Cache kezelés
│   │   └── metricsService.ts  # Metrikák nyilvántartása
│   ├── routes/             # API útvonal definíciók
│   │   ├── weatherRoutes.ts
│   │   └── metricsRoutes.ts
│   ├── types/              # TypeScript interface-ek
│   │   └── index.ts
│   ├── config.ts           # Alkalmazás konfiguráció
│   └── app.ts              # Express alkalmazás betöltése
├── public/                 # Statikus frontend fájlok
│   ├── index.html          # Főoldal
│   ├── metrics.html        # Metrikák oldal
│   ├── js/                 # JavaScript fájlok
│   │   ├── weather.js
│   │   └── metrics.js
│   └── css/                # Stílusfájlok, nincs külön fájl (Tailwind CDN)
├── .env                    # Környezeti változók
├── package.json            # Projekt metaadatok és függőségek
├── tsconfig.json           # TypeScript konfiguráció
└── README.md               # Projekt leírás
```

### Komponensek részletesen

#### 1. Cache réteg (cacheService.ts)
A cache szolgáltatás felelős a városonkénti időjárás adatok gyorsítótárazásáért. Memóriában tárolja az adatokat, és a `node-cache` csomagot használja a megvalósításhoz.

```typescript
export class CacheService {
  private cache: NodeCache;
  private metricsService: MetricsService;

  constructor(ttl: number, metricsService: MetricsService) {
    this.cache = new NodeCache({ stdTTL: ttl });
    this.metricsService = metricsService;
  }

  get(key: string): any {
    const value = this.cache.get(key);
    if (value) {
      this.metricsService.incrementCacheHits();
    }
    return value;
  }

  set(key: string, value: any): void {
    this.cache.set(key, value);
  }
}
```

#### 2. Rate Limiter (rateLimiter.ts)
A rate limiter korlátozza az API-hoz történő kérések számát felhasználónként. A `rate-limiter-flexible` csomagot használja, és minden nap 0:00 UTC-kor resetelődik.

```typescript
export function createRateLimiter(points: number, metricsService: MetricsService) {
  const duration = 24 * 60 * 60; // 1 nap másodpercekben

  const rateLimiter = new RateLimiterMemory({
    points,
    duration,
    keyPrefix: 'weather_api_limit',
  });

  return async (req: Request, res: Response, next: NextFunction) => {
    const userId = req.header('X-User-Id');
    
    if (!userId) {
      return res.status(400).json({ 
        error: true, 
        message: 'X-User-Id header is required' 
      });
    }

    try {
      await rateLimiter.consume(userId);
      metricsService.incrementApiCalls();
      next();
    } catch (error) {
      metricsService.incrementRateLimitExceeded();
      
      res.status(429).json({
        error: true,
        message: 'Rate limit exceeded. Maximum 100 requests per day allowed.'
      });
    }
  };
}
```

#### 3. Időjárás szolgáltatás (weatherService.ts)
Az időjárás szolgáltatás felelős az Open-Meteo API hívásáért és a kapott adatok feldolgozásáért. Először a cache-t ellenőrzi, és csak ha nincs találat, akkor hívja a külső API-t.

Főbb lépések:
1. Ellenőrzi, hogy a kért város adatai megvannak-e a cache-ben
2. Ha nincs, akkor először a városnevet koordinátákká alakítja a Geocoding API-val
3. A koordináták alapján lekéri az időjárás adatokat az Open-Meteo API-tól
4. Az eredményt cache-eli a következő kérésekhez
5. Visszaadja az adatokat, jelezve hogy cache-ből jöttek-e vagy sem

#### 4. Metrika szolgáltatás (metricsService.ts)
A metrika szolgáltatás nyilvántartja az API használati statisztikákat, beleértve:

- Cache találatok száma
- Rate limit túllépések száma
- API hívások száma naponta

Ez az adatok memóriában tárolódnak, így a szerver újraindításakor elvesznek. Éles környezetben érdemes lenne ezt egy adatbázisban tárolni.

#### 5. Kontrollerek (controllers/)
A kontrollerek kezelik a HTTP kéréseket és válaszokat. Két fő kontroller van:

- **weatherController.ts**: Időjárás adatok lekérdezése és visszaadása
- **metricsController.ts**: Használati statisztikák lekérdezése

## Frontend részletek

A frontend egy egyszerű, de modern Tailwind CSS alapú felhasználói felület. Nem használ semmilyen JavaScript keretrendszert vagy könyvtárat (mint React vagy Vue), csak vanilla JavaScript-et.

### Oldalak

#### 1. Főoldal (index.html)
A főoldal tartalmazza:
- Időjárás keresési űrlap városnév és felhasználói azonosító megadásához
- Kinyitható dokumentáció használati példákkal
- Időjárás eredmények megjelenítése (kezdetben rejtett)
- Óránkénti előrejelzés
- Link a metrikák oldalra

#### 2. Metrikák oldal (metrics.html)
A metrikák oldal megjeleníti a rendszer használati statisztikáit:
- Cache találatok száma
- Rate limit túllépések száma
- Összes API hívás
- Napi API hívások diagramja

### JavaScript funkcionalitás

#### weather.js
A JavaScript kód a frontendhez:
- Űrlap beküldés kezelése
- API hívás a szerverhez
- Eredmények megjelenítése
- Hibakezelés
- Kinyitható/becsukható dokumentáció kezelése

#### metrics.js
A metrikák oldalhoz:
- Metrikák lekérdezése a szervertől
- Chart.js diagram létrehozása a napi API hívásokhoz
- Frissítés gomb kezelése

### Használt technológiák
- **Tailwind CSS**: Modern utility-first CSS keretrendszer
- **Chart.js**: Diagramok készítése
- **Bootstrap Icons**: Ikonkészlet

## API dokumentáció

### 1. Időjárás API

#### Végpont
```
GET /weather?city={city_name}
```

#### Fejlécek
- **X-User-Id**: (kötelező) Felhasználói azonosító a rate limitinghez

#### Paraméterek
- **city**: (kötelező) A város neve, amelynek az időjárását le szeretnénk kérdezni

#### Válasz
Sikeres válasz (200 OK):
```json
{
  "latitude": 47.5,
  "longitude": 19.04,
  "timezone": "Europe/Budapest",
  "current_weather": {
    "temperature": 24.3,
    "windspeed": 5.2,
    "winddirection": 220,
    "weathercode": 1,
    "time": "2023-09-10T15:00"
  },
  "hourly": {
    "time": ["2023-09-10T00:00", "2023-09-10T01:00", ...],
    "temperature_2m": [15.2, 14.8, ...],
    "precipitation": [0, 0, ...],
    "weathercode": [0, 0, ...],
    "windspeed_10m": [3.1, 3.0, ...]
  },
  "fromCache": true
}
```

A `fromCache` mező jelzi, hogy az adat cache-ből származik-e.

#### Hibák
- **400 Bad Request**: Hiányzó várost vagy felhasználói azonosítót
- **429 Too Many Requests**: Rate limit túllépése
- **500 Internal Server Error**: Szerver oldali hiba

### 2. Metrikák API

#### Végpont
```
GET /metrics
```

#### Válasz
Sikeres válasz (200 OK):
```json
{
  "cacheHits": 15,
  "rateLimitExceeded": 3,
  "apiCalls": {
    "2023-09-10": 45,
    "2023-09-11": 23
  }
}
```

## Használati példák

### 1. curl példák

#### Alap időjárás lekérés
```bash
curl -X GET "http://localhost:3001/weather?city=Budapest" \
-H "X-User-Id: test_user_123"
```

#### Különböző városok összehasonlítása
```bash
curl -X GET "http://localhost:3001/weather?city=Debrecen" \
-H "X-User-Id: test_user_123"

curl -X GET "http://localhost:3001/weather?city=Szeged" \
-H "X-User-Id: test_user_123"
```

#### Cache működésének tesztelése
```bash
# Első kérés - külső API hívás
curl -X GET "http://localhost:3001/weather?city=Miskolc" \
-H "X-User-Id: test_user_123"

# Második kérés - cache-ből jön (fromCache: true)
curl -X GET "http://localhost:3001/weather?city=Miskolc" \
-H "X-User-Id: test_user_123"
```

#### Metrikák lekérése
```bash
curl -X GET "http://localhost:3001/metrics"
```

#### Rate limit tesztelése
```bash
curl -X GET "http://localhost:3001/weather?city=Pécs" \
-H "X-User-Id: other_user_456"
```

### 2. JavaScript példa

```javascript
// Időjárás adatok lekérése JavaScript-tel
async function getWeather(city, userId = 'test_user_123') {
  try {
    const response = await fetch(`http://localhost:3001/weather?city=${city}`, {
      headers: {
        'X-User-Id': userId
      }
    });
    
    if (!response.ok) {
      throw new Error(`Error: ${response.status}`);
    }
    
    const data = await response.json();
    console.log(`Weather in ${city}:`, data);
    return data;
  } catch (error) {
    console.error('Failed to fetch weather:', error);
  }
}

// Használat
getWeather('Budapest');
```

### 3. Python példa

```python
import requests

def get_weather(city, user_id='test_user_123'):
    url = f"http://localhost:3001/weather?city={city}"
    headers = {"X-User-Id": user_id}
    
    response = requests.get(url, headers=headers)
    
    if response.status_code == 200:
        return response.json()
    else:
        print(f"Error: {response.status_code}")
        return None

# Használat
weather_data = get_weather("Budapest")
print(weather_data)
```

## Hibaelhárítás

### Gyakori hibák és megoldásuk

#### 1. Port already in use - A port már használatban van
**Hiba**: A szerver indításakor "Error: listen EADDRINUSE: address already in use :::3000" hiba jelenik meg.
**Megoldás**: Változtasd meg a portot az .env fájlban (pl. PORT=3001) vagy állítsd le a másik alkalmazást, ami a portot használja.

#### 2. City not found - A város nem található
**Hiba**: A város koordinátáit nem sikerül lekérdezni.
**Megoldás**: Ellenőrizd a város nevének helyesírását, vagy próbálj egy nagyobb/ismertebb várost keresni.

#### 3. Rate limit exceeded - Túllépted a napi limitet
**Hiba**: 429-es hibát kapsz, "Rate limit exceeded" üzenettel.
**Megoldás**: Várj 24 órát, vagy használj másik felhasználói azonosítót.

#### 4. TypeError: Cannot read property of undefined
**Hiba**: Hiányzó mezők az API válaszban.
**Megoldás**: Ellenőrizd, hogy a forráskód megfelelően kezeli-e az opcionális mezőket. Néhány város esetén az órás előrejelzés bizonyos adatai hiányozhatnak.

## Bővítési lehetőségek

### 1. Adatbázis integráció
Jelenleg a cache és a metrikák csak a memóriában tárolódnak, ami azt jelenti, hogy a szerver újraindításakor elvesznek. Egy adatbázis (pl. MongoDB, PostgreSQL) integrálásával ezek az adatok tartósan tárolhatók lennének.

### 2. Felhasználói autentikáció
Jelenleg csak egy egyszerű `X-User-Id` header alapján különböztetjük meg a felhasználókat. Egy valódi autentikációs rendszer (pl. JWT) implementálásával biztonságosabbá tehetnénk az API-t.

### 3. További időjárás adatok
Az Open-Meteo API sok más időjárási adatot is kínál, amiket hozzáadhatnánk a válaszhoz, például:
- UV-index
- Páratartalom
- Légnyomás
- Hőérzet

### 4. Többnyelvű támogatás
A frontend és az API válaszok több nyelven is elérhetővé tehetők.

### 5. További geolokációs funkciók
- IP alapú automatikus helymeghatározás
- Térképes város kiválasztás
- Kedvenc városok mentése

### 6. Kibővített metrikák és monitorozás
- Külső API hívások válaszidejének mérése
- Hibastatisztikák
- Prometheus/Grafana integráció a monitorozáshoz

### 7. Több időjárás API támogatása
Több külső időjárás API integrálásával növelhetnénk a megbízhatóságot és pontosságot.

---

## Technikai dokumentáció a fejlesztőknek

### Hogyan adjunk hozzá új funkciókat?

#### 1. Új időjárás adatok hozzáadása
1. Frissítsd a `WeatherResponse` interface-t a `types/index.ts` fájlban
2. Módosítsd a `weatherService.ts`-t, hogy lekérje az új adatokat
3. Frissítsd a frontend-et (HTML/JS), hogy megjelenítse az új adatokat

#### 2. Új API végpont hozzáadása
1. Készíts egy új kontroller osztályt a `controllers/` mappában
2. Készíts egy új útvonalat a `routes/` mappában
3. Regisztráld az útvonalat az `app.ts` fájlban
4. Frissítsd a dokumentációt

---

Készítette: Norbert Bartus 
