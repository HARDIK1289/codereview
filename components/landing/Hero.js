"use client";
import { motion } from "framer-motion";
import { ArrowRight, Sparkles } from "lucide-react";
import Link from "next/link";

const container = {
  hidden: { opacity: 0 },
  visible: (i = 1) => ({
    opacity: 1,
    transition: { staggerChildren: 0.05, delayChildren: 0.2 * i },
  }),
};

const child = {
  visible: {
    opacity: 1,
    y: 0,
    transition: { type: "spring", damping: 12, stiffness: 100 },
  },
  hidden: {
    opacity: 0,
    y: 20,
    transition: { type: "spring", damping: 12, stiffness: 100 },
  },
};

export default function Hero() {
  const headline = "meant to be read.";
  const letters = Array.from(headline);

  return (
    <div className="min-h-[85vh] flex flex-col justify-center items-center text-center pt-20">
      
      {/* Badge */}
      <motion.div 
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="mb-8 px-4 py-1.5 rounded-full border border-slate-800 bg-slate-900/50 backdrop-blur-md flex items-center gap-2"
      >
        <Sparkles className="w-3 h-3 text-sky-400" />
        <span className="text-slate-300 text-xs font-semibold tracking-widest uppercase">
          AI-Powered Architecture
        </span>
      </motion.div>

      {/* Main Title */}
      <div className="space-y-2 mb-8">
        <motion.h1 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="text-6xl md:text-8xl font-bold tracking-tighter text-white"
        >
          Code that is
        </motion.h1>

        {/* Matte Blue Text (No Glow) */}
        <motion.div 
          className="flex justify-center overflow-hidden"
          variants={container}
          initial="hidden"
          animate="visible"
        >
          {letters.map((letter, index) => (
            <motion.span 
              key={index} 
              variants={child}
              // Removed drop-shadow, just pure color
              className="text-6xl md:text-8xl font-bold tracking-tighter text-sky-400"
            >
              {letter === " " ? "\u00A0" : letter}
            </motion.span>
          ))}
        </motion.div>
      </div>

      {/* Subtext */}
      <motion.p 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1, duration: 1 }}
        className="text-lg text-slate-400 max-w-xl mx-auto leading-relaxed mb-10"
      >
        The first developer platform that prioritizes human cognitive load. 
        Optimize your codebase for the <span className="text-white font-medium">10x readers</span>, not just the writers.
      </motion.p>

      {/* Button */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.2, duration: 0.5 }}
      >
        <Link href="/login">
          <button className="group relative px-8 py-4 bg-white text-black font-bold rounded-lg overflow-hidden transition-all hover:scale-105">
            <div className="absolute inset-0 bg-sky-300 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
            <div className="relative flex items-center gap-2">
              <span>Start Analyzing</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </div>
          </button>
        </Link>
      </motion.div>

    </div>
  );
}