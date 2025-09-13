import { format, parseISO, differenceInDays, startOfWeek, endOfWeek, eachDayOfInterval } from 'date-fns'

// Generate unique IDs
export const generateId = () => {
  return Date.now().toString(36) + Math.random().toString(36).substr(2)
}

// Format date for storage (YYYY-MM-DD)
export const formatDate = (date) => {
  return format(new Date(date), 'yyyy-MM-dd')
}

// Format date for display
export const formatDisplayDate = (date) => {
  return format(parseISO(date), 'MMM d, yyyy')
}

// Get today's date string
export const getTodayDateString = () => {
  return formatDate(new Date())
}

// Get date range for analytics
export const getDateRange = (days = 30) => {
  const end = new Date()
  const start = new Date()
  start.setDate(start.getDate() - days)

  return {
    start: formatDate(start),
    end: formatDate(end)
  }
}

// Calculate streak from completions
export const calculateStreak = (completions, habitId) => {
  const habitCompletions = completions
    .filter(c => c.habitId === habitId)
    .map(c => new Date(c.date))
    .sort((a, b) => b - a) // Most recent first

  if (habitCompletions.length === 0) return 0

  let streak = 0
  let currentDate = new Date()
  currentDate.setHours(0, 0, 0, 0)

  for (const completionDate of habitCompletions) {
    completionDate.setHours(0, 0, 0, 0)
    const daysDiff = differenceInDays(currentDate, completionDate)

    if (daysDiff === streak) {
      streak++
    } else if (daysDiff > streak) {
      break
    }
  }

  return streak
}

// Calculate completion percentage
export const calculateCompletionRate = (completions, habitId, days = 30) => {
  const { start } = getDateRange(days)
  const habitCompletions = completions.filter(
    c => c.habitId === habitId && c.date >= start
  )

  return Math.round((habitCompletions.length / days) * 100)
}

// Get weekly completion data
export const getWeeklyData = (completions, habitId, weekStart = new Date()) => {
  const start = startOfWeek(weekStart, { weekStartsOn: 1 }) // Monday
  const end = endOfWeek(weekStart, { weekStartsOn: 1 }) // Sunday

  const daysInWeek = eachDayOfInterval({ start, end })
  const habitCompletions = completions.filter(c => c.habitId === habitId)

  return daysInWeek.map(date => {
    const dateStr = formatDate(date)
    const completion = habitCompletions.find(c => c.date === dateStr)

    return {
      date: dateStr,
      dayName: format(date, 'EEE'),
      completed: !!completion,
      value: completion?.value || 0
    }
  })
}

// Get habit categories with colors
export const getHabitCategories = () => [
  { name: 'Academic', icon: '🎓', color: '#3b82f6' },
  { name: 'Health', icon: '💪', color: '#10b981' },
  { name: 'Skills', icon: '🔧', color: '#f59e0b' },
  { name: 'Learning', icon: '📚', color: '#8b5cf6' },
  { name: 'Wellness', icon: '🌱', color: '#ec4899' },
  { name: 'Social', icon: '👥', color: '#06b6d4' },
  { name: 'Creative', icon: '🎨', color: '#ef4444' },
  { name: 'Work', icon: '💼', color: '#6b7280' }
]

// Get habit frequency options
export const getFrequencyOptions = () => [
  { value: 'daily', label: 'Daily', description: 'Every day' },
  { value: 'weekly', label: 'Weekly', description: 'Once per week' },
  { value: 'weekdays', label: 'Weekdays', description: 'Monday to Friday' },
  { value: 'weekends', label: 'Weekends', description: 'Saturday and Sunday' },
  { value: 'custom', label: 'Custom', description: 'Custom schedule' }
]

// Validate habit data
export const validateHabit = (habitData) => {
  const errors = {}

  if (!habitData.name || habitData.name.trim().length < 2) {
    errors.name = 'Name must be at least 2 characters long'
  }

  if (!habitData.category) {
    errors.category = 'Please select a category'
  }

  if (!habitData.frequency) {
    errors.frequency = 'Please select a frequency'
  }

  if (habitData.target && (isNaN(habitData.target) || habitData.target <= 0)) {
    errors.target = 'Target must be a positive number'
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors
  }
}

// Get motivational quotes
export const getMotivationalQuotes = () => [
  {
    text: "Every action you take is a vote for the type of person you wish to become.",
    author: "James Clear"
  },
  {
    text: "You do not rise to the level of your goals. You fall to the level of your systems.",
    author: "James Clear"
  },
  {
    text: "The most effective way to change your habits is to focus not on what you want to achieve, but on who you wish to become.",
    author: "James Clear"
  },
  {
    text: "Habits are the compound interest of self-improvement.",
    author: "James Clear"
  },
  {
    text: "Success is the product of daily habits—not once-in-a-lifetime transformations.",
    author: "James Clear"
  },
  {
    text: "Small changes often appear to make no difference until you cross a critical threshold.",
    author: "James Clear"
  },
  {
    text: "The purpose of setting goals is to win the game. The purpose of building systems is to continue playing the game.",
    author: "James Clear"
  }
]

// Get random motivational quote
export const getRandomQuote = () => {
  const quotes = getMotivationalQuotes()
  return quotes[Math.floor(Math.random() * quotes.length)]
}

// Check if habit should be completed today
export const shouldCompleteToday = (habit, date = new Date()) => {
  const dayOfWeek = date.getDay() // 0 = Sunday, 1 = Monday, etc.

  switch (habit.frequency) {
    case 'daily':
      return true
    case 'weekly':
      return true // Can be completed any day of the week
    case 'weekdays':
      return dayOfWeek >= 1 && dayOfWeek <= 5 // Monday to Friday
    case 'weekends':
      return dayOfWeek === 0 || dayOfWeek === 6 // Saturday and Sunday
    default:
      return true
  }
}

// Get habit completion status for today
export const getHabitStatus = (habit, completions) => {
  const today = getTodayDateString()
  const todayCompletion = completions.find(
    c => c.habitId === habit.id && c.date === today
  )

  return {
    completed: !!todayCompletion,
    shouldComplete: shouldCompleteToday(habit),
    completion: todayCompletion,
    streak: calculateStreak(completions, habit.id)
  }
}

// Sort habits by priority/order
export const sortHabits = (habits, sortBy = 'name') => {
  switch (sortBy) {
    case 'name':
      return [...habits].sort((a, b) => a.name.localeCompare(b.name))
    case 'category':
      return [...habits].sort((a, b) => a.category.localeCompare(b.category))
    case 'streak':
      return [...habits].sort((a, b) => (b.streakCount || 0) - (a.streakCount || 0))
    case 'created':
      return [...habits].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    default:
      return habits
  }
}