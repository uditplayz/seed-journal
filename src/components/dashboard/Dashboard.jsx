import React from "react";
import { useApp } from "../../context/AppContext";
import {
  getRandomQuote,
  getHabitStatus,
  getTodayDateString,
} from "../../utils/habitUtils";
import { Calendar, TrendingUp, Target, Zap, Plus } from "lucide-react";
import HabitCard from "../habits/HabitCard";
import AddHabitModal from "../habits/AddHabitModal";

export default function Dashboard() {
  const { habits, completions, loading } = useApp();
  const [quote] = React.useState(getRandomQuote());
  const [showAddModal, setShowAddModal] = React.useState(false);

  const todayHabits = habits.map((habit) => ({
    ...habit,
    status: getHabitStatus(habit, completions),
  }));

  const stats = React.useMemo(() => {
    const completed = todayHabits.filter((h) => h.status.completed).length;
    const total = todayHabits.filter((h) => h.status.shouldComplete).length;
    const completionRate =
      total > 0 ? Math.round((completed / total) * 100) : 0;
    const totalStreak = todayHabits.reduce(
      (sum, h) => sum + (h.status.streak || 0),
      0,
    );

    return { completed, total, completionRate, totalStreak };
  }, [todayHabits]);

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/2 mb-4"></div>
          <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-1/3 mb-6"></div>
        </div>
        <div className="animate-pulse bg-gray-200 dark:bg-gray-700 h-24 rounded-xl mb-6"></div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="animate-pulse bg-gray-200 dark:bg-gray-700 h-20 rounded-xl"
            />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Greeting & Date */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Good{" "}
            {new Date().getHours() < 12
              ? "Morning"
              : new Date().getHours() < 18
                ? "Afternoon"
                : "Evening"}
            !
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            {new Date().toLocaleDateString("en-US", {
              weekday: "long",
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center space-x-2 bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-xl transition-colors font-medium shadow-lg hover:shadow-xl"
        >
          <Plus className="w-5 h-5" />
          <span className="hidden sm:inline">Add Habit</span>
        </button>
      </div>

      {/* Daily Quote */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 p-6 rounded-xl border border-blue-200 dark:border-blue-800">
        <blockquote className="text-gray-700 dark:text-gray-300 italic text-lg mb-2">
          "{quote.text}"
        </blockquote>
        <cite className="text-blue-600 dark:text-blue-400 font-medium">
          — {quote.author}
        </cite>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {stats.completed}/{stats.total}
              </p>
              <p className="text-gray-600 dark:text-gray-400 text-sm">
                Today's Progress
              </p>
            </div>
            <div className="p-3 bg-green-100 dark:bg-green-900/30 rounded-lg">
              <Target className="w-6 h-6 text-green-600 dark:text-green-400" />
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {stats.completionRate}%
              </p>
              <p className="text-gray-600 dark:text-gray-400 text-sm">
                Completion Rate
              </p>
            </div>
            <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
              <TrendingUp className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {stats.totalStreak}
              </p>
              <p className="text-gray-600 dark:text-gray-400 text-sm">
                Total Active Streaks
              </p>
            </div>
            <div className="p-3 bg-orange-100 dark:bg-orange-900/30 rounded-lg">
              <Zap className="w-6 h-6 text-orange-600 dark:text-orange-400" />
            </div>
          </div>
        </div>
      </div>

      {/* Today's Habits */}
      <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Today's Habits
          </h3>
          {stats.total > 0 && (
            <div className="flex items-center space-x-2">
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 w-24">
                <div
                  className="bg-green-500 h-2 rounded-full transition-all duration-500"
                  style={{ width: `${stats.completionRate}%` }}
                />
              </div>
              <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
                {stats.completionRate}%
              </span>
            </div>
          )}
        </div>

        {todayHabits.length === 0 ? (
          <div className="text-center py-8">
            <div className="text-4xl mb-3">🌱</div>
            <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              No habits yet
            </h4>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              Create your first habit to start building better routines.
            </p>
            <button
              onClick={() => setShowAddModal(true)}
              className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded-xl transition-colors font-medium inline-flex items-center space-x-2"
            >
              <Plus className="w-5 h-5" />
              <span>Create Your First Habit</span>
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {todayHabits
              .filter((habit) => habit.status.shouldComplete)
              .map((habit) => (
                <HabitCard
                  key={habit.id}
                  habit={habit}
                  showQuickComplete
                  variant="compact"
                />
              ))}
          </div>
        )}
      </div>

      {/* Completed Habits */}
      {todayHabits.some((h) => h.status.completed) && (
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Completed Today ✓
          </h3>
          <div className="space-y-3">
            {todayHabits
              .filter((habit) => habit.status.completed)
              .map((habit) => (
                <HabitCard
                  key={habit.id}
                  habit={habit}
                  showQuickComplete
                  variant="compact"
                />
              ))}
          </div>
        </div>
      )}

      {/* Add Habit Modal */}
      <AddHabitModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
      />
    </div>
  );
}
