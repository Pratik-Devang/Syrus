import React from 'react';

const URGENCY_CONFIG = {
    critical: { color: '#ef4444', bg: 'rgba(239,68,68,0.12)', border: 'rgba(239,68,68,0.3)', label: '🔴 CRITICAL', order: 0 },
    high:     { color: '#f59e0b', bg: 'rgba(245,158,11,0.1)', border: 'rgba(245,158,11,0.3)', label: '🟠 HIGH', order: 1 },
    medium:   { color: '#eab308', bg: 'rgba(234,179,8,0.1)',  border: 'rgba(234,179,8,0.25)', label: '🟡 MEDIUM', order: 2 },
    low:      { color: '#22c55e', bg: 'rgba(34,197,94,0.1)', border: 'rgba(34,197,94,0.25)', label: '🟢 LOW', order: 3 },
};

function getRiskColor(score) {
    if (score > 70) return '#ef4444';
    if (score > 40) return '#f59e0b';
    return '#22c55e';
}

function PriorityCard({ rec }) {
    const urgency = URGENCY_CONFIG[rec.urgency] || URGENCY_CONFIG.medium;
    const agent = rec.agent?.replace(' Agent', '') || 'AI';

    return (
        <div
            className="rounded-xl p-4 flex flex-col gap-2 transition-all duration-300 hover:scale-[1.01]"
            style={{
                background: urgency.bg,
                border: `1px solid ${urgency.border}`,
            }}
        >
            {/* Header row */}
            <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-2 flex-1 min-w-0">
                    <span className="text-xs font-bold px-2 py-0.5 rounded-full shrink-0"
                        style={{ background: urgency.bg, color: urgency.color, border: `1px solid ${urgency.border}` }}>
                        {urgency.label}
                    </span>
                    <span className="text-xs px-2 py-0.5 rounded-full shrink-0"
                        style={{ background: 'rgba(255,255,255,0.06)', color: 'var(--text-secondary)' }}>
                        {agent}
                    </span>
                </div>
                <span className="text-xs font-bold shrink-0" style={{ color: 'var(--primary)' }}>
                    {rec.confidence?.toFixed(0)}%
                </span>
            </div>

            {/* Action */}
            <div className="text-sm font-semibold leading-snug" style={{ color: 'var(--text-primary)' }}>
                {rec.action?.replace(/^\[P\d+\] /, '')}
            </div>

            {/* Reason */}
            {rec.reason && (
                <div className="text-xs leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
                    {rec.reason}
                </div>
            )}

            {/* Metadata row */}
            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-1">
                {rec.affected_zone && (
                    <div className="flex items-center gap-1">
                        <span style={{ color: 'var(--text-secondary)', fontSize: '0.65rem' }}>📍</span>
                        <span className="text-xs font-medium" style={{ color: 'var(--primary)' }}>
                            {rec.affected_zone.length > 35 ? rec.affected_zone.slice(0, 35) + '…' : rec.affected_zone}
                        </span>
                    </div>
                )}
                {rec.expected_impact && (
                    <div className="flex items-center gap-1">
                        <span style={{ color: 'var(--text-secondary)', fontSize: '0.65rem' }}>📈</span>
                        <span className="text-xs" style={{ color: 'var(--text-secondary)' }}>
                            {rec.expected_impact.length > 50 ? rec.expected_impact.slice(0, 50) + '…' : rec.expected_impact}
                        </span>
                    </div>
                )}
            </div>

            {/* Confidence bar */}
            <div className="h-0.5 rounded-full overflow-hidden mt-1" style={{ background: 'rgba(255,255,255,0.05)' }}>
                <div className="h-full rounded-full transition-all duration-700"
                    style={{ width: `${rec.confidence}%`, background: `linear-gradient(90deg, ${urgency.color}, ${urgency.color}88)` }} />
            </div>
        </div>
    );
}

const Dashboard = React.memo(function Dashboard({ state }) {
    if (!state) return null;

    const { zones = [], recommendations = [], overall_risk = 0, tick = 0, disaster } = state;

    // Gather top action recs from CommandAgent and others, sorted by urgency
    const urgencyOrder = { critical: 0, high: 1, medium: 2, low: 3 };
    const allRecs = recommendations
        .filter(r => r.action && r.reason)
        .sort((a, b) => {
            const uDiff = (urgencyOrder[a.urgency] ?? 4) - (urgencyOrder[b.urgency] ?? 4);
            return uDiff !== 0 ? uDiff : a.priority - b.priority;
        });

    // Deduplicate by action prefix
    const seen = new Set();
    const uniqueRecs = allRecs.filter(r => {
        const key = r.action.slice(0, 50);
        if (seen.has(key)) return false;
        seen.add(key);
        return true;
    }).slice(0, 8);

    const avgConfidence = uniqueRecs.length > 0
        ? uniqueRecs.reduce((s, r) => s + r.confidence, 0) / uniqueRecs.length : 0;

    const sortedZones = [...zones].sort((a, b) => b.risk_score - a.risk_score);
    const riskColor = overall_risk > 60 ? '#ef4444' : overall_risk > 30 ? '#f59e0b' : '#22c55e';

    return (
        <div className="flex flex-col gap-4 animate-slide-up">
            {/* Overall Risk Gauge */}
            <div className="glass-card p-5">
                <div className="flex items-center justify-between mb-3">
                    <h3 className="font-display text-xs tracking-widest font-bold uppercase" style={{ color: 'var(--primary)' }}>
                        ◈ Overall Assessment
                    </h3>
                    <span className="text-xs font-mono font-bold" style={{ color: 'var(--text-secondary)' }}>
                        T+{tick.toString().padStart(3, '0')}
                    </span>
                </div>

                {disaster && (
                    <div className="mb-3 text-xs font-semibold px-3 py-2 rounded-lg flex items-center gap-2"
                        style={{ background: 'rgba(239,68,68,0.05)', border: '1px solid rgba(239,68,68,0.2)', color: '#f87171' }}>
                        ⚠️ Active: <span className="uppercase tracking-wide font-bold">{disaster.type}</span>
                        &nbsp;— Intensity <span style={{ color: '#ef4444' }}>{disaster.intensity?.toFixed(0)}%</span>
                    </div>
                )}

                <div className="flex items-center gap-5">
                    <div className="relative w-20 h-20 rounded-full flex items-center justify-center shrink-0"
                        style={{
                            background: `conic-gradient(${riskColor} ${overall_risk * 3.6}deg, rgba(255,255,255,0.04) 0deg)`,
                            boxShadow: overall_risk > 60 ? `0 0 25px ${riskColor}40` : 'none',
                        }}>
                        <div className="w-14 h-14 rounded-full flex flex-col items-center justify-center"
                            style={{ background: 'var(--bg-dark)' }}>
                            <span className="text-lg font-bold font-display" style={{ color: riskColor }}>
                                {overall_risk.toFixed(0)}
                            </span>
                            <span className="text-xs" style={{ color: 'var(--text-secondary)' }}>RISK</span>
                        </div>
                    </div>

                    <div className="flex-1 flex flex-col gap-2">
                        <div>
                            <div className="text-xs uppercase tracking-wider font-semibold mb-1" style={{ color: 'var(--text-secondary)' }}>
                                AI Confidence
                            </div>
                            <div className="flex items-center gap-2">
                                <div className="health-bar flex-1">
                                    <div className="health-bar-fill" style={{
                                        width: `${avgConfidence}%`,
                                        background: avgConfidence > 70 ? 'linear-gradient(90deg, #22c55e, #86efac)' : 'linear-gradient(90deg, #f59e0b, #fcd34d)'
                                    }} />
                                </div>
                                <span className="text-sm font-bold font-display" style={{ color: 'var(--primary)', minWidth: '2.5rem' }}>
                                    {avgConfidence.toFixed(0)}%
                                </span>
                            </div>
                        </div>

                        <div className="flex gap-2 text-xs">
                            <div className="px-2 py-1 rounded-md" style={{ background: 'rgba(239,68,68,0.1)', color: '#ef4444' }}>
                                {uniqueRecs.filter(r => r.urgency === 'critical').length} Critical
                            </div>
                            <div className="px-2 py-1 rounded-md" style={{ background: 'rgba(245,158,11,0.1)', color: '#f59e0b' }}>
                                {uniqueRecs.filter(r => r.urgency === 'high').length} High
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Priority Actions */}
            {uniqueRecs.length > 0 && (
                <div className="glass-card p-5">
                    <h3 className="font-display text-xs tracking-widest font-bold uppercase mb-3" style={{ color: 'var(--primary)' }}>
                        🎯 Priority Actions ({uniqueRecs.length})
                    </h3>
                    <div className="flex flex-col gap-2">
                        {uniqueRecs.map((rec, i) => (
                            <PriorityCard key={i} rec={rec} index={i} />
                        ))}
                    </div>
                </div>
            )}

            {/* District Risk Map */}
            <div className="glass-card p-5">
                <h3 className="font-display text-xs tracking-widest font-bold uppercase mb-3" style={{ color: 'var(--primary)' }}>
                    🗺️ District Risk Scores
                </h3>
                <div className="grid grid-cols-2 gap-1.5">
                    {sortedZones.map((zone) => (
                        <div key={zone.id} className="p-2 rounded-lg"
                            style={{
                                background: 'rgba(255,255,255,0.03)',
                                border: `1px solid ${zone.risk_score > 60 ? 'rgba(239,68,68,0.25)' : 'var(--glass-border)'}`,
                            }}>
                            <div className="flex items-center justify-between mb-1">
                                <span className="text-xs truncate font-semibold" style={{ color: 'var(--text-primary)' }}>
                                    {zone.name}
                                </span>
                                <span className="text-xs font-bold ml-1 shrink-0" style={{ color: getRiskColor(zone.risk_score) }}>
                                    {zone.risk_score.toFixed(0)}%
                                </span>
                            </div>
                            <div className="h-0.5 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.05)' }}>
                                <div className="h-full rounded-full transition-all duration-500"
                                    style={{
                                        width: `${zone.risk_score}%`,
                                        background: `linear-gradient(90deg, ${getRiskColor(zone.risk_score)}, ${getRiskColor(zone.risk_score)}88)`,
                                    }} />
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
});

export default Dashboard;
