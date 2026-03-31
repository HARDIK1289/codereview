import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import { getGithubData } from "@/lib/github";
import { redirect } from "next/navigation";
import DeveloperProfile from "@/components/dashboard/DeveloperProfile"; // ✅ Imported here
import { GitFork, Star, Zap, LayoutTemplate } from "lucide-react";
import Image from "next/image";

// Reusable Stat Card Component
function StatCard({ label, value, icon: Icon }) {
  return (
    <div className="p-6 rounded-2xl border border-white/5 bg-white/5 backdrop-blur-sm hover:border-white/10 transition-colors">
      <div className="flex justify-between items-start mb-4">
        <div>
          <p className="text-slate-400 text-sm font-medium mb-1">{label}</p>
          <h3 className="text-3xl font-bold text-white tracking-tight">{value}</h3>
        </div>
        <div className="p-3 bg-white/5 rounded-lg text-sky-400">
          <Icon className="w-5 h-5" />
        </div>
      </div>
    </div>
  );
}

export default async function Dashboard() {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/login");
  }

  // Fetch Real Data using the username from session
  const data = await getGithubData(session.user.username);

  if (!data) {
    return <div className="text-white">Failed to load GitHub data. Rate limit exceeded?</div>;
  }

  return (
    <div className="space-y-8 p-6 md:p-12 max-w-7xl mx-auto">
      
      {/* 1. Header Section */}
      <div className="flex items-center justify-between border-b border-white/5 pb-8">
        <div>
          <h1 className="text-4xl font-black text-white tracking-tight">Dashboard</h1>
          <p className="text-slate-400 mt-2">
            Welcome back, <span className="text-transparent bg-clip-text bg-gradient-to-r from-sky-400 to-purple-400 font-bold">{session.user.name}</span>
          </p>
        </div>
        <div className="flex items-center gap-3 px-4 py-2 rounded-full border border-white/10 bg-white/5">
          <Image 
            src={session.user.image} 
            alt="Profile" 
            width={32} 
            height={32} 
            className="rounded-full ring-2 ring-sky-500/50"
          />
          <span className="text-sm font-medium text-slate-300">@{session.user.username}</span>
        </div>
      </div>

      {/* 2. NEW: Developer DNA (AI Profile) Section */}
      <section>
        <DeveloperProfile />
      </section>

      {/* 3. GitHub Overview (Stats Grid) */}
      <section>
        <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
          <Zap className="w-5 h-5 text-yellow-500" /> GitHub Activity
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <StatCard label="Total Repositories" value={data.totalRepos} icon={LayoutTemplate} />
          <StatCard label="Followers" value={data.followers} icon={Zap} />
          <StatCard label="Stars Earned" value={data.totalStars || 0} icon={Star} />
          <StatCard label="Forks" value={data.totalForks || 0} icon={GitFork} />
        </div>
      </section>

      {/* 4. Deep Dive Section (Languages & Recent Repos) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Languages Chart */}
        <div className="lg:col-span-1 p-6 rounded-2xl border border-white/5 bg-white/5 backdrop-blur-sm h-fit">
          <h3 className="text-lg font-semibold text-white mb-6">Top Languages</h3>
          <div className="space-y-4">
            {data.topLanguages.map((lang, i) => (
              <div key={lang.name}>
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-slate-300">{lang.name}</span>
                  <span className="text-slate-500">{lang.count} repos</span>
                </div>
                <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-sky-500/80 rounded-full" 
                    style={{ width: `${(lang.count / data.totalRepos) * 100}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Repos List */}
        <div className="lg:col-span-2 p-6 rounded-2xl border border-white/5 bg-white/5 backdrop-blur-sm">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-semibold text-white">Recent Repositories</h3>
          </div>
          
          <div className="space-y-4">
            {data.repos.map((repo) => (
              <div key={repo.id} className="group flex items-center justify-between p-4 rounded-xl border border-white/5 bg-black/20 hover:border-sky-500/30 transition-all">
                <div className="flex items-center gap-4">
                  <div className="p-2 rounded-lg bg-sky-500/10 text-sky-400">
                    <LayoutTemplate className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-white font-medium group-hover:text-sky-400 transition-colors">{repo.name}</h4>
                    <p className="text-xs text-slate-500">{repo.language || "No language"} • Updated {new Date(repo.updated_at).toLocaleDateString()}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 text-slate-500 text-sm">
                  <Star className="w-4 h-4" />
                  <span>{repo.stargazers_count}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}