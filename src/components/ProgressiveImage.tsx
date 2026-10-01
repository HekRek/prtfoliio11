import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";

interface ProgressiveImageProps {
  src: string;
  alt: string;
  className?: string;
}

export const ProgressiveImage: React.FC<ProgressiveImageProps> = ({ src, alt, className }) => {
  const [isLoaded, setIsLoaded] = useState(false);

  return (
    <div className={`relative overflow-hidden bg-white/5 ${className}`}>
      {/* Skeleton / Placeholder */}
      <AnimatePresence>
        {!isLoaded && (
          <motion.div 
            initial={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 z-10 flex items-center justify-center bg-white/5"
          >
            <motion.div 
              animate={{ 
                opacity: [0.3, 0.6, 0.3],
              }}
              transition={{ 
                duration: 1.5, 
                repeat: Infinity, 
                ease: "easeInOut" 
              }}
              className="w-full h-full bg-gradient-to-r from-transparent via-white/10 to-transparent"
              style={{ backgroundSize: '200% 100%' }}
            />
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-8 h-8 border-2 border-white/10 border-t-secondary rounded-full animate-spin" />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.img 
        src={src} 
        alt={alt}
        referrerPolicy="no-referrer"
        onLoad={() => setIsLoaded(true)}
        initial={{ opacity: 0, filter: "grayscale(100%)" }}
        animate={{ 
          opacity: isLoaded ? 1 : 0,
          filter: isLoaded ? "grayscale(0%)" : "grayscale(100%)"
        }}
        transition={{ duration: 0.8 }}
        className={`w-full h-full object-cover ${isLoaded ? "" : "invisible"}`} 
      />
    </div>
  );
};
