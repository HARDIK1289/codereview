"use client";
import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import ReactMarkdown from 'react-markdown';
import { 
  Sparkles, Brain, Shield, Loader2, Award, RotateCcw, Zap
} from "lucide-react";

export default function DeveloperProfile() {
  const { data: session } = useSession();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);

  useEffect(() => {
    if (!session?.user?.id) return;
    async function fetchProfile() {
      try {
        const res = await fetch(`http://localhost:8000/api/developer-profile/${session.user.id}`);
        if (res.ok) {
          const data = await res.json();
          setProfile(data);
        }
      } catch (e) {
        console.error("Failed to load profile", e);
      } finally {
        setLoading(false);
      }
    }
    fetchProfile();
  }, [session]);

  const handleGenerate = async () => {
    setGenerating(true);
    try {
      const res = await fetch("http://localhost:8000/api/generate-developer-profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: session.user.username,
          user_id: session.user.id,
          github_token: session.accessToken,
          force_refresh: true
        }),
      });
      const data = await res.json();
      if (data.status === "success") {
        setProfile(data.profile);
      }
    } catch (e) {
      alert("Failed to generate profile. Try again.");
    } finally {
      setGenerating(false);
    }
  };

  // Helper for Priority Label inside the card
  const getPriorityBadge = (priority) => {
    if (priority === 1) return <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-red-500/10 text-red-400 border border-red-500/20">HIGH IMPACT</span>;
    if (priority === 2) return <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-yellow-500/10 text-yellow-400 border border-yellow-500/20">MEDIUM</span>;
    return <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-blue-500/10 text-blue-400 border border-blue-500/20">LOW</span>;
  };

  if (loading) return <div className="h-64 bg-white/5 rounded-2xl animate-pulse" />;

  if (!profile) {
    return (
      <div className="bg-gradient-to-r from-indigo-900/50 to-purple-900/50 border border-white/10 rounded-2xl p-10 text-center relative overflow-hidden group">
        <div className="absolute inset-0 bg-grid-white/[0.05] bg-[size:20px_20px]" />
        <div className="relative z-10 max-w-lg mx-auto">
          <Sparkles className="w-12 h-12 text-purple-400 mx-auto mb-4" />
          <h2 className="text-3xl font-bold text-white mb-2">Unlock Your Developer DNA</h2>
          <p className="text-slate-300 mb-8">
            Let our AI analyze your top 3 repositories to generate a Senior Engineer assessment of your coding style.
          </p>
          <button 
            onClick={handleGenerate}
            disabled={generating}
            className="px-8 py-4 bg-white text-black font-bold rounded-full hover:scale-105 transition-all flex items-center gap-2 mx-auto disabled:opacity-50"
          >
            {generating ? <Loader2 className="animate-spin" /> : <Brain className="w-5 h-5" />}
            {generating ? "Analyzing Codebase..." : "Generate My Profile"}
          </button>
        </div>
      </div>
    );
  }

  const { summary } = profile;
  
  return (
    <div className="space-y-6">
      {/* 1. HERO SECTION */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left: Scores */}
        <div className="bg-[#111] border border-white/10 rounded-2xl p-6 flex flex-col justify-center gap-6 relative">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-500/10 rounded-lg text-blue-400">
                <Brain className="w-6 h-6" />
              </div>
              <div>
                <div className="text-slate-400 text-xs font-bold uppercase tracking-wider">Readability</div>
                <div className="text-3xl font-black text-white">{summary.overall_readability || 0}/100</div>
              </div>
            </div>
            <div className={`w-1.5 h-12 rounded-full ${summary.overall_readability > 70 ? 'bg-blue-500' : 'bg-blue-500/30'}`} />
          </div>

          <div className="h-px bg-white/10" />

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-emerald-500/10 rounded-lg text-emerald-400">
                <Shield className="w-6 h-6" />
              </div>
              <div>
                <div className="text-slate-400 text-xs font-bold uppercase tracking-wider">Maintainability</div>
                <div className="text-3xl font-black text-white">{summary.overall_maintainability || 0}/100</div>
              </div>
            </div>
            <div className={`w-1.5 h-12 rounded-full ${summary.overall_maintainability > 70 ? 'bg-emerald-500' : 'bg-emerald-500/30'}`} />
          </div>
        </div>

        {/* Middle: Mentorship Overview */}
        <div className="lg:col-span-2 bg-[#111] border border-white/10 rounded-2xl p-8 relative overflow-hidden group">
          <button 
            onClick={handleGenerate}
            disabled={generating}
            className="absolute top-4 right-4 p-2 bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white rounded-lg transition-all flex items-center gap-2 border border-white/5 z-20"
            title="Re-analyze Profile"
          >
            {generating ? <Loader2 className="w-4 h-4 animate-spin" /> : <RotateCcw className="w-4 h-4" />}
            <span className="text-xs font-bold uppercase tracking-wider">Re-Analyze</span>
          </button>

          <div className="absolute top-0 right-0 p-4 opacity-10 pointer-events-none">
            <Award className="w-32 h-32 text-white" />
          </div>
          
          <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-yellow-400" /> 
            Senior Engineer Assessment
          </h3>
          
          <div className="text-slate-300 leading-relaxed text-lg prose prose-invert max-w-none">
            <ReactMarkdown>
              {summary.developer_overview}
            </ReactMarkdown>
          </div>

          <div className="mt-6 flex flex-wrap gap-2">
            {profile.repos_analyzed && profile.repos_analyzed.map((repo, i) => (
              <span key={i} className="px-3 py-1 bg-white/5 border border-white/10 rounded-full text-xs text-slate-400 flex items-center gap-1">
                 {repo.repo_name}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* 2. SUGGESTIONS HEADER (The Catchy Badge) */}
      {summary.improvement_tips && (
        <>
          <div className="flex items-center justify-center my-8">
            <div className="relative group">
               {/* Glow Effect */}
               <div className="absolute -inset-1 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full blur opacity-25 group-hover:opacity-50 transition duration-200"></div>
               {/* Badge Content */}
               <div className="relative px-6 py-2 bg-[#0A0A0A] border border-white/10 rounded-full flex items-center gap-2">
                  <Zap className="w-4 h-4 text-purple-400" />
                  <span className="bg-gradient-to-r from-white to-slate-400 bg-clip-text text-transparent font-bold uppercase tracking-wider text-sm">
                    High-Impact Optimizations
                  </span>
               </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {summary.improvement_tips.map((tip, i) => (
              <div key={i} className="bg-[#111] border border-white/10 rounded-xl p-6 hover:border-white/20 transition-colors group relative flex flex-col">
                <div className="flex justify-between items-start mb-4">
                   <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center text-slate-400 font-bold text-sm">
                      {i + 1}
                   </div>
                   {getPriorityBadge(tip.priority)}
                </div>
                
                <h4 className="font-bold text-white text-sm group-hover:text-purple-400 transition-colors mb-2">
                  {tip.title}
                </h4>
                <p className="text-sm text-slate-400 leading-relaxed flex-grow">
                  {tip.description}
                </p>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}