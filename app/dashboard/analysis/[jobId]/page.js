"use client";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { vscDarkPlus } from "react-syntax-highlighter/dist/esm/styles/prism";
import { 
  Loader2, CheckCircle2, AlertTriangle, ArrowLeft, 
  FileCode, Shield, Zap, Bug
} from "lucide-react";

export default function AnalysisPage() {
  const { jobId } = useParams();
  const [status, setStatus] = useState({ progress: 0, current_step: "Initializing..." });
  const [results, setResults] = useState(null);
  const [error, setError] = useState(null);

  // --- 1. POLLING LOGIC ---
  useEffect(() => {
    if (!jobId) return;

    const pollInterval = setInterval(async () => {
      try {
        const res = await fetch(`http://localhost:8000/api/analysis-status/${jobId}`);
        if (!res.ok) throw new Error("Failed to fetch status");
        
        const data = await res.json();
        
        if (data.status === "failed") {
          clearInterval(pollInterval);
          setError(data.error || "Analysis failed unexpectedly");
        } else if (data.status === "completed") {
          clearInterval(pollInterval);
          const resultsRes = await fetch(`http://localhost:8000/api/analysis-results/${jobId}`);
          const resultsData = await resultsRes.json();
          setResults(resultsData);
        } else {
          setStatus(data);
        }
      } catch (err) {
        console.error("Polling error:", err);
      }
    }, 2000);

    return () => clearInterval(pollInterval);
  }, [jobId]);

  // --- 2. RENDER HELPERS ---
  const ScoreGauge = ({ score, label, icon: Icon, color }) => (
    <div className="flex flex-col items-center justify-center p-6 bg-white/5 border border-white/10 rounded-2xl relative overflow-hidden group hover:border-white/20 transition-all">
      <div className={`absolute top-0 left-0 w-full h-1 ${color}`} />
      <div className="flex items-center gap-2 text-slate-400 mb-2 uppercase text-xs font-bold tracking-wider">
        <Icon className="w-4 h-4" /> {label}
      </div>
      <div className="text-5xl font-black text-white mb-2">{score}</div>
      <div className="text-xs text-slate-500 font-mono">OUT OF 100</div>
    </div>
  );

  // --- 3. LOADING STATE ---
  if (!results && !error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-[#0A0A0A] text-white p-8">
        <div className="relative mb-8">
          <div className="absolute inset-0 bg-sky-500 blur-xl opacity-20 rounded-full animate-pulse" />
          <Loader2 className="w-16 h-16 text-sky-500 animate-spin relative z-10" />
        </div>
        <h2 className="text-2xl font-bold mb-2 animate-pulse">{status.current_step}</h2>
        <div className="w-64 h-1.5 bg-white/10 rounded-full mt-4 overflow-hidden">
          <div className="h-full bg-sky-500 transition-all duration-500" style={{ width: `${status.progress}%` }} />
        </div>
      </div>
    );
  }

  // --- 4. ERROR STATE ---
  if (error) return <div className="text-red-500 p-10 text-center">Error: {error}</div>;

  // --- 5. COMPLETED DASHBOARD ---
  return (
    <div className="min-h-screen bg-[#0A0A0A] text-slate-300 p-6 md:p-12 font-sans selection:bg-sky-500/30">
      <div className="max-w-7xl mx-auto space-y-12">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-white/10 pb-8">
          <div>
            <Link href="/projects" className="text-slate-500 hover:text-white flex items-center gap-2 mb-4 text-sm transition-colors group">
              <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" /> Back to Projects
            </Link>
            <h1 className="text-4xl md:text-5xl font-black text-white tracking-tight">
              Code Analysis <span className="text-sky-500">Report</span>
            </h1>
          </div>
          <div className="flex items-center gap-2 px-4 py-2 bg-green-500/10 border border-green-500/20 text-green-400 rounded-full text-sm font-bold">
            <CheckCircle2 className="w-4 h-4" /> Analysis Completed
          </div>
        </div>

        {/* Scores Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <ScoreGauge score={results.readability_score} label="Readability" icon={FileCode} color="bg-blue-500" />
          <ScoreGauge score={results.maintainability_score} label="Maintainability" icon={Shield} color="bg-emerald-500" />
          
          <div className="col-span-2 bg-white/5 border border-white/10 rounded-2xl p-6">
            <h3 className="text-slate-400 text-xs font-bold uppercase tracking-wider mb-4">Top Observations</h3>
            <ul className="space-y-3">
              {results.score_justifications.map((note, i) => (
                <li key={i} className="flex items-start gap-3 text-sm text-slate-300">
                  <div className="mt-1.5 w-1.5 h-1.5 rounded-full bg-sky-500 shrink-0" />
                  {note}
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* WORST ISSUE & FIX SECTION */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* The Problem */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-red-400 font-bold uppercase text-xs tracking-wider">
              <AlertTriangle className="w-4 h-4" /> Critical Issue Found
            </div>
            <div className="bg-red-500/5 border border-red-500/20 rounded-2xl overflow-hidden">
              <div className="bg-red-500/10 px-4 py-3 border-b border-red-500/20 flex justify-between items-center">
                <span className="text-red-400 font-mono text-sm">{results.worst_issue.file}</span>
                <span className="text-xs bg-red-500 text-white px-2 py-0.5 rounded font-bold">SEVERITY: HIGH</span>
              </div>
              <div className="p-4 text-sm text-slate-300 border-b border-red-500/10">
                {results.worst_issue.explanation}
              </div>
              <SyntaxHighlighter 
                language="python" 
                style={vscDarkPlus} 
                customStyle={{ margin: 0, borderRadius: 0, fontSize: '13px' }}
                showLineNumbers={true}
                wrapLines={true}
              >
                {results.worst_issue.snippet || "# Code snippet not available"}
              </SyntaxHighlighter>
            </div>
          </div>

          {/* The Solution */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-emerald-400 font-bold uppercase text-xs tracking-wider">
              <Zap className="w-4 h-4" /> AI Suggested Fix
            </div>
            <div className="bg-emerald-500/5 border border-emerald-500/20 rounded-2xl overflow-hidden">
              <div className="bg-emerald-500/10 px-4 py-3 border-b border-emerald-500/20">
                <span className="text-emerald-400 font-mono text-sm">Suggested Revision</span>
              </div>
              <div className="p-4 text-sm text-slate-300 border-b border-emerald-500/10">
                {results.rewrite_explanation}
              </div>
              <SyntaxHighlighter 
                language="python" 
                style={vscDarkPlus} 
                customStyle={{ margin: 0, borderRadius: 0, fontSize: '13px' }}
                showLineNumbers={true}
                wrapLines={true}
              >
                {results.rewritten_code || "# No rewrite generated"}
              </SyntaxHighlighter>
            </div>
          </div>
        </div>

        {/* FULL REPORT (Markdown Rendered) */}
        <div className="bg-white/5 border border-white/10 rounded-2xl p-8 md:p-12">
          <div className="flex items-center gap-2 text-sky-400 font-bold uppercase text-xs tracking-wider mb-8">
            <FileCode className="w-4 h-4" /> Full Engineer Report
          </div>
          <article className="prose prose-invert prose-headings:text-white prose-p:text-slate-400 prose-li:text-slate-400 max-w-none">
            <ReactMarkdown remarkPlugins={[remarkGfm]}>
              {results.final_report}
            </ReactMarkdown>
          </article>
        </div>

      </div>
    </div>
  );
}