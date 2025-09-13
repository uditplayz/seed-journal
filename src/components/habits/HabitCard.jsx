import React from 'react'
import { useApp } from '../../context/AppContext'
import { CheckCircle, Circle, Flame, Target } from 'lucide-react'
import { motion } from 'framer-motion'

export default function HabitCard({ habit, showQuickComplete = false, variant = 'default' }) {
  const { toggleHabitCompletion } = useApp()
  const [isAnimating, setIsAnimating] = React.useState(false)

  const handleToggle = async () => {
    if (isAnimating) return

    setIsAnimating(true)
    try {
      await toggleHabitCompletion(habit.id)
      // Add a small delay for animation
      setTimeout(() => setIsAnimating(false), 600)
    } catch (error) {
      setIsAnimating(false)
    }
  }

  const isCompleted = habit.status?.completed || false
  const streak = habit.status?.streak || habit.streakCount || 0

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ 
        opacity: 1, 
        y: 0,
        scale: isAnimating && isCompleted ? [1, 1.02, 1] : 1
      }}
      transition={{ 
        duration: 0.3,
        scale: { duration: 0.6, ease: "easeOut" }
      }}
      className={`card p-4 transition-all duration-200 ${
        variant === 'completed' 
          ? 'bg-success-50 dark:bg-success-900/20 border-success-200 dark:border-success-800' 
          : isCompleted 
            ? 'bg-success-50 dark:bg-success-900/20 border-success-200 dark:border-success-800'
            : 'hover:shadow-md'
      }`}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3 flex-1 min-w-0">
          {/* Completion Toggle */}
          {showQuickComplete && (
            <button
              onClick={handleToggle}
              disabled={isAnimating}
              className={`flex-shrink-0 transition-all duration-200 ${
                isAnimating ? 'scale-110' : 'hover:scale-105'
              }`}
            >
              {isCompleted ? (
                <CheckCircle className="w-6 h-6 text-success-600 dark:text-success-400" />
              ) : (
                <Circle className="w-6 h-6 text-gray-400 dark:text-gray-500 hover:text-primary-600 dark:hover:text-primary-400" />
              )}
            </button>
          )}

          {/* Habit Info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center space-x-2">
              <span className="text-lg">{habit.icon || '🎯'}</span>
              <h4 className={`font-medium truncate ${
                isCompleted 
                  ? 'text-success-700 dark:text-success-300' 
                  : 'text-gray-900 dark:text-white'
              }`}>
                {habit.name}
              </h4>
            </div>

            {habit.description && (
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1 truncate">
                {habit.description}
              </p>
            )}

            <div className="flex items-center space-x-4 mt-2">
              {/* Category */}
              <span className={`badge badge-primary text-xs`}>
                {habit.category}
              </span>

              {/* Target */}
              {habit.target && habit.unit && (
                <div className="flex items-center space-x-1 text-xs text-gray-500 dark:text-gray-400">
                  <Target className="w-3 h-3" />
                  <span>{habit.target} {habit.unit}</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Streak */}
        {streak > 0 && (
          <div className="flex items-center space-x-1 flex-shrink-0">
            <Flame className={`w-4 h-4 ${
              streak >= 7 
                ? 'text-orange-500' 
                : streak >= 3 
                  ? 'text-yellow-500' 
                  : 'text-gray-400'
            }`} />
            <span className={`text-sm font-medium ${
              streak >= 7 
                ? 'text-orange-500' 
                : streak >= 3 
                  ? 'text-yellow-500' 
                  : 'text-gray-500 dark:text-gray-400'
            }`}>
              {streak}
            </span>
          </div>
        )}
      </div>

      {/* Progress Bar for multi-value habits */}
      {habit.target && habit.target > 1 && habit.status?.completion && (
        <div className="mt-3">
          <div className="flex items-center justify-between text-xs text-gray-600 dark:text-gray-400 mb-1">
            <span>Progress</span>
            <span>{habit.status.completion.value || 0} / {habit.target}</span>
          </div>
          <div className="progress-bar">
            <div 
              className="progress-bar-fill bg-primary-600"
              style={{ 
                width: `${Math.min(((habit.status.completion.value || 0) / habit.target) * 100, 100)}%` 
              }}
            />
          </div>
        </div>
      )}
    </motion.div>
  )
}