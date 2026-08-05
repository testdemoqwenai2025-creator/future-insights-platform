'use client';

import { useState, useEffect, useCallback } from 'react';
import { useSound } from '@/hooks/useSound';
import { 
  Menu, 
  X, 
  Home, 
  LayoutDashboard, 
  Code2, 
  FlaskConical, 
  Rocket,
  Sparkles,
  ChevronRight,
  Atom,
  Globe,
  Settings,
  Heart,
  Info,
  ExternalLink,
  Zap,
  Moon,
  Sun,
  Volume2,
  VolumeX
} from 'lucide-react';

export interface MenuItem {
  id: string;
  label: string;
  icon: React.ReactNode;
  href: string;
  description?: string;
  badge?: string;
  color?: string;
  submenu?: MenuItem[];
}

interface SandwichMenuProps {
  currentPage: string;
  onNavigate: (page: string) => void;
  isDarkMode: boolean;
  onToggleDarkMode: () => void;
  soundEnabled: boolean;
  onToggleSound: () => void;
}

const menuItems: MenuItem[] = [
  {
    id: 'preview1',
    label: 'Landing',
    icon: <Home className="w-5 h-5" />,
    href: '/preview1',
    description: 'Welcome & Introduction',
    color: 'from-blue-500 to-cyan-500',
    badge: 'NEW'
  },
  {
    id: 'preview2',
    label: 'Frontend Hub',
    icon: <Code2 className="w-5 h-5" />,
    href: '/preview2',
    description: 'API Explorer & Connectors',
    color: 'from-purple-500 to-pink-500'
  },
  {
    id: 'preview3',
    label: 'Dashboard',
    icon: <LayoutDashboard className="w-5 h-5" />,
    href: '/preview3',
    description: 'Live Metrics & Analytics',
    color: 'from-green-500 to-emerald-500',
    badge: 'LIVE'
  },
  {
    id: 'preview4',
    label: 'Studio IDE',
    icon: <FlaskConical className="w-5 h-5" />,
    href: '/preview4',
    description: 'Interactive Development Environment',
    color: 'from-orange-500 to-yellow-500'
  },
  {
    id: 'preview5',
    label: 'Future Lab',
    icon: <Rocket className="w-5 h-5" />,
    href: '/preview5',
    description: 'Quantum, AR/VR & Genomics',
    color: 'from-red-500 to-rose-500',
    badge: 'BETA'
  }
];

const utilityItems: MenuItem[] = [
  {
    id: 'settings',
    label: 'Settings',
    icon: <Settings className="w-4 h-4" />,
    href: '#settings',
    description: 'Preferences & Config'
  },
  {
    id: 'about',
    label: 'About AETH-1',
    icon: <Info className="w-4 h-4" />,
    href: '#about',
    description: 'Version & Credits'
  }
];

export default function SandwichMenu({ 
  currentPage, 
  onNavigate, 
  isDarkMode,
  onToggleDarkMode,
  soundEnabled,
  onToggleSound
}: SandwichMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [activeSubmenu, setActiveSubmenu] = useState<string | null>(null);
  const [isAnimating, setIsAnimating] = useState(false);
  const [hoveredItem, setHoveredItem] = useState<string | null>(null);
  const { playSound } = useSound();

  const toggleMenu = useCallback(() => {
    if (!isAnimating) {
      setIsAnimating(true);
      setIsOpen(!isOpen);
      playSound(isOpen ? 'close' : 'open', 0.4);
      
      // Add a subtle vibration pattern for mobile
      if (typeof navigator !== 'undefined' && navigator.vibrate) {
        navigator.vibrate(isOpen ? [10, 20, 10] : [30]);
      }

      setTimeout(() => setIsAnimating(false), 300);
    }
  }, [isOpen, isAnimating, playSound]);

  const handleNavigate = useCallback((pageId: string) => {
    playSound('click', 0.35);
    playSound('whoosh', 0.25);
    onNavigate(pageId);
    setIsOpen(false);
    
    // Satisfying multi-tap vibration
    if (typeof navigator !== 'undefined' && navigator.vibrate) {
      navigator.vibrate([20, 50, 20]);
    }
  }, [onNavigate, playSound]);

  const handleHover = useCallback((itemId: string | null) => {
    if (itemId !== hoveredItem) {
      setHoveredItem(itemId);
      if (itemId && soundEnabled) {
        playSound('hover', 0.15);
      }
    }
  }, [hoveredItem, soundEnabled, playSound]);

  const handleUtilityAction = useCallback((action: string) => {
    playSound('pop', 0.3);
    
    switch (action) {
      case 'toggleDark':
        onToggleDarkMode();
        playSound(isDarkMode ? 'transition' : 'sparkle', 0.3);
        break;
      case 'toggleSound':
        onToggleSound();
        playSound(soundEnabled ? 'close' : 'open', 0.3);
        break;
    }
  }, [playSound, onToggleDarkMode, onToggleSound, isDarkMode, soundEnabled]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Cmd/Ctrl + K to toggle menu
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        toggleMenu();
      }
      // Escape to close
      if (e.key === 'Escape' && isOpen) {
        toggleMenu();
      }
      // Number keys 1-5 for quick navigation when menu is open
      if (isOpen && e.key >= '1' && e.key <= '5') {
        const index = parseInt(e.key) - 1;
        if (menuItems[index]) {
          handleNavigate(menuItems[index].id);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, toggleMenu, handleNavigate]);

  // Prevent body scroll when menu is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  return (
    <>
      {/* Floating Toggle Button */}
      <button
        onClick={toggleMenu}
        className={`
          fixed top-4 left-4 z-50 
          w-14 h-14 rounded-2xl 
          flex items-center justify-center
          transition-all duration-300 ease-out
          ${isOpen 
            ? 'bg-gradient-to-br from-red-500 to-pink-600 shadow-lg shadow-red-500/30 rotate-90 scale-90' 
            : 'bg-gradient-to-br from-violet-600 to-indigo-700 shadow-lg shadow-violet-500/40 hover:shadow-xl hover:shadow-violet-500/50 hover:scale-105 active:scale-95'
          }
          backdrop-blur-sm border border-white/10
          group overflow-hidden
        `}
        aria-label={isOpen ? 'Close menu' : 'Open menu'}
      >
        {/* Animated background shimmer */}
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
        
        {isOpen ? (
          <X className="w-6 h-6 text-white relative z-10" />
        ) : (
          <div className="relative z-10 flex flex-col gap-1.5">
            <span className={`block w-6 h-0.5 bg-white rounded-full transition-all duration-300 ${!isOpen ? '' : 'rotate-45 translate-y-2'}`} />
            <span className={`block w-6 h-0.5 bg-white rounded-full transition-all duration-300 ${!isOpen ? '' : 'opacity-0'}`} />
            <span className={`block w-6 h-0.5 bg-white rounded-full transition-all duration-300 ${!isOpen ? '' : '-rotate-45 -translate-y-2'}`} />
          </div>
        )}
      </button>

      {/* Backdrop */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/60 backdrop-blur-md z-40 transition-opacity duration-300"
          onClick={toggleMenu}
        />
      )}

      {/* Side Panel */}
      <div className={`
        fixed top-0 left-0 h-full w-[380px] max-w-[90vw]
        bg-gradient-to-b from-slate-900 via-slate-900 to-slate-950
        z-50 transform transition-all duration-300 ease-out
        shadow-2xl shadow-black/50
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}
        overflow-hidden
      `}>
        {/* Decorative Elements */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-bl from-violet-600/20 to-transparent rounded-full blur-3xl -translate-y-32 translate-x-32" />
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-gradient-to-tr from-cyan-600/15 to-transparent rounded-full blur-3xl translate-y-24 -translate-x-24" />

        <div className="relative h-full flex flex-col">
          {/* Header */}
          <div className="p-6 pb-4">
            <div className="flex items-center justify-between mb-6 mt-12 ml-16">
              <div>
                <h2 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
                  <Sparkles className="w-6 h-6 text-violet-400 animate-pulse" />
                  AETH-1
                </h2>
                <p className="text-xs text-slate-400 mt-1 font-medium">Navigation Hub</p>
              </div>
              
              {/* Quick Actions */}
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleUtilityAction('toggleSound')}
                  className={`
                    p-2 rounded-lg transition-all duration-200
                    ${soundEnabled 
                      ? 'bg-slate-800 text-violet-400 hover:bg-slate-700' 
                      : 'bg-slate-800/50 text-slate-500 hover:bg-slate-800'
                    }
                  `}
                  title={soundEnabled ? 'Mute sounds' : 'Enable sounds'}
                >
                  {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
                </button>
                <button
                  onClick={() => handleUtilityAction('toggleDark')}
                  className="p-2 rounded-lg bg-slate-800 text-yellow-400 hover:bg-slate-700 transition-all duration-200"
                  title="Toggle theme"
                >
                  {isDarkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Current Page Indicator */}
            <div className="ml-16 px-4 py-2 bg-slate-800/50 rounded-lg border border-slate-700/50">
              <p className="text-[10px] uppercase tracking-widest text-slate-500 font-semibold">Currently Viewing</p>
              <p className="text-sm text-white font-medium capitalize">{currentPage.replace('preview', 'Preview ')}</p>
            </div>

            {/* Keyboard Hint */}
            <div className="mt-3 ml-16 flex items-center gap-2 text-[10px] text-slate-500">
              <kbd className="px-1.5 py-0.5 bg-slate-800 rounded text-slate-400 font-mono">⌘K</kbd>
              <span>to toggle</span>
              <kbd className="px-1.5 py-0.5 bg-slate-800 rounded text-slate-400 font-mono">1-5</kbd>
              <span>quick nav</span>
            </div>
          </div>

          {/* Navigation Items */}
          <nav className="flex-1 px-4 space-y-2 overflow-y-auto">
            {menuItems.map((item, index) => (
              <button
                key={item.id}
                onClick={() => handleNavigate(item.id)}
                onMouseEnter={() => handleHover(item.id)}
                onMouseLeave={() => handleHover(null)}
                className={`
                  w-full group relative
                  p-4 rounded-xl
                  transition-all duration-200 ease-out
                  ${currentPage === item.id 
                    ? 'bg-gradient-to-r from-violet-600/20 to-indigo-600/10 border border-violet-500/30' 
                    : 'bg-slate-800/30 hover:bg-slate-800/60 border border-transparent hover:border-slate-700/50'
                  }
                  transform hover:scale-[1.02] active:scale-[0.98]
                  overflow-hidden
                `}
                style={{ animationDelay: `${index * 50}ms` }}
              >
                {/* Hover Glow Effect */}
                {hoveredItem === item.id && (
                  <div className={`absolute inset-0 bg-gradient-to-r ${item.color} opacity-10 animate-pulse`} />
                )}
                
                <div className="relative flex items-start gap-4">
                  {/* Icon Container */}
                  <div className={`
                    p-2.5 rounded-xl shrink-0 transition-all duration-200
                    ${currentPage === item.id 
                      ? `bg-gradient-to-br ${item.color} text-white shadow-lg` 
                      : 'bg-slate-700/50 text-slate-400 group-hover:text-white group-hover:bg-slate-600/50'
                    }
                  `}>
                    {item.icon}
                  </div>
                  
                  {/* Content */}
                  <div className="flex-1 text-left min-w-0">
                    <div className="flex items-center gap-2">
                      <span className={`font-semibold transition-colors ${
                        currentPage === item.id ? 'text-white' : 'text-slate-200 group-hover:text-white'
                      }`}>
                        {item.label}
                      </span>
                      {item.badge && (
                        <span className={`
                          px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider rounded-full
                          ${item.badge === 'LIVE' 
                            ? 'bg-green-500/20 text-green-400 animate-pulse' 
                            : item.badge === 'BETA'
                            ? 'bg-orange-500/20 text-orange-400'
                            : 'bg-violet-500/20 text-violet-400'
                          }
                        `}>
                          {item.badge}
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-500 mt-0.5 truncate">{item.description}</p>
                  </div>

                  {/* Arrow */}
                  <ChevronRight className={`
                    w-4 h-4 shrink-0 transition-all duration-200 mt-1
                    ${currentPage === item.id ? 'text-violet-400 translate-x-0' : 'text-slate-600 opacity-0 group-hover:opacity-100 group-hover:translate-x-0 -translate-x-2'}
                  `} />
                </div>

                {/* Number Shortcut Badge */}
                <div className="absolute top-2 right-2 w-5 h-5 rounded bg-slate-700/80 flex items-center justify-center">
                  <span className="text-[9px] font-mono text-slate-400">{index + 1}</span>
                </div>
              </button>
            ))}
          </nav>

          {/* Utility Section */}
          <div className="p-4 border-t border-slate-800/80">
            <p className="text-[10px] uppercase tracking-widest text-slate-600 font-semibold mb-3 px-2">Utilities</p>
            
            {utilityItems.map((item) => (
              <button
                key={item.id}
                onClick={() => {
                  playSound('click', 0.2);
                }}
                className="
                  w-full flex items-center gap-3 
                  p-3 rounded-lg 
                  text-slate-400 hover:text-slate-200 
                  hover:bg-slate-800/50 
                  transition-all duration-150
                  group
                "
              >
                {item.icon}
                <div className="text-left">
                  <p className="text-sm font-medium">{item.label}</p>
                  <p className="text-[10px] text-slate-600">{item.description}</p>
                </div>
              </button>
            ))}

            {/* Footer */}
            <div className="mt-4 pt-4 border-t border-slate-800/50">
              <div className="flex items-center justify-between px-2">
                <div className="flex items-center gap-2">
                  <Heart className="w-3 h-3 text-red-500" />
                  <span className="text-[10px] text-slate-600">Made with care</span>
                </div>
                <a 
                  href="#" 
                  className="flex items-center gap-1 text-[10px] text-violet-500 hover:text-violet-400 transition-colors"
                  onClick={(e) => {
                    e.preventDefault();
                    playSound('click', 0.2);
                  }}
                >
                  <ExternalLink className="w-3 h-3" />
                  Docs
                </a>
              </div>
              <p className="text-[9px] text-slate-700 mt-2 px-2 text-center">
                AETH-1 v2.0 • Human-in-the-loop Edition
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
