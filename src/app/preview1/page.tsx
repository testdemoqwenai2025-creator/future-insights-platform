'use client';

import { useState, useEffect, useCallback } from 'react';
import { useSound } from '@/hooks/useSound';
import {
  Sparkles,
  Zap,
  Shield,
  Globe,
  ArrowRight,
  Play,
  Star,
  Heart,
  Rocket,
  Brain,
  Cpu,
  Network,
  ChevronDown,
  Waves,
  Atom,
  Eye,
  MousePointerClick,
  Terminal,
  Database,
  Lock,
  Users,
  TrendingUp,
  Lightbulb,
  MessageSquare,
  Github,
  ExternalLink,
  CheckCircle2
} from 'lucide-react';

// Animated background particles
function ParticleBackground() {
  const [particles, setParticles] = useState<Array<{ id: number; x: number; y: number; size: number; duration: number; delay: number }>>([]);

  useEffect(() => {
    const newParticles = Array.from({ length: 30 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: Math.random() * 4 + 2,
      duration: Math.random() * 20 + 10,
      delay: Math.random() * 5
    }));
    setParticles(newParticles);
  }, []);

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {particles.map((p) => (
        <div
          key={p.id}
          className="absolute rounded-full bg-violet-400/20 animate-float"
          style={{
            left: `${p.x}%`,
            top: `${p.y}%`,
            width: p.size,
            height: p.size,
            animationDuration: `${p.duration}s`,
            animationDelay: `${p.delay}s`
          }}
        />
      ))}
    </div>
  );
}

// Typing animation component
function TypeWriter({ text, speed = 50 }: { text: string; speed?: number }) {
  const [displayText, setDisplayText] = useState('');
  const [currentIndex, setCurrentIndex] = useState(0);
  const { playSound } = useSound();

  useEffect(() => {
    if (currentIndex < text.length) {
      const timeout = setTimeout(() => {
        setDisplayText(prev => prev + text[currentIndex]);
        setCurrentIndex(prev => prev + 1);
        if (currentIndex % 3 === 0) {
          playSound('typing', 0.1);
        }
      }, speed);
      return () => clearTimeout(timeout);
    }
  }, [currentIndex, text, speed, playSound]);

  return (
    <span>
      {displayText}
      <span className="animate-pulse text-violet-400">|</span>
    </span>
  );
}

// Feature card with hover effects
function FeatureCard({ 
  icon: Icon, 
  title, 
  description, 
  color,
  index,
  onHover 
}: { 
  icon: React.ElementType; 
  title: string; 
  description: string;
  color: string;
  index: number;
  onHover: () => void;
}) {
  return (
    <div
      onMouseEnter={onHover}
      className="
        group relative p-6 rounded-2xl 
        bg-gradient-to-br from-slate-800/80 to-slate-900/80
        backdrop-blur-sm border border-slate-700/50
        hover:border-violet-500/50 transition-all duration-300
        hover:scale-[1.02] hover:shadow-xl hover:shadow-violet-500/10
        cursor-pointer overflow-hidden
      "
      style={{ animationDelay: `${index * 100}ms` }}
    >
      {/* Glow effect */}
      <div className={`absolute inset-0 bg-gradient-to-br ${color} opacity-0 group-hover:opacity-10 transition-opacity duration-300`} />
      
      {/* Icon */}
      <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
        <Icon className="w-6 h-6 text-white" />
      </div>

      {/* Content */}
      <h3 className="text-lg font-semibold text-white mb-2 group-hover:text-violet-200 transition-colors">
        {title}
      </h3>
      <p className="text-sm text-slate-400 leading-relaxed">
        {description}
      </p>

      {/* Arrow indicator */}
      <ArrowRight className="absolute bottom-4 right-4 w-5 h-5 text-slate-600 group-hover:text-violet-400 group-hover:translate-x-1 transition-all" />
    </div>
  );
}

// Stats counter animation
function AnimatedCounter({ target, suffix = '', prefix = '' }: { target: number; suffix?: string; prefix?: string }) {
  const [count, setCount] = useState(0);
  
  useEffect(() => {
    const duration = 2000;
    const steps = 60;
    const increment = target / steps;
    let current = 0;
    
    const timer = setInterval(() => {
      current += increment;
      if (current >= target) {
        setCount(target);
        clearInterval(timer);
      } else {
        setCount(Math.floor(current));
      }
    }, duration / steps);
    
    return () => clearInterval(timer);
  }, [target]);

  return (
    <span className="tabular-nums">
      {prefix}{count.toLocaleString()}{suffix}
    </span>
  );
}

export default function Preview1Landing() {
  const [isLoaded, setIsLoaded] = useState(false);
  const [activeFeature, setActiveFeature] = useState<number | null>(null);
  const [showCTA, setShowCTA] = useState(false);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const { playSound } = useSound();

  useEffect(() => {
    // Staggered entrance animations
    setTimeout(() => setIsLoaded(true), 100);
    setTimeout(() => setShowCTA(true), 1500);
    
    // Welcome sound after a brief delay
    setTimeout(() => {
      playSound('sparkle', 0.3);
    }, 800);
  }, []);

  // Track mouse for parallax effect
  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    const rect = e.currentTarget.getBoundingClientRect();
    setMousePosition({
      x: (e.clientX - rect.left) / rect.width - 0.5,
      y: (e.clientY - rect.top) / rect.height - 0.5
    });
  }, []);

  const features = [
    {
      icon: Brain,
      title: 'AI-Powered Intelligence',
      description: 'Advanced neural networks that learn and adapt to your workflow, providing intelligent suggestions and automating complex tasks.',
      color: 'from-violet-500 to-purple-600'
    },
    {
      icon: Shield,
      title: 'Enterprise Security',
      description: 'Military-grade encryption with zero-knowledge architecture. Your data remains yours, always protected, always private.',
      color: 'from-green-500 to-emerald-600'
    },
    {
      icon: Zap,
      title: 'Lightning Performance',
      description: 'Sub-millisecond response times with edge computing. Built for scale, optimized for speed, designed for real-time collaboration.',
      color: 'from-yellow-500 to-orange-600'
    },
    {
      icon: Network,
      title: 'Universal Connectivity',
      description: 'Seamless integration with 200+ services and platforms. One hub to connect them all, with custom connectors for unique needs.',
      color: 'from-blue-500 to-cyan-600'
    },
    {
      icon: Cpu,
      title: 'Quantum-Ready Architecture',
      description: 'Future-proof infrastructure designed for the quantum computing era. Hybrid classical-quantum algorithms ready to deploy.',
      color: 'from-pink-500 to-rose-600'
    },
    {
      icon: Users,
      title: 'Collaborative Intelligence',
      description: 'Real-time collaboration with AI-assisted workflows. Teams work smarter together, with context-aware suggestions.',
      color: 'from-indigo-500 to-violet-600'
    }
  ];

  const stats = [
    { value: 99.9, suffix: '%', label: 'Uptime SLA', icon: CheckCircle2 },
    { value: 50, suffix: 'ms', label: 'Avg Response', icon: Zap },
    { value: 10000, suffix: '+', label: 'Active Users', icon: Users },
    { value: 256, suffix: '-bit', label: 'Encryption', icon: Lock }
  ];

  return (
    <div 
      className={`min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 text-white overflow-hidden transition-opacity duration-1000 ${isLoaded ? 'opacity-100' : 'opacity-0'}`}
      onMouseMove={handleMouseMove}
    >
      {/* Animated Background */}
      <ParticleBackground />
      
      {/* Gradient Orbs that follow mouse slightly */}
      <div 
        className="fixed w-[600px] h-[600px] rounded-full bg-violet-600/20 blur-[120px] pointer-events-none transition-transform duration-1000 ease-out"
        style={{ 
          transform: `translate(${mousePosition.x * 50}px, ${mousePosition.y * 50}px)`,
          top: '-200px',
          right: '-200px'
        }}
      />
      <div 
        className="fixed w-[400px] h-[400px] rounded-full bg-cyan-600/15 blur-[100px] pointer-events-none transition-transform duration-1000 ease-out"
        style={{ 
          transform: `translate(${mousePosition.x * -30}px, ${mousePosition.y * -30}px)`,
          bottom: '-100px',
          left: '-100px'
        }}
      />

      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center px-6 pt-24 pb-16">
        <div className="max-w-6xl mx-auto text-center">
          {/* Badge */}
          <div 
            className={`inline-flex items-center gap-2 px-4 py-2 rounded-full bg-violet-500/10 border border-violet-500/30 mb-8 transition-all duration-700 ${isLoaded ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}
            onClick={() => playSound('click', 0.2)}
          >
            <Sparkles className="w-4 h-4 text-violet-400" />
            <span className="text-sm text-violet-300 font-medium">Introducing AETH-1 v2.0</span>
            <span className="flex h-2 w-2 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-violet-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-violet-500"></span>
            </span>
          </div>

          {/* Main Heading */}
          <h1 
            className={`text-5xl md:text-7xl lg:text-8xl font-bold tracking-tight mb-6 transition-all duration-1000 delay-200 ${isLoaded ? 'translate-y-0 opacity-100' : 'translate-y-20 opacity-0'}`}
          >
            <span className="bg-gradient-to-r from-white via-violet-200 to-white bg-clip-text text-transparent">
              The Future of
            </span>
            <br />
            <span className="bg-gradient-to-r from-violet-400 via-purple-400 to-cyan-400 bg-clip-text text-transparent relative">
              <TypeWriter text="Intelligent Systems" speed={80} />
            </span>
          </h1>

          {/* Subtitle */}
          <p 
            className={`text-xl md:text-2xl text-slate-400 max-w-3xl mx-auto mb-12 leading-relaxed transition-all duration-1000 delay-500 ${isLoaded ? 'translate-y-0 opacity-100' : 'translate-y-20 opacity-0'}`}
          >
            Experience the next generation of AI-powered technology. 
            Built for innovators, designed for humans, engineered for impact.
          </p>

          {/* CTA Buttons */}
          <div 
            className={`flex flex-col sm:flex-row items-center justify-center gap-4 transition-all duration-1000 delay-700 ${showCTA ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}
          >
            <button
              onClick={() => {
                playSound('success', 0.4);
                playSound('whoosh', 0.3);
              }}
              className="
                group relative px-8 py-4 rounded-2xl
                bg-gradient-to-r from-violet-600 to-indigo-600
                font-semibold text-lg
                shadow-lg shadow-violet-500/30
                hover:shadow-xl hover:shadow-violet-500/40
                hover:scale-105 active:scale-95
                transition-all duration-300
                overflow-hidden
              "
            >
              <span className="relative z-10 flex items-center gap-2">
                <Rocket className="w-5 h-5 group-hover:animate-bounce" />
                Get Started Free
              </span>
              <div className="absolute inset-0 bg-gradient-to-r from-indigo-600 to-purple-600 opacity-0 group-hover:opacity-100 transition-opacity" />
            </button>

            <button
              onClick={() => {
                playSound('open', 0.35);
              }}
              className="
                group px-8 py-4 rounded-2xl
                border border-slate-700 hover:border-violet-500/50
                font-semibold text-lg text-slate-300 hover:text-white
                bg-slate-800/50 hover:bg-slate-800
                transition-all duration-300
                hover:scale-105 active:scale-95
                flex items-center gap-2
              "
            >
              <Play className="w-5 h-5 text-violet-400" />
              Watch Demo
            </button>
          </div>

          {/* Social Proof */}
          <div 
            className={`mt-16 flex flex-col items-center gap-4 transition-all duration-1000 delay-1000 ${isLoaded ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}
          >
            <div className="flex items-center -space-x-3">
              {[...Array(5)].map((_, i) => (
                <div 
                  key={i} 
                  className="w-10 h-10 rounded-full bg-gradient-to-br from-violet-500 to-purple-600 border-2 border-slate-900 flex items-center justify-center text-xs font-bold"
                  onClick={() => playSound('pop', 0.2)}
                >
                  {String.fromCharCode(65 + i)}
                </div>
              ))}
            </div>
            <p className="text-sm text-slate-500">
              Trusted by <span className="text-white font-semibold">10,000+</span> developers worldwide
            </p>
            <div className="flex items-center gap-1">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="w-4 h-4 text-yellow-400 fill-yellow-400" />
              ))}
              <span className="ml-2 text-sm text-slate-400">5.0 rating from 2,000+ reviews</span>
            </div>
          </div>
        </div>

        {/* Scroll Indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce">
          <ChevronDown className="w-6 h-6 text-slate-500" />
        </div>
      </section>

      {/* Features Section */}
      <section className="relative py-24 px-6">
        <div className="max-w-7xl mx-auto">
          {/* Section Header */}
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-4">
              <span className="bg-gradient-to-r from-violet-400 to-cyan-400 bg-clip-text text-transparent">
                Powerful Capabilities
              </span>
            </h2>
            <p className="text-xl text-slate-400 max-w-2xl mx-auto">
              Everything you need to build, deploy, and scale intelligent applications
            </p>
          </div>

          {/* Feature Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, index) => (
              <FeatureCard
                key={feature.title}
                {...feature}
                index={index}
                onHover={() => {
                  setActiveFeature(index);
                  playSound('hover', 0.15);
                }}
              />
            ))}
          </div>
        </div>
      </section>

      {/* Live Stats Section */}
      <section className="relative py-24 px-6 bg-slate-900/50">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div 
                key={stat.label}
                className="text-center group"
                onMouseEnter={() => playSound('pop', 0.15)}
              >
                <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-slate-800 group-hover:bg-violet-600/20 transition-colors mb-4">
                  <stat.icon className="w-6 h-6 text-violet-400" />
                </div>
                <div className="text-3xl md:text-4xl font-bold text-white mb-1">
                  <AnimatedCounter target={stat.value} suffix={stat.suffix} />
                </div>
                <p className="text-sm text-slate-500">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Interactive Demo Section */}
      <section className="relative py-24 px-6">
        <div className="max-w-5xl mx-auto">
          <div className="relative rounded-3xl bg-gradient-to-br from-slate-800/90 to-slate-900/90 backdrop-blur-xl border border-slate-700/50 p-8 md:p-12 overflow-hidden">
            {/* Decorative Elements */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-violet-600/10 rounded-full blur-3xl" />
            <div className="absolute bottom-0 left-0 w-48 h-48 bg-cyan-600/10 rounded-full blur-3xl" />

            <div className="relative grid md:grid-cols-2 gap-8 items-center">
              {/* Left - Terminal Preview */}
              <div className="rounded-2xl bg-slate-950/80 border border-slate-800 overflow-hidden">
                <div className="flex items-center gap-2 px-4 py-3 bg-slate-900/80 border-b border-slate-800">
                  <div className="w-3 h-3 rounded-full bg-red-500" />
                  <div className="w-3 h-3 rounded-full bg-yellow-500" />
                  <div className="w-3 h-3 rounded-full bg-green-500" />
                  <span className="ml-2 text-xs text-slate-500 font-mono">aeth-terminal</span>
                </div>
                <div className="p-4 font-mono text-sm space-y-2">
                  <p className="text-slate-500">$ aeth init my-project</p>
                  <p className="text-green-400">✓ Project initialized successfully</p>
                  <p className="text-slate-500">$ aeth deploy --prod</p>
                  <p className="text-cyan-400">→ Deploying to edge network...</p>
                  <p className="text-violet-400 animate-pulse">● Building quantum modules...</p>
                </div>
              </div>

              {/* Right - Content */}
              <div>
                <h3 className="text-2xl font-bold text-white mb-4">
                  Ready in Seconds
                </h3>
                <p className="text-slate-400 mb-6 leading-relaxed">
                  Get started with our intuitive CLI or web interface. Deploy your first 
                  intelligent application in under 60 seconds with zero configuration.
                </p>
                
                <div className="space-y-3">
                  {['Zero-config setup', 'Auto-scaling infrastructure', 'Built-in monitoring'].map((item, i) => (
                    <div key={item} className="flex items-center gap-3">
                      <CheckCircle2 className="w-5 h-5 text-green-400 shrink-0" />
                      <span className="text-slate-300">{item}</span>
                    </div>
                  ))}
                </div>

                <button
                  onClick={() => {
                    playSound('success', 0.35);
                  }}
                  className="mt-6 px-6 py-3 rounded-xl bg-violet-600 hover:bg-violet-500 font-medium transition-all hover:scale-105 active:scale-95 flex items-center gap-2"
                >
                  <Terminal className="w-4 h-4" />
                  Try it Now
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA Section */}
      <section className="relative py-32 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl md:text-6xl font-bold mb-6">
            Ready to Build the
            <br />
            <span className="bg-gradient-to-r from-violet-400 via-purple-400 to-cyan-400 bg-clip-text text-transparent">
              Future Together?
            </span>
          </h2>
          <p className="text-xl text-slate-400 mb-10 max-w-2xl mx-auto">
            Join thousands of innovators already using AETH-1 to create 
            extraordinary experiences.
          </p>
          
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <button
              onClick={() => {
                playSound('sparkle', 0.4);
                playSound('success', 0.3);
              }}
              className="group px-10 py-5 rounded-2xl bg-gradient-to-r from-violet-600 to-indigo-600 text-lg font-semibold shadow-xl shadow-violet-500/30 hover:shadow-violet-500/50 hover:scale-105 active:scale-95 transition-all flex items-center gap-3"
            >
              <Rocket className="w-5 h-5 group-hover:animate-bounce" />
              Start Your Journey
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </button>
            
            <button
              onClick={() => playSound('open', 0.3)}
              className="group px-10 py-5 rounded-2xl border border-slate-700 hover:border-violet-500/50 text-slate-300 hover:text-white transition-all hover:scale-105 active:scale-95 flex items-center gap-3"
            >
              <Github className="w-5 h-5" />
              View on GitHub
            </button>
          </div>

          <p className="mt-8 text-sm text-slate-500">
            No credit card required • Free tier available • Cancel anytime
          </p>
        </div>
      </section>

    </div>
  );
}
