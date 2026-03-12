import { useRef, useEffect } from 'react';

const AGENT_COLORS = {
    'Weather Agent': '#3b82f6',
    'Traffic Agent': '#f59e0b',
    'Medical Agent': '#a855f7',
    'Power Agent': '#eab308',
    'Logistics Agent': '#06b6d4',
    'Command Agent': '#00f0ff',
};

export default function AgentLog({ logs = [] }) {
    const scrollRef = useRef(null);

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [logs]);

    return (
        <div className="glass-card p-5 animate-slide-up" style={{ maxHeight: '350px', display: 'flex', flexDirection: 'column' }}>
            <h3 className="font-display text-sm tracking-widest mb-3" style={{ color: 'var(--primary)' }}>
                📋 AGENT ACTIVITY LOG
            </h3>

            <div
                ref={scrollRef}
                className="flex-1 overflow-y-auto space-y-1 pr-1"
                style={{ maxHeight: '270px' }}
            >
                {logs.length === 0 ? (
                    <div className="text-center py-8" style={{ color: 'var(--text-secondary)' }}>
                        <div className="text-2xl mb-2">🔇</div>
                        <div className="text-xs">No agent activity yet. Start a simulation.</div>
                    </div>
                ) : (
                    logs.slice(-30).map((log, i) => (
                        <div
                            key={i}
                            className="agent-log-entry"
                            style={{
                                borderLeftColor: AGENT_COLORS[log.agent] || 'var(--primary-dim)',
                                animationDelay: `${i * 0.03}s`,
                            }}
                        >
                            <div className="flex items-center justify-between gap-2">
                                <span
                                    className="text-xs font-bold shrink-0"
                                    style={{ color: AGENT_COLORS[log.agent] || 'var(--primary)' }}
                                >
                                    {log.agent}
                                </span>
                                <span className="text-xs" style={{ color: 'var(--text-secondary)', fontSize: '0.65rem' }}>
                                    T{log.tick || '-'}
                                </span>
                            </div>
                            <div className="text-xs mt-0.5" style={{ color: 'var(--text-primary)' }}>
                                {log.message}
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}
