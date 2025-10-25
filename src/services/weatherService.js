// Weather service for Open-Meteo API integration
const BASE_URL = 'https://api.open-meteo.com/v1/forecast'

// Dasmarinas, Cavite, Philippines coordinates
const DASMARINAS_COORDS = {
  latitude: 14.2949,
  longitude: 120.9441
}

// Cache key for localStorage
const CACHE_KEY = 'weather_cache'
const CACHE_DURATION = 30 * 60 * 1000 // 30 minutes

// Weather code to icon mapping (WMO weather codes)
const WEATHER_ICONS = {
  0: 'Sun', // Clear sky
  1: 'CloudSun', // Mainly clear
  2: 'Cloud', // Partly cloudy
  3: 'Cloud', // Overcast
  45: 'CloudDrizzle', // Fog
  48: 'CloudDrizzle', // Depositing rime fog
  51: 'CloudDrizzle', // Drizzle: Light
  53: 'CloudDrizzle', // Drizzle: Moderate
  55: 'CloudDrizzle', // Drizzle: Dense intensity
  56: 'CloudSnow', // Freezing Drizzle: Light
  57: 'CloudSnow', // Freezing Drizzle: Dense intensity
  61: 'CloudRain', // Rain: Slight
  63: 'CloudRain', // Rain: Moderate
  65: 'CloudRain', // Rain: Heavy intensity
  66: 'CloudRain', // Freezing Rain: Light
  67: 'CloudRain', // Freezing Rain: Heavy intensity
  71: 'CloudSnow', // Snow fall: Slight
  73: 'CloudSnow', // Snow fall: Moderate
  75: 'CloudSnow', // Snow fall: Heavy intensity
  77: 'CloudSnow', // Snow grains
  80: 'CloudRain', // Rain showers: Slight
  81: 'CloudRain', // Rain showers: Moderate
  82: 'CloudRain', // Rain showers: Violent
  85: 'CloudSnow', // Snow showers: Slight
  86: 'CloudSnow', // Snow showers: Heavy
  95: 'CloudLightning', // Thunderstorm: Slight
  96: 'CloudLightning', // Thunderstorm: Moderate
  99: 'CloudLightning' // Thunderstorm: Heavy
}

// Weather code to description mapping
const WEATHER_DESCRIPTIONS = {
  0: 'Clear sky',
  1: 'Mainly clear',
  2: 'Partly cloudy',
  3: 'Overcast',
  45: 'Fog',
  48: 'Depositing rime fog',
  51: 'Light drizzle',
  53: 'Moderate drizzle',
  55: 'Dense drizzle',
  56: 'Light freezing drizzle',
  57: 'Dense freezing drizzle',
  61: 'Slight rain',
  63: 'Moderate rain',
  65: 'Heavy rain',
  66: 'Light freezing rain',
  67: 'Heavy freezing rain',
  71: 'Slight snow',
  73: 'Moderate snow',
  75: 'Heavy snow',
  77: 'Snow grains',
  80: 'Slight rain showers',
  81: 'Moderate rain showers',
  82: 'Violent rain showers',
  85: 'Slight snow showers',
  86: 'Heavy snow showers',
  95: 'Slight thunderstorm',
  96: 'Moderate thunderstorm',
  99: 'Heavy thunderstorm'
}

export const weatherService = {
  // Get current weather, 24-hour forecast, and 7-day forecast
  async getWeatherData() {
    try {
      const params = new URLSearchParams({
        latitude: DASMARINAS_COORDS.latitude.toString(),
        longitude: DASMARINAS_COORDS.longitude.toString(),
        current: 'temperature_2m,apparent_temperature,weather_code,relative_humidity_2m,wind_speed_10m',
        hourly: 'temperature_2m,weather_code,precipitation_probability,wind_speed_10m',
        daily: 'weather_code,temperature_2m_max,temperature_2m_min,precipitation_sum,sunrise,sunset',
        timezone: 'Asia/Manila',
        forecast_days: 8
      })

      const response = await fetch(`${BASE_URL}?${params}`)

      if (!response.ok) {
        throw new Error(`Weather API error: ${response.status}`)
      }

      const data = await response.json()
      const formattedData = this.formatWeatherData(data)

      // Cache the data
      this.cacheWeatherData(formattedData)

      return formattedData
    } catch (error) {
      console.error('Error fetching weather data:', error)
      throw error
    }
  },

  // Format raw API data into structured format
  formatWeatherData(data) {
    const current = data.current || {}
    const hourly = data.hourly || {}
    const daily = data.daily || {}

    return {
      current: {
        temperature: Math.round(current.temperature_2m || 0),
        feelsLike: Math.round(current.apparent_temperature || current.temperature_2m || 0),
        weatherCode: current.weather_code || 0,
        weatherDescription: WEATHER_DESCRIPTIONS[current.weather_code] || 'Unknown',
        humidity: Math.round(current.relative_humidity_2m || 0),
        windSpeed: Math.round(current.wind_speed_10m || 0),
        icon: WEATHER_ICONS[current.weather_code] || 'Cloud',
        lastUpdated: new Date().toISOString()
      },
      hourly: {
        time: hourly.time || [],
        temperature: hourly.temperature_2m?.map(temp => Math.round(temp)) || [],
        weatherCode: hourly.weather_code || [],
        precipitationProbability: hourly.precipitation_probability || [],
        windSpeed: hourly.wind_speed_10m?.map(speed => Math.round(speed)) || [],
        icons: (hourly.weather_code || []).map(code => WEATHER_ICONS[code] || 'Cloud'),
        descriptions: (hourly.weather_code || []).map(code => WEATHER_DESCRIPTIONS[code] || 'Unknown')
      },
      daily: {
        time: daily.time || [],
        maxTemperature: daily.temperature_2m_max?.map(temp => Math.round(temp)) || [],
        minTemperature: daily.temperature_2m_min?.map(temp => Math.round(temp)) || [],
        weatherCode: daily.weather_code || [],
        precipitationSum: daily.precipitation_sum || [],
        sunrise: daily.sunrise || [],
        sunset: daily.sunset || [],
        icons: (daily.weather_code || []).map(code => WEATHER_ICONS[code] || 'Cloud'),
        descriptions: (daily.weather_code || []).map(code => WEATHER_DESCRIPTIONS[code] || 'Unknown')
      },
      location: {
        name: 'Dasmarinas, Cavite',
        latitude: DASMARINAS_COORDS.latitude,
        longitude: DASMARINAS_COORDS.longitude
      }
    }
  },

  // Get weather icon name from lucide-react
  getWeatherIcon(weatherCode) {
    return WEATHER_ICONS[weatherCode] || 'Cloud'
  },

  // Get weather description
  getWeatherDescription(weatherCode) {
    return WEATHER_DESCRIPTIONS[weatherCode] || 'Unknown weather condition'
  },

  // Cache weather data to localStorage
  cacheWeatherData(data) {
    try {
      const cacheData = {
        data,
        timestamp: Date.now()
      }
      localStorage.setItem(CACHE_KEY, JSON.stringify(cacheData))
    } catch (error) {
      console.error('Error caching weather data:', error)
    }
  },

  // Get cached weather data if still valid
  getCachedWeather() {
    try {
      const cached = localStorage.getItem(CACHE_KEY)
      if (!cached) return null

      const { data, timestamp } = JSON.parse(cached)
      const age = Date.now() - timestamp

      // Return cached data if less than 30 minutes old
      if (age < CACHE_DURATION) {
        return data
      }

      // Cache expired, remove it
      localStorage.removeItem(CACHE_KEY)
      return null
    } catch (error) {
      console.error('Error reading cached weather data:', error)
      return null
    }
  }
}