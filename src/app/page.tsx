'use client';

import { useState, useCallback, useEffect } from 'react';
import dynamic from 'next/dynamic';
import SandwichMenu from '@/components/SandwichMenu';

// Dynamic imports for code splitting
const Preview1Landing = dynamic(() => import('./preview1/page'), {
  loading: () => <div className="min-h-screen bg-slate-950 flex items-center justify-center text-white">Loading Landing...</div>
});

const Preview2FrontendHub = dynamic(() => import('./preview2/page'), {
  loading: () => <div className="min-h-screen bg-slate-950 flex items-center justify-center text-white">Loading Frontend Hub...</div>
});

const Preview3Dashboard = dynamic(() => import('./preview3/page'), {
  loading: () => <div className="min-h-screen bg-slate-950 flex items-center justify-center text-white">Loading Dashboard...</div>
});

const Preview4Studio = dynamic(() => import('./preview4/page'), {
  loading: () => <div className="h-screen bg-slate-950 flex items-center justify-center text-white">Loading Studio IDE...</div>
});

const Preview5FutureLab = dynamic(() => import('./preview5/page'), {
  loading: () => <div className="min-h-screen bg-slate-950 flex items-center justify-center text-white">Loading Future Lab...</div>
});

type PageId = 'preview1' | 'preview2' | 'preview3' | 'preview4' | 'preview5';

export default function HomePage() {
  const [currentPage, setCurrentPage] = useState<PageId>('preview1');
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [pageHistory, setPageHistory] = useState<PageId[]>(['preview1']);

  const handleNavigate = useCallback((pageId: string) => {
    if (pageId === currentPage) return;
    
    setIsTransitioning(true);
    
    // Add transition effect
    setTimeout(() => {
      setCurrentPage(pageId as PageId);
      setPageHistory(prev => [...prev.slice(-10), pageId as PageId]);
      
      setTimeout(() => {
        setIsTransitioning(false);
      }, 100);
    }, 150);
  }, [currentPage]);

  const toggleDarkMode = useCallback(() => {
    setIsDarkMode(!isDarkMode);
  }, [isDarkMode]);

  const toggleSound = useCallback(() => {
    setSoundEnabled(!soundEnabled);
  }, [soundEnabled]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Alt + Left/Right for page history navigation
      if (e.altKey && e.key === 'ArrowLeft') {
        e.preventDefault();
        if (pageHistory.length > 1) {
          const prevPage = pageHistory[pageHistory.length - 2];
          handleNavigate(prevPage);
        }
      }
      if (e.altKey && e.key === 'ArrowRight') {
        e.preventDefault();
        // Could implement forward navigation here
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [pageHistory, handleNavigate]);

  const renderCurrentPage = () => {
    switch (currentPage) {
      case 'preview1':
        return <Preview1Landing />;
      case 'preview2':
        return <Preview2FrontendHub />;
      case 'preview3':
        return <Preview3Dashboard />;
      case 'preview4':
        return <Preview4Studio />;
      case 'preview5':
        return <Preview5FutureLab />;
      default:
        return <Preview1Landing />;
    }
  };

  return (
    <div className={`${isDarkMode ? 'dark' : ''}`}>
      {/* Sandwich Menu - Always visible */}
      <SandwichMenu
        currentPage={currentPage}
        onNavigate={handleNavigate}
        isDarkMode={isDarkMode}
        onToggleDarkMode={toggleDarkMode}
        soundEnabled={soundEnabled}
        onToggleSound={toggleSound}
      />

      {/* Main Content Area */}
      <main 
        className={`transition-opacity duration-150 ${isTransitioning ? 'opacity-0' : 'opacity-100'}`}
      >
        {renderCurrentPage()}
      </main>

      {/* Page Transition Overlay */}
      {isTransitioning && (
        <div className="fixed inset-0 z-40 pointer-events-none">
          <div className="absolute inset-0 bg-gradient-to-r from-violet-600/10 via-transparent to-cyan-600/10 animate-pulse" />
        </div>
      )}

      {/* Floating Navigation Hint */}
      {!isTransitioning && (
        <div className="fixed bottom-6 right-6 z-30 hidden md:block">
          <div className="px-4 py-2 rounded-xl bg-slate-900/90 backdrop-blur-sm border border-slate-700/50 shadow-lg">
            <p className="text-xs text-slate-400 mb-1">Quick Nav</p>
            <div className="flex gap-2">
              {(['preview1', 'preview2', 'preview3', 'preview4', 'preview5'] as PageId[]).map((id, i) => (
                <button
                  key={id}
                  onClick={() => handleNavigate(id)}
                  className={`w-8 h-8 rounded-lg text-xs font-medium transition-all ${
                    currentPage === id
                      ? 'bg-violet-600 text-white'
                      : 'bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700'
                  }`}
                >
                  {i + 1}
                </button>
              ))}
            </div>
            <p className="text-[10px] text-slate-600 mt-1.5 text-center">
              Press ⌘K for menu • 1-5 for quick nav
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
