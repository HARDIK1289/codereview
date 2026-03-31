"use client";

import { signIn, useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { Github, Code2, ArrowLeft, Loader2 } from "lucide-react";
import Link from "next/link";
import { motion } from "framer-motion";
import ParticlesBackground from "@/components/landing/ParticlesBackground";

export default function Login() {
  const { status } = useSession();
  const router = useRouter();

  // 1. Auto-Redirect Logic
  useEffect(() => {
    if (status === "authenticated") {
      router.replace("/dashboard"); // 'replace' prevents back-button loops
    }
  }, [status, router]);

  // 2. Loading State (Prevents UI flicker while checking session)
  if (status === "loading" || status === "authenticated") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#050505]">
        <Loader2 className="w-8 h-8 text-sky-500 animate-spin" />
      </div>
    );
  }

  // 3. Main Login UI
  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden bg-[#050505]">
      {/* Background Reuse */}
      <ParticlesBackground />
      
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md p-8 rounded-2xl bg-black/40 backdrop-blur-xl border border-white/10 shadow-[0_0_50px_rgba(0,0,0,0.5)] relative z-10"
      >
        {/* Header */}
        <div className="text-center mb-8 space-y-2">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-sky-500/10 mb-4 ring-1 ring-sky-500/30">
            <Code2 className="w-6 h-6 text-sky-400" />
          </div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Welcome Back</h1>
          <p className="text-slate-400 text-sm">Sign in to access your dashboard</p>
        </div>

        {/* Login Button */}
        <button 
          onClick={() => signIn("github", { callbackUrl: "/dashboard" })}
          className="w-full group relative flex items-center justify-center gap-3 px-4 py-3.5 bg-white text-black font-bold rounded-lg overflow-hidden transition-all hover:scale-[1.02] hover:shadow-[0_0_20px_rgba(255,255,255,0.3)]"
        >
          <Github className="w-5 h-5 transition-transform group-hover:scale-110" />
          <span>Continue with GitHub</span>
        </button>

        {/* Footer Links */}
        <div className="mt-8 pt-6 border-t border-white/5 text-center">
          <Link href="/" className="inline-flex items-center gap-2 text-xs text-slate-500 hover:text-white transition-colors">
            <ArrowLeft className="w-3 h-3" />
            Back to Home
          </Link>
        </div>

      </motion.div>
    </div>
  );
}