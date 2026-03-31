"use client";
import Link from "next/link";
import { Code2, Github, LayoutDashboard, User } from "lucide-react";
import { useSession } from "next-auth/react"; // 1. Import Session Hook

export default function Navbar() {
  const { data: session } = useSession(); // 2. Get User Data

  return (
    <div className="fixed top-6 left-0 right-0 flex justify-center z-50 px-4">
      <nav className="flex items-center gap-12 px-6 py-3 
        bg-white/5 
        backdrop-blur-xl 
        border border-white/10 
        rounded-full 
        shadow-[0_4px_30px_rgba(0,0,0,0.1)] 
        hover:border-white/20 hover:bg-white/10 transition-all duration-300"
      >
        
        {/* Logo */}
        <Link href="/" className="group cursor-pointer">
          <div className="flex items-center gap-2">
            <Code2 className="w-5 h-5 text-sky-400 group-hover:text-sky-300 transition-colors" />
            <span className="font-bold text-white tracking-tight group-hover:text-sky-100 transition-colors">
              CodeVibe
            </span>
          </div>
        </Link>

        {/* Middle Links (Hidden on mobile) */}
        <div className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-400">
          <Link href="/projects" className="hover:text-white transition-colors">Projects</Link>
          <Link href="#" className="hover:text-white transition-colors">Features</Link>
          <Link href="#" className="hover:text-white transition-colors">Pricing</Link>
        </div>

        {/* Dynamic Right Section */}
        {session ? (
          // ✅ IF LOGGED IN: Show Dashboard & Name
          <Link href="/dashboard">
            <button className="flex items-center gap-2 px-5 py-2 bg-sky-500/10 text-sky-400 border border-sky-500/20 text-xs font-bold rounded-full hover:bg-sky-500 hover:text-white transition-all">
              <LayoutDashboard className="w-3 h-3" />
              <span>Dashboard</span>
            </button>
          </Link>
        ) : (
          // ❌ IF LOGGED OUT: Show GitHub Login
          <Link href="/login">
            <button className="flex items-center gap-2 px-5 py-2 bg-white text-black text-xs font-bold rounded-full hover:bg-sky-50 transition-colors">
              <Github className="w-3 h-3" />
              <span>Login</span>
            </button>
          </Link>
        )}
      </nav>
    </div>
  );
}