import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "motion/react";

const BOOT_SEQUENCES = [
  "INITIALIZING SYSTEM_FLOW...",
  "BOOTING CORE_KERNEL 5.0.2...",
  "MOUNTING CREATIVE_DRIVE...",
  "SYNCING IDENTITY_MATRIX...",
  "ANALYZING NEURAL_PATHWAYS...",
  "HECTOR MARTIN DOMINGUEZ DETECTED",
  "SYSTEM_ESTABLISHED: 2007",
  "ACCESS GRANTED."
];

export const Loader = ({ onComplete }: { onComplete: () => void }) => {
  const [index, setIndex] = useState(0);
  const [progress, setProgress] = useState(0);
  const [showBrand, setShowBrand] = useState(false);

  useEffect(() => {
    if (index < BOOT_SEQUENCES.length) {
      const timeout = setTimeout(() => {
        setIndex((prev) => prev + 1);
        setProgress(((index + 1) / BOOT_SEQUENCES.length) * 100);
      }, index === BOOT_SEQUENCES.length - 1 ? 1200 : Math.random() * 400 + 100);
      return () => clearTimeout(timeout);
    } else {
      setTimeout(() => setShowBrand(true), 500);
      setTimeout(onComplete, 3500);
    }
  }, [index, onComplete]);

  return (
    <motion.div 
      initial={{ opacity: 1 }}
      exit={{ opacity: 0, filter: "blur(10px)" }}
      transition={{ duration: 1.5, ease: [0.19, 1, 0.22, 1] }}
      className="fixed inset-0 z-[100] bg-[#131313] flex flex-col items-center justify-center p-8 overflow-hidden"
    >
      <AnimatePresence mode="wait">
        {!showBrand ? (
          <motion.div 
            key="terminal"
            initial={{ opacity: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ duration: 0.5 }}
            className="w-full max-w-md space-y-12 relative z-20"
          >
            {/* Background Grid - visible only during terminal */}
            <div className="absolute inset-x-[-100vw] inset-y-[-100vh] opacity-[0.05] pointer-events-none" 
                 style={{ backgroundImage: 'linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)', backgroundSize: '40px 40px' }} 
            />

            <div className="space-y-4">
              <div className="flex justify-between items-end">
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="font-mono text-[10px] tracking-[0.3em] text-secondary uppercase italic"
                >
                  System Boot Sequence
                </motion.div>
                <div className="font-mono text-[10px] tracking-widest text-white/40">
                  {Math.round(progress)}%
                </div>
              </div>
              
              <div className="h-px w-full bg-white/10 relative overflow-hidden">
                <motion.div 
                  animate={{ width: `${progress}%` }}
                  transition={{ ease: "easeOut", duration: 0.5 }}
                  className="absolute top-0 left-0 h-full bg-secondary shadow-[0_0_15px_#ffffff]"
                />
              </div>
            </div>

            <div className="min-h-[120px] font-mono text-[11px] leading-relaxed tracking-widest uppercase flex flex-col gap-1">
              <AnimatePresence mode="popLayout">
                {BOOT_SEQUENCES.slice(Math.max(0, index - 5), index + 1).map((line, i) => {
                  const isLast = i === index - Math.max(0, index - 5);
                  return (
                    <motion.div
                      key={line}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: isLast ? 1 : 0.4, x: 0 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      className={isLast ? "text-white" : "text-white/40"}
                    >
                      <span className="text-secondary mr-3">{">"}</span> 
                      {line}
                      {isLast && (
                        <motion.span 
                          animate={{ opacity: [0, 1, 0] }}
                          transition={{ duration: 0.8, repeat: Infinity }}
                          className="inline-block w-2 h-3 bg-secondary ml-2 align-middle"
                        />
                      )}
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="brand"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1 }}
            className="flex flex-col items-center justify-center text-center relative z-20"
          >
            {/* Screen Turn On Effect */}
            <motion.div 
              initial={{ scaleX: 0, opacity: 0.5 }}
              animate={{ scaleX: 1, opacity: 1 }}
              transition={{ duration: 0.4, ease: "easeOut" }}
              className="w-full h-px bg-white/40 absolute top-1/2 -translate-y-1/2"
            />
            
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5, duration: 1, ease: [0.19, 1, 0.22, 1] }}
              className="space-y-6"
            >
              <motion.h1 
                animate={{ 
                  textShadow: [
                    "0 0 0px #fff",
                    "0 0 20px #fff",
                    "0 0 0px #fff"
                  ]
                }}
                transition={{ duration: 2, repeat: Infinity }}
                className="font-display text-4xl md:text-7xl font-black tracking-tighter uppercase italic text-white"
              >
                HÉCTOR MARTÍN <br /> DOMÍNGUEZ
              </motion.h1>
              
              <div className="flex items-center justify-center gap-6">
                <div className="w-12 h-px bg-white/20" />
                <span className="font-mono text-[9px] uppercase tracking-[0.6em] text-secondary">
                  AUTH_ACCESS_ESTABLISHED
                </span>
                <div className="w-12 h-px bg-white/20" />
              </div>
            </motion.div>

            {/* Distant Glow */}
            <motion.div 
              animate={{ 
                opacity: [0.1, 0.3, 0.1],
                scale: [1, 1.2, 1]
              }}
              transition={{ duration: 3, repeat: Infinity }}
              className="absolute -inset-20 bg-secondary/5 blur-[100px] -z-10 rounded-full"
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Scanning Line - always visible */}
      <motion.div 
        animate={{ y: ["-100%", "1000%"] }}
        transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
        className="absolute top-0 left-0 w-full h-[10vh] bg-gradient-to-b from-transparent via-secondary/10 to-transparent pointer-events-none z-10"
      />

      {/* Decorative corners */}
      <div className="absolute top-12 left-12 w-8 h-8 border-t border-l border-white/20" />
      <div className="absolute top-12 right-12 w-8 h-8 border-t border-r border-white/20" />
      <div className="absolute bottom-12 left-12 w-8 h-8 border-b border-l border-white/20" />
      <div className="absolute bottom-12 right-12 w-8 h-8 border-b border-r border-white/20" />
    </motion.div>
  );
};
