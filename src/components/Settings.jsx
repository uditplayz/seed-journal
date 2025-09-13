import React from 'react'
import { useApp } from '../context/AppContext'
import { useTheme } from '../context/ThemeContext'
import { 
  Download, 
  Upload, 
  Trash2, 
  Moon, 
  Sun, 
  Monitor,
  Bell,
  BellOff,
  Info,
  ExternalLink
} from 'lucide-react'
import toast from 'react-hot-toast'

export default function Settings() {
  const { settings, updateSettings, exportData, importData } = useApp()
  const { theme, setTheme } = useTheme()
  const [showExportData, setShowExportData] = React.useState(false)
  const fileInputRef = React.useRef(null)

  const handleExport = async () => {
    try {
      const data = await exportData()
      const blob = new Blob([JSON.stringify(data, null, 2)], { 
        type: 'application/json' 
      })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `seed-journal-backup-${new Date().toISOString().split('T')[0]}.json`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)

      setShowExportData(true)
    } catch (error) {
      toast.error('Failed to export data')
    }
  }

  const handleImport = async (event) => {
    const file = event.target.files?.[0]
    if (!file) return

    try {
      const text = await file.text()
      const data = JSON.parse(text)

      // Basic validation
      if (!data.habits && !data.completions && !data.settings) {
        throw new Error('Invalid backup file format')
      }

      await importData(data)
    } catch (error) {
      toast.error('Failed to import data. Please check the file format.')
    } finally {
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    }
  }

  const handleClearData = () => {
    if (window.confirm('Are you sure you want to clear all data? This action cannot be undone.')) {
      // Clear IndexedDB and localStorage
      if ('indexedDB' in window) {
        indexedDB.deleteDatabase('seed-journal-db')
      }
      localStorage.clear()
      window.location.reload()
    }
  }

  const themeOptions = [
    { value: 'light', icon: Sun, label: 'Light', description: 'Always use light theme' },
    { value: 'dark', icon: Moon, label: 'Dark', description: 'Always use dark theme' },
    { value: 'system', icon: Monitor, label: 'System', description: 'Follow system preference' }
  ]

  return (
    <div className="pt-6 pb-6 space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
          Settings
        </h2>
        <p className="text-gray-600 dark:text-gray-400 mt-1">
          Customize your experience and manage your data
        </p>
      </div>

      {/* Appearance */}
      <div className="card p-6 space-y-4">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
          Appearance
        </h3>

        <div className="space-y-3">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            Theme
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {themeOptions.map(({ value, icon: Icon, label, description }) => (
              <button
                key={value}
                onClick={() => setTheme(value)}
                className={`p-3 rounded-lg border-2 transition-all duration-200 text-left ${
                  theme === value
                    ? 'border-primary-600 bg-primary-50 dark:bg-primary-900/20'
                    : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <Icon className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                  <div>
                    <div className="font-medium text-gray-900 dark:text-white">
                      {label}
                    </div>
                    <div className="text-xs text-gray-600 dark:text-gray-400">
                      {description}
                    </div>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Notifications */}
      <div className="card p-6 space-y-4">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
          Notifications
        </h3>

        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            {settings.notifications ? (
              <Bell className="w-5 h-5 text-primary-600 dark:text-primary-400" />
            ) : (
              <BellOff className="w-5 h-5 text-gray-400" />
            )}
            <div>
              <div className="font-medium text-gray-900 dark:text-white">
                Daily Reminders
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">
                Get reminded to complete your habits
              </div>
            </div>
          </div>

          <button
            onClick={() => updateSettings({ notifications: !settings.notifications })}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200 ${
              settings.notifications
                ? 'bg-primary-600'
                : 'bg-gray-200 dark:bg-gray-700'
            }`}
          >
            <span
              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform duration-200 ${
                settings.notifications ? 'translate-x-6' : 'translate-x-1'
              }`}
            />
          </button>
        </div>
      </div>

      {/* Data Management */}
      <div className="card p-6 space-y-4">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
          Data Management
        </h3>

        <div className="space-y-3">
          {/* Export Data */}
          <button
            onClick={handleExport}
            className="w-full btn btn-secondary justify-start"
          >
            <Download className="w-4 h-4 mr-3" />
            <div className="text-left">
              <div className="font-medium">Export Data</div>
              <div className="text-xs text-gray-600 dark:text-gray-400">
                Download your habits and progress as JSON
              </div>
            </div>
          </button>

          {/* Import Data */}
          <button
            onClick={() => fileInputRef.current?.click()}
            className="w-full btn btn-secondary justify-start"
          >
            <Upload className="w-4 h-4 mr-3" />
            <div className="text-left">
              <div className="font-medium">Import Data</div>
              <div className="text-xs text-gray-600 dark:text-gray-400">
                Restore from a backup file
              </div>
            </div>
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept=".json"
            onChange={handleImport}
            className="hidden"
          />

          {/* Clear Data */}
          <button
            onClick={handleClearData}
            className="w-full btn bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 border-red-200 dark:border-red-800 hover:bg-red-100 dark:hover:bg-red-900/30 justify-start"
          >
            <Trash2 className="w-4 h-4 mr-3" />
            <div className="text-left">
              <div className="font-medium">Clear All Data</div>
              <div className="text-xs text-red-500 dark:text-red-400">
                Permanently delete all habits and progress
              </div>
            </div>
          </button>
        </div>
      </div>

      {/* App Info */}
      <div className="card p-6 space-y-4">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
          About
        </h3>

        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-gray-600 dark:text-gray-400">Version</span>
            <span className="font-medium text-gray-900 dark:text-white">1.0.0</span>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-gray-600 dark:text-gray-400">Storage Used</span>
            <span className="font-medium text-gray-900 dark:text-white">
              {navigator.storage && navigator.storage.estimate ? '~' : ''} 
              Calculating...
            </span>
          </div>
        </div>

        <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
            Built with ❤️ by Udit Jain for better habits. Inspired by Atomic Habits by James Clear.
          </p>

          <a
            href="https://jamesclear.com/atomic-habits"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center text-sm text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300"
          >
            Learn more about Atomic Habits
            <ExternalLink className="w-3 h-3 ml-1" />
          </a>
        </div>
      </div>

      {/* Export Success Modal */}
      {showExportData && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 max-w-sm w-full">
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-10 h-10 bg-success-100 dark:bg-success-900/20 rounded-full flex items-center justify-center">
                <Download className="w-5 h-5 text-success-600 dark:text-success-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Export Successful
              </h3>
            </div>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Your data has been exported successfully. Keep this file safe as a backup.
            </p>
            <button
              onClick={() => setShowExportData(false)}
              className="w-full btn btn-primary"
            >
              Got it
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
