"use client";

import { motion } from "framer-motion";
import { Github, Code2, Cpu } from "lucide-react";

export default function Features() {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 40 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.7, delay: 0.5 }}
      className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-16 border-t border-white/5"
    >
      <FeatureCard 
        icon={<Code2 className="w-6 h-6 text-cyan-400" />}
        title="Semantic Analysis"
        desc="Goes beyond linting to understand code intent and structure."
      />
      <FeatureCard 
        icon={<Cpu className="w-6 h-6 text-indigo-400" />}
        title="AI Scoring"
        desc="Get an objective 0-100 readability score for every file."
      />
      <FeatureCard 
        icon={<Github className="w-6 h-6 text-purple-400" />}
        title="GitHub Native"
        desc="Seamless integration with your public and private repositories."
      />
    </motion.div>
  );
}

// Sub-component (private to this file is fine since it's only used here)
function FeatureCard({ icon, title, desc }) {
  return (
    <div className="p-6 rounded-2xl border border-white/5 bg-white/5 hover:bg-white/10 transition-colors backdrop-blur-sm">
      <div className="mb-4 p-3 bg-white/5 rounded-lg w-fit">{icon}</div>
      <h3 className="text-xl font-semibold text-white mb-2">{title}</h3>
      <p className="text-slate-400 text-sm leading-relaxed">{desc}</p>
    </div>
  );
}