"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, FolderGit2, Settings, LogOut, Code2 } from "lucide-react";
import { signOut } from "next-auth/react";

const sidebarItems = [
  { icon: LayoutDashboard, label: "Overview", href: "/dashboard" },
  { icon: FolderGit2, label: "Projects", href: "/projects" }, // We will build this next
  { icon: Settings, label: "Settings", href: "/settings" },
];

export default function DashboardLayout({ children }) {
  const pathname = usePathname();

  return (
    <div className="flex min-h-screen bg-[#050505]">
      
      {/* Sidebar - Fixed Left */}
      <aside className="w-64 border-r border-white/5 bg-black/40 backdrop-blur-xl hidden md:flex flex-col fixed h-full z-20">
        
        {/* Logo Area */}
        {/* Logo Area */}
        <div className="p-6 border-b border-white/5">
          {/* ✅ FIX: Wrapped in Link href="/dashboard" */}
          <Link href="/" className="group block">
            <div className="flex items-center gap-2 text-white">
              <div className="p-2 bg-sky-500/10 rounded-lg group-hover:bg-sky-500/20 transition-colors">
                <Code2 className="w-6 h-6 text-sky-400" />
              </div>
              <span className="font-bold text-lg tracking-tight group-hover:text-sky-400 transition-colors">
                CodeVibe
              </span>
            </div>
          </Link>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-2">
          {sidebarItems.map((item) => {
            const isActive = pathname === item.href;
            const Icon = item.icon;
            
            return (
              <Link key={item.href} href={item.href}>
                <div className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group
                  ${isActive 
                    ? "bg-sky-500/10 text-sky-400 border border-sky-500/20" 
                    : "text-slate-400 hover:text-white hover:bg-white/5"
                  }`}
                >
                  <Icon className={`w-5 h-5 ${isActive ? "text-sky-400" : "text-slate-500 group-hover:text-white"}`} />
                  <span className="font-medium text-sm">{item.label}</span>
                </div>
              </Link>
            );
          })}
        </nav>

        {/* User / Logout Area */}
        <div className="p-4 border-t border-white/5">
          <button 
            onClick={() => signOut({ callbackUrl: "/" })}
            className="flex items-center gap-3 w-full px-4 py-3 text-slate-400 hover:text-red-400 hover:bg-red-500/10 rounded-xl transition-all"
          >
            <LogOut className="w-5 h-5" />
            <span className="font-medium text-sm">Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 md:ml-64 p-8 relative">
        {/* Background Gradients (Subtle) */}
        <div className="absolute top-0 left-0 w-full h-96 bg-sky-500/5 blur-[120px] pointer-events-none" />
        
        <div className="relative z-10 max-w-6xl mx-auto">
          {children}
        </div>
      </main>

    </div>
  );
}