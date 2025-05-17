document.addEventListener('DOMContentLoaded', () => {
    // DOM elemek
    const cacheHitsElement = document.getElementById('cache-hits');
    const rateLimitExceededElement = document.getElementById('rate-limit-exceeded');
    const totalApiCallsElement = document.getElementById('total-api-calls');
    const refreshButton = document.getElementById('refresh-metrics');
    const loadingOverlay = document.getElementById('loading-overlay');
    const errorToast = document.getElementById('error-toast');
    const errorMessage = document.getElementById('error-message');
    const toastCloseButton = document.getElementById('toast-close');
    
    // Chart.js diagram
    let apiCallsChart = null;
    
    // Toast bezárása gomb
    toastCloseButton.addEventListener('click', () => {
        errorToast.classList.add('hidden');
    });
    
    // Kezdeti betöltés
    fetchMetrics();
    
    // Frissítés gomb
    refreshButton.addEventListener('click', fetchMetrics);
    
    // Metrikák lekérdezése
    async function fetchMetrics() {
        try {
            showLoading();
            
            const response = await fetch('/metrics');
            
            if (!response.ok) {
                throw new Error('Hiba történt a metrikák lekérdezése során.');
            }
            
            const data = await response.json();
            displayMetrics(data);
        } catch (error) {
            showError(error.message);
        } finally {
            hideLoading();
        }
    }
    
    // Metrikák megjelenítése
    function displayMetrics(data) {
        // Számok megjelenítése
        cacheHitsElement.textContent = data.cacheHits;
        rateLimitExceededElement.textContent = data.rateLimitExceeded;
        
        // Összes API hívás számítása
        let totalCalls = 0;
        for (const date in data.apiCalls) {
            totalCalls += data.apiCalls[date];
        }
        totalApiCallsElement.textContent = totalCalls;
        
        // Diagram készítése
        createApiCallsChart(data.apiCalls);
    }
    
    // API hívások diagram
    function createApiCallsChart(apiCalls) {
        // Adatok rendezése dátum szerint
        const dates = Object.keys(apiCalls).sort();
        const counts = dates.map(date => apiCalls[date]);
        
        // Diagram konténer
        const ctx = document.getElementById('api-calls-chart').getContext('2d');
        
        // Meglévő diagram elpusztítása
        if (apiCallsChart) {
            apiCallsChart.destroy();
        }
        
        // Új diagram létrehozása
        apiCallsChart = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: dates,
                datasets: [{
                    label: 'API hívások száma',
                    data: counts,
                    backgroundColor: 'rgba(59, 130, 246, 0.5)',
                    borderColor: 'rgb(59, 130, 246)',
                    borderWidth: 1
                }]
            },
            options: {
                responsive: true,
                scales: {
                    y: {
                        beginAtZero: true,
                        ticks: {
                            precision: 0
                        }
                    }
                },
                plugins: {
                    title: {
                        display: true,
                        text: 'Napi API hívások száma',
                        font: {
                            size: 16
                        }
                    },
                    tooltip: {
                        callbacks: {
                            title: (items) => {
                                return formattedDate(items[0].label);
                            }
                        }
                    }
                }
            }
        });
    }
    
    // Dátum formázása
    function formattedDate(isoDate) {
        const date = new Date(isoDate);
        return date.toLocaleDateString('hu-HU', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
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
});
