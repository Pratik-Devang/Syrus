export default function Dashboard({ state }) {
    if (!state) return null;

    const { zones = [], recommendations = [], overall_risk = 0, tick = 0 } = state;

    // Get Command Agent's top prioritized recommendations
    const commandRecs = recommendations.filter(r => r.agent === 'Command Agent' && r.action.startsWith('[PRIORITY'));
    const planRec = recommendations.find(r => r.agent === 'Command Agent' && r.action === 'CRISIS ACTION PLAN UPDATED');
    const avgConfidence = planRec?.confidence || 0;

    // Zone risk cards
    const sortedZones = [...zones].sort((a, b) => b.risk_score - a.risk_score);

    return (
        <div className="space-y-4 animate-slide-up">
            {/* Overall Risk */}
            <div className="glass-card p-5">
                <div className="flex items-center justify-between mb-3">
                    <h3 className="font-display text-sm tracking-widest" style={{ color: 'var(--primary)' }}>
                        📊 OVERALL ASSESSMENT
                    </h3>
                    <span className="text-xs" style={{ color: 'var(--text-secondary)' }}>TICK {tick}</span>
                </div>

                <div className="flex items-center gap-6">
                    {/* Overall Risk Gauge */}
                    <div className="text-center">
                        <div
                            className="relative w-20 h-20 rounded-full flex items-center justify-center"
                            style={{
                                background: `conic-gradient(${overall_risk > 70 ? '#ef4444' : overall_risk > 40 ? '#f59e0b' : '#22c55e'} ${overall_risk * 3.6}deg, rgba(255,255,255,0.05) 0deg)`,
                                boxShadow: overall_risk > 60 ? '0 0 20px rgba(239,68,68,0.3)' : 'none',
                            }}
                        >
                            <div className="w-14 h-14 rounded-full flex items-center justify-center"
                                style={{ background: 'var(--bg-dark)' }}>
                                <span className="text-xl font-bold" style={{
                                    color: overall_risk > 70 ? '#ef4444' : overall_risk > 40 ? '#f59e0b' : '#22c55e',
                                }}>
                                    {overall_risk.toFixed(0)}
                                </span>
                            </div>
                        </div>
                        <div className="text-xs mt-1" style={{ color: 'var(--text-secondary)' }}>RISK</div>
                    </div>

                    {/* Confidence */}
                    <div className="flex-1">
                        <div className="text-xs uppercase tracking-wider mb-1" style={{ color: 'var(--text-secondary)' }}>
                            AI Recommendation Confidence
                        </div>
                        <div className="flex items-center gap-3">
                            <div className="health-bar flex-1">
                                <div
                                    className="health-bar-fill"
                                    style={{
                                        width: `${avgConfidence}%`,
                                        background: avgConfidence > 70 ? 'linear-gradient(90deg, #22c55e, #86efac)' :
                                            avgConfidence > 40 ? 'linear-gradient(90deg, #f59e0b, #fcd34d)' :
                                                'linear-gradient(90deg, #ef4444, #fca5a5)',
                                    }}
                                />
                            </div>
                            <span className="text-sm font-bold" style={{ color: 'var(--primary)', minWidth: '3rem' }}>
                                {avgConfidence.toFixed(0)}%
                            </span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Zone Risk Cards */}
            <div className="glass-card p-5">
                <h3 className="font-display text-sm tracking-widest mb-3" style={{ color: 'var(--primary)' }}>
                    🗺️ ZONE RISK SCORES
                </h3>
                <div className="grid grid-cols-2 gap-2">
                    {sortedZones.map((zone, i) => (
                        <div
                            key={zone.id}
                            className="p-3 rounded-lg animate-slide-right"
                            style={{
                                background: 'rgba(255,255,255,0.03)',
                                border: `1px solid ${zone.risk_score > 60 ? 'rgba(239,68,68,0.3)' : 'rgba(255,255,255,0.06)'}`,
                                animationDelay: `${i * 0.05}s`,
                            }}
                        >
                            <div className="flex items-center justify-between">
                                <span className="text-xs font-medium truncate">{zone.name}</span>
                                <span
                                    className="text-xs font-bold ml-2"
                                    style={{
                                        color: zone.risk_score > 70 ? '#ef4444' : zone.risk_score > 40 ? '#f59e0b' : '#22c55e',
                                    }}
                                >
                                    {zone.risk_score.toFixed(0)}
                                </span>
                            </div>
                            <div className="health-bar mt-1">
                                <div
                                    className="health-bar-fill"
                                    style={{
                                        width: `${zone.risk_score}%`,
                                        background: zone.risk_score > 70
                                            ? 'linear-gradient(90deg, #ef4444, #f87171)'
                                            : zone.risk_score > 40
                                                ? 'linear-gradient(90deg, #f59e0b, #fbbf24)'
                                                : 'linear-gradient(90deg, #22c55e, #4ade80)',
                                    }}
                                />
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Priority Actions */}
            {commandRecs.length > 0 && (
                <div className="glass-card p-5">
                    <h3 className="font-display text-sm tracking-widest mb-3" style={{ color: 'var(--primary)' }}>
                        🎯 PRIORITY ACTIONS
                    </h3>
                    <div className="space-y-2">
                        {commandRecs.slice(0, 5).map((rec, i) => (
                            <div
                                key={i}
                                className="p-3 rounded-lg animate-slide-right"
                                style={{
                                    background: 'rgba(0, 240, 255, 0.03)',
                                    border: '1px solid rgba(0, 240, 255, 0.1)',
                                    animationDelay: `${i * 0.1}s`,
                                }}
                            >
                                <div className="flex items-start gap-2">
                                    <span className="text-xs font-bold px-2 py-0.5 rounded" style={{
                                        background: i === 0 ? 'rgba(239,68,68,0.2)' : 'rgba(0,240,255,0.1)',
                                        color: i === 0 ? '#ef4444' : 'var(--primary)',
                                    }}>
                                        #{i + 1}
                                    </span>
                                    <div className="flex-1 min-w-0">
                                        <div className="text-xs font-medium" style={{ color: 'var(--text-primary)' }}>
                                            {rec.action.replace(/\[PRIORITY \d+\] /, '')}
                                        </div>
                                        {rec.details && (
                                            <div className="text-xs mt-1" style={{ color: 'var(--text-secondary)' }}>
                                                {rec.details}
                                            </div>
                                        )}
                                    </div>
                                    <span className="text-xs font-bold" style={{ color: 'var(--primary)' }}>
                                        {rec.confidence.toFixed(0)}%
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}
