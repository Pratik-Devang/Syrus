import { useState } from 'react';
import { useSimulation } from './hooks/useSimulation';
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
    startSimulation,
    stopSimulation,
    runWhatIf,
    viewTick,
  } = useSimulation();

  const [activeTab, setActiveTab] = useState('dashboard');
  const isRunning = state?.running || false;

  return (
    <div className="min-h-screen" style={{ background: 'linear-gradient(135deg, #0a0e1a 0%, #0d1520 50%, #0a0e1a 100%)' }}>
      {/* Background Grid Effect */}
      <div
        className="fixed inset-0 pointer-events-none"
        style={{
          backgroundImage: `
            linear-gradient(rgba(0, 240, 255, 0.02) 1px, transparent 1px),
            linear-gradient(90deg, rgba(0, 240, 255, 0.02) 1px, transparent 1px)
          `,
          backgroundSize: '40px 40px',
          zIndex: 0,
        }}
      />

      {/* Header */}
      <header className="relative z-10 border-b" style={{ borderColor: 'var(--glass-border)', background: 'rgba(10, 14, 26, 0.9)', backdropFilter: 'blur(20px)' }}>
        <div className="max-w-[1920px] mx-auto px-6 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="relative">
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center"
                  style={{
                    background: 'linear-gradient(135deg, rgba(0, 240, 255, 0.2), rgba(168, 85, 247, 0.2))',
                    border: '1px solid rgba(0, 240, 255, 0.3)',
                  }}
                >
                  <span className="text-lg">🛡️</span>
                </div>
                {isRunning && (
                  <div
                    className="absolute -top-1 -right-1 w-3 h-3 rounded-full"
                    style={{
                      background: '#ef4444',
                      animation: 'pulse-danger 1.5s ease-in-out infinite',
                    }}
                  />
                )}
              </div>
              <div>
                <h1 className="font-display text-lg tracking-wider" style={{ color: 'var(--primary)' }}>
                  RESILIENCE AI
                </h1>
                <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>
                  Multi-Agent Crisis Simulation & Decision Engine
                </p>
              </div>
            </div>

            {/* Tab Navigation */}
            <nav className="flex items-center gap-1">
              {[
                { id: 'dashboard', label: 'Dashboard', icon: '📊' },
                { id: 'whatif', label: 'What-If', icon: '🔮' },
                { id: 'agents', label: 'Agents', icon: '🤖' },
              ].map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className="px-4 py-2 rounded-lg text-xs font-semibold transition-all duration-300"
                  style={{
                    background: activeTab === tab.id ? 'rgba(0, 240, 255, 0.1)' : 'transparent',
                    color: activeTab === tab.id ? 'var(--primary)' : 'var(--text-secondary)',
                    border: activeTab === tab.id ? '1px solid rgba(0, 240, 255, 0.2)' : '1px solid transparent',
                  }}
                >
                  {tab.icon} {tab.label}
                </button>
              ))}
            </nav>

            {/* Connection Status */}
            <div className="flex items-center gap-2">
              <div className={`status-dot ${connected ? 'operational' : 'failed'}`} />
              <span className="text-xs" style={{ color: connected ? 'var(--success)' : 'var(--danger)' }}>
                {connected ? 'CONNECTED' : 'OFFLINE'}
              </span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="relative z-10 max-w-[1920px] mx-auto px-6 py-4">
        {/* Status Bar */}
        <div className="mb-4">
          <StatusBar state={state} connected={connected} />
        </div>

        {/* Main Grid Layout */}
        <div className="grid grid-cols-12 gap-4" style={{ minHeight: 'calc(100vh - 200px)' }}>
          {/* Left Column – Map */}
          <div className="col-span-8 space-y-4">
            <div style={{ height: '500px' }}>
              <CityMap state={state} />
            </div>

            {/* Cascading Flow */}
            {state?.cascading_events?.length > 0 && (
              <CascadingFlow events={state.cascading_events} />
            )}

            {/* Timeline */}
            <TimelineSlider
              timeline={timeline}
              viewingTick={viewingTick}
              onViewTick={viewTick}
            />
          </div>

          {/* Right Column – Controls & Dashboard */}
          <div className="col-span-4 space-y-4">
            {/* Disaster Controls */}
            <DisasterControls
              onStart={startSimulation}
              onStop={stopSimulation}
              running={isRunning}
            />

            {/* Tab Content */}
            {activeTab === 'dashboard' && (
              <Dashboard state={state} />
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
      <footer className="relative z-10 border-t py-3 px-6 text-center" style={{ borderColor: 'var(--glass-border)' }}>
        <span className="text-xs" style={{ color: 'var(--text-secondary)' }}>
          RESILIENCE AI v1.0 • Multi-Agent Crisis Simulation Platform • Real-time Decision Engine
        </span>
      </footer>
    </div>
  );
}
