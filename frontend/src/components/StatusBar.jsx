export default function StatusBar({ state, connected }) {
    if (!state) {
        return (
            <div className="glass-card p-4">
                <div className="flex items-center justify-center gap-3">
                    <div className={`status-dot ${connected ? 'operational' : 'failed'}`} />
                    <span className="text-xs" style={{ color: 'var(--text-secondary)' }}>
                        {connected ? 'Connected – Awaiting simulation' : 'Disconnected – Reconnecting...'}
                    </span>
                </div>
            </div>
        );
    }

    const { infrastructure = [], roads = [], overall_risk = 0, tick = 0, running = false } = state;

    const hospitals = infrastructure.filter(i => i.type === 'hospital');
    const powerStations = infrastructure.filter(i => i.type === 'power_station');
    const shelters = infrastructure.filter(i => i.type === 'shelter');
    const blockedRoads = roads.filter(r => r.blocked);

    const categories = [
        {
            label: 'Hospitals',
            icon: '🏥',
            items: hospitals,
            metric: hospitals.length > 0
                ? `${hospitals.filter(h => h.status === 'operational').length}/${hospitals.length} Online`
                : 'N/A',
            health: hospitals.length > 0
                ? (hospitals.filter(h => h.status === 'operational').length / hospitals.length) * 100
                : 100,
        },
        {
            label: 'Power Grid',
            icon: '⚡',
            items: powerStations,
            metric: powerStations.length > 0
                ? `${powerStations.filter(p => p.status === 'operational').length}/${powerStations.length} Active`
                : 'N/A',
            health: powerStations.length > 0
                ? (powerStations.filter(p => p.status === 'operational').length / powerStations.length) * 100
                : 100,
        },
        {
            label: 'Shelters',
            icon: '🏠',
            items: shelters,
            metric: shelters.length > 0
                ? `${shelters.filter(s => s.status === 'operational').length}/${shelters.length} Ready`
                : 'N/A',
            health: shelters.length > 0
                ? (shelters.filter(s => s.status === 'operational').length / shelters.length) * 100
                : 100,
        },
        {
            label: 'Roads',
            icon: '🛣️',
            items: roads,
            metric: `${blockedRoads.length} Blocked`,
            health: roads.length > 0
                ? ((roads.length - blockedRoads.length) / roads.length) * 100
                : 100,
        },
    ];

    return (
        <div className="glass-card p-4 animate-slide-up">
            <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                    <h3 className="font-display text-xs tracking-widest" style={{ color: 'var(--primary)' }}>
                        🖥️ SYSTEM STATUS
                    </h3>
                    <div className={`status-dot ${connected ? 'operational' : 'failed'}`} />
                </div>
                <div className="flex items-center gap-3">
                    {running && (
                        <span className="text-xs px-2 py-0.5 rounded-full animate-pulse-glow" style={{
                            background: 'rgba(0, 240, 255, 0.1)',
                            color: 'var(--primary)',
                            border: '1px solid rgba(0, 240, 255, 0.3)',
                        }}>
                            ● SIMULATION ACTIVE
                        </span>
                    )}
                    <span className="text-xs" style={{ color: 'var(--text-secondary)' }}>
                        Tick: {tick}
                    </span>
                </div>
            </div>

            <div className="grid grid-cols-4 gap-3">
                {categories.map((cat, i) => {
                    const statusColor = cat.health > 70 ? '#22c55e' : cat.health > 40 ? '#f59e0b' : '#ef4444';
                    return (
                        <div
                            key={i}
                            className="p-3 rounded-lg text-center"
                            style={{
                                background: 'rgba(255,255,255,0.02)',
                                border: `1px solid ${cat.health < 50 ? 'rgba(239,68,68,0.2)' : 'rgba(255,255,255,0.06)'}`,
                            }}
                        >
                            <div className="text-lg mb-1">{cat.icon}</div>
                            <div className="text-xs font-semibold" style={{ color: 'var(--text-primary)' }}>{cat.label}</div>
                            <div className="text-xs mt-1" style={{ color: statusColor }}>
                                {cat.metric}
                            </div>
                            <div className="health-bar mt-2">
                                <div
                                    className="health-bar-fill"
                                    style={{
                                        width: `${cat.health}%`,
                                        background: `linear-gradient(90deg, ${statusColor}, ${statusColor}88)`,
                                    }}
                                />
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
