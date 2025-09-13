import React from "react";
import { useApp } from "../../context/AppContext";
import { getHabitStatus, sortHabits } from "../../utils/habitUtils";
import { Plus, Filter, Search } from "lucide-react";
import HabitCard from "./HabitCard";
import AddHabitModal from "./AddHabitModal";
import { motion, AnimatePresence } from "framer-motion";

export default function HabitList() {
  const { habits, completions, loading } = useApp();
  const [searchTerm, setSearchTerm] = React.useState("");
  const [selectedCategory, setSelectedCategory] = React.useState("all");
  const [sortBy, setSortBy] = React.useState("name");
  const [showAddModal, setShowAddModal] = React.useState(false);

  const categories = React.useMemo(() => {
    const uniqueCategories = [...new Set(habits.map((h) => h.category))];
    return ["all", ...uniqueCategories];
  }, [habits]);

  const filteredAndSortedHabits = React.useMemo(() => {
    let filtered = habits.map((habit) => ({
      ...habit,
      status: getHabitStatus(habit, completions),
    }));

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(
        (habit) =>
          habit.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          habit.description?.toLowerCase().includes(searchTerm.toLowerCase()),
      );
    }

    // Filter by category
    if (selectedCategory !== "all") {
      filtered = filtered.filter(
        (habit) => habit.category === selectedCategory,
      );
    }

    // Sort habits
    return sortHabits(filtered, sortBy);
  }, [habits, completions, searchTerm, selectedCategory, sortBy]);

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/3 mb-4"></div>
          <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-1/4 mb-6"></div>
        </div>
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className="animate-pulse bg-gray-200 dark:bg-gray-700 h-32 rounded-xl"
          />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            My Habits
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            {habits.length} habit{habits.length !== 1 ? "s" : ""} total
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

      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Search habits..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="input pl-10"
          />
        </div>

        {/* Filters */}
        <div className="flex space-x-3">
          {/* Category Filter */}
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="input w-auto"
          >
            <option value="all">All Categories</option>
            {categories.slice(1).map((category) => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </select>

          {/* Sort Filter */}
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="input w-auto"
          >
            <option value="name">Sort by Name</option>
            <option value="category">Sort by Category</option>
            <option value="streak">Sort by Streak</option>
            <option value="created">Sort by Created</option>
          </select>
        </div>
      </div>

      {/* Habits List */}
      <div className="space-y-4">
        <AnimatePresence>
          {filteredAndSortedHabits.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center py-12"
            >
              <div className="text-6xl mb-4">🌱</div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                {searchTerm || selectedCategory !== "all"
                  ? "No matching habits"
                  : "No habits yet"}
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                {searchTerm || selectedCategory !== "all"
                  ? "Try adjusting your search or filters"
                  : "Create your first habit to start building better routines"}
              </p>

              {!searchTerm && selectedCategory === "all" && (
                <button
                  onClick={() => setShowAddModal(true)}
                  className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded-xl transition-colors font-medium inline-flex items-center space-x-2"
                >
                  <Plus className="w-5 h-5" />
                  <span>Create Your First Habit</span>
                </button>
              )}
            </motion.div>
          ) : (
            <>
              {filteredAndSortedHabits.map((habit, index) => (
                <motion.div
                  key={habit.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <HabitCard habit={habit} showQuickComplete />
                </motion.div>
              ))}
            </>
          )}
        </AnimatePresence>
      </div>

      {/* Quick Stats */}
      {filteredAndSortedHabits.length > 0 && (
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Quick Stats
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-green-500 mb-1">
                {
                  filteredAndSortedHabits.filter((h) => h.status.completed)
                    .length
                }
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">
                Completed Today
              </div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-500 mb-1">
                {Math.round(
                  filteredAndSortedHabits.reduce(
                    (sum, h) => sum + (h.status.streak || 0),
                    0,
                  ) / filteredAndSortedHabits.length,
                ) || 0}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">
                Avg. Streak
              </div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-500 mb-1">
                {filteredAndSortedHabits.reduce(
                  (sum, h) => sum + (h.totalCompletions || 0),
                  0,
                )}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">
                Total Completions
              </div>
            </div>
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
