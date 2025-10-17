"use client";
import { motion } from "framer-motion";
import { useIsMobile } from "@/hooks/use-mobile";
import { useEffect, useState } from "react";

const HeroSection = () => {
  const [isClient, setIsClient] = useState(false);
  const isMobile = useIsMobile();

  useEffect(() => {
    setIsClient(true);
  }, []);

  // Animation variants for the glow effect
  const glowVariants = {
    hidden: { opacity: 0, scale: 0.8 },
    visible: { opacity: 1, scale: 1.1 }
  };

  // Create staggered animation for each circle
  const containerVariants = {
    hidden: {},
    visible: {
      transition: {
        staggerChildren: 0.8, // Each circle glows for 0.8 seconds before moving to next
        repeat: Infinity,
        repeatDelay: 0.5
      }
    }
  };

  const circleVariants = {
    hidden: { 
      scale: 1
    },
    visible: { 
      scale: [1, 1.05, 1.1, 1.05, 1],
      transition: {
        duration: 0.8,
        ease: "easeInOut"
      }
    }
  };

  const glowEffectVariants = {
    hidden: { 
      opacity: 0,
      scale: 1
    },
    visible: { 
      opacity: [0, 0.9, 1, 0.9, 0],
      scale: [1, 1.3, 1.6, 1.3, 1],
      transition: {
        duration: 0.8,
        ease: "easeInOut"
      }
    }
  };

  // Calculate positions for 6 circles evenly distributed around the center
  // Each circle is positioned at 60-degree intervals (360° / 6 = 60°)
  // Responsive radius based on mobile/desktop
  const radius = isMobile ? 160 : 300;
  const circleImages = [
    { 
      id: 1, 
      src: "/pic1.png", 
      alt: "Healthcare",
      angle: 0 // Top (12 o'clock)
    },
    { 
      id: 2, 
      src: "/pic2.png", 
      alt: "Global Network",
      angle: 60 // Top-right (2 o'clock)
    },
    { 
      id: 3, 
      src: "/pic3.png", 
      alt: "Business Analytics",
      angle: 120 // Bottom-right (4 o'clock)
    },
    { 
      id: 4, 
      src: "/pic4.png", 
      alt: "Education",
      angle: 180 // Bottom (6 o'clock)
    },
    { 
      id: 5, 
      src: "/pic5.png", 
      alt: "Investment",
      angle: 240 // Bottom-left (8 o'clock)
    },
    { 
      id: 6, 
      src: "/pic6.png", 
      alt: "Travel",
      angle: 300 // Top-left (10 o'clock)
    }
  ];

  // Don't render the positioned elements until we're on the client
  if (!isClient) {
    return (
      <div className="relative h-screen bg-gradient-to-br from-green-50 to-blue-50 overflow-hidden">
        {/* Background circles for decoration */}
        <div className="absolute inset-0">
          <div className="absolute top-10 left-10 w-32 h-32 bg-green-200 rounded-full opacity-20"></div>
          <div className="absolute bottom-10 right-10 w-24 h-24 bg-blue-200 rounded-full opacity-20"></div>
          <div className="absolute top-1/2 left-1/4 w-16 h-16 bg-green-300 rounded-full opacity-15"></div>
        </div>

        {/* Main content */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center max-w-6xl px-4 sm:px-8">
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-7xl font-bold text-gray-800 mb-4 sm:mb-6">
              Risk-Free
            </h1>
            <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-7xl font-bold text-gray-800 mb-2 sm:mb-4">
              Financing
            </h2>
            <h3 className="text-2xl sm:text-3xl md:text-4xl lg:text-6xl font-bold text-gray-800 mb-6 sm:mb-8">
              start here
            </h3>
            <button className="bg-green-600 text-white px-6 sm:px-8 py-2 sm:py-3 rounded-full text-base sm:text-lg font-semibold shadow-lg hover:bg-green-700 transition-colors duration-300">
              DONATE
            </button>
            <p className="text-lg sm:text-xl text-gray-700 mt-6 sm:mt-8 font-medium px-4">
              1st crowdfunding platform in Bangladesh for startups
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative h-screen bg-gradient-to-br from-green-50 to-blue-50 overflow-hidden">
      {/* Background circles for decoration */}
      <div className="absolute inset-0">
        <div className="absolute top-10 left-10 w-32 h-32 bg-green-200 rounded-full opacity-20"></div>
        <div className="absolute bottom-10 right-10 w-24 h-24 bg-blue-200 rounded-full opacity-20"></div>
        <div className="absolute top-1/2 left-1/4 w-16 h-16 bg-green-300 rounded-full opacity-15"></div>
      </div>

      {/* Animated circular images */}
      <motion.div
        className="absolute inset-0 flex items-center justify-center"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {circleImages.map((image, index) => {
          // Convert angle to radians and calculate x, y position
          const angleInRadians = (image.angle * Math.PI) / 180;
          const x = Math.cos(angleInRadians) * radius;
          const y = Math.sin(angleInRadians) * radius;
          
          return (
            <motion.div
              key={image.id}
              className={`absolute ${isMobile ? 'w-16 h-16' : 'w-28 h-28'}`}
              style={{
                left: `calc(50% + ${x}px - ${isMobile ? '2rem' : '3.5rem'})`,
                top: `calc(50% + ${y}px - ${isMobile ? '2rem' : '3.5rem'})`,
              }}
              variants={circleVariants as any}
              custom={index}
            >
              {/* Glow effect layer - perfectly circular */}
              <motion.div
                className="absolute inset-0 rounded-full"
                style={{
                  background: 'radial-gradient(circle, rgba(34, 197, 94, 0.7) 0%, rgba(34, 197, 94, 0.5) 30%, rgba(34, 197, 94, 0.3) 60%, transparent 100%)',
                  filter: `blur(${isMobile ? '8px' : '12px'})`,
                  transform: `scale(${isMobile ? '1.8' : '2.2'})`
                }}
                variants={glowEffectVariants as any}
                custom={index}
              />
              
              {/* Additional stronger inner glow */}
              <motion.div
                className="absolute inset-0 rounded-full"
                style={{
                  background: 'radial-gradient(circle, rgba(34, 197, 94, 0.8) 0%, rgba(34, 197, 94, 0.4) 50%, transparent 80%)',
                  filter: `blur(${isMobile ? '4px' : '6px'})`,
                  transform: `scale(${isMobile ? '1.3' : '1.5'})`
                }}
                variants={glowEffectVariants as any}
                custom={index}
              />
              
              {/* Main circular image */}
              <div className="relative w-full h-full rounded-full overflow-hidden border-4 border-white shadow-lg bg-white">
                <img
                  src={image.src}
                  alt={image.alt}
                  className="w-full h-full object-cover"
                />
              </div>
            </motion.div>
          );
        })}
      </motion.div>

      {/* Main content */}
      <div className="absolute inset-0 flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.5 }}
          className="text-center max-w-6xl px-4 sm:px-8"
        >
          {/* Main heading */}
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.7 }}
            className="text-3xl sm:text-4xl md:text-5xl lg:text-7xl font-bold text-gray-800 mb-4 sm:mb-6"
          >
            Risk-Free
          </motion.h1>
          
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.9 }}
            className="text-3xl sm:text-4xl md:text-5xl lg:text-7xl font-bold text-gray-800 mb-2 sm:mb-4"
          >
            Financing
          </motion.h2>
          
          <motion.h3
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 1.1 }}
            className="text-2xl sm:text-3xl md:text-4xl lg:text-6xl font-bold text-gray-800 mb-6 sm:mb-8"
          >
            start here
          </motion.h3>

          {/* Donate button */}
          <motion.button
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 1.3 }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="bg-green-600 text-white px-6 sm:px-8 py-2 sm:py-3 rounded-full text-base sm:text-lg font-semibold shadow-lg hover:bg-green-700 transition-colors duration-300"
          >
            DONATE
          </motion.button>

          {/* Subtitle */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 1.5 }}
            className="text-lg sm:text-xl text-gray-700 mt-6 sm:mt-8 font-medium px-4"
          >
            1st crowdfunding platform in Bangladesh for startups
          </motion.p>

          {/* Bottom content */}
          <div className="mt-8 sm:mt-12 grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8 text-center lg:text-left">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 1.7 }}
              className="px-2"
            >
              <h4 className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-800 mb-2">
                More than Tk 50 million is raised every week on PujiGori.*
              </h4>
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 1.9 }}
              className="px-2"
            >
              <p className="text-base sm:text-lg text-gray-700">
                Get started in just a few minutes — with helpful new tools, it's easier 
                than ever to pick the perfect title, write a compelling story, and share 
                it with the world.
              </p>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default HeroSection;