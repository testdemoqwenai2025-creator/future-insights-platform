'use client';

import { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';

const TemplateGalleryPage = dynamic(() => import('@/components/SciCMP/TemplateGalleryPage'), {
  loading: () => <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center">Loading...</div>,
  ssr: false
});

export default function HomePage() {
  const [currentPage, setCurrentPage] = useState<'home' | 'templates'>('home');
  const [hash, setHash] = useState('');

  useEffect(() => {
    const handleHash = () => {
      const h = window.location.hash;
      setHash(h);
      if (h.includes('templates')) {
        setCurrentPage('templates');
      }
    };
    
    handleHash();
    window.addEventListener('hashchange', handleHash);
    return () => window.removeEventListener('hashchange', handleHash);
  }, []);

  if (currentPage === 'templates') {
    return <TemplateGalleryPage initialHash={hash} />;
  }

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <div className="max-w-4xl mx-auto px-4 py-16">
        <h1 className="text-5xl font-bold mb-6 bg-gradient-to-r from-violet-400 to-cyan-400 bg-clip-text text-transparent">
          SciCMP Platform
        </h1>
        
        <p className="text-xl text-slate-400 mb-8">
          Scientific Computing Templates & Tools
        </p>

        <div className="bg-slate-900 rounded-xl p-6 mb-8 border border-slate-800">
          <p className="text-sm text-slate-500 mb-2">Current URL Hash:</p>
          <code className="text-violet-400">{hash || '(none)'}</code>
        </div>

        <a 
          href="#/templates/bioinformatics/blast"
          onClick={(e) => { e.preventDefault(); setCurrentPage('templates'); window.location.hash = '#/templates/bioinformatics/blast'; }}
          className="inline-block px-8 py-4 bg-violet-600 hover:bg-violet-700 rounded-xl font-semibold transition-colors"
        >
          🧬 Open Template Gallery →
        </a>
      </div>
    </div>
  );
}
