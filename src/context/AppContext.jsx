import React, { createContext, useContext, useReducer, useEffect } from 'react'
import { db } from '../services/database'
import { generateId, formatDate } from '../utils/habitUtils'
import toast from 'react-hot-toast'

const AppContext = createContext()

const initialState = {
  habits: [],
  completions: [],
  settings: {
    theme: 'system',
    notifications: true,
    firstDayOfWeek: 'monday',
    reminderTime: '09:00'
  },
  loading: false,
  error: null,
  isOnline: navigator.onLine
}

function appReducer(state, action) {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, loading: action.payload }

    case 'SET_ERROR':
      return { ...state, error: action.payload, loading: false }

    case 'SET_HABITS':
      return { ...state, habits: action.payload }

    case 'ADD_HABIT':
      return { ...state, habits: [...state.habits, action.payload] }

    case 'UPDATE_HABIT':
      return {
        ...state,
        habits: state.habits.map(habit =>
          habit.id === action.payload.id ? action.payload : habit
        )
      }

    case 'DELETE_HABIT':
      return {
        ...state,
        habits: state.habits.filter(habit => habit.id !== action.payload)
      }

    case 'SET_COMPLETIONS':
      return { ...state, completions: action.payload }

    case 'ADD_COMPLETION':
      return { ...state, completions: [...state.completions, action.payload] }

    case 'UPDATE_COMPLETION':
      return {
        ...state,
        completions: state.completions.map(completion =>
          completion.id === action.payload.id ? action.payload : completion
        )
      }

    case 'REMOVE_COMPLETION':
      return {
        ...state,
        completions: state.completions.filter(completion => completion.id !== action.payload)
      }

    case 'SET_SETTINGS':
      return { ...state, settings: { ...state.settings, ...action.payload } }

    case 'SET_ONLINE_STATUS':
      return { ...state, isOnline: action.payload }

    default:
      return state
  }
}

export function AppProvider({ children }) {
  const [state, dispatch] = useReducer(appReducer, initialState)

  useEffect(() => {
    loadInitialData()

    // Online/offline status listeners
    const handleOnline = () => {
      dispatch({ type: 'SET_ONLINE_STATUS', payload: true })
      toast.success('Back online!')
    }
    const handleOffline = () => {
      dispatch({ type: 'SET_ONLINE_STATUS', payload: false })
      toast('Working offline', { icon: '📱' })
    }

    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)

    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [])

  const loadInitialData = async () => {
    dispatch({ type: 'SET_LOADING', payload: true })

    try {
      const [habits, completions, settings] = await Promise.all([
        db.getHabits(),
        db.getTodayCompletions(),
        db.getAllSettings()
      ])

      dispatch({ type: 'SET_HABITS', payload: habits })
      dispatch({ type: 'SET_COMPLETIONS', payload: completions })

      // Convert settings array to object
      const settingsObj = settings.reduce((acc, { key, value }) => {
        acc[key] = value
        return acc
      }, {})

      dispatch({ 
        type: 'SET_SETTINGS', 
        payload: { ...initialState.settings, ...settingsObj }
      })
    } catch (error) {
      console.error('Failed to load initial data:', error)
      dispatch({ type: 'SET_ERROR', payload: error.message })
      toast.error('Failed to load data')
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false })
    }
  }

  const createHabit = async (habitData) => {
    try {
      const habit = {
        id: generateId(),
        ...habitData,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        isActive: true,
        streakCount: 0,
        totalCompletions: 0,
        bestStreak: 0
      }

      await db.saveHabit(habit)
      dispatch({ type: 'ADD_HABIT', payload: habit })
      toast.success('Habit created successfully!')
      return habit
    } catch (error) {
      console.error('Failed to create habit:', error)
      dispatch({ type: 'SET_ERROR', payload: error.message })
      toast.error('Failed to create habit')
      throw error
    }
  }

  const updateHabit = async (habitId, updates) => {
    try {
      const existingHabit = state.habits.find(h => h.id === habitId)
      if (!existingHabit) throw new Error('Habit not found')

      const updatedHabit = {
        ...existingHabit,
        ...updates,
        updatedAt: new Date().toISOString()
      }

      await db.saveHabit(updatedHabit)
      dispatch({ type: 'UPDATE_HABIT', payload: updatedHabit })
      toast.success('Habit updated successfully!')
      return updatedHabit
    } catch (error) {
      console.error('Failed to update habit:', error)
      dispatch({ type: 'SET_ERROR', payload: error.message })
      toast.error('Failed to update habit')
      throw error
    }
  }

  const deleteHabit = async (habitId) => {
    try {
      await db.deleteHabit(habitId)
      dispatch({ type: 'DELETE_HABIT', payload: habitId })
      toast.success('Habit deleted successfully!')
    } catch (error) {
      console.error('Failed to delete habit:', error)
      dispatch({ type: 'SET_ERROR', payload: error.message })
      toast.error('Failed to delete habit')
      throw error
    }
  }

  const toggleHabitCompletion = async (habitId, date = new Date()) => {
    try {
      const dateStr = formatDate(date)
      const existingCompletion = state.completions.find(
        c => c.habitId === habitId && c.date === dateStr
      )

      if (existingCompletion) {
        // Remove completion
        await db.deleteCompletion(existingCompletion.id)
        dispatch({ type: 'REMOVE_COMPLETION', payload: existingCompletion.id })
        toast('Habit marked as incomplete', { icon: '⏪' })
      } else {
        // Add completion
        const completion = {
          id: generateId(),
          habitId,
          date: dateStr,
          value: 1,
          createdAt: new Date().toISOString()
        }

        await db.saveCompletion(completion)
        dispatch({ type: 'ADD_COMPLETION', payload: completion })

        // Trigger haptic feedback if available
        if (navigator.vibrate) {
          navigator.vibrate(50)
        }

        toast.success('Great job! 🎉', {
          duration: 2000,
          style: {
            background: '#10b981',
            color: 'white',
          }
        })
      }

      // Update habit statistics
      await updateHabitStats(habitId)
    } catch (error) {
      console.error('Failed to toggle habit completion:', error)
      dispatch({ type: 'SET_ERROR', payload: error.message })
      toast.error('Failed to update habit')
      throw error
    }
  }

  const updateHabitStats = async (habitId) => {
    try {
      const habit = state.habits.find(h => h.id === habitId)
      if (!habit) return

      const completions = await db.getCompletions(
        habitId,
        new Date(Date.now() - 365 * 24 * 60 * 60 * 1000), // Last year
        new Date()
      )

      const totalCompletions = completions.length
      const streakCount = calculateCurrentStreak(completions)
      const bestStreak = Math.max(habit.bestStreak || 0, streakCount)

      const updatedHabit = {
        ...habit,
        totalCompletions,
        streakCount,
        bestStreak,
        updatedAt: new Date().toISOString()
      }

      await db.saveHabit(updatedHabit)
      dispatch({ type: 'UPDATE_HABIT', payload: updatedHabit })
    } catch (error) {
      console.error('Failed to update habit stats:', error)
    }
  }

  const calculateCurrentStreak = (completions) => {
    if (!completions.length) return 0

    const sortedDates = completions
      .map(c => new Date(c.date))
      .sort((a, b) => b - a) // Descending order

    let streak = 0
    let currentDate = new Date()
    currentDate.setHours(0, 0, 0, 0)

    for (const completionDate of sortedDates) {
      completionDate.setHours(0, 0, 0, 0)
      const diffDays = Math.floor((currentDate - completionDate) / (1000 * 60 * 60 * 24))

      if (diffDays === streak) {
        streak++
      } else if (diffDays > streak) {
        break
      }
    }

    return streak
  }

  const updateSettings = async (newSettings) => {
    try {
      // Save individual settings to IndexedDB
      await Promise.all(
        Object.entries(newSettings).map(([key, value]) =>
          db.saveSetting(key, value)
        )
      )

      dispatch({ type: 'SET_SETTINGS', payload: newSettings })
      toast.success('Settings updated!')
    } catch (error) {
      console.error('Failed to update settings:', error)
      dispatch({ type: 'SET_ERROR', payload: error.message })
      toast.error('Failed to update settings')
      throw error
    }
  }

  const exportData = async () => {
    try {
      const data = await db.exportData()
      toast.success('Data exported successfully!')
      return data
    } catch (error) {
      console.error('Failed to export data:', error)
      dispatch({ type: 'SET_ERROR', payload: error.message })
      toast.error('Failed to export data')
      throw error
    }
  }

  const importData = async (data) => {
    try {
      await db.importData(data)
      await loadInitialData()
      toast.success('Data imported successfully!')
    } catch (error) {
      console.error('Failed to import data:', error)
      dispatch({ type: 'SET_ERROR', payload: error.message })
      toast.error('Failed to import data')
      throw error
    }
  }

  const value = {
    ...state,
    createHabit,
    updateHabit,
    deleteHabit,
    toggleHabitCompletion,
    updateSettings,
    exportData,
    importData,
    clearError: () => dispatch({ type: 'SET_ERROR', payload: null })
  }

  return (
    <AppContext.Provider value={value}>
      {children}
    </AppContext.Provider>
  )
}

export const useApp = () => {
  const context = useContext(AppContext)
  if (!context) {
    throw new Error('useApp must be used within an AppProvider')
  }
  return context
}