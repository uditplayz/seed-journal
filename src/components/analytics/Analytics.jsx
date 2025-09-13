import React from 'react'
import { useApp } from '../../context/AppContext'
import { getWeeklyData, calculateCompletionRate } from '../../utils/habitUtils'
import { BarChart3, TrendingUp, Calendar, Target } from 'lucide-react'
import { format, subDays, eachDayOfInterval } from 'date-fns'

export default function Analytics() {
  const { habits, completions, loading } = useApp()
  const [selectedPeriod, setSelectedPeriod] = React.useState('7') // days
  const [selectedHabit, setSelectedHabit] = React.useState('all')

  const analyticsData = React.useMemo(() => {
    const days = parseInt(selectedPeriod)
    const endDate = new Date()
    const startDate = subDays(endDate, days - 1)

    const dateRange = eachDayOfInterval({ start: startDate, end: endDate })

    if (selectedHabit === 'all') {
      // Overall analytics
      const dailyCompletions = dateRange.map(date => {
        const dateStr = format(date, 'yyyy-MM-dd')
        const dayCompletions = completions.filter(c => c.date === dateStr).length
        return {
          date: dateStr,
          value: dayCompletions,
          label: format(date, 'MMM d')
        }
      })

      const totalCompletions = completions.filter(c => {
        const completionDate = new Date(c.date)
        return completionDate >= startDate && completionDate <= endDate
      }).length

      const totalPossible = habits.length * days
      const overallRate = totalPossible > 0 ? Math.round((totalCompletions / totalPossible) * 100) : 0

      return {
        type: 'overall',
        chartData: dailyCompletions,
        stats: {
          totalCompletions,
          overallRate,
          totalPossible,
          averagePerDay: Math.round(totalCompletions / days * 10) / 10
        }
      }
    } else {
      // Individual habit analytics
      const habit = habits.find(h => h.id === selectedHabit)
      if (!habit) return { type: 'individual', chartData: [], stats: {} }

      const habitCompletions = completions.filter(c => c.habitId === selectedHabit)
      const dailyData = dateRange.map(date => {
        const dateStr = format(date, 'yyyy-MM-dd')
        const completion = habitCompletions.find(c => c.date === dateStr)
        return {
          date: dateStr,
          value: completion ? (completion.value || 1) : 0,
          completed: !!completion,
          label: format(date, 'MMM d')
        }
      })

      const completedDays = dailyData.filter(d => d.completed).length
      const completionRate = Math.round((completedDays / days) * 100)
      const currentStreak = habit.streakCount || 0
      const bestStreak = habit.bestStreak || currentStreak
      const totalValue = dailyData.reduce((sum, d) => sum + d.value, 0)

      return {
        type: 'individual',
        habit,
        chartData: dailyData,
        stats: {
          completedDays,
          completionRate,
          currentStreak,
          bestStreak,
          totalValue,
          averageValue: Math.round(totalValue / days * 10) / 10
        }
      }
    }
  }, [habits, completions, selectedPeriod, selectedHabit])

  if (loading) {
    return (
      <div className="pt-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 dark:bg-gray-800 rounded-lg w-1/2"></div>
          <div className="grid grid-cols-2 gap-4">
            <div className="h-20 bg-gray-200 dark:bg-gray-800 rounded-lg"></div>
            <div className="h-20 bg-gray-200 dark:bg-gray-800 rounded-lg"></div>
          </div>
          <div className="h-64 bg-gray-200 dark:bg-gray-800 rounded-lg"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="pt-6 pb-6 space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
          Analytics
        </h2>
        <p className="text-gray-600 dark:text-gray-400 mt-1">
          Track your progress and identify patterns
        </p>
      </div>

      {/* Filters */}
      <div className="card p-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Period Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Time Period
            </label>
            <select
              value={selectedPeriod}
              onChange={(e) => setSelectedPeriod(e.target.value)}
              className="input"
            >
              <option value="7">Last 7 days</option>
              <option value="14">Last 2 weeks</option>
              <option value="30">Last 30 days</option>
              <option value="90">Last 3 months</option>
            </select>
          </div>

          {/* Habit Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Habit
            </label>
            <select
              value={selectedHabit}
              onChange={(e) => setSelectedHabit(e.target.value)}
              className="input"
            >
              <option value="all">All Habits</option>
              {habits.map(habit => (
                <option key={habit.id} value={habit.id}>
                  {habit.icon} {habit.name}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {analyticsData.type === 'overall' ? (
          <>
            <div className="card p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {analyticsData.stats.totalCompletions}
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Total Completions
                  </p>
                </div>
                <Target className="w-8 h-8 text-primary-600 dark:text-primary-400" />
              </div>
            </div>

            <div className="card p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {analyticsData.stats.overallRate}%
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
                    {analyticsData.stats.averagePerDay}
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Average per Day
                  </p>
                </div>
                <BarChart3 className="w-8 h-8 text-warning-600 dark:text-warning-400" />
              </div>
            </div>
          </>
        ) : (
          <>
            <div className="card p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {analyticsData.stats.completionRate}%
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Completion Rate
                  </p>
                </div>
                <TrendingUp className="w-8 h-8 text-success-600 dark:text-success-400" />
              </div>
            </div>

            <div className="card p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {analyticsData.stats.currentStreak}
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Current Streak
                  </p>
                </div>
                <Target className="w-8 h-8 text-primary-600 dark:text-primary-400" />
              </div>
            </div>

            <div className="card p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {analyticsData.stats.bestStreak}
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Best Streak
                  </p>
                </div>
                <BarChart3 className="w-8 h-8 text-warning-600 dark:text-warning-400" />
              </div>
            </div>

            <div className="card p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {analyticsData.stats.completedDays}
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Completed Days
                  </p>
                </div>
                <Calendar className="w-8 h-8 text-secondary-600 dark:text-secondary-400" />
              </div>
            </div>
          </>
        )}
      </div>

      {/* Chart */}
      <div className="card p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          {analyticsData.type === 'overall' ? 'Daily Completions' : `${analyticsData.habit?.name} Progress`}
        </h3>

        {analyticsData.chartData.length > 0 ? (
          <div className="space-y-4">
            {/* Simple Bar Chart */}
            <div className="flex items-end space-x-2 h-32">
              {analyticsData.chartData.map((item, index) => {
                const maxValue = Math.max(...analyticsData.chartData.map(d => d.value))
                const height = maxValue > 0 ? (item.value / maxValue) * 100 : 0

                return (
                  <div
                    key={index}
                    className="flex-1 flex flex-col items-center"
                  >
                    <div className="w-full flex items-end justify-center h-24">
                      <div
                        className={`w-full max-w-8 rounded-t transition-all duration-300 ${
                          analyticsData.type === 'individual' && item.completed
                            ? 'bg-success-500'
                            : item.value > 0
                              ? 'bg-primary-500'
                              : 'bg-gray-200 dark:bg-gray-700'
                        }`}
                        style={{ height: `${height}%` }}
                        title={`${item.label}: ${item.value}`}
                      />
                    </div>
                    <span className="text-xs text-gray-600 dark:text-gray-400 mt-1 rotate-45 origin-left">
                      {format(new Date(item.date), 'MM/dd')}
                    </span>
                  </div>
                )
              })}
            </div>

            {/* Legend */}
            <div className="flex items-center justify-center space-x-6 text-sm">
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-primary-500 rounded"></div>
                <span className="text-gray-600 dark:text-gray-400">
                  {analyticsData.type === 'overall' ? 'Completions' : 'Progress'}
                </span>
              </div>
              {analyticsData.type === 'individual' && (
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-success-500 rounded"></div>
                  <span className="text-gray-600 dark:text-gray-400">
                    Completed
                  </span>
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="text-center py-8">
            <BarChart3 className="w-12 h-12 text-gray-400 dark:text-gray-500 mx-auto mb-4" />
            <p className="text-gray-600 dark:text-gray-400">
              No data available for the selected period
            </p>
          </div>
        )}
      </div>
    </div>
  )
}