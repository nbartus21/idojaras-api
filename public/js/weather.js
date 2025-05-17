document.addEventListener('DOMContentLoaded', () => {
    // DOM elemek
    const weatherForm = document.getElementById('weather-form');
    const cityInput = document.getElementById('city');
    const userIdInput = document.getElementById('user-id');
    const weatherResult = document.getElementById('weather-result');
    const cacheBadge = document.getElementById('cache-badge');
    const cityNameElement = document.getElementById('city-name');
    const weatherIcon = document.getElementById('weather-icon');
    const currentTempElement = document.getElementById('current-temp');
    const weatherDescriptionElement = document.getElementById('weather-description');
    const windSpeedElement = document.getElementById('wind-speed');
    const windDirectionElement = document.getElementById('wind-direction');
    const precipitationElement = document.getElementById('precipitation');
    const coordinatesElement = document.getElementById('coordinates');
    const timezoneElement = document.getElementById('timezone');
    const hourlyForecastElement = document.getElementById('hourly-forecast');
    const loadingOverlay = document.getElementById('loading-overlay');
    const errorToast = document.getElementById('error-toast');
    const errorMessage = document.getElementById('error-message');
    const toastCloseButton = document.getElementById('toast-close');
    
    // Toast bezárása gomb
    toastCloseButton.addEventListener('click', () => {
        errorToast.classList.add('hidden');
    });
    
    // Időjárás adatok lekérdezése
    weatherForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const city = cityInput.value.trim();
        const userId = userIdInput.value.trim();
        
        if (!city) {
            showError('Kérem adja meg a város nevét!');
            return;
        }
        
        if (!userId) {
            showError('Kérem adja meg a felhasználói azonosítóját!');
            return;
        }
        
        try {
            showLoading();
            
            const response = await fetch(`/weather?city=${encodeURIComponent(city)}`, {
                headers: {
                    'X-User-Id': userId
                }
            });
            
            if (!response.ok) {
                if (response.status === 429) {
                    throw new Error('Túllépte a napi kérések számát (100 kérés/nap).');
                }
                throw new Error('Hiba történt az időjárás adatok lekérdezése során.');
            }
            
            const data = await response.json();
            displayWeatherData(data);
        } catch (error) {
            showError(error.message);
        } finally {
            hideLoading();
        }
    });
    
    // Időjárás adatok megjelenítése
    function displayWeatherData(data) {
        // Város neve
        cityNameElement.textContent = cityInput.value;
        
        // Cache badge
        if (data.fromCache) {
            cacheBadge.textContent = 'Cache-ből';
            cacheBadge.classList.remove('bg-primary');
            cacheBadge.classList.add('bg-warning');
        } else {
            cacheBadge.textContent = 'Friss adat';
            cacheBadge.classList.add('bg-primary');
            cacheBadge.classList.remove('bg-warning');
        }
        
        // Jelenlegi hőmérséklet
        if (data.current_weather) {
            currentTempElement.textContent = `${data.current_weather.temperature}°C`;
            
            // Időjárás ikon és leírás
            updateWeatherDescription(data.current_weather.weathercode);
            
            // Szélsebesség
            windSpeedElement.textContent = `${data.current_weather.windspeed} km/h`;
            
            // Szélirány
            windDirectionElement.textContent = `${data.current_weather.winddirection}°`;
        }
        
        // Csapadék (ha elérhető)
        let precipitation = 0;
        if (data.hourly && data.hourly.precipitation) {
            // Az első órás adat használata
            precipitation = data.hourly.precipitation[0] || 0;
        }
        precipitationElement.textContent = `${precipitation} mm`;
        
        // Koordináták
        coordinatesElement.textContent = `${data.latitude.toFixed(2)}°N, ${data.longitude.toFixed(2)}°E`;
        
        // Időzóna
        timezoneElement.textContent = data.timezone;
        
        // Óránkénti előrejelzés
        if (data.hourly && data.hourly.time) {
            displayHourlyForecast(data.hourly);
        }
        
        // Eredmény mutatása
        weatherResult.classList.remove('hidden');
    }
    
    // Óránkénti előrejelzés megjelenítése
    function displayHourlyForecast(hourlyData) {
        hourlyForecastElement.innerHTML = '';
        
        // Csak az első 24 órát mutatjuk
        const hoursToShow = Math.min(24, hourlyData.time.length);
        
        for (let i = 0; i < hoursToShow; i++) {
            const time = new Date(hourlyData.time[i]);
            const temperature = hourlyData.temperature_2m ? hourlyData.temperature_2m[i] : null;
            const weatherCode = hourlyData.weathercode ? hourlyData.weathercode[i] : 0;
            
            const hourlyItem = document.createElement('div');
            hourlyItem.className = 'flex-shrink-0 w-20 p-3 bg-gray-50 rounded-lg text-center';
            
            const hourSpan = document.createElement('div');
            hourSpan.textContent = time.getHours() + ':00';
            hourSpan.className = 'font-semibold mb-2';
            
            const iconSpan = document.createElement('div');
            iconSpan.innerHTML = `<i class="${getWeatherIcon(weatherCode)} text-2xl ${getWeatherIconColor(weatherCode)}"></i>`;
            iconSpan.className = 'mb-2';
            
            const tempSpan = document.createElement('div');
            tempSpan.textContent = temperature !== null ? `${temperature}°C` : 'N/A';
            tempSpan.className = 'font-medium';
            
            hourlyItem.appendChild(hourSpan);
            hourlyItem.appendChild(iconSpan);
            hourlyItem.appendChild(tempSpan);
            
            hourlyForecastElement.appendChild(hourlyItem);
        }
    }
    
    // Időjárás leírásának frissítése
    function updateWeatherDescription(weatherCode) {
        // Ikon frissítése
        weatherIcon.className = `${getWeatherIcon(weatherCode)} ${getWeatherIconColor(weatherCode)}`;
        
        // Leírás frissítése
        weatherDescriptionElement.textContent = getWeatherDescription(weatherCode);
    }
    
    // Időjárás kód alapján ikon
    function getWeatherIcon(weatherCode) {
        // WMO Weather interpretation codes (WW)
        // https://open-meteo.com/en/docs
        switch (true) {
            case weatherCode === 0:
                return 'bi bi-sun';
            case weatherCode === 1:
                return 'bi bi-sun';
            case weatherCode === 2:
                return 'bi bi-cloud-sun';
            case weatherCode === 3:
                return 'bi bi-clouds';
            case weatherCode >= 45 && weatherCode <= 48:
                return 'bi bi-cloud-fog';
            case weatherCode >= 51 && weatherCode <= 57:
                return 'bi bi-cloud-drizzle';
            case weatherCode >= 61 && weatherCode <= 67:
                return 'bi bi-cloud-rain';
            case weatherCode >= 71 && weatherCode <= 77:
                return 'bi bi-cloud-snow';
            case weatherCode >= 80 && weatherCode <= 82:
                return 'bi bi-cloud-rain-heavy';
            case weatherCode >= 85 && weatherCode <= 86:
                return 'bi bi-cloud-snow';
            case weatherCode >= 95 && weatherCode <= 99:
                return 'bi bi-cloud-lightning-rain';
            default:
                return 'bi bi-cloud';
        }
    }
    
    // Időjárás ikon színe
    function getWeatherIconColor(weatherCode) {
        switch (true) {
            case weatherCode === 0:
            case weatherCode === 1:
                return 'text-yellow-500';
            case weatherCode === 2:
            case weatherCode === 3:
                return 'text-gray-500';
            case weatherCode >= 45 && weatherCode <= 48:
                return 'text-gray-400';
            case weatherCode >= 51 && weatherCode <= 57:
                return 'text-blue-300';
            case weatherCode >= 61 && weatherCode <= 67:
                return 'text-blue-500';
            case weatherCode >= 71 && weatherCode <= 77:
            case weatherCode >= 85 && weatherCode <= 86:
                return 'text-blue-200';
            case weatherCode >= 80 && weatherCode <= 82:
                return 'text-blue-600';
            case weatherCode >= 95 && weatherCode <= 99:
                return 'text-red-500';
            default:
                return 'text-gray-500';
        }
    }
    
    // Időjárás kód alapján leírás
    function getWeatherDescription(weatherCode) {
        // WMO Weather interpretation codes (WW)
        // https://open-meteo.com/en/docs
        switch (true) {
            case weatherCode === 0:
                return 'Tiszta égbolt';
            case weatherCode === 1:
                return 'Túlnyomóan tiszta';
            case weatherCode === 2:
                return 'Részben felhős';
            case weatherCode === 3:
                return 'Felhős';
            case weatherCode >= 45 && weatherCode <= 48:
                return 'Köd';
            case weatherCode >= 51 && weatherCode <= 57:
                return 'Szitálás';
            case weatherCode >= 61 && weatherCode <= 67:
                return 'Eső';
            case weatherCode >= 71 && weatherCode <= 77:
                return 'Havazás';
            case weatherCode >= 80 && weatherCode <= 82:
                return 'Záporeső';
            case weatherCode >= 85 && weatherCode <= 86:
                return 'Hózápor';
            case weatherCode >= 95 && weatherCode <= 99:
                return 'Zivatar';
            default:
                return 'Ismeretlen időjárás';
        }
    }
    
    // Betöltés mutatása
    function showLoading() {
        loadingOverlay.classList.remove('hidden');
    }
    
    // Betöltés elrejtése
    function hideLoading() {
        loadingOverlay.classList.add('hidden');
    }
    
    // Hiba üzenet megjelenítése
    function showError(message) {
        errorMessage.textContent = message;
        errorToast.classList.remove('hidden');
    }
    
    // Kinyitható/becsukható dokumentáció
    const toggleDocsButton = document.getElementById('toggle-docs');
    const docsContent = document.getElementById('docs-content');
    const docsIcon = document.getElementById('docs-icon');
    
    if (toggleDocsButton && docsContent && docsIcon) {
        toggleDocsButton.addEventListener('click', () => {
            docsContent.classList.toggle('hidden');
            docsIcon.classList.toggle('rotate-180');
        });
    }
});
