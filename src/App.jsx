import React from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { AppProvider } from './context/AppContext'
import { ThemeProvider } from './context/ThemeContext'
import Layout from './components/layout/Layout'
import Dashboard from './components/dashboard/Dashboard'
import HabitList from './components/habits/HabitList'
import Analytics from './components/analytics/Analytics'
import Settings from './components/Settings'
import { ErrorBoundary } from './components/common/ErrorBoundary'

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider>
        <AppProvider>
          <Router>
            <Layout>
              <Routes>
                <Route path="/" element={<Dashboard />} />
                <Route path="/habits" element={<HabitList />} />
                <Route path="/analytics" element={<Analytics />} />
                <Route path="/settings" element={<Settings />} />
              </Routes>
            </Layout>
          </Router>
          <Toaster 
            position="top-center"
            toastOptions={{
              duration: 3000,
              className: 'bg-white dark:bg-gray-800 text-gray-900 dark:text-white border border-gray-200 dark:border-gray-700',
              style: {
                borderRadius: '8px',
                padding: '12px 16px'
              }
            }}
          />
        </AppProvider>
      </ThemeProvider>
    </ErrorBoundary>
  )
}

export default App