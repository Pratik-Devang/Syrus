import React from 'react';

const INFRA_CATEGORIES = [
    { id: 'hospital',       label: 'Hospitals',   icon: '🏥', unit: 'Online' },
    { id: 'power_station',  label: 'Power Grid',  icon: '⚡', unit: 'Active' },
    { id: 'shelter',        label: 'Shelters',    icon: '🏠', unit: 'Ready'  },
    { id: 'fire_station',   label: 'Fire Units',  icon: '🚒', unit: 'Active' },
    { id: 'police_station', label: 'Police',      icon: '🚔', unit: 'Online' },
    { id: 'metro_station',  label: 'Metro Lines', icon: '🚇', unit: 'Running'},
    { id: 'communications', label: 'Comms Nodes', icon: '📡', unit: 'Online' },
];

function StatusCard({ icon, label, metric, health, unit, compact }) {
    const color = health > 70 ? '#22c55e' : health > 40 ? '#f59e0b' : '#ef4444';
    return (
        <div
            className="p-3 rounded-xl flex flex-col gap-1.5 transition-all duration-300"
            style={{
                background: 'rgba(255,255,255,0.03)',
                border: `1px solid ${health < 50 ? 'rgba(239,68,68,0.25)' : 'var(--glass-border)'}`,
                minWidth: compact ? '90px' : '110px',
            }}
        >
            <div className="flex items-center gap-2">
                <span className="text-base">{icon}</span>
                <span className="text-xs font-semibold uppercase tracking-wide" style={{ color: 'var(--text-secondary)' }}>
                    {label}
                </span>
            </div>
            <div className="font-bold text-sm" style={{ color }}>
                {metric} <span className="font-normal text-xs opacity-70">{unit}</span>
            </div>
            <div className="h-1 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.05)' }}>
                <div
                    className="h-full rounded-full transition-all duration-700"
                    style={{ width: `${Math.max(2, health)}%`, background: `linear-gradient(90deg, ${color}, ${color}88)` }}
                />
            </div>
        </div>
    );
}

const StatusBar = React.memo(function StatusBar({ state, connected }) {
    if (!state) {
        return (
            <div className="glass-card px-5 py-3 flex items-center gap-3">
                <div className={`status-dot ${connected ? 'operational' : 'failed'}`} />
                <span className="text-xs tracking-widest uppercase font-medium" style={{ color: 'var(--text-secondary)' }}>
                    {connected ? 'Command Core Connected — Awaiting Simulation Launch' : '⚠ Core Offline — Attempting Reconnect...'}
                </span>
            </div>
        );
    }

    const { infrastructure = [], roads = [], overall_risk = 0, tick = 0, running = false, zones = [] } = state;

    const blockedRoads = roads.filter(r => r.blocked);

    const infraCards = INFRA_CATEGORIES.map(cat => {
        const items = infrastructure.filter(i => i.type === cat.id);
        const operational = items.filter(i => i.status === 'operational').length;
        const health = items.length > 0 ? (operational / items.length) * 100 : 100;
        return { ...cat, metric: items.length > 0 ? `${operational}/${items.length}` : 'N/A', health };
    });

    const riskColor = overall_risk > 60 ? '#ef4444' : overall_risk > 30 ? '#f59e0b' : '#22c55e';
    const totalPop = zones.reduce((sum, z) => sum + (z.population || 0), 0);

    return (
        <div className="glass-card px-5 py-3 animate-slide-up">
            <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                    <h3 className="font-display text-xs tracking-widest uppercase font-bold" style={{ color: 'var(--primary)' }}>
                        ◈ COMMAND STATUS — MUMBAI METROPOLITAN
                    </h3>
                    {running && (
                        <span className="text-xs px-2.5 py-0.5 rounded-full font-semibold flex items-center gap-1 animate-pulse-glow"
                            style={{ background: 'rgba(239,68,68,0.1)', color: '#ef4444', border: '1px solid rgba(239,68,68,0.3)' }}>
                            ● LIVE SIM
                        </span>
                    )}
                </div>

                <div className="flex items-center gap-5">
                    <div className="text-right">
                        <div className="text-xs uppercase tracking-widest font-semibold" style={{ color: 'var(--text-secondary)' }}>Tick</div>
                        <div className="font-display text-lg font-bold" style={{ color: 'var(--primary)' }}>{tick.toString().padStart(3, '0')}</div>
                    </div>
                    <div className="text-right">
                        <div className="text-xs uppercase tracking-widest font-semibold" style={{ color: 'var(--text-secondary)' }}>Est. Pop.</div>
                        <div className="font-display text-sm font-bold" style={{ color: 'var(--text-primary)' }}>{(totalPop / 1000000).toFixed(1)}M</div>
                    </div>
                    <div className="text-right">
                        <div className="text-xs uppercase tracking-widest font-semibold" style={{ color: 'var(--text-secondary)' }}>City Risk</div>
                        <div className="font-display text-lg font-bold" style={{ color: riskColor }}>{overall_risk.toFixed(0)}%</div>
                    </div>
                    <div className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider" style={{
                        background: blockedRoads.length > 0 ? 'rgba(239,68,68,0.1)' : 'rgba(34,197,94,0.1)',
                        color: blockedRoads.length > 0 ? '#ef4444' : '#22c55e',
                        border: `1px solid ${blockedRoads.length > 0 ? 'rgba(239,68,68,0.3)' : 'rgba(34,197,94,0.3)'}`,
                    }}>
                        🛣 {blockedRoads.length} Roads Blocked
                    </div>
                </div>
            </div>

            <div className="flex gap-3 overflow-x-auto pb-1">
                {infraCards.map((cat, i) => (
                    <StatusCard key={i} {...cat} compact />
                ))}
            </div>
        </div>
    );
});

export default StatusBar;


