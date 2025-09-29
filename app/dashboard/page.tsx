'use client'

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { createClient } from "@/utils/supabase/client";
import ProductCard from "@/components/ProductCard";

// Helper function to extract product name from URL
function extractProductInfo(url: string, storeName: string) {
  try {
    const urlParts = url.split('/');
    const productPart = urlParts.find(part => part.includes('-') && part.length > 10) || '';

    // Clean up the product name
    let productName = productPart
      .replace(/[-_]/g, ' ')
      .replace(/\d+/g, '')
      .trim()
      .split(' ')
      .filter(word => word.length > 2)
      .slice(0, 4)
      .join(' ');

    // If we can't extract from URL, use store name + generic
    if (!productName || productName.length < 5) {
      productName = `${storeName} Product`;
    }

    return productName.charAt(0).toUpperCase() + productName.slice(1);
  } catch {
    return `${storeName} Product`;
  }
}

// Generate placeholder image based on store
function getPlaceholderImage(storeName: string) {
  const colors = {
    'Shoe Palace': 'bg-gradient-to-br from-red-400 to-red-600',
    'JD Sports': 'bg-gradient-to-br from-blue-400 to-blue-600',
    'Hibbett': 'bg-gradient-to-br from-green-400 to-green-600',
    'default': 'bg-gradient-to-br from-gray-400 to-gray-600'
  };

  return colors[storeName as keyof typeof colors] || colors.default;
}

// Custom component for displaying price monitor data
function ProductMonitorCard({ monitor, index }: { monitor: any, index: number }) {
  const productName = extractProductInfo(monitor.product_url, monitor.store_name);
  const gradientClass = getPlaceholderImage(monitor.store_name);

  return (
    <motion.div
      whileHover={{ y: -8 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
      className="group cursor-pointer"
    >
      <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 overflow-hidden transition-shadow duration-300 group-hover:shadow-lg group-hover:shadow-black/10">

        {/* Image Container with Gradient Placeholder */}
        <div className="relative aspect-square bg-gray-50 dark:bg-gray-800">
          <div className={`w-full h-full ${gradientClass} flex items-center justify-center`}>
            <div className="text-center text-white p-4">
              <div className="text-2xl font-bold mb-2">👟</div>
              <div className="text-sm opacity-90">{monitor.store_name}</div>
            </div>
          </div>

          {/* Status Badge */}
          <div className="absolute top-3 right-3">
            <div className={`px-2 py-1 rounded-full text-xs font-medium ${
              monitor.is_active
                ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                : 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200'
            }`}>
              {monitor.is_active ? 'Active' : 'Paused'}
            </div>
          </div>

          {/* Price Change Indicator */}
          {monitor.last_price && monitor.target_price && (
            <div className="absolute top-3 left-3">
              <div className={`px-2 py-1 rounded-full text-xs font-medium ${
                parseFloat(monitor.last_price) <= parseFloat(monitor.target_price)
                  ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                  : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
              }`}>
                {parseFloat(monitor.last_price) <= parseFloat(monitor.target_price) ? '🎯' : '📈'}
              </div>
            </div>
          )}
        </div>

        {/* Content */}
        <div className="p-4 space-y-3">
          {/* Title */}
          <h3 className="font-semibold text-gray-900 dark:text-white text-sm leading-tight line-clamp-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors duration-200">
            {productName}
          </h3>

          {/* Price Information */}
          <div className="space-y-2">
            {monitor.last_price && (
              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-500 dark:text-gray-400">Current</span>
                <span className="text-lg font-bold text-gray-900 dark:text-white">
                  ${monitor.last_price}
                </span>
              </div>
            )}

            {monitor.target_price && (
              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-500 dark:text-gray-400">Target</span>
                <span className="text-sm font-medium text-green-600 dark:text-green-400">
                  ${monitor.target_price}
                </span>
              </div>
            )}
          </div>

          {/* Last Checked */}
          {monitor.last_checked_at && (
            <div className="text-xs text-gray-400 dark:text-gray-500">
              Checked: {new Date(monitor.last_checked_at).toLocaleDateString()}
            </div>
          )}

          {/* Action Button - appears on hover */}
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            whileHover={{ opacity: 1, height: "auto" }}
            transition={{ duration: 0.2 }}
            className="group-hover:opacity-100 opacity-0 transition-opacity duration-200"
          >
            <button
              onClick={() => window.open(monitor.product_url, '_blank')}
              className="w-full mt-2 bg-gray-900 dark:bg-white text-white dark:text-gray-900 py-2 px-4 rounded-lg text-sm font-medium hover:bg-gray-800 dark:hover:bg-gray-100 transition-colors duration-200"
            >
              View Product
            </button>
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
}

import { SneakerTrackerApp } from "@/components/sneaker-tracker-app";

export default function Dashboard() {
  return <SneakerTrackerApp />;
}