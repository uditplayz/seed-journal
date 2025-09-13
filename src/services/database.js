import { openDB } from 'idb'

const DB_NAME = 'seed-journal-db'
const DB_VERSION = 1

class DatabaseService {
  constructor() {
    this.db = null
    this.initPromise = this.init()
  }

  async init() {
    try {
      this.db = await openDB(DB_NAME, DB_VERSION, {
        upgrade(db) {
          // Habits store
          if (!db.objectStoreNames.contains('habits')) {
            const habitsStore = db.createObjectStore('habits', {
              keyPath: 'id',
              autoIncrement: false
            })
            habitsStore.createIndex('category', 'category')
            habitsStore.createIndex('isActive', 'isActive')
            habitsStore.createIndex('createdAt', 'createdAt')
          }

          // Completions store
          if (!db.objectStoreNames.contains('completions')) {
            const completionsStore = db.createObjectStore('completions', {
              keyPath: 'id',
              autoIncrement: false
            })
            completionsStore.createIndex('habitId', 'habitId')
            completionsStore.createIndex('date', 'date')
            completionsStore.createIndex('habitDate', ['habitId', 'date'], { unique: true })
          }

          // Settings store
          if (!db.objectStoreNames.contains('settings')) {
            db.createObjectStore('settings', {
              keyPath: 'key'
            })
          }

          // Templates store for pre-defined habits
          if (!db.objectStoreNames.contains('templates')) {
            const templatesStore = db.createObjectStore('templates', {
              keyPath: 'id',
              autoIncrement: false
            })
            templatesStore.createIndex('category', 'category')

            // Add default templates
            const defaultTemplates = [
              {
                id: 'study-math',
                name: 'Study Mathematics',
                description: 'Practice differential equations or algebra',
                category: 'Academic',
                frequency: 'daily',
                target: 1,
                unit: 'session',
                icon: '📊',
                color: '#3b82f6'
              },
              {
                id: 'code-practice',
                name: 'Programming Practice',
                description: 'Code for at least 30 minutes',
                category: 'Skills',
                frequency: 'daily',
                target: 30,
                unit: 'minutes',
                icon: '💻',
                color: '#10b981'
              },
              {
                id: 'read-tech',
                name: 'Technical Reading',
                description: 'Read technical articles or documentation',
                category: 'Learning',
                frequency: 'daily',
                target: 1,
                unit: 'article',
                icon: '📚',
                color: '#8b5cf6'
              },
              {
                id: 'exercise',
                name: 'Physical Exercise',
                description: 'Any form of physical activity',
                category: 'Health',
                frequency: 'daily',
                target: 30,
                unit: 'minutes',
                icon: '🏃‍♂️',
                color: '#f59e0b'
              },
              {
                id: 'meditation',
                name: 'Meditation/Mindfulness',
                description: 'Practice mindfulness or meditation',
                category: 'Wellness',
                frequency: 'daily',
                target: 10,
                unit: 'minutes',
                icon: '🧘‍♂️',
                color: '#ec4899'
              }
            ]

            defaultTemplates.forEach(template => {
              templatesStore.add(template)
            })
          }
        }
      })
    } catch (error) {
      console.error('Failed to initialize database:', error)
      // Fallback to localStorage
      this.db = null
    }
  }

  async ensureReady() {
    await this.initPromise
  }

  async saveHabit(habit) {
    await this.ensureReady()

    if (this.db) {
      try {
        const tx = this.db.transaction('habits', 'readwrite')
        await tx.objectStore('habits').put(habit)
        await tx.done
        return habit
      } catch (error) {
        console.error('Failed to save habit to IndexedDB:', error)
        throw error
      }
    } else {
      // Fallback to localStorage
      const habits = JSON.parse(localStorage.getItem('habits') || '[]')
      const index = habits.findIndex(h => h.id === habit.id)
      if (index >= 0) {
        habits[index] = habit
      } else {
        habits.push(habit)
      }
      localStorage.setItem('habits', JSON.stringify(habits))
      return habit
    }
  }

  async getHabits() {
    await this.ensureReady()

    if (this.db) {
      try {
        const tx = this.db.transaction('habits', 'readonly')
        const habits = await tx.objectStore('habits').getAll()
        return habits.filter(habit => habit.isActive)
      } catch (error) {
        console.error('Failed to get habits from IndexedDB:', error)
        return []
      }
    } else {
      // Fallback to localStorage
      const habits = JSON.parse(localStorage.getItem('habits') || '[]')
      return habits.filter(habit => habit.isActive)
    }
  }

  async deleteHabit(habitId) {
    await this.ensureReady()

    if (this.db) {
      try {
        const tx = this.db.transaction(['habits'], 'readwrite')

        // Soft delete - mark as inactive
        const habit = await tx.objectStore('habits').get(habitId)
        if (habit) {
          habit.isActive = false
          habit.deletedAt = new Date().toISOString()
          await tx.objectStore('habits').put(habit)
        }

        await tx.done
      } catch (error) {
        console.error('Failed to delete habit:', error)
        throw error
      }
    } else {
      // Fallback to localStorage
      const habits = JSON.parse(localStorage.getItem('habits') || '[]')
      const index = habits.findIndex(h => h.id === habitId)
      if (index >= 0) {
        habits[index].isActive = false
        habits[index].deletedAt = new Date().toISOString()
        localStorage.setItem('habits', JSON.stringify(habits))
      }
    }
  }

  async saveCompletion(completion) {
    await this.ensureReady()

    if (this.db) {
      try {
        const tx = this.db.transaction('completions', 'readwrite')
        await tx.objectStore('completions').put(completion)
        await tx.done
        return completion
      } catch (error) {
        console.error('Failed to save completion:', error)
        throw error
      }
    } else {
      // Fallback to localStorage
      const completions = JSON.parse(localStorage.getItem('completions') || '[]')
      const index = completions.findIndex(c => c.id === completion.id)
      if (index >= 0) {
        completions[index] = completion
      } else {
        completions.push(completion)
      }
      localStorage.setItem('completions', JSON.stringify(completions))
      return completion
    }
  }

  async deleteCompletion(completionId) {
    await this.ensureReady()

    if (this.db) {
      try {
        const tx = this.db.transaction('completions', 'readwrite')
        await tx.objectStore('completions').delete(completionId)
        await tx.done
      } catch (error) {
        console.error('Failed to delete completion:', error)
        throw error
      }
    } else {
      // Fallback to localStorage
      const completions = JSON.parse(localStorage.getItem('completions') || '[]')
      const filtered = completions.filter(c => c.id !== completionId)
      localStorage.setItem('completions', JSON.stringify(filtered))
    }
  }

  async getCompletions(habitId, startDate, endDate) {
    await this.ensureReady()

    if (this.db) {
      try {
        const tx = this.db.transaction('completions', 'readonly')
        const index = tx.objectStore('completions').index('habitId')
        const completions = await index.getAll(habitId)

        return completions.filter(completion => {
          const completionDate = new Date(completion.date)
          return completionDate >= new Date(startDate) && completionDate <= new Date(endDate)
        })
      } catch (error) {
        console.error('Failed to get completions:', error)
        return []
      }
    } else {
      // Fallback to localStorage
      const completions = JSON.parse(localStorage.getItem('completions') || '[]')
      return completions.filter(completion => {
        if (completion.habitId !== habitId) return false
        const completionDate = new Date(completion.date)
        return completionDate >= new Date(startDate) && completionDate <= new Date(endDate)
      })
    }
  }

  async getTodayCompletions() {
    const today = new Date().toISOString().split('T')[0]

    if (this.db) {
      try {
        const tx = this.db.transaction('completions', 'readonly')
        const index = tx.objectStore('completions').index('date')
        return await index.getAll(today)
      } catch (error) {
        console.error('Failed to get today completions:', error)
        return []
      }
    } else {
      // Fallback to localStorage
      const completions = JSON.parse(localStorage.getItem('completions') || '[]')
      return completions.filter(c => c.date === today)
    }
  }

  async saveSetting(key, value) {
    await this.ensureReady()

    if (this.db) {
      try {
        const tx = this.db.transaction('settings', 'readwrite')
        await tx.objectStore('settings').put({ key, value })
        await tx.done
      } catch (error) {
        console.error('Failed to save setting:', error)
        throw error
      }
    } else {
      // Fallback to localStorage
      localStorage.setItem(`setting_${key}`, JSON.stringify(value))
    }
  }

  async getSetting(key, defaultValue = null) {
    await this.ensureReady()

    if (this.db) {
      try {
        const tx = this.db.transaction('settings', 'readonly')
        const result = await tx.objectStore('settings').get(key)
        return result ? result.value : defaultValue
      } catch (error) {
        console.error('Failed to get setting:', error)
        return defaultValue
      }
    } else {
      // Fallback to localStorage
      const value = localStorage.getItem(`setting_${key}`)
      return value ? JSON.parse(value) : defaultValue
    }
  }

  async getAllSettings() {
    await this.ensureReady()

    if (this.db) {
      try {
        const tx = this.db.transaction('settings', 'readonly')
        return await tx.objectStore('settings').getAll()
      } catch (error) {
        console.error('Failed to get all settings:', error)
        return []
      }
    } else {
      // Fallback to localStorage - gather all setting_* keys
      const settings = []
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i)
        if (key && key.startsWith('setting_')) {
          const settingKey = key.replace('setting_', '')
          const value = JSON.parse(localStorage.getItem(key))
          settings.push({ key: settingKey, value })
        }
      }
      return settings
    }
  }

  async getHabitTemplates() {
    await this.ensureReady()

    if (this.db) {
      try {
        const tx = this.db.transaction('templates', 'readonly')
        return await tx.objectStore('templates').getAll()
      } catch (error) {
        console.error('Failed to get templates:', error)
        return []
      }
    } else {
      // Return default templates
      return [
        {
          id: 'study-math',
          name: 'Study Mathematics',
          description: 'Practice differential equations or algebra',
          category: 'Academic',
          frequency: 'daily',
          target: 1,
          unit: 'session',
          icon: '📊',
          color: '#3b82f6'
        },
        {
          id: 'code-practice',
          name: 'Programming Practice',
          description: 'Code for at least 30 minutes',
          category: 'Skills',
          frequency: 'daily',
          target: 30,
          unit: 'minutes',
          icon: '💻',
          color: '#10b981'
        }
      ]
    }
  }

  async exportData() {
    await this.ensureReady()

    try {
      const [habits, completions, settings] = await Promise.all([
        this.getAllHabits(), // Get all habits including inactive
        this.getAllCompletions(),
        this.getAllSettings()
      ])

      return {
        habits,
        completions,
        settings,
        exportedAt: new Date().toISOString(),
        version: DB_VERSION
      }
    } catch (error) {
      console.error('Failed to export data:', error)
      throw error
    }
  }

  async getAllHabits() {
    await this.ensureReady()

    if (this.db) {
      try {
        const tx = this.db.transaction('habits', 'readonly')
        return await tx.objectStore('habits').getAll()
      } catch (error) {
        console.error('Failed to get all habits:', error)
        return []
      }
    } else {
      return JSON.parse(localStorage.getItem('habits') || '[]')
    }
  }

  async getAllCompletions() {
    await this.ensureReady()

    if (this.db) {
      try {
        const tx = this.db.transaction('completions', 'readonly')
        return await tx.objectStore('completions').getAll()
      } catch (error) {
        console.error('Failed to get all completions:', error)
        return []
      }
    } else {
      return JSON.parse(localStorage.getItem('completions') || '[]')
    }
  }

  async importData(data) {
    await this.ensureReady()

    try {
      if (this.db) {
        const tx = this.db.transaction(['habits', 'completions', 'settings'], 'readwrite')

        // Clear existing data
        await Promise.all([
          tx.objectStore('habits').clear(),
          tx.objectStore('completions').clear(),
          tx.objectStore('settings').clear()
        ])

        // Import new data
        if (data.habits) {
          for (const habit of data.habits) {
            await tx.objectStore('habits').put(habit)
          }
        }

        if (data.completions) {
          for (const completion of data.completions) {
            await tx.objectStore('completions').put(completion)
          }
        }

        if (data.settings) {
          for (const setting of data.settings) {
            await tx.objectStore('settings').put(setting)
          }
        }

        await tx.done
      } else {
        // Fallback to localStorage
        if (data.habits) {
          localStorage.setItem('habits', JSON.stringify(data.habits))
        }
        if (data.completions) {
          localStorage.setItem('completions', JSON.stringify(data.completions))
        }
        if (data.settings) {
          // Clear existing settings
          const keys = Object.keys(localStorage).filter(key => key.startsWith('setting_'))
          keys.forEach(key => localStorage.removeItem(key))

          // Set new settings
          data.settings.forEach(({ key, value }) => {
            localStorage.setItem(`setting_${key}`, JSON.stringify(value))
          })
        }
      }
    } catch (error) {
      console.error('Failed to import data:', error)
      throw error
    }
  }
}

export const db = new DatabaseService()
export default DatabaseService