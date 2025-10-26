"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState } from "react";

const WaterDropLoader = () => {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    // Hide loader after 3 seconds
    const timer = setTimeout(() => {
      setIsVisible(false);
    }, 3000);

    return () => clearTimeout(timer);
  }, []);

  // Create multiple water drops for the animation
  const waterDrops = Array.from({ length: 6 }, (_, i) => i);

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5 }}
          className="fixed inset-0 z-50 bg-gradient-to-br from-green-50 via-blue-50 to-green-50 flex items-center justify-center overflow-hidden"
        >
          {/* Background animated circles */}
          <div className="absolute inset-0">
            <motion.div
              className="absolute top-20 left-20 w-64 h-64 bg-green-200 rounded-full opacity-20"
              animate={{
                scale: [1, 1.2, 1],
                x: [0, 30, 0],
                y: [0, -20, 0],
              }}
              transition={{
                duration: 4,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            />
            <motion.div
              className="absolute bottom-20 right-20 w-48 h-48 bg-blue-200 rounded-full opacity-20"
              animate={{
                scale: [1, 1.3, 1],
                x: [0, -40, 0],
                y: [0, 30, 0],
              }}
              transition={{
                duration: 5,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            />
          </div>

          {/* Main content container */}
          <div className="relative flex flex-col items-center justify-center">
            {/* Water drops animation */}
            <div className="relative w-40 h-40 mb-8">
              {waterDrops.map((index) => {
                const angle = (index * 60) * Math.PI / 180;
                const radius = 60;
                const x = Math.cos(angle) * radius;
                const y = Math.sin(angle) * radius;

                return (
                  <motion.div
                    key={index}
                    className="absolute w-4 h-4"
                    style={{
                      left: `calc(50% + ${x}px - 0.5rem)`,
                      top: `calc(50% + ${y}px - 0.5rem)`,
                    }}
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{
                      scale: [0, 1.5, 1, 0],
                      opacity: [0, 1, 1, 0],
                      y: [0, -10, 0, 30],
                    }}
                    transition={{
                      duration: 2,
                      repeat: Infinity,
                      delay: index * 0.2,
                      ease: "easeInOut",
                    }}
                  >
                    {/* Water drop shape */}
                    <svg
                      viewBox="0 0 24 24"
                      className="w-full h-full"
                      fill="url(#dropGradient)"
                    >
                      <defs>
                        <linearGradient id="dropGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                          <stop offset="0%" stopColor="#22c55e" stopOpacity="0.8" />
                          <stop offset="100%" stopColor="#3b82f6" stopOpacity="0.6" />
                        </linearGradient>
                      </defs>
                      <path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z" />
                    </svg>
                  </motion.div>
                );
              })}

              {/* Center ripple effect */}
              <motion.div
                className="absolute inset-0 flex items-center justify-center"
              >
                <motion.div
                  className="w-20 h-20 border-4 border-green-400 rounded-full"
                  animate={{
                    scale: [1, 1.5, 2],
                    opacity: [0.6, 0.3, 0],
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    ease: "easeOut",
                  }}
                />
                <motion.div
                  className="absolute w-16 h-16 border-4 border-blue-400 rounded-full"
                  animate={{
                    scale: [1, 1.5, 2],
                    opacity: [0.6, 0.3, 0],
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    delay: 0.5,
                    ease: "easeOut",
                  }}
                />
              </motion.div>
            </div>

            {/* PujiGori Logo/Text */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5, duration: 0.8 }}
              className="text-center"
            >
              <h1 className="text-4xl sm:text-5xl font-bold mb-2">
                <span className="text-green-600">Puji</span>
                <span className="text-gray-800">Gori</span>
              </h1>
              <p className="text-gray-600 text-sm sm:text-base">
                Risk-Free Financing Starts Here
              </p>
            </motion.div>

            {/* Loading text */}
            <motion.div
              className="mt-8 flex items-center space-x-1"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1 }}
            >
              <span className="text-gray-500 text-sm">Loading</span>
              {[0, 1, 2].map((i) => (
                <motion.span
                  key={i}
                  className="inline-block w-1 h-1 bg-green-600 rounded-full"
                  animate={{
                    y: [0, -8, 0],
                  }}
                  transition={{
                    duration: 0.6,
                    repeat: Infinity,
                    delay: i * 0.15,
                  }}
                />
              ))}
            </motion.div>

            {/* Progress bar */}
            <motion.div
              className="mt-6 w-48 h-1 bg-gray-200 rounded-full overflow-hidden"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.8 }}
            >
              <motion.div
                className="h-full bg-gradient-to-r from-green-500 to-blue-500"
                initial={{ width: "0%" }}
                animate={{ width: "100%" }}
                transition={{ duration: 2.5, ease: "easeInOut" }}
              />
            </motion.div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default WaterDropLoader;