/**
 * TemplateGalleryPage - Scientific Computing Template Gallery
 * Minimal working version with full hash-based routing support
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
  Play,
  Settings,
  CheckCircle2,
  Layers,
  Cpu,
  Dna,
  Microscope,
  TestTube2,
  Calculator,
  LineChart,
  Workflow,
  FileCode2,
  Terminal
} from 'lucide-react';

// ============================================================================
// DATA TYPES
// ============================================================================

type TemplateCategory = 'bioinformatics' | 'cheminformatics' | 'machine-learning' | 
                         'statistics' | 'visualization' | 'quantum-computing' |
                         'computational-physics' | 'image-analysis' | 'nlp' | 
                         'signal-processing';

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
  {
    id: 'bayesian-inference-framework',
    name: 'Statistical Analysis Suite',
    description: 'Bayesian inference and statistical modeling with MCMC sampling',
    category: 'statistics',
    difficulty: 'advanced',
    oneClickSetup: true,
    icon: BarChart3,
    tags: ['statistics', 'bayesian', 'mcmc']
  },
  {
    id: 'quantum-algorithm-simulator',
    name: 'Quantum Algorithm Simulator',
    description: 'Simulate quantum algorithms including QAOA, VQE, and Grover search',
    category: 'quantum-computing',
    difficulty: 'expert',
    oneClickSetup: false,
    icon: Atom,
    tags: ['quantum', 'algorithms', 'simulation']
  },
  {
    id: 'medical-image-segmentation',
    name: 'Medical Image Segmentation',
    description: 'U-Net based segmentation for medical imaging with DICOM support',
    category: 'image-analysis',
    difficulty: 'advanced',
    oneClickSetup: true,
    icon: Image,
    tags: ['imaging', 'segmentation', 'medical']
  }
];

// ============================================================================
// URL ROUTING CONFIGURATION
// ============================================================================

const CATEGORY_SLUGS: Record<string, TemplateCategory> = {
  'bio': 'bioinformatics', 'bioinformatics': 'bioinformatics',
  'chem': 'cheminformatics', 'cheminformatics': 'cheminformatics',
  'ml': 'machine-learning', 'machine-learning': 'machine-learning',
  'training': 'machine-learning',
  'stats': 'statistics', 'statistics': 'statistics',
  'viz': 'visualization', 'visualization': 'visualization',
  'quantum': 'quantum-computing', 'quantum-computing': 'quantum-computing',
};

const TEMPLATE_SLUGS: Record<string, string> = {
  'blast': 'blast-sequence-analysis',
  'docking': 'molecular-docking-workflow',
  'training': 'transformer-training-pipeline',
  'bayesian': 'bayesian-inference-framework',
  'quantum-sim': 'quantum-algorithm-simulator',
  'vqe': 'quantum-algorithm-simulator',
  'segmentation': 'medical-image-segmentation',
};

function parseHashRoute(hash: string): { templateId: string | null; category: TemplateCategory | 'all' } {
  const cleanHash = hash.replace(/^#\/?/, '');
  const templatesMatch = cleanHash.match(/templates\/(?:([^/]+)\/)?([^/]+)\/?$/);
  
  if (templatesMatch) {
    const categorySlug = templatesMatch[1];
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
    
    // Category only
    if (categorySlug) {
      const mappedCategory = CATEGORY_SLUGS[categorySlug.toLowerCase()];
      if (mappedCategory) return { templateId: null, category: mappedCategory };
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
  const [selectedCategory, setSelectedCategory] = useState<TemplateCategory | 'all'>('all');
  const [selectedTemplate, setSelectedTemplate] = useState<TemplateData | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);
  
  // Accordion state for all sections
  const [expandedSections, setExpandedSections] = useState<{
    'core-capabilities': boolean;
    'quick-start': boolean;
    'teaching-training': boolean;
    'standardization': boolean;
    'free-tier': boolean;
    'use-cases': boolean;
  }>({
    'core-capabilities': false,
    'quick-start': false,
    'teaching-training': false,
    'standardization': false,
    'free-tier': false,
    'use-cases': false,
  });

  const toggleSection = useCallback((sectionId: keyof typeof expandedSections) => {
    setExpandedSections(prev => ({ ...prev, [sectionId]: !prev[sectionId] }));
  }, []);

  // ====================================================================
  // HASH-BASED ROUTING EFFECT
  // ====================================================================
  
  useEffect(() => {
    if (typeof window === 'undefined') return;
    
    const hash = initialHash || window.location.hash;
    console.log('[TemplateGallery] Initial hash:', hash);
    
    // Check for section routing pattern: /#/templates#/{sectionId}
    const sectionMatch = hash.match(/templates\/?#\/(.+)$/);
    if (sectionMatch) {
      const sectionId = sectionMatch[1];
      console.log('[TemplateGallery] Section route:', sectionId);
      
      const validSections = ['core-capabilities', 'quick-start', 'teaching-training', 'standardization', 'free-tier', 'use-cases'];
      if (validSections.includes(sectionId)) {
        setExpandedSections(prev => ({ ...prev, [sectionId]: true }));
        
        setTimeout(() => {
          const element = document.getElementById(sectionId);
          if (element) element.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }, 300);
      }
      setIsInitialized(true);
      return;
    }
    
    // Parse template route
    const { templateId, category } = parseHashRoute(hash);
    console.log('[TemplateGallery] Parsed route:', { templateId, category });
    
    if (category !== 'all') setSelectedCategory(category);
    if (templateId) {
      const template = templates.find(t => t.id === templateId);
      if (template) {
        setSelectedTemplate(template);
        console.log('[TemplateGallery] Selected template:', template.name);
      }
    }
    
    setIsInitialized(true);
  }, [initialHash]);

  // Listen for hash changes
  useEffect(() => {
    if (typeof window === 'undefined') return;
    
    const handleHashChange = () => {
      const hash = window.location.hash;
      console.log('[TemplateGallery] Hash changed:', hash);
      
      // Section routing
      const sectionMatch = hash.match(/templates\/?#\/(.+)$/);
      if (sectionMatch) {
        const sectionId = sectionMatch[1];
        const validSections = ['core-capabilities', 'quick-start', 'teaching-training', 'standardization', 'free-tier', 'use-cases'];
        if (validSections.includes(sectionId)) {
          setExpandedSections(prev => ({ ...prev, [sectionId]: true }));
          setTimeout(() => {
            const el = document.getElementById(sectionId);
            if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
          }, 100);
        }
        return;
      }
      
      // Template routing
      const { templateId, category } = parseHashRoute(hash);
      if (category !== 'all') setSelectedCategory(category);
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

  // Filter templates by category
  const filteredTemplates = selectedCategory === 'all' 
    ? templates 
    : templates.filter(t => t.category === selectedCategory);

  const categories: { id: TemplateCategory | 'all'; name: string; icon: React.ElementType }[] = [
    { id: 'all', name: 'All Templates', icon: Grid3X3 },
    { id: 'bioinformatics', name: 'Bioinformatics', icon: Zap },
    { id: 'cheminformatics', name: 'Chemistry', icon: FlaskConical },
    { id: 'machine-learning', name: 'Machine Learning', icon: Brain },
    { id: 'statistics', name: 'Statistics', icon: BarChart3 },
    { id: 'quantum-computing', name: 'Quantum', icon: Atom },
    { id: 'image-analysis', name: 'Imaging', icon: Image },
  ];

  // ====================================================================
  // RENDER
  // ====================================================================

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
                    Hello! I'm your AI assistant for <strong>{selectedTemplate.name}</strong>. 
                    I can help you understand the algorithms, optimize parameters, or troubleshoot issues.
                  </p>
                </div>
                <div className="flex gap-2">
                  <input 
                    type="text" 
                    placeholder="Ask about this template..."
                    className="flex-1 bg-slate-950 border border-slate-700 rounded-lg px-4 py-2 text-sm focus:outline-none focus:border-violet-500"
                  />
                  <button className="px-4 py-2 bg-violet-600 hover:bg-violet-700 rounded-lg transition-colors">
                    Send
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Main Gallery View
  return (
    <div className="min-h-screen bg-slate-950 text-white">
      {/* Hero Section */}
      <header className="bg-gradient-to-b from-violet-600/10 to-transparent py-12 px-4">
        <div className="max-w-7xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-violet-500/20 border border-violet-500/30 mb-6">
            <Sparkles className="w-4 h-4 text-violet-400" />
            <span className="text-sm font-medium text-violet-300">Scientific Computing Platform</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-violet-400 to-cyan-400 bg-clip-text text-transparent">
            Template Gallery
          </h1>
          <p className="text-xl text-slate-400 max-w-3xl mx-auto mb-8">
            Production-ready scientific computing templates with one-click setup, parameter presets, and embedded best practices.
          </p>
          <div className="flex justify-center gap-4 text-sm text-slate-500">
            <span>{templates.length} Templates</span>
            <span>•</span>
            <span>{categories.length - 1} Categories</span>
            <span>•</span>
            <span>{templates.filter(t => t.oneClickSetup).length} One-Click Setup</span>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 pb-12">
        {/* Category Filter */}
        <div className="flex flex-wrap gap-3 mb-8 justify-center">
          {categories.map(cat => {
            const CatIcon = cat.icon;
            return (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${
                  selectedCategory === cat.id
                    ? 'bg-violet-600 text-white'
                    : 'bg-slate-800 text-slate-400 hover:bg-slate-700 hover:text-white'
                }`}
              >
                <CatIcon className="w-4 h-4" />
                {cat.name}
              </button>
            );
          })}
        </div>

        {/* Templates Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          {filteredTemplates.map(template => {
            const Icon = template.icon;
            return (
              <button
                key={template.id}
                onClick={() => {
                  setSelectedTemplate(template);
                  window.history.pushState('', '', `#/templates/${template.category}/${template.id}`);
                }}
                className="bg-slate-900 rounded-xl p-6 border border-slate-800 hover:border-violet-500/50 transition-all text-left group"
              >
                <div className="flex items-start gap-4">
                  <div className={`w-12 h-12 rounded-lg flex items-center justify-center flex-shrink-0 ${
                    template.category === 'bioinformatics' ? 'bg-emerald-500/20' :
                    template.category === 'cheminformatics' ? 'bg-blue-500/20' :
                    template.category === 'machine-learning' ? 'bg-violet-500/20' :
                    template.category === 'quantum-computing' ? 'bg-purple-500/20' :
                    'bg-slate-700/50'
                  }`}>
                    <Icon className={`w-6 h-6 ${
                      template.category === 'bioinformatics' ? 'text-emerald-400' :
                      template.category === 'cheminformatics' ? 'text-blue-400' :
                      template.category === 'machine-learning' ? 'text-violet-400' :
                      template.category === 'quantum-computing' ? 'text-purple-400' :
                      'text-slate-400'
                    }`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-lg mb-1 group-hover:text-violet-400 transition-colors">
                      {template.name}
                    </h3>
                    <p className="text-sm text-slate-400 line-clamp-2 mb-3">
                      {template.description}
                    </p>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className={`text-xs px-2 py-0.5 rounded ${
                        template.difficulty === 'beginner' ? 'bg-green-500/20 text-green-400' :
                        template.difficulty === 'intermediate' ? 'bg-yellow-500/20 text-yellow-400' :
                        'bg-orange-500/20 text-orange-400'
                      }`}>
                        {template.difficulty}
                      </span>
                      {template.oneClickSetup && (
                        <span className="text-xs text-emerald-400">⚡ One-click</span>
                      )}
                    </div>
                  </div>
                </div>
              </button>
            );
          })}
        </div>

        {/* ================================================================== */}
        {/* EXPANDABLE SECTIONS WITH ROUTING SUPPORT */}
        {/* ================================================================== */}

        {/* Core Capabilities Section */}
        <section id="core-capabilities" className="mb-8 bg-gradient-to-b from-primary/5 to-transparent rounded-2xl p-6 border border-slate-800">
          <div 
            onClick={() => toggleSection('core-capabilities')}
            className="cursor-pointer select-none"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Sparkles className="w-6 h-6 text-primary" />
                <h2 className="text-2xl font-bold">Core Capabilities</h2>
              </div>
              <ChevronDown className={`w-5 h-5 transition-transform ${expandedSections['core-capabilities'] ? 'rotate-180' : ''}`} />
            </div>
            <p className="text-slate-400 mt-2">Platform features that make SciCMPMATH powerful</p>
          </div>
          
          {expandedSections['core-capabilities'] && (
            <div className="mt-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 animate-in slide-in-from-top-4 duration-300">
              {[
                { icon: Zap, title: 'One-Click Setup', desc: 'Instantly configure environments with pre-built templates' },
                { icon: Settings, title: 'Parameter Presets', desc: 'Optimized defaults for common research scenarios' },
                { icon: BookOpen, title: 'Best Practices', desc: 'Embedded community-vetted methodologies' },
                { icon: Users, title: 'Community Curated', desc: 'Templates reviewed and improved by researchers' },
              ].map((item, i) => (
                <div key={i} className="bg-slate-900/50 rounded-lg p-4 border border-slate-700">
                  <item.icon className="w-8 h-8 text-violet-400 mb-3" />
                  <h3 className="font-semibold mb-1">{item.title}</h3>
                  <p className="text-sm text-slate-400">{item.desc}</p>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Quick Start Projects Section */}
        <section id="quick-start" className="mb-8 bg-card/50 rounded-2xl p-6 border border-slate-800">
          <div onClick={() => toggleSection('quick-start')} className="cursor-pointer select-none">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Rocket className="w-6 h-6 text-emerald-500" />
                <h2 className="text-2xl font-bold">Quick Start Projects</h2>
              </div>
              <ChevronDown className={`w-5 h-5 transition-transform ${expandedSections['quick-start'] ? 'rotate-180' : ''}`} />
            </div>
            <p className="text-slate-400 mt-2">Beginner-friendly templates to get started fast</p>
          </div>
          
          {expandedSections['quick-start'] && (
            <div className="mt-6 space-y-4 animate-in slide-in-from-top-4 duration-300">
              {templates.filter(t => t.difficulty === 'beginner' || t.oneClickSetup).map(template => {
                const Icon = template.icon;
                return (
                  <button
                    key={template.id}
                    onClick={() => {
                      setSelectedTemplate(template);
                      window.history.pushState('', '', `#/templates/${template.category}/${template.id}`);
                    }}
                    className="w-full bg-slate-900/50 rounded-lg p-4 border border-slate-700 hover:border-emerald-500/50 transition-all flex items-center gap-4 text-left"
                  >
                    <Icon className="w-10 h-10 text-emerald-400" />
                    <div className="flex-1">
                      <h3 className="font-semibold">{template.name}</h3>
                      <p className="text-sm text-slate-400">{template.description.substring(0, 80)}...</p>
                    </div>
                    <ArrowRight className="w-5 h-5 text-slate-500" />
                  </button>
                );
              })}
            </div>
          )}
        </section>

        {/* Teaching & Training Section */}
        <section id="teaching-training" className="mb-8 rounded-2xl p-6 border border-slate-800">
          <div onClick={() => toggleSection('teaching-training')} className="cursor-pointer select-none">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <GraduationCap className="w-6 h-6 text-violet-500" />
                <h2 className="text-2xl font-bold">Teaching & Training</h2>
              </div>
              <ChevronDown className={`w-5 h-5 transition-transform ${expandedSections['teaching-training'] ? 'rotate-180' : ''}`} />
            </div>
            <p className="text-slate-400 mt-2">Educational resources for classrooms and workshops</p>
          </div>
          
          {expandedSections['teaching-training'] && (
            <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4 animate-in slide-in-from-top-4 duration-300">
              {[
                { title: 'Classroom Ready', desc: 'Pre-configured for educational environments', icon: BookOpen },
                { title: 'Step-by-Step Guides', desc: 'Integrated tutorials and documentation', icon: ExternalLink },
                { title: 'Assessment Tools', desc: 'Built-in grading and progress tracking', icon: Star },
              ].map((item, i) => (
                <div key={i} className="bg-slate-900/50 rounded-lg p-4 border border-slate-700">
                  <item.icon className="w-8 h-8 text-violet-400 mb-3" />
                  <h3 className="font-semibold mb-1">{item.title}</h3>
                  <p className="text-sm text-slate-400">{item.desc}</p>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Standardization Across Labs Section */}
        <section id="standardization" className="mb-8 bg-amber-500/5 rounded-2xl p-6 border border-amber-500/20">
          <div onClick={() => toggleSection('standardization')} className="cursor-pointer select-none">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Users className="w-6 h-6 text-amber-500" />
                <h2 className="text-2xl font-bold">Standardization Across Labs</h2>
              </div>
              <ChevronDown className={`w-5 h-5 transition-transform ${expandedSections['standardization'] ? 'rotate-180' : ''}`} />
            </div>
            <p className="text-slate-400 mt-2">Ensure reproducibility across research teams</p>
          </div>
          
          {expandedSections['standardization'] && (
            <div className="mt-6 space-y-4 animate-in slide-in-from-top-4 duration-300">
              <div className="bg-slate-900/50 rounded-lg p-4 border border-slate-700">
                <h3 className="font-semibold mb-2">Version Control Integration</h3>
                <p className="text-sm text-slate-400">Track changes, collaborate, and ensure reproducibility with built-in Git integration.</p>
              </div>
              <div className="bg-slate-900/50 rounded-lg p-4 border border-slate-700">
                <h3 className="font-semibold mb-2">Environment Snapshots</h3>
                <p className="text-sm text-slate-400">Capture complete computational environments for exact replication of results.</p>
              </div>
            </div>
          )}
        </section>

        {/* Free Tier Resources Section */}
        <section id="free-tier" className="mb-8 rounded-2xl p-6 border border-slate-800">
          <div onClick={() => toggleSection('free-tier')} className="cursor-pointer select-none">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Gift className="w-6 h-6 text-green-500" />
                <h2 className="text-2xl font-bold">Free Tier Resources ({templates.filter(t => t.oneClickSetup).length} available)</h2>
              </div>
              <ChevronDown className={`w-5 h-5 transition-transform ${expandedSections['free-tier'] ? 'rotate-180' : ''}`} />
            </div>
            <p className="text-slate-400 mt-2">Start free with these fully-featured templates</p>
          </div>
          
          {expandedSections['free-tier'] && (
            <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4 animate-in slide-in-from-top-4 duration-300">
              {templates.filter(t => t.oneClickSetup).map(template => {
                const Icon = template.icon;
                return (
                  <div key={template.id} className="bg-slate-900/50 rounded-lg p-4 border border-green-500/20">
                    <div className="flex items-center gap-3 mb-2">
                      <Icon className="w-6 h-6 text-green-400" />
                      <h3 className="font-semibold">{template.name}</h3>
                      <span className="ml-auto text-xs bg-green-500/20 text-green-400 px-2 py-0.5 rounded">FREE</span>
                    </div>
                    <p className="text-sm text-slate-400">{template.description.substring(0, 100)}...</p>
                  </div>
                );
              })}
            </div>
          )}
        </section>

        {/* Use Cases Section */}
        <section id="use-cases" className="mb-8 bg-card/50 rounded-2xl p-6 border border-slate-800">
          <div onClick={() => toggleSection('use-cases')} className="cursor-pointer select-none">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <ExternalLink className="w-6 h-6 text-cyan-500" />
                <h2 className="text-2xl font-bold">Use Cases</h2>
              </div>
              <ChevronDown className={`w-5 h-5 transition-transform ${expandedSections['use-cases'] ? 'rotate-180' : ''}`} />
            </div>
            <p className="text-slate-400 mt-2">Real-world applications and success stories</p>
          </div>
          
          {expandedSections['use-cases'] && (
            <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4 animate-in slide-in-from-top-4 duration-300">
              {[
                { title: 'Genomic Research', desc: 'Sequence analysis pipelines processing millions of base pairs', category: 'Bioinformatics' },
                { title: 'Drug Discovery', desc: 'Virtual screening workflows identifying potential drug candidates', category: 'Chemistry' },
                { title: 'Model Training', desc: 'Production ML systems training on large-scale datasets', category: 'Machine Learning' },
                { title: 'Quantum Simulation', desc: 'Quantum algorithm development and testing environment', category: 'Quantum Computing' },
              ].map((useCase, i) => (
                <div key={i} className="bg-slate-900/50 rounded-lg p-4 border border-slate-700">
                  <span className="text-xs text-cyan-400 font-medium">{useCase.category}</span>
                  <h3 className="font-semibold mt-1 mb-1">{useCase.title}</h3>
                  <p className="text-sm text-slate-400">{useCase.desc}</p>
                </div>
              ))}
            </div>
          )}
        </section>
      </main>
    </div>
  );
}

// All icons now properly imported from lucide-react
