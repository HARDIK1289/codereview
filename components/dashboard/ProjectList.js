"use client";
import { useState, useEffect } from "react";
import { Search, GitFork, Star, ArrowRight, Loader2, Lock, Globe } from "lucide-react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";

export default function ProjectList({ username }) {
  const [repos, setRepos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [analyzingRepoId, setAnalyzingRepoId] = useState(null); // Track which repo is being started

  const router = useRouter();
  const { data: session } = useSession();

  // 1. Fetch Repos
  useEffect(() => {
    async function fetchRepos() {
      try {
        const res = await fetch(`https://api.github.com/users/${username}/repos?per_page=100&sort=updated`);
        if (!res.ok) throw new Error("Failed to fetch");
        const data = await res.json();
        setRepos(data);
      } catch (error) {
        console.error("Repo fetch error:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchRepos();
  }, [username]);

  // 2. Handle Analysis Trigger (Connects to Python Backend)
  const handleAnalyze = async (repo) => {
    if (!session) return;
    
    setAnalyzingRepoId(repo.id); // Show loading spinner on button

    try {
      // POST to FastAPI Backend
      const res = await fetch("http://localhost:8000/api/analyze-repo", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          repo_url: repo.html_url,
          user_id: session.user.id,
          github_token: session.accessToken // Requires session.user.id to be set in authOptions
        }),
      });

      if (!res.ok) {
        throw new Error("Analysis failed to start");
      }

      const data = await res.json();

      // Redirect to the Polling Page with the new Job ID
      if (data.job_id) {
        router.push(`/dashboard/analysis/${data.job_id}`);
      }
    } catch (error) {
      console.error("Analysis trigger failed:", error);
      alert("Failed to start analysis. Is the backend running?");
      setAnalyzingRepoId(null); // Reset loading state on error
    }
  };

  // 3. Filter Logic
  const filteredRepos = repos.filter(repo => 
    repo.name.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <Loader2 className="w-8 h-8 text-sky-500 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Search Bar */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
        <input 
          type="text" 
          placeholder="Search repositories..." 
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-4 py-3 text-white placeholder:text-slate-600 focus:outline-none focus:border-sky-500/50 transition-colors"
        />
      </div>

      {/* Repo Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pb-20">
        {filteredRepos.map((repo, i) => (
          <motion.div 
            key={repo.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className="group flex flex-col justify-between p-6 rounded-2xl border border-white/5 bg-white/5 hover:border-sky-500/30 hover:bg-white/10 transition-all duration-300"
          >
            <div>
              <div className="flex justify-between items-start mb-4">
                <div className="flex items-center gap-2">
                   {repo.private ? <Lock className="w-4 h-4 text-slate-500" /> : <Globe className="w-4 h-4 text-slate-500" />}
                   <h3 className="text-lg font-bold text-white group-hover:text-sky-400 transition-colors truncate max-w-[180px]">
                     {repo.name}
                   </h3>
                </div>
                {repo.fork && <GitFork className="w-4 h-4 text-slate-500" />}
              </div>
              
              <p className="text-slate-400 text-sm line-clamp-2 mb-6 h-10">
                {repo.description || "No description provided."}
              </p>
              
              <div className="flex items-center gap-4 text-xs text-slate-500 font-mono">
                <span className="flex items-center gap-1">
                  <div className={`w-2 h-2 rounded-full ${repo.language ? 'bg-sky-500' : 'bg-slate-600'}`} />
                  {repo.language || "Mixed"}
                </span>
                <span className="flex items-center gap-1">
                  <Star className="w-3 h-3" />
                  {repo.stargazers_count}
                </span>
                <span>
                  {new Date(repo.updated_at).toLocaleDateString()}
                </span>
              </div>
            </div>

            {/* ANALYZE BUTTON - Now calls API */}
            <button 
              onClick={() => handleAnalyze(repo)}
              disabled={analyzingRepoId === repo.id}
              className="mt-6 w-full py-2.5 bg-sky-500/10 text-sky-400 font-medium rounded-lg border border-sky-500/20 hover:bg-sky-500 hover:text-white transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {analyzingRepoId === repo.id ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Starting...</span>
                </>
              ) : (
                <>
                  <span>Analyze Project</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>

          </motion.div>
        ))}
      </div>
      
      {filteredRepos.length === 0 && (
        <div className="text-center py-20 text-slate-500">
          No repositories found matching "{search}"
        </div>
      )}
    </div>
  );
}