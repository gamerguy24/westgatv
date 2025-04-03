const counties = {
    carroll: { lat: 33.5785, lon: -85.0766 },
    haralson: { lat: 33.7928, lon: -85.2119 },
    heard: { lat: 33.2871, lon: -85.1283 },
    cleburne: { lat: 33.6773, lon: -85.5149 },
    randolph: { lat: 33.2904, lon: -85.4556 }
};

async function fetchWeather(county, coords) {
    try {
        const response = await fetch(
            `https://api.open-meteo.com/v1/forecast?latitude=${coords.lat}&longitude=${coords.lon}&current=temperature_2m,wind_speed_10m&temperature_unit=fahrenheit&wind_speed_unit=mph&timezone=America/New_York`
        );
        const data = await response.json();
        
        const element = document.getElementById(`${county}-weather`).querySelector('.weather-data');
        if (element && data.current) {
            element.innerHTML = `
                <p class="temp">Temperature: ${Math.round(data.current.temperature_2m)}°F</p>
                <p class="wind">Wind Speed: ${Math.round(data.current.wind_speed_10m)} MPH</p>
                <p class="time">Updated: ${new Date().toLocaleTimeString()}</p>
            `;
        }
    } catch (error) {
        console.error(`Error fetching weather for ${county}:`, error);
        const element = document.getElementById(`${county}-weather`).querySelector('.weather-data');
        if (element) {
            element.innerHTML = `<p class="error">Weather data currently unavailable</p>`;
        }
    }
}

function updateAllWeather() {
    Object.entries(counties).forEach(([county, coords]) => {
        fetchWeather(county, coords);
    });
}

// Update weather every 15 minutes
updateAllWeather();
setInterval(updateAllWeather, 15 * 60 * 1000);
