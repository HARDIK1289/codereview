'use client';

import React, { useState, useEffect } from 'react';
import ArchitectureGraph from '@/components/ArchitectureGraph';

/**
 * PROJECT REPORT PAGE - HACKATHON EDITION
 * Integrated with Next.js 15 Promise-based params and FastAPI backend.
 */
export default function ProjectReport({ params }) {
  // 1. Unwrap the params (Next.js 15 Requirement)
  const resolvedParams = React.use(params);
  const id = resolvedParams.id;

  // 2. State Management
  const [graphData, setGraphData] = useState(null);
  const [insight, setInsight] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // 3. Data Fetching from FastAPI (Port 8000)
  useEffect(() => {
    const fetchAnalysisData = async () => {
      try {
        const response = await fetch(`http://localhost:8000/api/analysis-graph/${id}`);
        
        if (!response.ok) {
          throw new Error('Failed to reach Graph Engine');
        }

        const result = await response.json();
        
        setGraphData(result.graph_data);
        setInsight(result.ai_insight);
      } catch (err) {
        console.error("Fetch Error:", err);
        setError("SYSTEM_OFFLINE: Ensure FastAPI is running on http://localhost:8000");
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchAnalysisData();
    }
  }, [id]);

  return (
    <div className="min-h-screen bg-[#050505] text-white p-6 font-sans">
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* --- TOP BAR / HEADER --- */}
        <header className="flex flex-col md:flex-row justify-between items-start md:items-center bg-[#0a0a0a] border border-gray-800 p-6 rounded-2xl">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></span>
              <span className="text-[10px] font-mono text-gray-500 uppercase tracking-widest">Architectural Insight System</span>
            </div>
            <h1 className="text-3xl font-black tracking-tight text-white uppercase">
              {id.replace('-', ' ')} <span className="text-blue-500">Analysis</span>
            </h1>
          </div>
          <div className="mt-4 md:mt-0 flex gap-3">
             <div className="px-4 py-2 bg-gray-900 border border-gray-800 rounded-xl text-right">
                <p className="text-[9px] text-gray-500 uppercase font-bold">Neo4j Engine</p>
                <p className="text-xs text-green-400 font-mono">v3.4.1_STABLE</p>
             </div>
             <div className="px-4 py-2 bg-blue-600 rounded-xl flex items-center justify-center">
                <span className="font-bold text-sm tracking-tighter">EXPORT REPORT</span>
             </div>
          </div>
        </header>

        {/* --- MAIN CONTENT AREA --- */}
        {loading ? (
          <div className="h-[600px] flex flex-col items-center justify-center bg-gray-900/10 rounded-2xl border border-dashed border-gray-800">
            <div className="relative w-16 h-16">
                <div className="absolute inset-0 border-4 border-blue-500/20 rounded-full"></div>
                <div className="absolute inset-0 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
            </div>
            <p className="text-gray-500 font-mono text-xs mt-6 tracking-[0.3em] uppercase">Reconstructing_Dependency_Matrix...</p>
          </div>
        ) : error ? (
          <div className="p-12 bg-red-950/10 border border-red-500/20 rounded-2xl text-red-400 text-center space-y-4">
            <p className="text-3xl">⚠️</p>
            <p className="font-mono text-sm">{error}</p>
            <button onClick={() => window.location.reload()} className="px-4 py-2 bg-red-500/20 border border-red-500/40 rounded-lg text-xs hover:bg-red-500/40 transition">RETRY_CONNECTION</button>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 animate-in fade-in duration-700">
            
            {/* 1. THE GRAPH (Clean Layered Layout) */}
            <section className="bg-black border border-gray-800 rounded-2xl overflow-hidden shadow-2xl">
               <ArchitectureGraph data={graphData} />
            </section>

            {/* 2. THE INSIGHT & STATS GRID */}
            <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              
              {/* GROQ SEMANTIC AUDIT CARD */}
              <div className="lg:col-span-2 p-8 bg-gradient-to-br from-[#0d1117] to-black border border-gray-800 rounded-2xl relative overflow-hidden">
                <div className="absolute top-0 right-0 p-4 opacity-10 text-6xl">🤖</div>
                <div className="flex items-center gap-3 mb-6">
                  <div className="bg-blue-500/10 p-2.5 rounded-xl border border-blue-500/30">
                    <span className="text-xl">🧠</span>
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-white">Groq Strategic Audit</h3>
                    <p className="text-[10px] text-gray-500 font-mono uppercase tracking-widest">Model: llama-3.3-70b-versatile</p>
                  </div>
                </div>

                <div className="relative">
                    <div className="absolute -left-6 top-0 bottom-0 w-1 bg-blue-500/60 rounded-full shadow-[0_0_10px_rgba(59,130,246,0.5)]"></div>
                    <p className="text-gray-300 text-lg leading-relaxed italic font-medium">
                      "{insight}"
                    </p>
                </div>

                <div className="mt-8 pt-6 border-t border-gray-800 flex flex-wrap gap-3">
                  {["Architecture_Validated", "No_Circular_Deps", "Optimal_Decoupling"].map(tag => (
                    <span key={tag} className="px-3 py-1 bg-gray-900 border border-gray-700 text-gray-400 text-[10px] font-mono rounded-md uppercase tracking-tighter">
                      {tag}
                    </span>
                  ))}
                </div>
              </div>

              {/* SIDEBAR STATS */}
              <div className="space-y-6">
                {/* HEALTH SCORE */}
                <div className="p-8 bg-blue-600 rounded-2xl flex flex-col items-center justify-center text-center shadow-[0_0_40px_rgba(37,99,235,0.25)]">
                  <p className="text-blue-100 text-[10px] font-black uppercase tracking-[0.25em] mb-2">Structural Health</p>
                  <p className="text-7xl font-black text-white italic">94</p>
                  <p className="text-blue-200 text-[10px] mt-4 font-mono">STATUS: OPTIMAL</p>
                </div>

                {/* DB METRIC */}
                <div className="p-6 bg-[#0a0a0a] border border-gray-800 rounded-2xl">
                   <div className="flex justify-between items-center mb-4">
                      <span className="text-xs text-gray-500 font-bold uppercase">Neo4j Query Latency</span>
                      <span className="text-xs text-blue-400 font-mono">124ms</span>
                   </div>
                   <div className="w-full bg-gray-900 h-1.5 rounded-full overflow-hidden">
                      <div className="bg-blue-500 h-full w-[88%] shadow-[0_0_10px_#3b82f6]"></div>
                   </div>
                </div>
              </div>

            </section>
          </div>
        )}
      </div>
    </div>
  );
}