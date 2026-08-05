'use client';

import { useState, useEffect, useCallback } from 'react';
import { useSound } from '@/hooks/useSound';
import {
  Atom,
  Brain,
  Dna,
  Glasses,
  Microscope,
  Zap,
  Cpu,
  Waves,
  Hexagon,
  CircleDot,
  Triangle,
  Sparkles,
  Play,
  Pause,
  RotateCcw,
  Settings,
  Maximize2,
  Eye,
  EyeOff,
  Layers,
  Network,
  Radio,
  Beaker,
  FlaskConical,
  Telescope,
  GraduationCap,
  Target,
  Compass,
  Rocket,
  Star,
  Infinity,
  Activity,
  Thermometer,
  Battery,
  Wifi,
  Lock
} from 'lucide-react';

// Quantum Circuit Visualization
function QuantumCircuit({ isRunning }: { isRunning: boolean }) {
  const [qubits, setQubits] = useState<Array<{ state: number; phase: number }>>([
    { state: 0, phase: 0 },
    { state: 1, phase: Math.PI / 4 },
    { state: 0.5, phase: Math.PI / 2 },
    { state: -0.5, phase: Math.PI }
  ]);

  useEffect(() => {
    if (!isRunning) return;

    const interval = setInterval(() => {
      setQubits(prev => prev.map(q => ({
        state: Math.sin(Date.now() / 500 + q.phase) * 0.8 + q.state * 0.2,
        phase: q.phase + 0.05
      })));
    }, 50);

    return () => clearInterval(interval);
  }, [isRunning]);

  return (
    <div className="relative w-full h-48 bg-slate-950 rounded-xl border border-slate-800 overflow-hidden">
      {/* Grid Background */}
      <div 
        className="absolute inset-0 opacity-20"
        style={{
          backgroundImage: `
            linear-gradient(rgba(139, 92, 246, 0.3) 1px, transparent 1px),
            linear-gradient(90deg, rgba(139, 92, 246, 0.3) 1px, transparent 1px)
          `,
          backgroundSize: '30px 30px'
        }}
      />

      {/* Qubit Visualizations */}
      <div className="relative h-full flex items-center justify-around p-6">
        {qubits.map((qubit, i) => (
          <div key={i} className="flex flex-col items-center gap-3">
            {/* Bloch Sphere Representation */}
            <div className="relative w-16 h-16">
              {/* Outer ring */}
              <div className="absolute inset-0 rounded-full border-2 border-violet-500/30 animate-pulse" />
              
              {/* State vector */}
              <div 
                className="absolute top-1/2 left-1/2 w-1 bg-gradient-to-t from-violet-500 to-cyan-400 rounded-full origin-bottom transition-transform duration-75"
                style={{ 
                  height: `${Math.abs(qubit.state) * 28}px`,
                  transform: `translate(-50%, -100%) rotate(${qubit.phase}rad)`
                }}
              />
              
              {/* Center point */}
              <div className="absolute top-1/2 left-1/2 w-2 h-2 -translate-x-1/2 -translate-y-1/2 rounded-full bg-violet-400" />
            </div>

            {/* Label */}
            <span className="text-xs font-mono text-slate-400">q[{i}]</span>
            
            {/* Probability */}
            <span className="text-[10px] font-mono text-violet-400">
              {(Math.abs(qubit.state) ** 2).toFixed(2)}
            </span>
          </div>
        ))}

        {/* Gate Operations */}
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
          {['H', 'X', 'CNOT', 'T'].map((gate, i) => (
            <div key={gate} className="px-2 py-1 rounded bg-violet-600/20 border border-violet-500/30 text-[10px] font-mono text-violet-300">
              {gate}
            </div>
          ))}
        </div>
      </div>

      {/* Animated particles */}
      {isRunning && (
        <>
          {[...Array(10)].map((_, i) => (
            <div
              key={i}
              className="absolute w-1 h-1 rounded-full bg-violet-400 animate-float"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 2}s`,
                animationDuration: `${2 + Math.random() * 3}s`
              }}
            />
          ))}
        </>
      )}
    </div>
  );
}

// DNA Helix Visualization
function DNAHelix({ isAnimating }: { isAnimating: boolean }) {
  const bases = ['A', 'T', 'G', 'C', 'A', 'G', 'T', 'C', 'G', 'A'];
  
  return (
    <div className="relative h-64 flex items-center justify-center overflow-hidden">
      {/* Double helix strands */}
      <svg width="200" height="240" viewBox="0 0 200 240" className="overflow-visible">
        {/* Left strand */}
        <path
          d={isAnimating ? "M50,0 Q25,40 50,80 T50,160 T50,240" : "M50,0 C30,60 70,120 50,180 S30,220 50,240"}
          fill="none"
          stroke="#22c55e"
          strokeWidth="3"
          className={isAnimating ? 'animate-pulse' : ''}
        />
        
        {/* Right strand */}
        <path
          d={isAnimating ? "M150,0 Q175,40 150,80 T150,160 T150,240" : "M150,0 C170,60 130,120 150,180 S170,220 150,240"}
          fill="none"
          stroke="#3b82f6"
          strokeWidth="3"
          className={isAnimating ? 'animate-pulse' : ''}
        />

        {/* Base pairs */}
        {bases.map((base, i) => {
          const y = 20 + i * 22;
          const offset = isAnimating ? Math.sin((Date.now() / 300) + i) * 15 : 0;
          
          return (
            <g key={i}>
              {/* Connection line */}
              <line
                x1={50 + offset}
                y1={y}
                x2={150 - offset}
                y2={y}
                stroke="#64748b"
                strokeWidth="2"
                strokeDasharray="4,2"
              />
              
              {/* Base pair labels */}
              <text x={35 + offset} y={y + 4} fill="#22c55e" fontSize="12" fontWeight="bold">{base}</text>
              <text x={155 - offset} y={y + 4} fill="#3b82f6" fontSize="12" fontWeight="bold">
                {base === 'A' ? 'T' : base === 'T' ? 'A' : base === 'G' ? 'C' : 'G'}
              </text>
            </g>
          );
        })}
      </svg>

      {/* Glow effect */}
      <div className="absolute inset-0 bg-gradient-to-b from-green-500/10 via-transparent to-blue-500/10 pointer-events-none" />
    </div>
  );
}

// AR/VR Scene Preview
function ARVRScenePreview({ isActive }: { isActive: boolean }) {
  return (
    <div className={`relative w-full h-56 rounded-xl overflow-hidden ${isActive ? 'ring-2 ring-cyan-500/50' : ''}`}>
      {/* Virtual Environment */}
      <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-purple-900/20 to-blue-900/20">
        {/* Grid floor */}
        <div 
          className="absolute bottom-0 left-0 right-0 h-32 opacity-30"
          style={{
            backgroundImage: `
              linear-gradient(90deg, rgba(6, 182, 212, 0.5) 1px, transparent 1px),
              linear-gradient(rgba(6, 182, 212, 0.5) 1px, transparent 1px)
            `,
            backgroundSize: '20px 20px',
            perspective: '200px',
            transform: 'rotateX(60deg)',
            transformOrigin: 'bottom'
          }}
        />

        {/* Floating objects */}
        {[...Array(5)].map((_, i) => (
          <div
            key={i}
            className={`absolute rounded-lg backdrop-blur-sm border ${
              i === 0 ? 'bg-red-500/20 border-red-500/40' :
              i === 1 ? 'bg-blue-500/20 border-blue-500/40' :
              i === 2 ? 'bg-green-500/20 border-green-500/40' :
              i === 3 ? 'bg-yellow-500/20 border-yellow-500/40' :
              'bg-purple-500/20 border-purple-500/40'
            }`}
            style={{
              left: `${20 + (i * 15)}%`,
              top: `${20 + Math.sin(i) * 20}%`,
              width: `${40 + i * 10}px`,
              height: `${40 + i * 10}px`,
              animation: isActive ? `float${i % 3} ${3 + i}s ease-in-out infinite` : 'none',
              animationDelay: `${i * 0.3}s`
            }}
          >
            <div className="w-full h-full flex items-center justify-center text-white/50 text-xs">
              {['🧊', '🔮', '⚡', '🌟', '💎'][i]}
            </div>
          </div>
        ))}

        {/* AR Overlay UI */}
        <div className="absolute top-4 left-4 right-4 flex justify-between items-start">
          <div className="px-3 py-1.5 rounded-lg bg-black/50 backdrop-blur-sm border border-white/10">
            <p className="text-[10px] text-cyan-400 font-mono">AR MODE</p>
          </div>
          
          <div className="flex gap-2">
            <div className="px-2 py-1 rounded bg-black/50 backdrop-blur-sm">
              <p className="text-[10px] text-white">FPS: {isActive ? '60' : '--'}</p>
            </div>
            <div className="px-2 py-1 rounded bg-black/50 backdrop-blur-sm">
              <p className="text-[10px] text-white">Latency: {isActive ? '12ms' : '--'}</p>
            </div>
          </div>
        </div>

        {/* Crosshair */}
        {isActive && (
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
            <div className="w-8 h-8 relative">
              <div className="absolute top-0 left-1/2 w-px h-2 bg-cyan-400 -translate-x-1/2" />
              <div className="absolute bottom-0 left-1/2 w-px h-2 bg-cyan-400 -translate-x-1/2" />
              <div className="absolute left-0 top-1/2 h-px w-2 bg-cyan-400 -translate-y-1/2" />
              <div className="absolute right-0 top-1/2 h-px w-2 bg-cyan-400 -translate-y-1/2" />
              <div className="absolute top-1/2 left-1/2 w-1 h-1 rounded-full bg-cyan-400 -translate-x-1/2 -translate-y-1/2" />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// Tech Card Component
function TechCard({
  icon: Icon,
  title,
  description,
  status,
  metrics,
  children,
  onToggle,
  isActive,
  color
}: {
  icon: React.ElementType;
  title: string;
  description: string;
  status: 'experimental' | 'beta' | 'production';
  metrics?: Array<{ label: string; value: string }>;
  children?: React.ReactNode;
  onToggle: () => void;
  isActive: boolean;
  color: string;
}) {
  const statusStyles = {
    experimental: 'bg-orange-500/20 text-orange-400 border-orange-500/30',
    beta: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
    production: 'bg-green-500/20 text-green-400 border-green-500/30'
  };

  return (
    <div className={`rounded-2xl border transition-all duration-300 ${
      isActive 
        ? `bg-slate-900/90 border-${color.split('-')[1]}-500/30 shadow-lg shadow-${color.split('-')[1]}-500/10` 
        : 'bg-slate-800/50 border-slate-700/50 hover:border-slate-600/50'
    }`}>
      {/* Header */}
      <div className="p-5 pb-4">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-3">
            <div className={`p-2.5 rounded-xl bg-gradient-to-br ${color}`}>
              <Icon className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="font-semibold text-white">{title}</h3>
              <span className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase mt-1 ${statusStyles[status]}`}>
                {status}
              </span>
            </div>
          </div>

          <button
            onClick={onToggle}
            className={`p-2 rounded-lg transition-all ${
              isActive 
                ? 'bg-violet-600 text-white' 
                : 'bg-slate-700/50 text-slate-400 hover:text-white hover:bg-slate-700'
            }`}
          >
            {isActive ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
          </button>
        </div>

        <p className="text-sm text-slate-400 leading-relaxed">{description}</p>

        {/* Metrics Row */}
        {metrics && (
          <div className="flex gap-3 mt-4">
            {metrics.map((metric) => (
              <div key={metric.label} className="px-3 py-1.5 rounded-lg bg-slate-900/50 border border-slate-800/50">
                <p className="text-[10px] text-slate-500 uppercase">{metric.label}</p>
                <p className="text-sm font-mono text-white">{metric.value}</p>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Visualization Area */}
      {children && (
        <div className="px-5 pb-5">
          {children}
        </div>
      )}
    </div>
  );
}

export default function Preview5FutureLab() {
  const [activePanels, setActivePanels] = useState<Set<string>>(new Set());
  const [globalAnimation, setGlobalAnimation] = useState(true);
  const { playSound } = useSound();

  const togglePanel = useCallback((panelId: string) => {
    playSound('click', 0.25);
    
    setActivePanels(prev => {
      const next = new Set(prev);
      if (next.has(panelId)) {
        next.delete(panelId);
        playSound('close', 0.2);
      } else {
        next.add(panelId);
        playSound('success', 0.3);
      }
      return next;
    });
  }, [playSound]);

  const toggleAll = () => {
    if (activePanels.size > 0) {
      setActivePanels(new Set());
      playSound('close', 0.3);
    } else {
      setActivePanels(new Set(['quantum', 'genomics', 'arvr']));
      playSound('sparkle', 0.4);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 text-white p-6 md:p-8">
      {/* Header */}
      <div className="max-w-7xl mx-auto mb-8">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-gradient-to-br from-red-500 to-rose-600">
              <Rocket className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold">Future Tech Lab</h1>
              <p className="text-slate-400">Quantum Computing • AR/VR • Genomics</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => {
                setGlobalAnimation(!globalAnimation);
                playSound(globalAnimation ? 'pause' : 'play', 0.25);
              }}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
            >
              {globalAnimation ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
              Animations
            </button>

            <button
              onClick={toggleAll}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-violet-600 hover:bg-violet-500 text-white transition-colors"
            >
              <Sparkles className="w-4 h-4" />
              {activePanels.size > 0 ? 'Stop All' : 'Start All'}
            </button>
          </div>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Top Row - Main Panels */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Quantum Computing Panel */}
          <TechCard
            icon={Atom}
            title="Quantum Computing"
            description="Explore quantum circuits and qubit states. Simulate quantum algorithms with real-time visualization of superposition and entanglement."
            status="experimental"
            color="from-violet-600 to-purple-700"
            onToggle={() => togglePanel('quantum')}
            isActive={activePanels.has('quantum')}
            metrics={[
              { label: 'Qubits', value: '4' },
              { label: 'Fidelity', value: '99.7%' },
              { label: 'Gate Time', value: '20ns' }
            ]}
          >
            <QuantumCircuit isRunning={activePanels.has('quantum') && globalAnimation} />
          </TechCard>

          {/* AR/VR Panel */}
          <TechCard
            icon={Glasses}
            title="AR/VR Environment"
            description="Immersive mixed reality workspace. Visualize data in 3D space, interact with holographic interfaces, and explore virtual environments."
            status="beta"
            color="from-cyan-600 to-blue-700"
            onToggle={() => togglePanel('arvr')}
            isActive={activePanels.has('arvr')}
            metrics={[
              { label: 'Resolution', value: '4K/eye' },
              { label: 'FOV', value: '110°' },
              { label: 'Refresh', value: '120Hz' }
            ]}
          >
            <ARVRScenePreview isActive={activePanels.has('arvr') && globalAnimation} />
          </TechCard>
        </div>

        {/* Bottom Row - Genomics & Additional */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Genomics Panel */}
          <TechCard
            icon={Dna}
            title="Genomics Platform"
            description="Analyze DNA sequences, visualize protein structures, and simulate molecular interactions for drug discovery research."
            status="beta"
            color="from-green-600 to-emerald-700"
            onToggle={() => togglePanel('genomics')}
            isActive={activePanels.has('genomics')}
            metrics={[
              { label: 'Base Pairs', value: '3.2B' },
              { label: 'Genes', value: '~20K' },
              { label: 'Coverage', value: '99.9%' }
            ]}
          >
            <DNAHelix isAnimating={activePanels.has('genomics') && globalAnimation} />
          </TechCard>

          {/* AI Research Assistant */}
          <TechCard
            icon={Brain}
            title="AI Research Lab"
            description="Neural network visualization, model training dashboards, and automated experiment design powered by advanced AI systems."
            status="production"
            color="from-pink-600 to-rose-700"
            onToggle={() => togglePanel('ai')}
            isActive={activePanels.has('ai')}
            metrics={[
              { label: 'Models', value: '12' },
              { label: 'Accuracy', value: '97.3%' },
              { label: 'Inference', value: '<5ms' }
            ]}
          >
            <div className="h-48 flex items-center justify-center bg-slate-950 rounded-xl border border-slate-800">
              <div className="text-center space-y-3">
                <Brain className="w-12 h-12 mx-auto text-pink-400 animate-pulse" />
                <p className="text-sm text-slate-400">Neural Network Visualization</p>
                
                {/* Simple neural net representation */}
                <div className="flex items-center justify-center gap-2 pt-2">
                  {[3, 4, 4, 2].map((nodes, layerIdx) => (
                    <div key={layerIdx} className="flex flex-col gap-2">
                      {[...Array(nodes)].map((_, nodeIdx) => (
                        <div
                          key={nodeIdx}
                          className={`w-3 h-3 rounded-full ${
                            activePanels.has('ai') && globalAnimation
                              ? 'bg-pink-400 animate-pulse'
                              : 'bg-slate-700'
                          }`}
                          style={{ animationDelay: `${(layerIdx + nodeIdx) * 0.1}s` }}
                        />
                      ))}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </TechCard>

          {/* Nanotechnology */}
          <TechCard
            icon={Microscope}
            title="Nanotech Lab"
            description="Molecular assembly simulation, nanomaterial analysis, and atomic-scale engineering tools for cutting-edge research."
            status="experimental"
            color="from-yellow-600 to-orange-700"
            onToggle={() => togglePanel('nano')}
            isActive={activePanels.has('nano')}
            metrics={[
              { label: 'Scale', value: 'nm' },
              { label: 'Atoms', value: '~10⁶' },
              { label: 'Precision', value: '0.1nm' }
            ]}
          >
            <div className="h-48 flex items-center justify-center bg-slate-950 rounded-xl border border-slate-800 relative overflow-hidden">
              {/* Atomic lattice pattern */}
              <div 
                className="absolute inset-0 opacity-20"
                style={{
                  backgroundImage: `
                    radial-gradient(circle at 20% 30%, rgba(234, 179, 8, 0.8) 2px, transparent 2px),
                    radial-gradient(circle at 50% 50%, rgba(234, 179, 8, 0.8) 2px, transparent 2px),
                    radial-gradient(circle at 80% 70%, rgba(234, 179, 8, 0.8) 2px, transparent 2px),
                    radial-gradient(circle at 35% 70%, rgba(234, 179, 8, 0.8) 2px, transparent 2px),
                    radial-gradient(circle at 65% 30%, rgba(234, 179, 8, 0.8) 2px, transparent 2px)
                  `,
                  backgroundSize: '100% 100%'
                }}
              />
              
              {/* Floating molecules */}
              {activePanels.has('nano') && globalAnimation && [...Array(6)].map((_, i) => (
                <div
                  key={i}
                  className="absolute w-4 h-4 rounded-full bg-yellow-400/60 animate-spin"
                  style={{
                    left: `${20 + Math.random() * 60}%`,
                    top: `${20 + Math.random() * 60}%`,
                    animationDuration: `${3 + Math.random() * 4}s`,
                    animationDelay: `${i * 0.5}s`
                  }}
                />
              ))}

              <Microscope className={`w-10 h-10 text-yellow-400/50 ${activePanels.has('nano') && globalAnimation ? 'animate-bounce' : ''}`} />
            </div>
          </TechCard>
        </div>

        {/* Status Bar */}
        <div className="mt-8 p-4 rounded-xl bg-slate-800/30 border border-slate-700/50">
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-6">
              <span className="text-slate-400">
                Active Modules: <span className="text-white font-medium">{activePanels.size}</span>
              </span>
              <span className="text-slate-400">
                Status: <span className={`${activePanels.size > 0 ? 'text-green-400' : 'text-slate-500'}`}>
                  {activePanels.size > 0 ? '● Running' : '○ Idle'}
                </span>
              </span>
            </div>

            <div className="flex items-center gap-4 text-slate-500">
              <span className="flex items-center gap-1">
                <Thermometer className="w-4 h-4" /> 42°C
              </span>
              <span className="flex items-center gap-1">
                <Activity className="w-4 h-4" /> {activePanels.size > 0 ? 'High' : 'Low'}
              </span>
              <span className="flex items-center gap-1">
                <Battery className="w-4 h-4" /> 87%
              </span>
            </div>
          </div>
        </div>
      </div>

    </div>
  );
}
