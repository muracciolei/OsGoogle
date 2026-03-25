/**
 * Weather Service
 * Fetches weather data from wttr.in
 */

const WeatherService = {
  async fetchWeather() {
    try {
      const response = await fetch('https://wttr.in/?format=j1');
      
      if (!response.ok) {
        throw new Error('Weather fetch failed');
      }

      const data = await response.json();
      const current = data.current_condition[0];
      const nearestArea = data.nearest_area[0];

      return {
        temp: parseInt(current.temp_C),
        condition: current.weatherDesc[0].value,
        humidity: current.humidity,
        location: nearestArea.areaName[0].value,
        icon: this.getIcon(parseInt(current.temp_C))
      };
    } catch (error) {
      console.error('Weather fetch error:', error);
      return null;
    }
  },

  getIcon(temp) {
    if (temp > 30) return '🔥';
    if (temp > 25) return '☀️';
    if (temp > 20) return '🌤️';
    if (temp > 15) return '⛅';
    if (temp > 10) return '🌥️';
    if (temp > 5) return '🌧️';
    return '❄️';
  }
};

window.WeatherService = WeatherService;