import React, { useState } from 'react'

interface WeatherData {
  city: string
  temperature: number
  condition: string
  humidity: number
  windSpeed: number
  icon: string
}

export function WeatherWidget() {
  const [city, setCity] = useState('')
  const [weather, setWeather] = useState<WeatherData | null>(null)
  const [loading, setLoading] = useState(false)

  // Mock weather data for demonstration
  const mockWeatherData: Record<string, WeatherData> = {
    'new york': {
      city: 'New York',
      temperature: 22,
      condition: 'Partly Cloudy',
      humidity: 65,
      windSpeed: 12,
      icon: '⛅'
    },
    'london': {
      city: 'London',
      temperature: 18,
      condition: 'Rainy',
      humidity: 80,
      windSpeed: 8,
      icon: '🌧️'
    },
    'tokyo': {
      city: 'Tokyo',
      temperature: 28,
      condition: 'Sunny',
      humidity: 55,
      windSpeed: 6,
      icon: '☀️'
    },
    'paris': {
      city: 'Paris',
      temperature: 20,
      condition: 'Cloudy',
      humidity: 70,
      windSpeed: 10,
      icon: '☁️'
    }
  }

  const searchWeather = async () => {
    if (!city.trim()) return

    setLoading(true)
    
    // Simulate API call delay
    setTimeout(() => {
      const weatherData = mockWeatherData[city.toLowerCase()]
      if (weatherData) {
        setWeather(weatherData)
      } else {
        setWeather({
          city: city,
          temperature: Math.floor(Math.random() * 30) + 5,
          condition: 'Clear',
          humidity: Math.floor(Math.random() * 40) + 40,
          windSpeed: Math.floor(Math.random() * 15) + 5,
          icon: '🌤️'
        })
      }
      setLoading(false)
    }, 1000)
  }

  return (
    <div className="max-w-md mx-auto">
      <h2 className="text-2xl font-bold text-center mb-6 text-gray-800">Weather Widget</h2>
      
      <div className="mb-6">
        <div className="flex gap-2">
          <input
            type="text"
            value={city}
            onChange={(e) => setCity(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && searchWeather()}
            placeholder="Enter city name..."
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          <button
            onClick={searchWeather}
            disabled={loading}
            className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors duration-200 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? '...' : 'Search'}
          </button>
        </div>
      </div>

      {loading && (
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
          <p className="text-gray-600 mt-2">Loading weather data...</p>
        </div>
      )}

      {weather && !loading && (
        <div className="bg-gradient-to-br from-blue-400 to-blue-600 text-white rounded-xl p-6 shadow-lg">
          <div className="text-center mb-4">
            <div className="text-6xl mb-2">{weather.icon}</div>
            <h3 className="text-2xl font-bold">{weather.city}</h3>
            <p className="text-blue-100">{weather.condition}</p>
          </div>
          
          <div className="text-center mb-6">
            <div className="text-5xl font-light">{weather.temperature}°C</div>
          </div>
          
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div className="bg-white/20 rounded-lg p-3 text-center">
              <div className="text-blue-100">Humidity</div>
              <div className="text-xl font-semibold">{weather.humidity}%</div>
            </div>
            <div className="bg-white/20 rounded-lg p-3 text-center">
              <div className="text-blue-100">Wind Speed</div>
              <div className="text-xl font-semibold">{weather.windSpeed} km/h</div>
            </div>
          </div>
        </div>
      )}

      {!weather && !loading && (
        <div className="text-center text-gray-500 py-8">
          <div className="text-4xl mb-2">🌍</div>
          <p>Enter a city name to get weather information</p>
          <p className="text-sm mt-2">Try: New York, London, Tokyo, or Paris</p>
        </div>
      )}
    </div>
  )
}