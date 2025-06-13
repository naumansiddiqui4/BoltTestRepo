import React, { useState } from 'react'
import { Calculator } from './components/Calculator'
import { TodoList } from './components/TodoList'
import { WeatherWidget } from './components/WeatherWidget'

function App() {
  const [activeTab, setActiveTab] = useState<'calculator' | 'todo' | 'weather'>('calculator')

  const tabs = [
    { id: 'calculator' as const, label: 'Calculator', icon: '🧮' },
    { id: 'todo' as const, label: 'Todo List', icon: '📝' },
    { id: 'weather' as const, label: 'Weather', icon: '🌤️' },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-8">
        <header className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">
            Bolt Test Repository
          </h1>
          <p className="text-gray-600">A collection of interactive components</p>
        </header>

        <div className="max-w-4xl mx-auto">
          {/* Tab Navigation */}
          <div className="flex justify-center mb-8">
            <div className="bg-white rounded-lg p-1 shadow-lg">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`px-6 py-3 rounded-md font-medium transition-all duration-200 ${
                    activeTab === tab.id
                      ? 'bg-blue-500 text-white shadow-md'
                      : 'text-gray-600 hover:text-blue-500 hover:bg-blue-50'
                  }`}
                >
                  <span className="mr-2">{tab.icon}</span>
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          {/* Tab Content */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            {activeTab === 'calculator' && <Calculator />}
            {activeTab === 'todo' && <TodoList />}
            {activeTab === 'weather' && <WeatherWidget />}
          </div>
        </div>
      </div>
    </div>
  )
}

export default App