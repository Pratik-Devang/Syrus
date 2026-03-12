import { useState } from 'react';

const INTERVENTIONS = [
    {
        action: 'add_ambulances',
        label: 'Deploy Ambulances',
        icon: '🚑',
        description: 'Send additional ambulances to increase hospital capacity',
        unit: 'units',
    },
    {
        action: 'deploy_generator',
        label: 'Deploy Generators',
        icon: '🔋',
        description: 'Deploy backup generators to restore power grid',
        unit: 'generators',
    },
    {
        action: 'open_shelter',
        label: 'Open New Shelter',
        icon: '🏕️',
        description: 'Open emergency shelters for displaced population',
        unit: 'shelters',
    },
];

export default function WhatIfPanel({ onRunWhatIf, running }) {
    const [selectedAction, setSelectedAction] = useState('add_ambulances');
    const [amount, setAmount] = useState(3);
    const [result, setResult] = useState(null);
    const [loading, setLoading] = useState(false);

    const handleRun = async () => {
        setLoading(true);
        const res = await onRunWhatIf(selectedAction, null, amount);
        setResult(res);
        setLoading(false);
    };

    const selectedIntervention = INTERVENTIONS.find(i => i.action === selectedAction);

    return (
        <div className="glass-card p-5 animate-slide-up">
            <h3 className="font-display text-sm tracking-widest mb-4" style={{ color: 'var(--secondary)' }}>
                🔮 WHAT-IF SIMULATION
            </h3>

            {/* Intervention selection */}
            <div className="space-y-2 mb-4">
                {INTERVENTIONS.map(int => (
                    <button
                        key={int.action}
                        onClick={() => { setSelectedAction(int.action); setResult(null); }}
                        className="w-full text-left p-3 rounded-lg transition-all duration-300 flex items-center gap-3"
                        style={{
                            background: selectedAction === int.action ? 'rgba(168, 85, 247, 0.1)' : 'rgba(255,255,255,0.02)',
                            border: `1px solid ${selectedAction === int.action ? 'rgba(168, 85, 247, 0.3)' : 'rgba(255,255,255,0.05)'}`,
                        }}
                    >
                        <span className="text-lg">{int.icon}</span>
                        <div>
                            <div className="text-xs font-semibold" style={{ color: selectedAction === int.action ? 'var(--secondary)' : 'var(--text-primary)' }}>
                                {int.label}
                            </div>
                            <div className="text-xs" style={{ color: 'var(--text-secondary)' }}>{int.description}</div>
                        </div>
                    </button>
                ))}
            </div>

            {/* Amount */}
            <div className="mb-4">
                <label className="block text-xs uppercase tracking-wider mb-2" style={{ color: 'var(--text-secondary)' }}>
                    Amount: <span style={{ color: 'var(--secondary)' }}>{amount} {selectedIntervention?.unit}</span>
                </label>
                <input
                    type="range"
                    min="1"
                    max="10"
                    value={amount}
                    onChange={e => { setAmount(Number(e.target.value)); setResult(null); }}
                    className="w-full"
                    style={{ accentColor: '#a855f7' }}
                />
            </div>

            {/* Run button */}
            <button
                onClick={handleRun}
                disabled={!running || loading}
                className="btn-neon w-full mb-4"
                style={{
                    color: 'var(--secondary)',
                    borderColor: 'var(--secondary)',
                    opacity: (!running || loading) ? 0.4 : 1,
                }}
            >
                {loading ? '⏳ Simulating...' : '🔬 Run What-If'}
            </button>

            {/* Results */}
            {result && (
                <div className="space-y-3 animate-fade-in">
                    <div className="text-xs font-bold uppercase tracking-wider" style={{ color: 'var(--secondary)' }}>
                        Comparison Results
                    </div>

                    {/* Before vs After */}
                    <div className="grid grid-cols-2 gap-2">
                        <div className="p-3 rounded-lg" style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)' }}>
                            <div className="text-xs mb-1" style={{ color: 'var(--text-secondary)' }}>Before</div>
                            <div className="text-lg font-bold" style={{ color: '#ef4444' }}>
                                {result.before?.overall_risk?.toFixed(1)}%
                            </div>
                            <div className="text-xs" style={{ color: 'var(--text-secondary)' }}>Risk Score</div>
                        </div>
                        <div className="p-3 rounded-lg" style={{ background: 'rgba(34,197,94,0.08)', border: '1px solid rgba(34,197,94,0.2)' }}>
                            <div className="text-xs mb-1" style={{ color: 'var(--text-secondary)' }}>After</div>
                            <div className="text-lg font-bold" style={{ color: '#22c55e' }}>
                                {result.after?.overall_risk?.toFixed(1)}%
                            </div>
                            <div className="text-xs" style={{ color: 'var(--text-secondary)' }}>Risk Score</div>
                        </div>
                    </div>

                    {/* Improvement */}
                    <div className="p-3 rounded-lg text-center" style={{ background: 'rgba(168,85,247,0.08)', border: '1px solid rgba(168,85,247,0.2)' }}>
                        <div className="text-xs mb-1" style={{ color: 'var(--text-secondary)' }}>Risk Reduction</div>
                        <div className="text-xl font-bold" style={{ color: 'var(--secondary)' }}>
                            ↓ {result.improvement?.risk_reduction?.toFixed(1)}%
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
