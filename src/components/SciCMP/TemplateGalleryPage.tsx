/**
 * TemplateGalleryPage - Minimal Working Version
 * Tests basic routing functionality
 */

'use client';

import { useState, useEffect } from 'react';
import { Zap, Brain, FlaskConical, BarChart3, Atom, Image } from 'lucide-react';

interface TemplateGalleryPageProps {
  initialHash?: string;
}

const templates = [
  {
    id: 'blast-sequence-analysis',
    name: 'BLAST+ Sequence Analysis',
    description: 'Perform BLAST sequence alignments with customizable parameters',
    category: 'bioinformatics',
    difficulty: 'intermediate' as const,
    icon: Zap,
  },
  {
    id: 'molecular-docking-workflow',
    name: 'Molecular Docking Workflow',
    description: 'AutoDock Vina docking pipeline',
    category: 'cheminformatics',
    difficulty: 'advanced' as const,
    icon: FlaskConical,
  },
  {
    id: 'transformer-training-pipeline',
    name: 'ML Model Training Pipeline',
    description: 'End-to-end transformer model training',
    category: 'machine-learning',
    difficulty: 'advanced' as const,
    icon: Brain,
  },
];

export default function TemplateGalleryPage({ initialHash }: TemplateGalleryPageProps) {
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null);
  const [currentHash, setCurrentHash] = useState(initialHash || '');

  useEffect(() => {
    // Parse hash on mount
    const hash = window.location.hash;
    setCurrentHash(hash);
    
    // Check for template route like #/templates/bioinformatics/blast
    if (hash.includes('templates')) {
      const parts = hash.replace(/^#\/?/, '').split('/');
      if (parts.length >= 3 && parts[0] === 'templates') {
        // Find template by slug
        const templateSlug = parts[2];
        const template = templates.find(t => t.id.includes(templateSlug) || templateSlug === 'blast');
        if (template) {
          setSelectedTemplate(template.id);
        }
      }
    }
  }, [initialHash]);

  // Listen for hash changes
  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash;
      setCurrentHash(hash);
      
      if (hash.includes('templates')) {
        const parts = hash.replace(/^#\/?/, '').split('/');
        if (parts.length >= 3 && parts[0] === 'templates') {
          const templateSlug = parts[2];
          const template = templates.find(t => t.id.includes(templateSlug) || templateSlug === 'blast');
          if (template) {
            setSelectedTemplate(template.id);
          }
        }
      }
    };
    
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  const selected = templates.find(t => t.id === selectedTemplate);

  return (
    <div className="min-h-screen bg-slate-950 text-white p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-violet-400 to-cyan-400 bg-clip-text text-transparent">
          Scientific Computing Templates
        </h1>
        <p className="text-slate-400 mb-8">
          Current Hash: {currentHash || '(none)'}
        </p>

        {selected ? (
          /* Template Detail View */
          <div className="bg-gradient-to-br from-violet-600/20 to-cyan-600/20 rounded-2xl p-8 border border-violet-500/30">
            <button 
              onClick={() => setSelectedTemplate(null)}
              className="mb-4 text-violet-400 hover:text-violet-300"
            >
              ← Back to Gallery
            </button>
            
            <div className="flex items-start gap-6">
              <div className="w-16 h-16 rounded-xl bg-violet-500/20 flex items-center justify-center">
                <selected.icon className="w-8 h-8 text-violet-400" />
              </div>
              <div>
                <h2 className="text-3xl font-bold mb-2">{selected.name}</h2>
                <p className="text-lg text-slate-300 mb-4">{selected.description}</p>
                <span className="px-3 py-1 rounded-full text-sm bg-emerald-500/20 text-emerald-400">
                  {selected.difficulty}
                </span>
              </div>
            </div>

            <div className="mt-8 p-6 bg-slate-900 rounded-xl">
              <h3 className="text-xl font-semibold mb-4">Starter Code</h3>
              <pre className="bg-slate-950 p-4 rounded-lg text-sm overflow-x-auto">
{`# ${selected.name} - SciCMPMATH Template
import scicmppath as sci

workspace = sci.Workspace("${selected.id}")
data = workspace.load_data("./your_data.csv")
results = workspace.analyze(data)
print("✅ Analysis complete!")`}
              </pre>
            </div>
          </div>
        ) : (
          /* Gallery Grid */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {templates.map((template) => {
              const Icon = template.icon;
              return (
                <button
                  key={template.id}
                  onClick={() => {
                    setSelectedTemplate(template.id);
                    window.location.hash = `#/templates/${template.category}/${template.id.split('-')[0]}`;
                  }}
                  className="bg-slate-900 rounded-xl p-6 border border-slate-700 hover:border-violet-500 transition-all text-left"
                >
                  <Icon className="w-10 h-10 text-violet-400 mb-4" />
                  <h3 className="text-xl font-semibold mb-2">{template.name}</h3>
                  <p className="text-slate-400 text-sm">{template.description}</p>
                </button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
