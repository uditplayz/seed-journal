import React from "react";
import { useLocation } from "react-router-dom";
import Header from "./Header";
import Navigation from "./Navigation";

export default function Layout({ children }) {
  const location = useLocation();

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <Header />

      {/* Main Content */}
      <main className="pb-20 pt-16">
        {" "}
        {/* Space for fixed header and bottom nav */}
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">{children}</div>
      </main>

      {/* Bottom Navigation */}
      <Navigation />
    </div>
  );
}
