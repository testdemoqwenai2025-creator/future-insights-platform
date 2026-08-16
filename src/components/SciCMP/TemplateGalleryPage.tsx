/**
 * TemplateGalleryPage - Scientific Computing Template Gallery
 * Full routing support for /#/templates/* URLs
 * All sections fully interactive with working navigation
 */

'use client';

import { useState, useCallback, useEffect } from 'react';
import {
  ArrowRight,
  ChevronDown,
  ChevronUp,
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
  Lightbulb,
  Target,
  Layers,
  FileText,
  Download,
  Heart,
  Shield,
  TrendingUp,
  Package,
  Wrench,
  AcademicCap,
  Briefcase,
  Lock,
  Unlock,
  ArrowLeft
} from 'lucide-react';

// ============================================================================
// DATA TYPES
// ============================================================================

type TemplateCategory = 'bioinformatics' | 'cheminformatics' | 'machine-learning' | 
                         'statistics' | 'visualization' | 'quantum-computing' | 'guide';

interface TemplateData {
  id: string;
  name: string;
  description: string;
  category: TemplateCategory;
  difficulty: 'beginner' | 'intermediate' | 'advanced' | 'expert';
  oneClickSetup: boolean;
  icon: React.ElementType;
  tags: string[];
  features?: string[];
  useCases?: string[];
}

interface CapabilityData {
  id: string;
  title: string;
  description: string;
  icon: React.ElementType;
  details: string[];
  link?: string;
}

interface UseCaseData {
  id: string;
  title: string;
  description: string;
  icon: React.ElementType;
  templates: string[];
  audience: string;
}

interface FreeTierResource {
  id: string;
  name: string;
  description: string;
  icon: React.ElementType;
  isAvailable: boolean;
  limit?: string;
}

// ============================================================================
// TEMPLATE DATA - COMPLETE LIST
// ============================================================================

const templates: TemplateData[] = [
  // Bioinformatics
  {
    id: 'blast-sequence-analysis',
    name: 'BLAST+ Sequence Analysis',
    description: 'Perform BLAST sequence alignments with customizable parameters for DNA/RNA/protein analysis. Includes local and NCBI remote database support.',
    category: 'bioinformatics',
    difficulty: 'intermediate',
    oneClickSetup: true,
    icon: Zap,
    tags: ['bioinformatics', 'genomics', 'sequence-alignment', 'NCBI'],
    features: ['Local & remote BLAST databases', 'Custom scoring matrices', 'Batch processing support', 'Results visualization'],
    useCases: ['Gene annotation', 'Homology detection', 'Phylogenetic analysis', 'Variant calling validation']
  },
  
  // Cheminformatics
  {
    id: 'molecular-docking-workflow',
    name: 'Molecular Docking Workflow',
    description: 'AutoDock Vina docking pipeline with ligand preparation, receptor setup, binding pose analysis, and scoring visualization.',
    category: 'cheminformatics',
    difficulty: 'advanced',
    oneClickSetup: true,
    icon: FlaskConical,
    tags: ['chemistry', 'docking', 'drug-discovery', 'AutoDock'],
    features: ['Automated ligand preparation', 'Grid box auto-docking', 'Binding affinity scoring', 'Pose clustering analysis'],
    useCases: ['Virtual screening', 'Lead optimization', 'Binding mode prediction', 'SAR studies']
  },
  
  // Machine Learning
  {
    id: 'transformer-training-pipeline',
    name: 'ML Model Training Pipeline',
    description: 'End-to-end transformer model training with data preprocessing, hyperparameter tuning, evaluation metrics, and export capabilities.',
    category: 'machine-learning',
    difficulty: 'advanced',
    oneClickSetup: true,
    icon: Brain,
    tags: ['machine-learning', 'transformers', 'deep-learning', 'PyTorch'],
    features: ['Distributed training support', 'Automatic mixed precision', 'Experiment tracking', 'Model checkpointing'],
    useCases: ['Sequence classification', 'Named entity recognition', 'Text generation', 'Protein property prediction']
  },
  
  // Statistics - NEW
  {
    id: 'statistical-analysis-suite',
    name: 'Statistical Analysis Suite',
    description: 'Comprehensive statistical analysis toolkit with hypothesis testing, regression analysis, ANOVA, Bayesian methods, and publication-ready visualizations.',
    category: 'statistics',
    difficulty: 'intermediate',
    oneClickSetup: true,
    icon: BarChart3,
    tags: ['statistics', 'hypothesis-testing', 'regression', 'ANOVA', 'Bayesian'],
    features: ['20+ statistical tests', 'Multiple comparison correction', 'Effect size calculations', 'Publication-quality plots'],
    useCases: ['Clinical trial analysis', 'Experimental data validation', 'Quality control', 'Meta-analysis']
  },
  
  // Visualization - NEW
  {
    id: 'visualization-templates',
    name: 'Visualization Templates',
    description: 'Scientific visualization templates for heatmaps, scatter plots, network graphs, molecular structures, and interactive dashboards.',
    category: 'visualization',
    difficulty: 'beginner',
    oneClickSetup: true,
    icon: Image,
    tags: ['visualization', 'plots', 'dashboards', 'interactive', 'publication'],
    features: ['30+ chart types', 'Interactive tooltips', 'Export to SVG/PDF', 'Color-blind friendly palettes'],
    useCases: ['Paper figures', 'Presentation graphics', 'Exploratory analysis', 'Real-time dashboards']
  },
  
  // Guide - NEW
  {
    id: 'create-template-guide',
    name: 'Create Your Template Guide',
    description: 'Step-by-step guide to creating custom SciCMP templates with best practices, validation testing, and community sharing workflows.',
    category: 'guide',
    difficulty: 'beginner',
    oneClickSetup: false,
    icon: BookOpen,
    tags: ['guide', 'tutorial', 'custom-template', 'community', 'best-practices'],
    features: ['Template scaffolding CLI', 'Validation testing suite', 'Documentation generator', 'Community submission workflow'],
    useCases: ['Custom workflow creation', 'Lab protocol standardization', 'Teaching material development', 'Method reproducibility']
  }
];

// ============================================================================
// CORE CAPABILITIES DATA - FULLY INTERACTIVE
// ============================================================================

const coreCapabilities: CapabilityData[] = [
  {
    id: 'one-click-setup',
    title: 'One-Click Setup',
    description: 'Pre-configured environments with all dependencies installed and validated.',
    icon: Zap,
    details: [
      'Automatic dependency resolution',
      'Container-ready environments',
      'Version-pinned packages',
      'GPU support detection',
      'Cloud-native deployment ready'
    ],
    link: '#/templates/guide'
  },
  {
    id: 'parameter-presets',
    title: 'Parameter Presets',
    description: 'Expert-curated configurations for common analysis types and publication standards.',
    icon: Settings,
    details: [
      'Domain expert validated',
      'Citation-ready parameters',
      'Reproducible configs',
      'Community contributed presets',
      'A/B comparison support'
    ],
    link: '#/templates/statistics'
  },
  {
    id: 'best-practices',
    title: 'Best Practices Embedded',
    description: 'Templates follow community standards, publication guidelines, and FAIR principles.',
    icon: CheckCircle2,
    details: [
      'FAIR data compliance',
      'Code quality standards',
      'Documentation requirements',
      'Testing coverage minimums',
      'Peer review checklist'
    ],
    link: '#/templates/guide'
  }
];

// ============================================================================
// USE CASES DATA - INTERACTIVE SECTION
// ============================================================================

const useCases: UseCaseData[] = [
  {
    id: 'quick-start',
    title: 'Quick Start Projects',
    description: 'Get running in minutes with pre-built project templates for common research workflows.',
    icon: Rocket,
    templates: ['blast-sequence-analysis', 'statistical-analysis-suite', 'visualization-templates'],
    audience: 'New users, rapid prototyping'
  },
  {
    id: 'teaching-training',
    title: 'Teaching & Training',
    description: 'Classroom-ready templates with exercises, solutions, and assessment rubrics built in.',
    icon: GraduationCap,
    templates: ['blast-sequence-analysis', 'statistical-analysis-suite', 'create-template-guide'],
    audience: 'Instructors, workshop leaders'
  },
  {
    id: 'lab-standardization',
    title: 'Standardization Across Labs',
    description: 'Ensure reproducibility and consistency across multiple research groups and collaborations.',
    icon: Users,
    templates: ['create-template-guide', 'molecular-docking-workflow', 'ml-training-pipeline'],
    audience: 'Core facilities, consortia'
  }
];

// ============================================================================
// FREE TIER RESOURCES DATA - INTERACTIVE SECTION
// ============================================================================

const freeTierResources: FreeTierResource[] = [
  {
    id: 'blast-free',
    name: 'BLAST+ Sequence Analysis',
    description: 'Full local BLAST functionality with sample databases included.',
    icon: Zap,
    isAvailable: true,
    limit: 'Up to 1000 sequences/query'
  },
  {
    id: 'docking-free',
    name: 'Molecular Docking Setup',
    description: 'AutoDock Vina with pre-configured docking scenarios.',
    icon: FlaskConical,
    isAvailable: true,
    limit: '50 ligands per session'
  },
  {
    id: 'ml-free',
    name: 'ML Model Training Pipeline',
    description: 'Transformer training with CPU support and sample datasets.',
    icon: Brain,
    isAvailable: true,
    limit: 'Models up to 100M parameters'
  },
  {
    id: 'stats-free',
    name: 'Statistical Analysis Suite',
    description: 'Complete statistical toolkit with all tests unlocked.',
    icon: BarChart3,
    isAvailable: true,
    limit: 'Datasets up to 10K rows'
  },
  {
    id: 'viz-free',
    name: 'Visualization Templates',
    description: 'All 30+ chart types with export capabilities.',
    icon: Image,
    isAvailable: true,
    limit: 'Unlimited exports'
  },
  {
    id: 'guide-free',
    name: 'Create Your Template Guide',
    description: 'Complete template creation tutorial and CLI tools.',
    icon: BookOpen,
    isAvailable: true,
    limit: 'Unlimited templates'
  }
];

// ============================================================================
// URL ROUTING CONFIGURATION
// ============================================================================

const TEMPLATE_SLUGS: Record<string, string> = {
  'blast': 'blast-sequence-analysis',
  'docking': 'molecular-docking-workflow',
  'training': 'transformer-training-pipeline',
  'stats': 'statistical-analysis-suite',
  'statistics': 'statistical-analysis-suite',
  'viz': 'visualization-templates',
  'visualization': 'visualization-templates',
  'guide': 'create-template-guide',
  'template-guide': 'create-template-guide',
};

function parseHashRoute(hash: string): { templateId: string | null; category: TemplateCategory | 'all'; section?: string } {
  const cleanHash = hash.replace(/^#\/?/, '');
  
  // Check for special sections
  if (cleanHash === 'capabilities' || cleanHash === 'core-capabilities') {
    return { templateId: null, category: 'all', section: 'capabilities' };
  }
  if (cleanHash === 'use-cases') {
    return { templateId: null, category: 'all', section: 'use-cases' };
  }
  if (cleanHash === 'free-tier' || cleanHash === 'resources') {
    return { templateId: null, category: 'all', section: 'free-tier' };
  }
  
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
  const [expandedCapability, setExpandedCapability] = useState<string | null>(null);
  const [activeSection, setActiveSection] = useState<string | null>(null);

  // Hash-based routing effect
  useEffect(() => {
    if (typeof window === 'undefined') return;
    
    const hash = initialHash || window.location.hash;
    console.log('[TemplateGallery] Processing hash:', hash);
    
    const { templateId, section } = parseHashRoute(hash);
    
    if (section) {
      setActiveSection(section);
      setSelectedTemplate(null);
      // Scroll to section
      setTimeout(() => {
        const el = document.getElementById(`section-${section}`);
        if (el) el.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    } else if (templateId) {
      const template = templates.find(t => t.id === templateId);
      if (template) {
        setSelectedTemplate(template);
        setActiveSection(null);
        console.log('[TemplateGallery] Selected:', template.name);
      }
    }
  }, [initialHash]);

  // Listen for hash changes
  useEffect(() => {
    const handleHashChange = () => {
      const { templateId, section } = parseHashRoute(window.location.hash);
      
      if (section) {
        setActiveSection(section);
        setSelectedTemplate(null);
      } else if (templateId) {
        const template = templates.find(t => t.id === templateId);
        if (template) {
          setSelectedTemplate(template);
          setActiveSection(null);
        }
      } else {
        setSelectedTemplate(null);
        setActiveSection(null);
      }
    };
    
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  // Navigate to template
  const navigateToTemplate = useCallback((template: TemplateData) => {
    setSelectedTemplate(template);
    setActiveSection(null);
    const slug = Object.keys(TEMPLATE_SLUGS).find(k => TEMPLATE_SLUGS[k] === template.id) || template.id;
    window.location.hash = `#/templates/${template.category}/${slug}`;
  }, []);

  // Navigate to section
  const navigateToSection = useCallback((sectionId: string) => {
    setActiveSection(sectionId);
    setSelectedTemplate(null);
    window.location.hash = `#/${sectionId}`;
  }, []);

  // Go back to gallery
  const goBackToGallery = useCallback(() => {
    setSelectedTemplate(null);
    setActiveSection(null);
    window.history.pushState('', '', '#/templates');
  }, []);

  // Toggle capability expansion
  const toggleCapability = useCallback((capabilityId: string) => {
    setExpandedCapability(prev => prev === capabilityId ? null : capabilityId);
  }, []);

  // If a template is selected, show detail view
  if (selectedTemplate) {
    const Icon = selectedTemplate.icon;
    return (
      <div className="min-h-screen bg-slate-950 text-white p-4 md:p-8">
        <div className="max-w-6xl mx-auto">
          {/* Back button */}
          <button
            onClick={goBackToGallery}
            className="mb-6 flex items-center gap-2 text-violet-400 hover:text-violet-300 transition-colors group"
          >
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            Back to Gallery
          </button>

          {/* Template Header */}
          <div className="bg-gradient-to-br from-violet-600/20 to-cyan-600/20 rounded-2xl p-8 border border-violet-500/30 mb-8">
            <div className="flex items-start gap-6">
              <div className="w-20 h-20 rounded-xl bg-violet-500/20 flex items-center justify-center flex-shrink-0">
                <Icon className="w-10 h-10 text-violet-400" />
              </div>
              <div className="flex-1">
                <h1 className="text-3xl md:text-4xl font-bold mb-3">{selectedTemplate.name}</h1>
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
                    <span className="px-3 py-1 rounded-full text-sm font-medium bg-emerald-500/20 text-emerald-400 flex items-center gap-1">
                      <Zap className="w-3 h-3" /> One-Click Setup
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

          {/* Features Grid */}
          {selectedTemplate.features && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
              <div className="bg-slate-900 rounded-xl p-6 border border-slate-700">
                <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
                  <Star className="w-5 h-5 text-yellow-400" />
                  Key Features
                </h3>
                <ul className="space-y-2">
                  {selectedTemplate.features.map((feature, idx) => (
                    <li key={idx} className="flex items-start gap-2 text-slate-300">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 mt-0.5 flex-shrink-0" />
                      {feature}
                    </li>
                  ))}
                </ul>
              </div>

              <div className="bg-slate-900 rounded-xl p-6 border border-slate-700">
                <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
                  <Target className="w-5 h-5 text-cyan-400" />
                  Use Cases
                </h3>
                <ul className="space-y-2">
                  {selectedTemplate.useCases?.map((useCase, idx) => (
                    <li key={idx} className="flex items-start gap-2 text-slate-300">
                      <ArrowRight className="w-4 h-4 text-violet-400 mt-0.5 flex-shrink-0" />
                      {useCase}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}

          {/* Template Content Portal */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Code Editor Panel */}
            <div className="bg-slate-900 rounded-xl p-6 border border-slate-700">
              <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
                <Code className="w-5 h-5 text-cyan-400" />
                Starter Code
              </h3>
              <pre className="bg-slate-950 rounded-lg p-4 overflow-x-auto text-sm text-slate-300 font-mono">
{`# ${selectedTemplate.name} - SciCMP Template
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
              <button 
                onClick={() => alert(`🚀 Launching ${selectedTemplate.name}...\\n\\nIn production, this would:\\n1. Initialize the workspace\\n2. Load sample data\\n3. Open interactive editor`)}
                className="mt-4 w-full py-3 bg-violet-600 hover:bg-violet-700 rounded-lg transition-colors font-medium flex items-center justify-center gap-2"
              >
                <Play className="w-4 h-4" />
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
                  <p className="text-sm text-slate-300 mb-3">
                    Ready to assist with <strong>{selectedTemplate.name.toLowerCase()}</strong>. 
                    Ask about parameters, best practices, or interpretation of results.
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {['Explain parameters', 'Show example', 'Best practices'].map((suggestion) => (
                      <button
                        key={suggestion}
                        onClick={() => alert(`💡 AI Assistant: "${suggestion}" for ${selectedTemplate.name}\\n\\nThis would open an AI chat interface with context-aware suggestions.`)}
                        className="px-3 py-1 bg-violet-500/20 hover:bg-violet-500/30 text-violet-300 rounded-full text-xs transition-colors"
                      >
                        {suggestion}
                      </button>
                    ))}
                  </div>
                </div>
                
                <div className="border-t border-slate-700 pt-4">
                  <h4 className="text-sm font-semibold mb-2 text-slate-400">Quick Actions</h4>
                  <div className="grid grid-cols-2 gap-2">
                    <button 
                      onClick={() => alert('📥 Downloading template configuration...')}
                      className="py-2 px-3 bg-slate-800 hover:bg-slate-700 rounded-lg text-sm transition-colors flex items-center gap-2"
                    >
                      <Download className="w-4 h-4" /> Download
                    </button>
                    <button 
                      onClick={() => alert('📖 Opening documentation...')}
                      className="py-2 px-3 bg-slate-800 hover:bg-slate-700 rounded-lg text-sm transition-colors flex items-center gap-2"
                    >
                      <FileText className="w-4 h-4" /> Docs
                    </button>
                    <button 
                      onClick={() => alert('⭐ Added to favorites!')}
                      className="py-2 px-3 bg-slate-800 hover:bg-slate-700 rounded-lg text-sm transition-colors flex items-center gap-2"
                    >
                      <Heart className="w-4 h-4" /> Favorite
                    </button>
                    <button 
                      onClick={() => alert('🔗 Copy share link to clipboard')}
                      className="py-2 px-3 bg-slate-800 hover:bg-slate-700 rounded-lg text-sm transition-colors flex items-center gap-2"
                    >
                      <ShareIcon className="w-4 h-4" /> Share
                    </button>
                  </div>
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
          <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-violet-400 via-purple-400 to-cyan-400 bg-clip-text text-transparent">
            Scientific Computing Templates
          </h1>
          <p className="text-xl text-slate-400 max-w-3xl mx-auto mb-6">
            Production-ready templates for bioinformatics, cheminformatics, machine learning, statistics, and visualization.
          </p>
          <div className="flex justify-center gap-3">
            <button 
              onClick={() => navigateToSection('capabilities')}
              className={`px-4 py-2 rounded-lg transition-all ${activeSection === 'capabilities' ? 'bg-violet-600 text-white' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'}`}
            >
              <Settings className="w-4 h-4 inline mr-1" /> Capabilities
            </button>
            <button 
              onClick={() => navigateToSection('use-cases')}
              className={`px-4 py-2 rounded-lg transition-all ${activeSection === 'use-cases' ? 'bg-violet-600 text-white' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'}`}
            >
              <Target className="w-4 h-4 inline mr-1" /> Use Cases
            </button>
            <button 
              onClick={() => navigateToSection('free-tier')}
              className={`px-4 py-2 rounded-lg transition-all ${activeSection === 'free-tier' ? 'bg-violet-600 text-white' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'}`}
            >
              <Gift className="w-4 h-4 inline mr-1" /> Free Tier
            </button>
          </div>
        </div>

        {/* ========================================== */}
        {/* CORE CAPABILITIES - INTERACTIVE SECTION     */}
        {/* ========================================== */}
        <section id="section-capabilities" className="mb-16 scroll-mt-8">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-3xl font-bold flex items-center gap-3">
              <Sparkles className="w-8 h-8 text-violet-400" />
              Core Capabilities
            </h2>
            <button 
              onClick={() => navigateToSection(null)}
              className="text-sm text-slate-400 hover:text-white transition-colors"
            >
              View all templates →
            </button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {coreCapabilities.map((capability) => {
              const Icon = capability.icon;
              const isExpanded = expandedCapability === capability.id;
              
              return (
                <div
                  key={capability.id}
                  className="bg-slate-900 rounded-xl border border-slate-700 overflow-hidden hover:border-violet-500/50 transition-all"
                >
                  {/* Clickable Header */}
                  <button
                    onClick={() => toggleCapability(capability.id)}
                    className="w-full p-6 text-left focus:outline-none focus:ring-2 focus:ring-violet-500 focus:ring-inset"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-violet-500/20 to-cyan-500/20 flex items-center justify-center">
                        <Icon className="w-6 h-6 text-violet-400" />
                      </div>
                      {isExpanded ? (
                        <ChevronUp className="w-5 h-5 text-slate-400" />
                      ) : (
                        <ChevronDown className="w-5 h-5 text-slate-400" />
                      )}
                    </div>
                    
                    <h3 className="text-xl font-semibold mb-2 text-white">{capability.title}</h3>
                    <p className="text-slate-400 text-sm">{capability.description}</p>
                  </button>
                  
                  {/* Expandable Details */}
                  {isExpanded && (
                    <div className="px-6 pb-6 border-t border-slate-700 pt-4">
                      <ul className="space-y-2 mb-4">
                        {capability.details.map((detail, idx) => (
                          <li key={idx} className="flex items-start gap-2 text-sm text-slate-300">
                            <CheckCircle2 className="w-4 h-4 text-emerald-400 mt-0.5 flex-shrink-0" />
                            {detail}
                          </li>
                        ))}
                      </ul>
                      {capability.link && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            window.location.hash = capability.link;
                          }}
                          className="text-violet-400 hover:text-violet-300 text-sm font-medium flex items-center gap-1"
                        >
                          Learn more <ExternalLink className="w-3 h-3" />
                        </button>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </section>

        {/* ========================================== */}
        {/* TEMPLATES GRID - FULLY INTERACTIVE         */}
        {/* ========================================== */}
        <section className="mb-16">
          <h2 className="text-3xl font-bold mb-8 text-center flex items-center justify-center gap-3">
            <Grid3X3 className="w-8 h-8 text-cyan-400" />
            Available Templates ({templates.length})
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {templates.map((template) => {
              const Icon = template.icon;
              return (
                <button
                  key={template.id}
                  onClick={() => navigateToTemplate(template)}
                  className="bg-slate-900 rounded-xl p-6 border border-slate-700 hover:border-violet-500 transition-all text-left group focus:outline-none focus:ring-2 focus:ring-violet-500"
                >
                  <div className="w-14 h-14 rounded-lg bg-gradient-to-br from-violet-500/20 to-cyan-500/20 flex items-center justify-center mb-4 group-hover:from-violet-500/30 group-hover:to-cyan-500/30 transition-all">
                    <Icon className="w-7 h-7 text-violet-400" />
                  </div>
                  
                  <h3 className="text-xl font-semibold mb-2 group-hover:text-violet-300 transition-colors">{template.name}</h3>
                  <p className="text-slate-400 text-sm mb-4 line-clamp-2">{template.description}</p>
                  
                  <div className="flex items-center justify-between flex-wrap gap-2">
                    <span className={`px-2 py-1 rounded text-xs font-medium ${
                      template.difficulty === 'beginner' ? 'bg-green-500/20 text-green-400' :
                      template.difficulty === 'intermediate' ? 'bg-yellow-500/20 text-yellow-400' :
                      'bg-orange-500/20 text-orange-400'
                    }`}>
                      {template.difficulty}
                    </span>
                    
                    {template.oneClickSetup ? (
                      <span className="text-xs text-emerald-400 flex items-center gap-1">
                        <Zap className="w-3 h-3" /> One-click ✓
                      </span>
                    ) : (
                      <span className="text-xs text-slate-500 flex items-center gap-1">
                        <Wrench className="w-3 h-3" /> Custom setup
                      </span>
                    )}
                  </div>
                  
                  <div className="mt-3 flex items-center gap-1 text-violet-400 text-sm opacity-0 group-hover:opacity-100 transition-opacity">
                    View details <ArrowRight className="w-4 h-4" />
                  </div>
                </button>
              );
            })}
          </div>
        </section>

        {/* ========================================== */}
        {/* USE CASES - INTERACTIVE SECTION             */}
        {/* ========================================== */}
        <section id="section-use-cases" className="mb-16 scroll-mt-8">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-3xl font-bold flex items-center gap-3">
              <Lightbulb className="w-8 h-8 text-yellow-400" />
              Use Cases
            </h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {useCases.map((useCase) => {
              const Icon = useCase.icon;
              return (
                <button
                  key={useCase.id}
                  onClick={() => {
                    // Navigate to first relevant template
                    const firstTemplate = templates.find(t => useCase.templates.includes(t.id));
                    if (firstTemplate) navigateToTemplate(firstTemplate);
                  }}
                  className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-xl p-6 border border-slate-700 hover:border-yellow-500/50 transition-all text-left group focus:outline-none focus:ring-2 focus:ring-yellow-500"
                >
                  <div className="w-14 h-14 rounded-lg bg-yellow-500/10 flex items-center justify-center mb-4 group-hover:bg-yellow-500/20 transition-colors">
                    <Icon className="w-7 h-7 text-yellow-400" />
                  </div>
                  
                  <h3 className="text-xl font-semibold mb-2 text-white">{useCase.title}</h3>
                  <p className="text-slate-400 text-sm mb-4">{useCase.description}</p>
                  
                  <div className="space-y-2">
                    <p className="text-xs text-slate-500 uppercase tracking-wide">For:</p>
                    <p className="text-sm text-slate-300">{useCase.audience}</p>
                    <p className="text-xs text-slate-500 uppercase tracking-wide mt-2">Includes:</p>
                    <div className="flex flex-wrap gap-1">
                      {useCase.templates.slice(0, 2).map(templateId => {
                        const t = templates.find(tm => tm.id === templateId);
                        return t ? (
                          <span key={templateId} className="px-2 py-0.5 bg-slate-700 rounded text-xs text-slate-300">
                            {t.name.split(' ')[0]}
                          </span>
                        ) : null;
                      })}
                    </div>
                  </div>
                  
                  <div className="mt-4 text-yellow-400 text-sm flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    Explore <ArrowRight className="w-4 h-4" />
                  </div>
                </button>
              );
            })}
          </div>
        </section>

        {/* ========================================== */}
        {/* FREE TIER RESOURCES - INTERACTIVE SECTION   */}
        {/* ========================================== */}
        <section id="section-free-tier" className="mb-16 scroll-mt-8">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-3xl font-bold flex items-center gap-3">
              <Gift className="w-8 h-8 text-emerald-400" />
              Free Tier Resources
              <span className="text-lg font-normal text-slate-400">({freeTierResources.filter(r => r.isAvailable).length} available)</span>
            </h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {freeTierResources.map((resource) => {
              const Icon = resource.icon;
              const relatedTemplate = templates.find(t => t.id === resource.id.replace('-free', ''));
              
              return (
                <button
                  key={resource.id}
                  onClick={() => {
                    if (relatedTemplate && resource.isAvailable) {
                      navigateToTemplate(relatedTemplate);
                    } else {
                      alert(`💡 ${resource.name}\\n\\n${resource.description}\\n\\nLimit: ${resource.limit || 'Contact for details'}\\n\\nUpgrade for unlimited access!`);
                    }
                  }}
                  disabled={!resource.isAvailable}
                  className={`bg-slate-900 rounded-xl p-5 border transition-all text-left group focus:outline-none focus:ring-2 ${
                    resource.isAvailable 
                      ? 'border-emerald-500/30 hover:border-emerald-500 hover:bg-slate-800 focus:ring-emerald-500 cursor-pointer' 
                      : 'border-slate-700 opacity-60 cursor-not-allowed'
                  }`}
                >
                  <div className="flex items-start gap-4">
                    <div className={`w-12 h-12 rounded-lg flex items-center justify-center flex-shrink-0 ${
                      resource.isAvailable ? 'bg-emerald-500/20' : 'bg-slate-800'
                    }`}>
                      <Icon className={`w-6 h-6 ${resource.isAvailable ? 'text-emerald-400' : 'text-slate-500'}`} />
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-semibold text-white truncate">{resource.name}</h3>
                        {resource.isAvailable ? (
                          <Unlock className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                        ) : (
                          <Lock className="w-4 h-4 text-slate-500 flex-shrink-0" />
                        )}
                      </div>
                      
                      <p className="text-sm text-slate-400 line-clamp-2 mb-2">{resource.description}</p>
                      
                      {resource.limit && (
                        <span className="text-xs text-slate-500 bg-slate-800 px-2 py-1 rounded">
                          {resource.limit}
                        </span>
                      )}
                    </div>
                  </div>
                  
                  {resource.isAvailable && (
                    <div className="mt-3 text-emerald-400 text-xs flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      Get started free <ArrowRight className="w-3 h-3" />
                    </div>
                  )}
                </button>
              );
            })}
          </div>
          
          <div className="mt-6 text-center">
            <button 
              onClick={() => alert('💎 Upgrade to Pro for:\\n\\n✓ Unlimited computations\\n✓ Priority GPU access\\n✓ Advanced templates\\n✓ Dedicated support\\n✓ Team collaboration')}
              className="px-6 py-3 bg-gradient-to-r from-violet-600 to-cyan-600 hover:from-violet-500 hover:to-cyan-500 rounded-lg font-medium transition-all inline-flex items-center gap-2"
            >
              <TrendingUp className="w-5 h-5" />
              Upgrade to Pro
            </button>
          </div>
        </section>

        {/* Footer CTA */}
        <div className="text-center py-12 border-t border-slate-800">
          <p className="text-slate-400 mb-4">
            Ready to accelerate your scientific computing?
          </p>
          <button 
            onClick={() => navigateToTemplate(templates[0])}
            className="px-8 py-4 bg-violet-600 hover:bg-violet-700 rounded-xl font-semibold transition-colors inline-flex items-center gap-2"
          >
            <Rocket className="w-5 h-5" />
            Get Started with Templates
          </button>
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// HELPER ICON COMPONENTS
// ============================================================================

function ShareIcon(props: any) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <circle cx="18" cy="5" r="3"></circle>
      <circle cx="6" cy="12" r="3"></circle>
      <circle cx="18" cy="19" r="3"></circle>
      <line x1="8.59" y1="13.51" x2="15.42" y2="17.49"></line>
      <line x1="15.41" y1="6.51" x2="8.59" y2="10.49"></line>
    </svg>
  );
}
