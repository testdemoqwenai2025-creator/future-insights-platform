/**
 * TemplateGalleryPage - Scientific Computing Template Gallery
 * Full routing support for /#/templates/* URLs
 */

'use client';

import { useState, useCallback, useEffect } from 'react';
import {
  ArrowRight,
  ChevronDown,
  ExternalLink,
  Zap,
  Brain,
  FlaskConical,
  BarChart3,
  Atom,
  Image,
  Sparkles,
  Rocket,
  GraduationCap,
  BookOpen,
  Users,
  Gift,
  Star,
  Grid3X3,
  Code,
  Play
} from 'lucide-react';

// ============================================================================
// DATA TYPES
// ============================================================================

type TemplateCategory = 'bioinformatics' | 'cheminformatics' | 'machine-learning' | 
                         'statistics' | 'visualization' | 'quantum-computing';

interface TemplateData {
  id: string;
  name: string;
  description: string;
  category: TemplateCategory;
  difficulty: 'beginner' | 'intermediate' | 'advanced' | 'expert';
  oneClickSetup: boolean;
  icon: React.ElementType;
  tags: string[];
}

// ============================================================================
// TEMPLATE DATA
// ============================================================================

const templates: TemplateData[] = [
  {
    id: 'blast-sequence-analysis',
    name: 'BLAST+ Sequence Analysis',
    description: 'Perform BLAST sequence alignments with customizable parameters for DNA/RNA/protein analysis',
    category: 'bioinformatics',
    difficulty: 'intermediate',
    oneClickSetup: true,
    icon: Zap,
    tags: ['bioinformatics', 'genomics', 'sequence-alignment']
  },
  {
    id: 'molecular-docking-workflow',
    name: 'Molecular Docking Workflow',
    description: 'AutoDock Vina docking pipeline with ligand preparation and binding analysis',
    category: 'cheminformatics',
    difficulty: 'advanced',
    oneClickSetup: true,
    icon: FlaskConical,
    tags: ['chemistry', 'docking', 'drug-discovery']
  },
  {
    id: 'transformer-training-pipeline',
    name: 'ML Model Training Pipeline',
    description: 'End-to-end transformer model training with data preprocessing and evaluation',
    category: 'machine-learning',
    difficulty: 'advanced',
    oneClickSetup: true,
    icon: Brain,
    tags: ['machine-learning', 'transformers', 'deep-learning']
  },
];

// ============================================================================
// URL ROUTING CONFIGURATION
// ============================================================================

const TEMPLATE_SLUGS: Record<string, string> = {
  'blast': 'blast-sequence-analysis',
  'docking': 'molecular-docking-workflow',
  'training': 'transformer-training-pipeline',
};

function parseHashRoute(hash: string): { templateId: string | null; category: TemplateCategory | 'all' } {
  const cleanHash = hash.replace(/^#\/?/, '');
  const templatesMatch = cleanHash.match(/templates\/(?:([^/]+)\/)?([^/]+)\/?$/);
  
  if (templatesMatch) {
    const templateSlug = templatesMatch[2];
    
    // Direct ID match
    const directMatch = templates.find(t => t.id === templateSlug);
    if (directMatch) return { templateId: directMatch.id, category: directMatch.category };
    
    // Slug mapping
    const mappedId = TEMPLATE_SLUGS[templateSlug.toLowerCase()];
    if (mappedId) {
      const template = templates.find(t => t.id === mappedId);
      if (template) return { templateId: template.id, category: template.category };
    }
  }
  
  return { templateId: null, category: 'all' };
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

interface TemplateGalleryPageProps {
  initialHash?: string;
}

export default function TemplateGalleryPage({ initialHash }: TemplateGalleryPageProps) {
  const [selectedTemplate, setSelectedTemplate] = useState<TemplateData | null>(null);

  // Hash-based routing effect
  useEffect(() => {
    if (typeof window === 'undefined') return;
    
    const hash = initialHash || window.location.hash;
    console.log('[TemplateGallery] Processing hash:', hash);
    
    const { templateId } = parseHashRoute(hash);
    if (templateId) {
      const template = templates.find(t => t.id === templateId);
      if (template) {
        setSelectedTemplate(template);
        console.log('[TemplateGallery] Selected:', template.name);
      }
    }
  }, [initialHash]);

  // Listen for hash changes
  useEffect(() => {
    const handleHashChange = () => {
      const { templateId } = parseHashRoute(window.location.hash);
      if (templateId) {
        const template = templates.find(t => t.id === templateId);
        if (template) setSelectedTemplate(template);
      } else {
        setSelectedTemplate(null);
      }
    };
    
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  // If a template is selected, show detail view
  if (selectedTemplate) {
    const Icon = selectedTemplate.icon;
    return (
      <div className="min-h-screen bg-slate-950 text-white p-4 md:p-8">
        <div className="max-w-6xl mx-auto">
          {/* Back button */}
          <button
            onClick={() => {
              setSelectedTemplate(null);
              window.history.pushState('', '', '#/templates');
            }}
            className="mb-6 flex items-center gap-2 text-violet-400 hover:text-violet-300 transition-colors"
          >
            ← Back to Gallery
          </button>

          {/* Template Header */}
          <div className="bg-gradient-to-br from-violet-600/20 to-cyan-600/20 rounded-2xl p-8 border border-violet-500/30 mb-8">
            <div className="flex items-start gap-6">
              <div className="w-16 h-16 rounded-xl bg-violet-500/20 flex items-center justify-center flex-shrink-0">
                <Icon className="w-8 h-8 text-violet-400" />
              </div>
              <div className="flex-1">
                <h1 className="text-3xl font-bold mb-2">{selectedTemplate.name}</h1>
                <p className="text-lg text-slate-300 mb-4">{selectedTemplate.description}</p>
                <div className="flex gap-2 flex-wrap">
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                    selectedTemplate.difficulty === 'beginner' ? 'bg-green-500/20 text-green-400' :
                    selectedTemplate.difficulty === 'intermediate' ? 'bg-yellow-500/20 text-yellow-400' :
                    selectedTemplate.difficulty === 'advanced' ? 'bg-orange-500/20 text-orange-400' :
                    'bg-red-500/20 text-red-400'
                  }`}>
                    {selectedTemplate.difficulty}
                  </span>
                  {selectedTemplate.oneClickSetup && (
                    <span className="px-3 py-1 rounded-full text-sm font-medium bg-emerald-500/20 text-emerald-400">
                      ✓ One-Click Setup
                    </span>
                  )}
                  {selectedTemplate.tags.map(tag => (
                    <span key={tag} className="px-3 py-1 rounded-full text-sm bg-slate-700/50 text-slate-300">
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Template Content Portal */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Code Editor Panel */}
            <div className="bg-slate-900 rounded-xl p-6 border border-slate-700">
              <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
                <Code className="w-5 h-5 text-cyan-400" />
                Starter Code
              </h3>
              <pre className="bg-slate-950 rounded-lg p-4 overflow-x-auto text-sm text-slate-300">
{`# ${selectedTemplate.name} - SciCMPMATH Template
import scicmppath as sci

# Initialize workspace
workspace = sci.Workspace("${selectedTemplate.id}")

# Load your data
data = workspace.load_data("./your_data.csv")

# Configure parameters
config = workspace.configure({
    "method": "auto",
    "confidence": 0.95,
})

# Run analysis
results = workspace.analyze(data, config)

# Export results
workspace.export(results, format=["pdf", "csv"])
print("✅ Analysis complete!")`}
              </pre>
              <button className="mt-4 w-full py-2 bg-violet-600 hover:bg-violet-700 rounded-lg transition-colors font-medium">
                <Play className="w-4 h-4 inline mr-2" />
                Run Code
              </button>
            </div>

            {/* AI Assistant Panel */}
            <div className="bg-slate-900 rounded-xl p-6 border border-slate-700">
              <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-violet-400" />
                AI Research Assistant
              </h3>
              <div className="space-y-4">
                <div className="bg-slate-950 rounded-lg p-4">
                  <p className="text-sm text-slate-300">
                    Ready to assist with {selectedTemplate.name.toLowerCase()}. 
                    Ask about parameters, best practices, or interpretation of results.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Gallery View
  return (
    <div className="min-h-screen bg-slate-950 text-white p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold mb-4 bg-gradient-to-r from-violet-400 via-purple-400 to-cyan-400 bg-clip-text text-transparent">
            Scientific Computing Templates
          </h1>
          <p className="text-xl text-slate-400 max-w-3xl mx-auto">
            Production-ready templates for bioinformatics, cheminformatics, machine learning, and more.
          </p>
        </div>

        {/* Templates Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {templates.map((template) => {
            const Icon = template.icon;
            return (
              <button
                key={template.id}
                onClick={() => {
                  setSelectedTemplate(template);
                  const slug = Object.keys(TEMPLATE_SLUGS).find(k => TEMPLATE_SLUGS[k] === template.id) || template.id;
                  window.location.hash = `#/templates/${template.category}/${slug}`;
                }}
                className="bg-slate-900 rounded-xl p-6 border border-slate-700 hover:border-violet-500 transition-all text-left group"
              >
                <div className="w-12 h-12 rounded-lg bg-violet-500/20 flex items-center justify-center mb-4 group-hover:bg-violet-500/30 transition-colors">
                  <Icon className="w-6 h-6 text-violet-400" />
                </div>
                
                <h3 className="text-xl font-semibold mb-2 group-text-white">{template.name}</h3>
                <p className="text-slate-400 text-sm mb-4 line-clamp-2">{template.description}</p>
                
                <div className="flex items-center justify-between">
                  <span className={`px-2 py-1 rounded text-xs ${
                    template.difficulty === 'beginner' ? 'bg-green-500/20 text-green-400' :
                    template.difficulty === 'intermediate' ? 'bg-yellow-500/20 text-yellow-400' :
                    'bg-orange-500/20 text-orange-400'
                  }`}>
                    {template.difficulty}
                  </span>
                  
                  {template.oneClickSetup && (
                    <span className="text-xs text-emerald-400">One-click ✓</span>
                  )}
                </div>
              </button>
            );
          })}
        </div>

        {/* Core Capabilities Section */}
        <section className="mt-16" id="core-capabilities">
          <h2 className="text-3xl font-bold mb-8 text-center">Core Capabilities</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-slate-900 rounded-xl p-6 border border-slate-800">
              <Zap className="w-8 h-8 text-yellow-400 mb-4" />
              <h3 className="text-xl font-semibold mb-2">One-click Setup</h3>
              <p className="text-slate-400">Pre-configured environments with all dependencies installed.</p>
            </div>
            <div className="bg-slate-900 rounded-xl p-6 border border-slate-800">
              <Settings className="w-8 h-8 text-blue-400 mb-4" />
              <h3 className="text-xl font-semibold mb-2">Parameter Presets</h3>
              <p className="text-slate-400">Expert-curated configurations for common analysis types.</p>
            </div>
            <div className="bg-slate-900 rounded-xl p-6 border border-slate-800">
              <BookOpen className="w-8 h-8 text-green-400 mb-4" />
              <h3 className="text-xl font-semibold mb-2">Best Practices Embedded</h3>
              <p className="text-slate-400">Templates follow community standards and publication guidelines.</p>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}

// Missing icon fallback
function Settings(props: any) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <circle cx="12" cy="12" r="3"></circle>
      <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path>
    </svg>
  );
}
