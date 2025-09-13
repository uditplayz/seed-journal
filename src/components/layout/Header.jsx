import React from 'react'
import { useTheme } from '../../context/ThemeContext'
import { useApp } from '../../context/AppContext'
import { Sun, Moon, Monitor, Wifi, WifiOff } from 'lucide-react'

export default function Header() {
  const { theme, setTheme, isDark } = useTheme()
  const { isOnline } = useApp()

  const themeOptions = [
    { value: 'light', icon: Sun, label: 'Light' },
    { value: 'dark', icon: Moon, label: 'Dark' },
    { value: 'system', icon: Monitor, label: 'System' }
  ]

  return (
    <header className="fixed top-0 left-0 right-0 bg-white/80 dark:bg-gray-900/80 backdrop-blur-md border-b border-gray-200 dark:border-gray-700 z-50 safe-area-top">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-lg">🌱</span>
            </div>
            <h1 className="text-lg font-semibold text-gray-900 dark:text-white">
              Seed Journal
            </h1>
          </div>

          {/* Right side */}
          <div className="flex items-center space-x-3">
            {/* Online/Offline indicator */}
            <div className="flex items-center space-x-1">
              {isOnline ? (
                <Wifi className="w-4 h-4 text-green-500" />
              ) : (
                <WifiOff className="w-4 h-4 text-red-500" />
              )}
            </div>

            {/* Theme toggle */}
            <div className="relative">
              <select
                value={theme}
                onChange={(e) => setTheme(e.target.value)}
                className="appearance-none bg-transparent border border-gray-300 dark:border-gray-600 rounded-lg px-8 py-1.5 pr-8 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                {themeOptions.map(({ value, label }) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </select>

              {/* Theme icon */}
              <div className="absolute left-2 top-1/2 transform -translate-y-1/2 pointer-events-none">
                {themeOptions.map(({ value, icon: Icon }) => (
                  theme === value && (
                    <Icon key={value} className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                  )
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>
  )
}