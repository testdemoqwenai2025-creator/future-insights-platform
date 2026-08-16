'use client';

import { useState, useEffect } from 'react';

export default function HomePage() {
  const [hash, setHash] = useState('');

  useEffect(() => {
    setHash(window.location.hash);
    
    const handleHash = () => setHash(window.location.hash);
    window.addEventListener('hashchange', handleHash);
    return () => window.removeEventListener('hashchange', handleHash);
  }, []);

  const isTemplateRoute = hash.includes('templates');

  return (
    <div className="min-h-screen bg-slate-950 text-white p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-5xl font-bold mb-6 bg-gradient-to-r from-violet-400 to-cyan-400 bg-clip-text text-transparent">
          SciCMP Platform
        </h1>
        
        <div className="bg-slate-900 rounded-xl p-6 mb-8 border border-slate-700">
          <p className="text-slate-400 mb-2">Current URL Hash:</p>
          <p className="font-mono text-violet-400">{hash || '(empty)'}</p>
          <p className="mt-4 text-sm">
            Template Route: {isTemplateRoute ? 
              <span className="text-green-400">✅ DETECTED</span> : 
              <span className="text-slate-500">Not a template route</span>}
          </p>
        </div>

        {isTemplateRoute ? (
          <div className="bg-gradient-to-br from-violet-600/20 to-cyan-600/20 rounded-xl p-8 border border-violet-500/30">
            <h2 className="text-3xl font-bold mb-4">🧬 Template Gallery</h2>
            <p className="text-lg text-slate-300 mb-6">
              Routing is working! You accessed: <code className="text-cyan-400">{hash}</code>
            </p>
            
            {hash.includes('blast') && (
              <div className="bg-slate-900 rounded-lg p-6 mt-6">
                <h3 className="text-xl font-semibold mb-3 flex items-center gap-2">
                  ⚡ BLAST+ Sequence Analysis
                </h3>
                <p className="text-slate-400 mb-4">
                  Perform BLAST sequence alignments with customizable parameters for DNA/RNA/protein analysis
                </p>
                <pre className="bg-slate-950 p-4 rounded text-sm overflow-x-auto">
{`# BLAST+ Analysis Template
from scicmppath import blast

# Configure BLAST parameters
config = blast.configure({
    "evalue": 0.001,
    "max_targets": 100,
    "database": "nr"
})

# Run analysis
results = blast.run(query_sequence, config)
print(f"Found {len(results.hits)} matches")`}
                </pre>
              </div>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <a href="#/templates/bioinformatics/blast" 
               className="block bg-slate-900 rounded-xl p-6 border border-slate-700 hover:border-violet-500 transition-all">
              <h3 className="text-xl font-semibold mb-2">🧬 Templates</h3>
              <p className="text-slate-400">Browse scientific computing templates</p>
              <span className="text-violet-400 text-sm mt-4 block">#/templates/bioinformatics/blast →</span>
            </a>
            
            <div className="bg-slate-900 rounded-xl p-6 border border-slate-700">
              <h3 className="text-xl font-semibold mb-2">📊 Dashboard</h3>
              <p className="text-slate-400">Analytics and monitoring (coming soon)</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
