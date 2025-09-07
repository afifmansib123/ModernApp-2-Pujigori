"use client";
import Image from "next/image";
import { motion } from "framer-motion";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

const HeroSection = () => {
  return (
    <div className="relative h-screen">
      {" "}
      {/* the parent is relative */}
      <Image
        src="/landing-splash.jpg"
        alt="homepage image"
        priority
        fill
        className="object-cover object-center"
      />
      <div className="absolute inset-0 bg-black bg-opacity-50">
        {/* initial state and it will move 20 px frpm start , opicity makes it fully visible */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="absolute iset-0 top-1/3 transform -translate-y-1/2 -translate-x-1/2 text-center w-full"
        >
          {/* classname is for placing text at center with 1/3rd at top */}
          <div className="max-w-4xl mx-auto px-16 sm:px-12">
            <h1 className="text-4xl sm:text-5xl md:text-6xl text-white font-bold mb-4">
              Our Text
            </h1>
            <p className="text-lg sm:text-xl text-white mb-8">
              Our Text
            </p>
            <div className="flex justify-center">
              <Input
                type="text"
                placeholder="find your dream property today"
                value="search query"
                onChange={() => {}}
                className="w-full max-w-lg bg-white h-12 rounded-none rounded-l-xl"
              />{" "}
              {/* rounded none and then rounding the right side */}
              <Button
                className="bg-secondary-500 text-white rounded-none rounded-r-xl h-12"
                onClick={() => {}}
              >
                Search
              </Button>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default HeroSection;