export default function CascadingFlow({ events = [] }) {
    if (events.length === 0) return null;

    const nodeColors = {
        'Flood': '#3b82f6',
        'Earthquake': '#f59e0b',
        'Road Network': '#ef4444',
        'Road Blockage': '#ef4444',
        'Emergency Response': '#f97316',
        'Casualty Surge': '#f97316',
        'Hospital System': '#a855f7',
        'Hospital Overload': '#a855f7',
        'Power Grid': '#eab308',
        'Infrastructure Damage': '#eab308',
        'Supply Chain': '#06b6d4',
    };

    const getNodeColor = (name) => {
        for (const [key, val] of Object.entries(nodeColors)) {
            if (name.includes(key)) return val;
        }
        return 'var(--primary)';
    };

    return (
        <div className="glass-card p-5 animate-slide-up">
            <h3 className="font-display text-sm tracking-widest mb-4" style={{ color: 'var(--primary)' }}>
                ⛓️ CASCADING FAILURE CHAIN
            </h3>

            <div className="flex items-center gap-1 overflow-x-auto pb-2" style={{ minHeight: '80px' }}>
                {events.map((event, i) => (
                    <div key={i} className="flex items-center shrink-0">
                        {/* Node */}
                        <div
                            className="cascade-node"
                            style={{
                                borderColor: getNodeColor(event.source) + '40',
                                animationDelay: `${i * 0.2}s`,
                            }}
                        >
                            <span className="text-lg">{event.icon}</span>
                            <div>
                                <div className="text-xs font-bold whitespace-nowrap" style={{ color: getNodeColor(event.source) }}>
                                    {event.source}
                                </div>
                                <div className="text-xs whitespace-nowrap" style={{ color: 'var(--text-secondary)', maxWidth: '140px', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                    {event.description}
                                </div>
                            </div>
                        </div>

                        {/* Connector arrow */}
                        {i < events.length - 1 && (
                            <div className="cascade-connector" style={{ animationDelay: `${i * 0.2 + 0.1}s` }}>
                                <svg width="30" height="20" viewBox="0 0 30 20">
                                    <defs>
                                        <linearGradient id={`grad-${i}`} x1="0%" y1="0%" x2="100%" y2="0%">
                                            <stop offset="0%" stopColor={getNodeColor(event.source)} />
                                            <stop offset="100%" stopColor={getNodeColor(events[i + 1]?.source || '')} />
                                        </linearGradient>
                                    </defs>
                                    <line
                                        x1="0" y1="10" x2="22" y2="10"
                                        stroke={`url(#grad-${i})`}
                                        strokeWidth="2"
                                        strokeDasharray="4 2"
                                        style={{ animation: 'flow-line 1.5s linear infinite' }}
                                    />
                                    <polygon
                                        points="22,5 30,10 22,15"
                                        fill={getNodeColor(events[i + 1]?.source || '')}
                                    />
                                </svg>
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
}
