'use client';

import { useState } from 'react';

// ============================================
// BULLET-PROOF STUDIO IDE - No dependencies
// ============================================

export default function Preview4Studio() {
  const [isRunning, setIsRunning] = useState(true); // Auto-start!
  const [showPreview, setShowPreview] = useState(true);

  return (
    <div style={{
      width: '100vw',
      height: '100vh',
      backgroundColor: '#0f172a',
      color: '#fff',
      display: 'flex',
      flexDirection: 'column',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      overflow: 'hidden'
    }}>
      
      {/* ===== TOP BAR ===== */}
      <header style={{
        padding: '12px 16px',
        backgroundColor: '#1e293b',
        borderBottom: '1px solid #334155',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexShrink: 0
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ fontSize: '18px' }}>🧪</span>
          <strong>AETH Studio</strong>
        </div>
        
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          {!isRunning ? (
            <button
              onClick={() => setIsRunning(true)}
              style={{
                padding: '8px 20px',
                backgroundColor: '#22c55e',
                color: '#fff',
                border: 'none',
                borderRadius: '6px',
                cursor: 'pointer',
                fontWeight: 600,
                fontSize: '14px'
              }}
            >
              ▶ Run Preview
            </button>
          ) : (
            <button
              onClick={() => setIsRunning(false)}
              style={{
                padding: '8px 20px',
                backgroundColor: '#ef4444',
                color: '#fff',
                border: 'none',
                borderRadius: '6px',
                cursor: 'pointer',
                fontWeight: 600,
                fontSize: '14px'
              }}
            >
              ■ Stop
            </button>
          )}
          
          <button
            onClick={() => setShowPreview(!showPreview)}
            style={{
              padding: '8px 12px',
              backgroundColor: showPreview ? '#7c3aed' : '#334155',
              color: '#fff',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer'
            }}
          >
            ⊞ Split
          </button>
        </div>
        
        <div style={{ fontSize: '12px', color: isRunning ? '#4ade80' : '#64748b' }}>
          {isRunning ? '● Running' : '○ Stopped'}
        </div>
      </header>

      {/* ===== MAIN CONTENT AREA ===== */}
      <div style={{ flex: 1, display: 'flex', minHeight: 0 }}>
        
        {/* FILE EXPLORER SIDEBAR */}
        <aside style={{
          width: '200px',
          backgroundColor: '#1e293b',
          borderRight: '1px solid #334155',
          flexShrink: 0,
          overflow: 'auto'
        }}>
          <div style={{ 
            padding: '12px', 
            fontSize: '11px', 
            fontWeight: 700, 
            color: '#64748b',
            textTransform: 'uppercase',
            letterSpacing: '0.05em'
          }}>
            Explorer
          </div>
          
          {/* File Tree */}
          <FileTree />
        </aside>

        {/* EDITOR + PREVIEW CONTAINER */}
        <div style={{ flex: 1, display: 'flex', minHeight: 0 }}>
          
          {/* CODE EDITOR */}
          <section style={{
            width: showPreview ? '50%' : '100%',
            display: 'flex',
            flexDirection: 'column',
            borderRight: showPreview ? '1px solid #334555' : 'none'
          }}>
            {/* Editor Tabs */}
            <div style={{
              display: 'flex',
              backgroundColor: '#0f172a',
              borderBottom: '1px solid #334155',
              flexShrink: 0
            }}>
              {['App.tsx', 'utils.ts', 'api.ts'].map((file) => (
                <div key={file} style={{
                  padding: '10px 16px',
                  fontSize: '13px',
                  color: file === 'App.tsx' ? '#fff' : '#64748b',
                  backgroundColor: file === 'App.tsx' ? '#1e293b' : 'transparent',
                  borderBottom: file === 'App.tsx' ? '2px solid #7c3aed' : 'none',
                  cursor: 'pointer'
                }}>
                  {file}
                </div>
              ))}
            </div>
            
            {/* Code Content */}
            <div style={{
              flex: 1,
              display: 'flex',
              backgroundColor: '#0f172a',
              overflow: 'auto',
              fontSize: '13px',
              lineHeight: '1.6'
            }}>
              {/* Line Numbers */}
              <div style={{
                padding: '16px 12px',
                textAlign: 'right',
                color: '#334155',
                userSelect: 'none',
                fontFamily: 'monospace',
                flexShrink: 0
              }}>
                {Array.from({ length: 25 }, (_, i) => (
                  <div key={i}>{i + 1}</div>
                ))}
              </div>
              
              {/* Code Text */}
              <pre style={{
                padding: '16px',
                margin: 0,
                color: '#e2e8f0',
                fontFamily: '"Fira Code", "Cascadia Code", monospace',
                whiteSpace: 'pre',
                flex: 1
              }}>{`// AETH-1 Application
// Enterprise Technology Hub

import { useState } from 'react';

export default function App() {
  const [count, setCount] = useState(0);
  
  return (
    <div className="app-container">
      <header>
        <h1>🔮 AETH-1</h1>
        <p>Enterprise Technology Hub</p>
      </header>
      
      <main>
        <h2>Build the Future of</h2>
        <h3>Intelligent Systems</h3>
        
        <p>Count: {count}</p>
        <button onClick={() => setCount(c => c + 1)}>
          Increment
        </button>
        
        <FeaturesGrid />
        <StatsBar />
      </main>
    </div>
  );
}`}</pre>
            </div>
          </section>

          {/* PREVIEW PANEL */}
          {showPreview && (
            <section style={{
              width: '50%',
              display: 'flex',
              flexDirection: 'column',
              backgroundColor: '#020617'
            }}>
              {/* Preview Header */}
              <div style={{
                padding: '10px 16px',
                backgroundColor: '#1e293b',
                borderBottom: '1px solid #334155',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                flexShrink: 0
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ color: '#4ade80' }}>🖥️</span>
                  <span style={{ fontSize: '13px', fontWeight: 600 }}>Live Preview</span>
                </div>
                
                <div style={{ 
                  padding: '4px 10px', 
                  borderRadius: '4px',
                  fontSize: '11px',
                  fontWeight: 600,
                  backgroundColor: isRunning ? '#064e3b' : '#1e293b',
                  color: isRunning ? '#4ade80' : '#64748b',
                  border: `1px solid ${isRunning ? '#059669' : '#334155'}`
                }}>
                  {isRunning ? '● LIVE' : '○ OFF'}
                </div>
              </div>
              
              {/* PREVIEW CONTENT - THE ACTUAL APP */}
              <div style={{ flex: 1, overflow: 'auto' }}>
                {isRunning ? (
                  <AethOneApp />
                ) : (
                  <div style={{
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#64748b'
                  }}>
                    <div style={{ fontSize: '48px', marginBottom: '16px', opacity: 0.3 }}>🖥️</div>
                    <div style={{ fontSize: '18px', fontWeight: 600, marginBottom: '8px' }}>Preview Paused</div>
                    <div style={{ fontSize: '14px' }}>Click Run to start the live preview</div>
                  </div>
                )}
              </div>
              
              {/* Preview Footer */}
              {isRunning && (
                <div style={{
                  padding: '8px 16px',
                  backgroundColor: '#1e293b',
                  borderTop: '1px solid #334155',
                  fontSize: '10px',
                  color: '#64748b',
                  display: 'flex',
                  justifyContent: 'space-between',
                  flexShrink: 0
                }}>
                  <span>localhost:3000 • React 19 • Next.js 16</span>
                  <span>HMR Active ✓</span>
                </div>
              )}
            </section>
          )}
        </div>
      </div>

      {/* ===== TERMINAL PANEL ===== */}
      <div style={{
        height: '160px',
        backgroundColor: '#1e293b',
        borderTop: '1px solid #334155',
        display: 'flex',
        flexDirection: 'column',
        flexShrink: 0
      }}>
        {/* Terminal Header */}
        <div style={{
          padding: '8px 16px',
          borderBottom: '1px solid #334155',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          fontSize: '12px'
        }}>
          <span>💻</span>
          <strong style={{ color: '#fff' }}>TERMINAL</strong>
        </div>
        
        {/* Terminal Output */}
        <div style={{
          flex: 1,
          padding: '12px 16px',
          fontFamily: 'monospace',
          fontSize: '13px',
          overflow: 'auto',
          lineHeight: 1.6
        }}>
          <TerminalOutput isRunning={isRunning} />
        </div>
      </div>

      {/* ===== STATUS BAR ===== */}
      <footer style={{
        padding: '6px 16px',
        backgroundColor: '#7c3aed',
        fontSize: '11px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexShrink: 0
      }}>
        <div style={{ display: 'flex', gap: '16px' }}>
          <span>📁 main</span>
          {isRunning && <span>👁️ Preview Active</span>}
        </div>
        <div style={{ display: 'flex', gap: '16px' }}>
          <span>TypeScript</span>
          <span>UTF-8</span>
          <span>25 Lines</span>
          <span>🌐 Connected</span>
        </div>
      </footer>
    </div>
  );
}

// ============================================
// FILE TREE COMPONENT
// ============================================
function FileTree() {
  const [expanded, setExpanded] = useState({ src: true, app: true });
  
  const toggle = (key: string) => {
    setExpanded(prev => ({ ...prev, [key]: !prev[key] }));
  };
  
  return (
    <div style={{ padding: '0 8px 8px' }}>
      <FileItem name="src" isFolder isOpen={expanded.src} onToggle={() => toggle('src')} />
      {expanded.src && (
        <div style={{ marginLeft: '12px' }}>
          <FileItem name="app" isFolder isOpen={expanded.app} onToggle={() => toggle('app')} />
          {expanded.app && (
            <div style={{ marginLeft: '12px' }}>
              <FileItem name="page.tsx" />
              <FileItem name="layout.tsx" />
              <FileItem name="preview1/" isFolder />
              <FileItem name="preview2/" isFolder />
              <FileItem name="preview3/" isFolder />
              <FileItem name="preview4/" isFolder />
              <FileItem name="preview5/" isFolder />
            </div>
          )}
          <FileItem name="components/" isFolder />
          <FileItem name="hooks/" isFolder />
          <FileItem name="api/" isFolder />
        </div>
      )}
      <FileItem name="public/" isFolder />
      <FileItem name="package.json" />
      <FileItem name="tsconfig.json" />
    </div>
  );
}

function FileItem({ name, isFolder = false, isOpen = false, onToggle }: { 
  name: string; 
  isFolder?: boolean; 
  isOpen?: boolean;
  onToggle?: () => void;
}) {
  return (
    <div
      onClick={isFolder ? onToggle : undefined}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '6px',
        padding: '6px 8px',
        borderRadius: '4px',
        cursor: isFolder ? 'pointer' : 'default',
        fontSize: '13px',
        color: '#94a3b8',
        ...(isFolder ? {} : { '&:hover': { backgroundColor: '#334155', color: '#fff' } })
      }}
      onMouseEnter={(e) => {
        if (!isFolder) (e.currentTarget as HTMLDivElement).style.backgroundColor = '#334155';
      }}
      onMouseLeave={(e) => {
        if (!isFolder) (e.currentTarget as HTMLDivElement).style.backgroundColor = 'transparent';
      }}
    >
      <span>{isFolder ? (isOpen ? '📂' : '📁') : getIcon(name)}</span>
      <span>{name}</span>
    </div>
  );
}

function getIcon(name: string): string {
  if (name.endsWith('.tsx') || name.endsWith('.ts')) return '📘';
  if (name.endsWith('.json')) return '📋';
  if (name.endsWith('.css')) return '🎨';
  return '📄';
}

// ============================================
// TERMINAL OUTPUT COMPONENT
// ============================================
function TerminalOutput({ isRunning }: { isRunning: boolean }) {
  if (!isRunning) {
    return (
      <>
        <div style={{ color: '#67e8f9' }}>$ AETH Studio v2.0 initialized</div>
        <div style={{ color: '#4ade80' }}>✓ Ready — Press Run to start preview</div>
      </>
    );
  }
  
  return (
    <>
      <div style={{ color: '#67e8f9' }}>$ Starting development server...</div>
      <div style={{ color: '#e2e8f0' }}>✓ Compiling TypeScript...</div>
      <div style={{ color: '#e2e8f0' }}>✓ Bundling with Turbopack...</div>
      <div style={{ color: '#e2e8f0' }}>✓ Generating optimized chunks...</div>
      <br />
      <div style={{ color: '#a78bfa' }}>═════════════════════════════</div>
      <div style={{ color: '#4ade80' }}>  ✓ Server: http://localhost:3000</div>
      <div style={{ color: '#4ade80' }}>  ✓ Preview: Embedded panel active</div>
      <div style={{ color: '#4ade80' }}>  ✓ HMR: Connected</div>
      <div style={{ color: '#a78bfa' }}>═════════════════════════════</div>
      <br />
      <div style={{ color: '#4ade80' }}>✔ Ready in 1.18s — AETH-1 Studio v2.0</div>
    </>
  );
}

// ============================================
// AETH-1 APPLICATION - RENDERED IN PREVIEW
// ============================================
function AethOneApp() {
  const [count, setCount] = useState(0);
  
  return (
    <div style={{
      minHeight: '100%',
      background: 'linear-gradient(135deg, #0f172a 0%, #0f172a 50%, #020617 100%)',
      color: '#fff'
    }}>
      {/* HEADER */}
      <header style={{
        position: 'sticky',
        top: 0,
        zIndex: 10,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '24px',
        background: 'rgba(30, 41, 59, 0.95)',
        backdropFilter: 'blur(8px)',
        borderBottom: '1px solid rgba(51, 65, 85, 0.5)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{
            width: '44px',
            height: '44px',
            borderRadius: '12px',
            background: 'linear-gradient(135deg, #7c3aed, #4f46e5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '22px',
            boxShadow: '0 8px 32px rgba(124, 58, 237, 0.3)'
          }}>
            ✨
          </div>
          <div>
            <h1 style={{ fontSize: '20px', fontWeight: 700, margin: 0 }}>AETH-1</h1>
            <p style={{ fontSize: '10px', color: '#64748b', margin: '4px 0 0', letterSpacing: '0.1em', textTransform: 'uppercase' }}>
              Enterprise Technology Hub
            </p>
          </div>
        </div>
        
        <nav style={{ display: 'flex', gap: '4px' }}>
          {['Home', 'Features', 'Dashboard', 'Studio', 'Docs'].map(item => (
            <button key={item} style={{
              padding: '10px 18px',
              borderRadius: '8px',
              fontSize: '14px',
              color: '#94a3b8',
              background: 'transparent',
              border: 'none',
              cursor: 'pointer'
            }}>
              {item}
            </button>
          ))}
        </nav>
        
        <button style={{
          padding: '12px 24px',
          borderRadius: '12px',
          background: 'linear-gradient(135deg, #7c3aed, #4f46e5)',
          color: '#fff',
          border: 'none',
          fontWeight: 600,
          fontSize: '14px',
          cursor: 'pointer',
          boxShadow: '0 8px 24px rgba(124, 58, 237, 0.3)'
        }}>
          Launch App →
        </button>
      </header>

      {/* HERO SECTION */}
      <section style={{ 
        padding: '64px 32px', 
        textAlign: 'center',
        position: 'relative',
        overflow: 'hidden'
      }}>
        {/* Background glow effects */}
        <div style={{
          position: 'absolute',
          top: '40px',
          left: '20%',
          width: '280px',
          height: '280px',
          background: 'rgba(124, 58, 237, 0.15)',
          borderRadius: '50%',
          filter: 'blur(80px)',
          pointerEvents: 'none'
        }} />
        <div style={{
          position: 'absolute',
          bottom: '60px',
          right: '20%',
          width: '220px',
          height: '220px',
          background: 'rgba(34, 211, 238, 0.1)',
          borderRadius: '50%',
          filter: 'blur(70px)',
          pointerEvents: 'none'
        }} />
        
        <div style={{ position: 'relative', maxWidth: '600px', margin: '0 auto' }}>
          {/* Badge */}
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            padding: '8px 20px',
            borderRadius: '999px',
            background: 'rgba(124, 58, 237, 0.1)',
            border: '1px solid rgba(124, 58, 237, 0.3)',
            marginBottom: '32px',
            fontSize: '14px',
            color: '#a78bfa'
          }}>
            <span style={{ 
              width: '8px', 
              height: '8px', 
              borderRadius: '50%', 
              background: '#4ade80',
              animation: 'pulse 2s infinite'
            }} />
            v2.0 Now Available
          </div>
          
          {/* Title */}
          <h2 style={{ 
            fontSize: '42px', 
            fontWeight: 800, 
            lineHeight: 1.2,
            marginBottom: '24px'
          }}>
            Build the Future of{' '}
            <span style={{
              background: 'linear-gradient(135deg, #a78bfa, #c084fc, #22d3ee)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent'
            }}>
              Intelligent Systems
            </span>
          </h2>
          
          <p style={{ 
            fontSize: '18px', 
            color: '#94a3b8', 
            marginBottom: '40px',
            lineHeight: 1.6
          }}>
            Quantum computing, AR/VR immersion, genomics research — all unified in one platform.
          </p>
          
          {/* CTA Buttons */}
          <div style={{ display: 'flex', justifyContent: 'center', gap: '16px', marginBottom: '48px' }}>
            <button 
              onClick={() => setCount(c => c + 1)}
              style={{
                padding: '16px 36px',
                borderRadius: '16px',
                background: 'linear-gradient(135deg, #7c3aed, #4f46e5)',
                color: '#fff',
                border: 'none',
                fontWeight: 600,
                fontSize: '16px',
                cursor: 'pointer',
                boxShadow: '0 12px 40px rgba(124, 58, 237, 0.35)'
              }}
            >
              ▶ Start Building {count > 0 && `(${count})`}
            </button>
            <button style={{
              padding: '16px 36px',
              borderRadius: '16px',
              background: '#1e293b',
              color: '#fff',
              border: '1px solid #334155',
              fontWeight: 600,
              fontSize: '16px',
              cursor: 'pointer'
            }}>
              👁 View Demo
            </button>
          </div>
          
          {/* Stats Grid */}
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(4, 1fr)', 
            gap: '16px',
            maxWidth: '500px',
            margin: '0 auto'
          }}>
            {[
              { value: '99.9%', label: 'Uptime' },
              { value: '<50ms', label: 'Latency' },
              { value: '10K+', label: 'Users' },
              { value: '24/7', label: 'Support' }
            ].map(stat => (
              <div key={stat.label} style={{
                padding: '16px 12px',
                borderRadius: '12px',
                background: 'rgba(30, 41, 59, 0.4)',
                border: '1px solid rgba(51, 65, 85, 0.4)'
              }}>
                <div style={{ fontSize: '20px', fontWeight: 700, color: '#a78bfa' }}>{stat.value}</div>
                <div style={{ fontSize: '11px', color: '#64748b', marginTop: '4px' }}>{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FEATURES SECTION */}
      <section style={{ padding: '32px' }}>
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <h3 style={{ fontSize: '24px', fontWeight: 700, marginBottom: '8px' }}>Powerful Capabilities</h3>
          <p style={{ color: '#64748b' }}>Everything you need for next-gen applications</p>
        </div>
        
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(3, 1fr)', 
          gap: '16px',
          maxWidth: '700px',
          margin: '0 auto'
        }}>
          {[
            { icon: '🖥️', title: 'Quantum Core', desc: 'Quantum-ready architecture', color: '#3b82f6' },
            { icon: '🥽', title: 'AR/VR Studio', desc: 'Immersive experiences', color: '#a855f7' },
            { icon: '🧬', title: 'Genomics Lab', desc: 'DNA analysis tools', color: '#22c55e' },
            { icon: '💻', title: 'AI Assistant', desc: 'Smart code completion', color: '#f97316' },
            { icon: '🌐', title: 'Edge CDN', desc: 'Global deployment', color: '#ef4444' },
            { icon: '🛡️', title: 'Security', desc: 'Enterprise protection', color: '#14b8a6' }
          ].map(feature => (
            <div key={feature.title} style={{
              padding: '24px',
              borderRadius: '16px',
              background: 'rgba(30, 41, 59, 0.3)',
              border: '1px solid rgba(51, 65, 85, 0.4)',
              transition: 'transform 0.2s'
            }}>
              <div style={{
                width: '48px',
                height: '48px',
                borderRadius: '12px',
                background: `linear-gradient(135deg, ${feature.color}, ${feature.color}88)`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '22px',
                marginBottom: '16px'
              }}>
                {feature.icon}
              </div>
              <h4 style={{ fontSize: '16px', fontWeight: 600, marginBottom: '6px' }}>{feature.title}</h4>
              <p style={{ fontSize: '13px', color: '#94a3b8', lineHeight: 1.5 }}>{feature.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* TERMINAL DEMO */}
      <section style={{ padding: '32px' }}>
        <div style={{
          maxWidth: '500px',
          margin: '0 auto',
          borderRadius: '16px',
          background: 'rgba(30, 41, 59, 0.5)',
          border: '1px solid rgba(51, 65, 85, 0.5)',
          overflow: 'hidden'
        }}>
          {/* Terminal header bar */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '12px 16px',
            background: 'rgba(30, 41, 59, 0.6)',
            borderBottom: '1px solid rgba(51, 65, 85, 0.5)'
          }}>
            <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: '#ef4444' }} />
            <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: '#eab308' }} />
            <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: '#22c55e' }} />
            <span style={{ marginLeft: '12px', fontSize: '12px', color: '#64748b' }}>terminal — aeth-studio</span>
          </div>
          
          {/* Terminal content */}
          <div style={{ padding: '16px', fontFamily: 'monospace', fontSize: '13px', lineHeight: 1.8 }}>
            <div><span style={{ color: '#22d3ee' }}>$</span> aeth init my-project --template=enterprise</div>
            <div style={{ color: '#e2e8f0' }}>  ✨ Creating new AETH-1 project...</div>
            <div style={{ color: '#e2e8f0' }}>  📦 Installing dependencies...</div>
            <div style={{ color: '#e2e8f0' }}>  ⚡ Configuring Turbopack...</div>
            <div style={{ color: '#4ade80' }}>  ✔ Project created successfully!</div>
            <br />
            <div><span style={{ color: '#22d3ee' }}>$</span> aeth dev --preview</div>
            <div style={{ color: '#22d3ee' }}>  ▸ Starting development server... <span style={{ animation: 'blink 1s infinite' }}>▄</span></div>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer style={{
        padding: '24px',
        textAlign: 'center',
        borderTop: '1px solid rgba(51, 65, 85, 0.4)',
        fontSize: '12px',
        color: '#475569'
      }}>
        © 2026 AETH-1 · Advanced Enterprise Technology Hub · Built with Next.js & TypeScript
      </footer>
      
      {/* CSS Animation for pulse */}
      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
        @keyframes blink {
          0%, 100% { opacity: 1; }
          50% { opacity: 0; }
        }
      `}</style>
    </div>
  );
}
