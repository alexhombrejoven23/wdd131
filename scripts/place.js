const temperature = 10; 
const windSpeed = 5; 

/**
 * Calculates wind chill factor using the metric formula
 * Formula: 13.12 + 0.6215*T - 11.37*V^0.16 + 0.3965*T*V^0.16
 * where T = temperature in Celsius and V = wind speed in km/h
 * @param {number} temp 
 * @param {number} wind 
 * @returns {number} 
 */
function calculateWindChill(temp, wind) {
    return 13.12 + 0.6215 * temp - 11.37 * Math.pow(wind, 0.16) + 0.3965 * temp * Math.pow(wind, 0.16);
}

function displayWindChill() {
    const windChillElement = document.getElementById('windchill');

    if (temperature <= 10 && windSpeed > 4.8) {
        const windChillValue = calculateWindChill(temperature, windSpeed);
        windChillElement.textContent = `${windChillValue.toFixed(1)} °C`;
    } else {
        windChillElement.textContent = 'N/A';
    }
}

function displayCurrentYear() {
    const currentYearElement = document.getElementById('currentYear');
    const currentYear = new Date().getFullYear();
    currentYearElement.textContent = currentYear;
}

function displayLastModified() {
    const lastModifiedElement = document.getElementById('lastModified');
    const lastModified = document.lastModified;
    lastModifiedElement.textContent = lastModified;
}

document.addEventListener('DOMContentLoaded', () => {
    displayWindChill();
    displayCurrentYear();
    displayLastModified();
});