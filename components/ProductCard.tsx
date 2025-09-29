
'use client'

import Image from "next/image";
import { motion } from "framer-motion";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

interface ProductCardProps {
  imageUrl: string;
  title: string;
  price: number;
}

export default function ProductCard({
  imageUrl,
  title,
  price,
}: ProductCardProps) {
  return (
    <motion.div
      whileHover={{ y: -8 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
      className="group cursor-pointer"
    >
      <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 overflow-hidden transition-shadow duration-300 group-hover:shadow-lg group-hover:shadow-black/10">

        {/* Image Container */}
        <div className="relative aspect-square bg-gray-50 dark:bg-gray-800 p-4">
          <motion.div
            whileHover={{ scale: 1.05 }}
            transition={{ duration: 0.4, ease: "easeOut" }}
            className="relative w-full h-full"
          >
            <Image
              src={imageUrl}
              alt={title}
              fill
              className="object-contain transition-all duration-500"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            />
          </motion.div>

          {/* Subtle overlay on hover */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        </div>

        {/* Content */}
        <div className="p-4 space-y-2">
          {/* Title */}
          <h3 className="font-semibold text-gray-900 dark:text-white text-sm leading-tight line-clamp-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors duration-200">
            {title}
          </h3>

          {/* Price */}
          <div className="flex items-center justify-between">
            <span className="text-lg font-bold text-gray-900 dark:text-white">
              {price ? `$${price}` : "Price TBD"}
            </span>
          </div>

          {/* Action Button - appears on hover */}
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            whileHover={{ opacity: 1, height: "auto" }}
            transition={{ duration: 0.2 }}
            className="group-hover:opacity-100 opacity-0 transition-opacity duration-200"
          >
            <button className="w-full mt-2 bg-gray-900 dark:bg-white text-white dark:text-gray-900 py-2 px-4 rounded-lg text-sm font-medium hover:bg-gray-800 dark:hover:bg-gray-100 transition-colors duration-200">
              View Details
            </button>
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
}
