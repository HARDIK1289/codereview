'use client';

import React, { useEffect, useState } from 'react';
import ReactFlow, { Background, Controls, MiniMap, useNodesState, useEdgesState, Panel } from 'reactflow';
import 'reactflow/dist/style.css';

const nodeStyle = (color) => ({
  background: '#0f172a',
  color: color,
  border: `1px solid ${color}`,
  borderRadius: '6px',
  padding: '10px',
  fontSize: '11px',
  fontWeight: '700',
  width: 180,
  textAlign: 'center',
  boxShadow: `0 4px 15px rgba(0,0,0,0.5)`
});

export default function ArchitectureGraph({ data }) {
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [isMapping, setIsMapping] = useState(true);

  useEffect(() => {
    if (!data) return;

    // CLEAN HIERARCHICAL POSITIONS
    const positions = {
      'root': { x: 400, y: 0 },
      'm1': { x: 400, y: 120 },   // main.py
      'm2': { x: 150, y: 240 },   // llm_agents
      'm3': { x: 400, y: 240 },   // parser
      'm4': { x: 650, y: 240 },   // github_helpers
      'f1': { x: 250, y: 400 },   // page.js
      'f2': { x: 550, y: 400 },   // GraphViz
      'ext1': { x: 150, y: 360 }, // Groq
      'ext2': { x: 400, y: 500 }, // Mongo
    };

    const initialNodes = data.nodes.map((node) => ({
      id: node.id,
      data: { label: node.label },
      position: positions[node.id] || { x: Math.random() * 400, y: 400 },
      style: nodeStyle(node.color),
    }));

    const initialEdges = data.edges.map((edge) => ({
      ...edge,
      type: 'smoothstep', // CLEAN STRAIGHTER LINES
      animated: true,
      style: { stroke: '#4b5563', strokeWidth: 1.5 },
      labelStyle: { fill: '#94a3b8', fontSize: 9, fontWeight: 700 }
    }));

    setNodes(initialNodes);
    setEdges(initialEdges);
    setIsMapping(false);
  }, [data]);

  return (
    <div className="w-full h-[550px] bg-[#050505] rounded-xl border border-gray-800 overflow-hidden relative">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        fitView
      >
        <Panel position="top-left" className="m-4">
          <div className="bg-black/80 border border-blue-500/30 p-3 rounded-lg backdrop-blur-md">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-green-500 rounded-full shadow-[0_0_8px_#22c55e]"></div>
              <span className="text-[10px] font-mono text-white tracking-widest uppercase">Neo4j Structure Stabilized</span>
            </div>
          </div>
        </Panel>

        <Background color="#111" gap={20} size={1} />
        <Controls />
        <MiniMap 
          nodeColor={(n) => n.style.border.split(' ')[2]} 
          style={{ background: '#000', border: '1px solid #333' }}
        />
      </ReactFlow>
    </div>
  );
}