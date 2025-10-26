import { useState, useEffect } from 'react'
import { 
  Sun, 
  Cloud, 
  CloudSun,
  CloudRain, 
  CloudDrizzle, 
  CloudSnow, 
  CloudLightning,
  Thermometer,
  Droplets,
  Wind,
  Sunrise,
  Sunset
} from 'lucide-react'
import { weatherService } from '../services/weatherService'
import Clock from '../components/ui/Clock'
import '../styles/Weather.css'

function Weather() {
  const [weatherData, setWeatherData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [activeTab, setActiveTab] = useState('current')

  const loadWeatherData = async () => {
    try {
      setError(null)
      
      // Try to load from cache first
      const cached = weatherService.getCachedWeather()
      if (cached) {
        setWeatherData(cached)
        setLoading(false)
      }
      
      const data = await weatherService.getWeatherData()
      setWeatherData(data)
    } catch (err) {
      // If fetch fails but we have cache, use it
      const cached = weatherService.getCachedWeather()
      if (cached) {
        setWeatherData(cached)
        setError('Using cached data. Unable to refresh.')
      } else {
        setError('Failed to load weather data. Please try again.')
      }
      console.error('Weather data error:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadWeatherData()
    
    // Refresh data every 30 minutes
    const interval = setInterval(loadWeatherData, 30 * 60 * 1000)
    return () => clearInterval(interval)
  }, [])

  const getWeatherIcon = (iconName) => {
    const icons = {
      Sun,
      Cloud,
      CloudSun,
      CloudRain,
      CloudDrizzle,
      CloudSnow,
      CloudLightning
    }
    return icons[iconName] || Cloud
  }

  const formatDate = (dateString) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', { 
      weekday: 'short', 
      month: 'short', 
      day: 'numeric' 
    })
  }

  const formatTime = (dateString) => {
    const date = new Date(dateString)
    return date.toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: false 
    })
  }

  if (loading) {
    return (
      <div className="page-container">
        <div className="weather-loading">
          <Cloud className="animate-pulse" size={32} />
          <p>Loading weather data...</p>
        </div>
      </div>
    )
  }

  if (error && !weatherData) {
    return (
      <div className="page-container">
        <div className="weather-error">
          <p>{error}</p>
        </div>
      </div>
    )
  }

  if (!weatherData) {
    return null
  }

  const WeatherIcon = getWeatherIcon(weatherData.current.icon)

  return (
    <div className="page-container">
      <div className="page-content">
        <div className="page-header">
          <div className="page-header-info">
            <h2>Weather</h2>
            <div className="location-info">
              <span>{weatherData.location.name}</span>
            </div>
            <Clock className="weather-clock" showIcon={false} showDate={true} />
          </div>
        </div>

        <div className="weather-tabs">
        <button
          className={`tab-button ${activeTab === 'current' ? 'active' : ''}`}
          onClick={() => setActiveTab('current')}
        >
          Current
        </button>
        <button
          className={`tab-button ${activeTab === 'hourly' ? 'active' : ''}`}
          onClick={() => setActiveTab('hourly')}
        >
          24 Hours
        </button>
        <button
          className={`tab-button ${activeTab === 'daily' ? 'active' : ''}`}
          onClick={() => setActiveTab('daily')}
        >
          7 Days
        </button>
      </div>

        <div className="tab-content">
          {activeTab === 'current' && (
          <div className="current-weather">
            <div className="current-main">
              <div className="temperature-display">
                <WeatherIcon size={64} className="weather-icon-main" />
                <div className="temperature-value">
                  {weatherData.current.temperature}°C
                </div>
              </div>
              <div className="weather-description">
                {weatherData.current.weatherDescription}
              </div>
            </div>
            
            <div className="current-details">
              <div className="detail-item">
                <Thermometer size={20} />
                <span>Feels like {weatherData.current.feelsLike}°C</span>
              </div>
              <div className="detail-item">
                <Droplets size={20} />
                <span>Humidity {weatherData.current.humidity}%</span>
              </div>
              <div className="detail-item">
                <Wind size={20} />
                <span>Wind {weatherData.current.windSpeed} km/h</span>
              </div>
            </div>
            
            {weatherData.daily.sunrise && weatherData.daily.sunset && (
              <div className="sun-times">
                <div className="sun-time-item">
                  <Sunrise size={20} />
                  <span>{formatTime(weatherData.daily.sunrise[0])}</span>
                </div>
                <div className="sun-time-item">
                  <Sunset size={20} />
                  <span>{formatTime(weatherData.daily.sunset[0])}</span>
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === 'hourly' && (
          <div className="hourly-forecast">
            <div className="forecast-scroll">
              {(() => {
                const now = new Date()
                const futureHours = weatherData.hourly.time
                  .map((time, index) => ({ time, index }))
                  .filter(({ time }) => new Date(time) >= now)
                  .slice(0, 24)

                return futureHours.map(({ time, index }) => {
                  const HourlyIcon = getWeatherIcon(weatherData.hourly.icons[index])
                  return (
                    <div key={time} className="hourly-item">
                      <div className="hourly-time">
                        {formatTime(time)}
                      </div>
                      <HourlyIcon size={24} className="hourly-icon" />
                      <div className="hourly-temp">
                        {weatherData.hourly.temperature[index]}°
                      </div>
                      {weatherData.hourly.precipitationProbability[index] > 20 && (
                        <div className="hourly-precip">
                          <Droplets size={12} />
                          {weatherData.hourly.precipitationProbability[index]}%
                        </div>
                      )}
                    </div>
                  )
                })
              })()}
            </div>
          </div>
        )}

        {activeTab === 'daily' && (
          <div className="daily-forecast">
            {(() => {
              const today = new Date()
              today.setHours(0, 0, 0, 0)
              
              const futureDays = weatherData.daily.time
                .map((time, index) => ({ time, index }))
                .filter(({ time }) => {
                  const forecastDate = new Date(time)
                  forecastDate.setHours(0, 0, 0, 0)
                  return forecastDate > today
                })

              return futureDays.map(({ time, index }) => {
                const DailyIcon = getWeatherIcon(weatherData.daily.icons[index])
                return (
                  <div key={time} className="daily-item">
                    <div className="daily-date">
                      {formatDate(time)}
                    </div>
                    <DailyIcon size={32} className="daily-icon" />
                    <div className="daily-description">
                      {weatherData.daily.descriptions[index]}
                    </div>
                    <div className="daily-temps">
                      <span className="temp-high">
                        {weatherData.daily.maxTemperature[index]}°
                      </span>
                      <span className="temp-low">
                        {weatherData.daily.minTemperature[index]}°
                      </span>
                    </div>
                    {weatherData.daily.precipitationSum[index] > 0 && (
                      <div className="daily-precip">
                        <Droplets size={12} />
                        {weatherData.daily.precipitationSum[index]}mm
                      </div>
                    )}
                  </div>
                )
              })
            })()}
          </div>
        )}
        </div>
      </div>
    </div>
  )
}

export default Weather