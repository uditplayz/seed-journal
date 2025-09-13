import React from 'react'
import { useApp } from '../../context/AppContext'
import { getRandomQuote, getHabitStatus, getTodayDateString } from '../../utils/habitUtils'
import { Calendar, TrendingUp, Target, Zap } from 'lucide-react'
import HabitCard from '../habits/HabitCard'

export default function Dashboard() {
  const { habits, completions, loading } = useApp()
  const [quote] = React.useState(getRandomQuote())

  const todayHabits = habits.map(habit => ({
    ...habit,
    status: getHabitStatus(habit, completions)
  }))

  const stats = React.useMemo(() => {
    const completed = todayHabits.filter(h => h.status.completed).length
    const total = todayHabits.filter(h => h.status.shouldComplete).length
    const completionRate = total > 0 ? Math.round((completed / total) * 100) : 0
    const totalStreak = todayHabits.reduce((sum, h) => sum + (h.status.streak || 0), 0)

    return { completed, total, completionRate, totalStreak }
  }, [todayHabits])

  if (loading) {
    return (
      <div className="pt-6">
        <div className="animate-pulse space-y-4">
          <div className="h-32 bg-gray-200 dark:bg-gray-800 rounded-xl"></div>
          <div className="grid grid-cols-2 gap-4">
            <div className="h-20 bg-gray-200 dark:bg-gray-800 rounded-lg"></div>
            <div className="h-20 bg-gray-200 dark:bg-gray-800 rounded-lg"></div>
          </div>
          <div className="space-y-3">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-16 bg-gray-200 dark:bg-gray-800 rounded-lg"></div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="pt-6 pb-6 space-y-6">
      {/* Greeting & Date */}
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
          Good {new Date().getHours() < 12 ? 'Morning' : new Date().getHours() < 18 ? 'Afternoon' : 'Evening'}!
        </h2>
        <p className="text-gray-600 dark:text-gray-400 mt-1">
          {new Date().toLocaleDateString('en-US', { 
            weekday: 'long', 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
          })}
        </p>
      </div>

      {/* Daily Quote */}
      <div className="card p-6 text-center">
        <blockquote className="text-lg text-gray-700 dark:text-gray-300 italic mb-3">
          "{quote.text}"
        </blockquote>
        <cite className="text-sm text-gray-500 dark:text-gray-400">
          — {quote.author}
        </cite>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="card p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {stats.completed}/{stats.total}
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Today's Progress
              </p>
            </div>
            <Target className="w-8 h-8 text-primary-600 dark:text-primary-400" />
          </div>
        </div>

        <div className="card p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {stats.completionRate}%
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Completion Rate
              </p>
            </div>
            <TrendingUp className="w-8 h-8 text-success-600 dark:text-success-400" />
          </div>
        </div>

        <div className="card p-4 lg:col-span-2">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {stats.totalStreak}
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Total Active Streaks
              </p>
            </div>
            <Zap className="w-8 h-8 text-warning-600 dark:text-warning-400" />
          </div>
        </div>
      </div>

      {/* Today's Habits */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
            Today's Habits
          </h3>
          {stats.total > 0 && (
            <div className="flex items-center space-x-2">
              <div className="w-16 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                <div 
                  className="bg-primary-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${stats.completionRate}%` }}
                />
              </div>
              <span className="text-sm text-gray-600 dark:text-gray-400">
                {stats.completionRate}%
              </span>
            </div>
          )}
        </div>

        {todayHabits.length === 0 ? (
          <div className="card p-8 text-center">
            <Calendar className="w-12 h-12 text-gray-400 dark:text-gray-500 mx-auto mb-4" />
            <h4 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              No habits yet
            </h4>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              Create your first habit to start building better routines.
            </p>
            <button className="btn btn-primary">
              Add Your First Habit
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {todayHabits
              .filter(habit => habit.status.shouldComplete)
              .map(habit => (
                <HabitCard 
                  key={habit.id} 
                  habit={habit} 
                  showQuickComplete={true}
                />
              ))}
          </div>
        )}
      </div>

      {/* Completed Habits */}
      {todayHabits.some(h => h.status.completed) && (
        <div className="space-y-4">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white">
            Completed Today ✓
          </h3>
          <div className="space-y-2">
            {todayHabits
              .filter(habit => habit.status.completed)
              .map(habit => (
                <HabitCard 
                  key={habit.id} 
                  habit={habit} 
                  showQuickComplete={true}
                  variant="completed"
                />
              ))}
          </div>
        </div>
      )}
    </div>
  )
}