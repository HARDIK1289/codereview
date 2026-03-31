"use client";
import { motion } from "framer-motion";
import { Eye, GitBranch, Terminal } from "lucide-react";

const infoCards = [
  {
    icon: <Eye className="w-5 h-5 text-sky-300" />, // Color accent
    title: "Cognitive Load",
    desc: "Code is read 10x more than written. We optimize for the reader, reducing mental fatigue."
  },
  {
    icon: <Terminal className="w-5 h-5 text-indigo-300" />,
    title: "Objective Metrics",
    desc: "Move beyond 'looks good to me'. Get quantifiable scores on cyclomatic complexity and nesting."
  },
  {
    icon: <GitBranch className="w-5 h-5 text-purple-300" />,
    title: "Maintainability",
    desc: "Predict technical debt before it merges. Ensure your codebase scales with your team."
  }
];

export default function InfoSection() {
  return (
    <section className="py-24 px-4 relative z-10">
      <div className="max-w-6xl mx-auto">
        <div className="mb-16 text-center">
          <h2 className="text-3xl font-bold tracking-tight mb-4 text-slate-100">Why Readability Matters</h2>
          <div className="h-1 w-24 bg-gradient-to-r from-sky-500 to-indigo-500 mx-auto rounded-full" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {infoCards.map((card, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.1 }}
              // Improved Card Styling: Glassmorphism + Hover Lift
              className="group p-8 rounded-2xl bg-slate-800/40 backdrop-blur-md border border-slate-700/50 hover:border-sky-500/30 hover:bg-slate-800/60 transition-all duration-300 shadow-lg hover:shadow-sky-500/10 hover:-translate-y-1"
            >
              <div className="w-12 h-12 bg-slate-700/50 rounded-xl flex items-center justify-center mb-6 text-white group-hover:scale-110 transition-transform ring-1 ring-white/10">
                {card.icon}
              </div>
              <h3 className="text-xl font-semibold text-slate-100 mb-3">{card.title}</h3>
              <p className="text-slate-400 text-sm leading-relaxed">
                {card.desc}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}