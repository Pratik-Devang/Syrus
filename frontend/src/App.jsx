import { useState } from 'react';
import { useSimulation } from './hooks/useSimulation';
import { useTheme } from './context/ThemeContext';
import CityMap from './components/CityMap';
import DisasterControls from './components/DisasterControls';
import Dashboard from './components/Dashboard';
import CascadingFlow from './components/CascadingFlow';
import AgentLog from './components/AgentLog';
import WhatIfPanel from './components/WhatIfPanel';
import TimelineSlider from './components/TimelineSlider';
import StatusBar from './components/StatusBar';

export default function App() {
  const {
    state,
    connected,
    timeline,
    viewingTick,
    loading,
    error,
    isRunning,
    startSimulation,
    stopSimulation,
    resetSimulation,
    runWhatIf,
    viewTick,
  } = useSimulation();

  const { theme, toggleTheme } = useTheme();
  const [activeTab, setActiveTab] = useState('dashboard');

  return (
    <div className="min-h-screen flex flex-col" style={{ background: 'var(--bg-dark)', color: 'var(--text-primary)', transition: 'background-color 0.4s ease' }}>
      {/* Background Grid Effect */}
      <div
        className="fixed inset-0 pointer-events-none"
        style={{
          backgroundImage: `
            linear-gradient(rgba(var(--primary), 0.02) 1px, transparent 1px),
            linear-gradient(90deg, rgba(var(--primary), 0.02) 1px, transparent 1px)
          `,
          backgroundSize: '40px 40px',
          zIndex: 0,
        }}
      />

      {/* Header */}
      <header className="relative z-10 glass-card mx-6 mt-4 mb-2 rounded-2xl animate-slide-up" style={{ border: '1px solid var(--glass-border)' }}>
        <div className="max-w-[2560px] mx-auto px-6 py-4 flex items-center justify-between">
          
          <div className="flex items-center gap-4">
            <div className="relative">
              <div
                className="w-12 h-12 rounded-xl flex items-center justify-center shadow-lg"
                style={{
                  background: 'linear-gradient(135deg, var(--primary) 0%, var(--secondary) 100%)',
                  opacity: 0.9,
                }}
              >
                <span className="text-2xl text-white">🛡️</span>
              </div>
              {isRunning && (
                <div
                  className="absolute -top-1 -right-1 w-3 h-3 rounded-full"
                  style={{
                    background: 'var(--danger)',
                    animation: 'pulse-danger 1.5s ease-in-out infinite',
                  }}
                />
              )}
            </div>
            <div>
              <h1 className="font-display text-2xl font-bold tracking-widest uppercase italic" style={{ color: 'var(--text-primary)', textShadow: '0 0 10px rgba(0, 240, 255, 0.2)' }}>
                RESILIENCE<span style={{ color: 'var(--primary)' }}> AI</span>
              </h1>
              <p className="text-xs font-semibold tracking-wider uppercase" style={{ color: 'var(--text-secondary)' }}>
                Multi-Agent Crisis Simulation & Decision Engine
              </p>
            </div>
          </div>

          <div className="flex items-center gap-6">
            {/* Tab Navigation */}
            <nav className="flex items-center gap-1 p-1 rounded-lg" style={{ background: 'rgba(0,0,0,0.1)' }}>
              {[
                { id: 'dashboard', label: 'Dashboard', icon: '📊' },
                { id: 'whatif', label: 'What-If', icon: '🔮' },
                { id: 'agents', label: 'Agents', icon: '🤖' },
              ].map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className="px-5 py-2 rounded-md flex items-center gap-2 text-sm font-semibold transition-all duration-300"
                  style={{
                    background: activeTab === tab.id ? 'var(--bg-card-hover)' : 'transparent',
                    color: activeTab === tab.id ? 'var(--primary)' : 'var(--text-secondary)',
                    border: activeTab === tab.id ? '1px solid var(--glass-border)' : '1px solid transparent',
                    boxShadow: activeTab === tab.id ? '0 4px 12px rgba(0,0,0,0.1)' : 'none'
                  }}
                >
                  <span className="text-lg">{tab.icon}</span>
                  {tab.label}
                </button>
              ))}
            </nav>

            {/* Theme Toggle */}
            <button 
                onClick={toggleTheme}
                className="p-3 rounded-lg transition-all duration-300 hover:scale-105"
                style={{ background: 'rgba(0,0,0,0.1)', border: '1px solid var(--glass-border)' }}
                title="Toggle Theme"
            >
                <span className="text-xl">{theme === 'dark' ? '☀️' : '🌙'}</span>
            </button>

            {/* Connection Status */}
            <div className="flex items-center gap-3 px-4 py-2 rounded-lg" style={{ background: 'rgba(0,0,0,0.1)', border: '1px solid var(--glass-border)' }}>
              <div className={`status-dot ${connected ? 'operational' : 'failed'}`} />
              <span className="text-xs font-bold tracking-widest uppercase" style={{ color: connected ? 'var(--success)' : 'var(--danger)' }}>
                {connected ? 'CORE ONLINE' : 'DISCONNECTED'}
              </span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="relative z-10 max-w-[2560px] w-full mx-auto px-6 py-4 flex-1 flex flex-col gap-4">
        
        {/* Status Bar Component (Full width) */}
        <StatusBar state={state} connected={connected} />

        {/* Main Grid Layout (Map 70%, Panel 30%) */}
        <div className="grid grid-cols-10 gap-6 h-full flex-1 min-h-[700px]">
          
          {/* Left Column – Map Area (70%) */}
          <div className="col-span-12 lg:col-span-7 flex flex-col gap-4 relative">
            <div className="flex-1 rounded-2xl overflow-hidden glass-card relative" style={{ minHeight: '500px' }}>
              <CityMap state={state} theme={theme} />
              
              {/* Timeline attached right above map bottom */}
              {timeline.length > 0 && (
                <div className="absolute bottom-4 left-4 right-4 z-[1000]">
                  <TimelineSlider
                    timeline={timeline}
                    viewingTick={viewingTick}
                    onViewTick={viewTick}
                    running={isRunning}
                  />
                </div>
              )}
            </div>

            {/* Cascading Flow (Appears below map during active simulation) */}
            {state?.cascading_events?.length > 0 && (
              <CascadingFlow events={state.cascading_events} />
            )}
          </div>

          {/* Right Column – Control Panel (30%) */}
          <div className="col-span-12 lg:col-span-3 flex flex-col gap-4 overflow-y-auto pr-2" style={{ maxHeight: 'calc(100vh - 220px)' }}>
            
            {activeTab === 'dashboard' && (
              <>
                <DisasterControls
                  onStart={startSimulation}
                  onStop={stopSimulation}
                  onReset={resetSimulation}
                  running={isRunning}
                  loading={loading}
                  error={error}
                />
                <Dashboard state={state} />
              </>
            )}

            {activeTab === 'whatif' && (
              <WhatIfPanel onRunWhatIf={runWhatIf} running={isRunning} />
            )}

            {activeTab === 'agents' && (
              <AgentLog logs={state?.agent_logs || []} />
            )}
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 py-3 text-center border-t mt-auto" style={{ borderColor: 'var(--glass-border)', background: 'rgba(0,0,0,0.2)' }}>
        <span className="text-xs font-semibold tracking-widest text-[var(--text-secondary)] uppercase">
          RESILIENCE AI V2.0 • STRATEGIC DECISION SUPPORT SYSTEM • MUMBAI METROPOLITAN REGION
        </span>
      </footer>
    </div>
  );
}
