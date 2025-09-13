import React from "react";
import { useApp } from "../../context/AppContext";
import { getHabitStatus, sortHabits } from "../../utils/habitUtils";
import { Plus, Filter, Search } from "lucide-react";
import HabitCard from "./HabitCard";
import { motion, AnimatePresence } from "framer-motion";

export default function HabitList() {
  const { habits, completions, loading } = useApp();
  const [searchTerm, setSearchTerm] = React.useState("");
  const [selectedCategory, setSelectedCategory] = React.useState("all");
  const [sortBy, setSortBy] = React.useState("name");

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
      <div className="pt-6">
        <div className="animate-pulse space-y-4">
          <div className="h-10 bg-gray-200 dark:bg-gray-800 rounded-lg"></div>
          <div className="h-8 bg-gray-200 dark:bg-gray-800 rounded-lg w-1/2"></div>
          <div className="space-y-3">
            {[1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className="h-20 bg-gray-200 dark:bg-gray-800 rounded-lg"
              ></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="pt-6 pb-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            My Habits
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            {habits.length} habit{habits.length !== 1 ? "s" : ""} total
          </p>
        </div>

        <button className="btn btn-primary">
          <Plus className="w-4 h-4 mr-2" />
          Add Habit
        </button>
      </div>

      {/* Search and Filters */}
      <div className="space-y-4">
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search habits..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="input pl-10"
          />
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-3">
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
        <AnimatePresence mode="wait">
          {filteredAndSortedHabits.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="card p-8 text-center"
            >
              <div className="w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
                <Filter className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
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
                <button className="btn btn-primary">
                  <Plus className="w-4 h-4 mr-2" />
                  Create Your First Habit
                </button>
              )}
            </motion.div>
          ) : (
            <motion.div
              className="space-y-3"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              {filteredAndSortedHabits.map((habit, index) => (
                <motion.div
                  key={habit.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{
                    opacity: 1,
                    y: 0,
                    transition: { delay: index * 0.05 },
                  }}
                  exit={{ opacity: 0, y: -20 }}
                >
                  <HabitCard habit={habit} showQuickComplete={true} />
                </motion.div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Quick Stats */}
      {filteredAndSortedHabits.length > 0 && (
        <div className="card p-4">
          <h3 className="text-sm font-medium text-gray-900 dark:text-white mb-3">
            Quick Stats
          </h3>
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {
                  filteredAndSortedHabits.filter((h) => h.status.completed)
                    .length
                }
              </p>
              <p className="text-xs text-gray-600 dark:text-gray-400">
                Completed Today
              </p>
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {Math.round(
                  filteredAndSortedHabits.reduce(
                    (sum, h) => sum + (h.status.streak || 0),
                    0,
                  ) / filteredAndSortedHabits.length,
                ) || 0}
              </p>
              <p className="text-xs text-gray-600 dark:text-gray-400">
                Avg. Streak
              </p>
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {filteredAndSortedHabits.reduce(
                  (sum, h) => sum + (h.totalCompletions || 0),
                  0,
                )}
              </p>
              <p className="text-xs text-gray-600 dark:text-gray-400">
                Total Completions
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
