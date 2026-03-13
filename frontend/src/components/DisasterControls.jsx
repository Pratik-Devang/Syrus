import { useState } from 'react';

const DISASTERS = [
    { type: 'flood', label: 'Flood', icon: '🌊', color: '#3b82f6' },
    { type: 'earthquake', label: 'Earthquake', icon: '🌍', color: '#f59e0b' },
    { type: 'cyclone', label: 'Cyclone', icon: '🌀', color: '#8b5cf6' },
    { type: 'grid_failure', label: 'Grid Failure', icon: '⚡', color: '#ef4444' },
];

const ZONES = [
    { id: 'z1', name: 'South Mumbai' },
    { id: 'z2', name: 'Colaba' },
    { id: 'z3', name: 'Dadar' },
    { id: 'z4', name: 'Bandra' },
    { id: 'z5', name: 'Andheri' },
    { id: 'z6', name: 'Juhu' },
    { id: 'z7', name: 'Powai' },
    { id: 'z8', name: 'Kurla' },
    { id: 'z9', name: 'Dharavi' },
    { id: 'z10', name: 'Sion' },
    { id: 'z11', name: 'Chembur' },
    { id: 'z12', name: 'Borivali' },
    { id: 'z13', name: 'Thane' },
    { id: 'z14', name: 'Navi Mumbai' },
];

export default function DisasterControls({ onStart, onStop, onReset, running, loading, error }) {
    const [selectedDisaster, setSelectedDisaster] = useState('flood');
    const [selectedZone, setSelectedZone] = useState('z9'); // Default: Dharavi
    const [intensity, setIntensity] = useState(70);

    const handleStart = () => {
        if (loading) return;
        onStart(selectedDisaster, selectedZone, intensity);
    };

    return (
        <div className="glass-card p-5 animate-slide-up">
            <h3 className="font-display text-sm tracking-widest mb-4" style={{ color: 'var(--primary)' }}>
                ⚠️ DISASTER CONTROL
            </h3>

            {/* Error Banner */}
            {error && (
                <div className="mb-4 p-3 rounded-lg text-xs font-semibold"
                    style={{
                        background: 'rgba(239,68,68,0.1)',
                        border: '1px solid rgba(239,68,68,0.3)',
                        color: '#ef4444',
                    }}>
                    ⚠️ {error}
                </div>
            )}

            {/* Disaster Type */}
            <div className="mb-4">
                <label className="block text-xs uppercase tracking-wider mb-2" style={{ color: 'var(--text-secondary)' }}>
                    Event Type
                </label>
                <div className="grid grid-cols-2 gap-2">
                    {DISASTERS.map(d => (
                        <button
                            key={d.type}
                            onClick={() => setSelectedDisaster(d.type)}
                            className="py-2 px-3 rounded-lg text-sm font-semibold transition-all duration-300"
                            style={{
                                background: selectedDisaster === d.type ? `${d.color}22` : 'rgba(255,255,255,0.03)',
                                border: `1px solid ${selectedDisaster === d.type ? d.color : 'rgba(255,255,255,0.08)'}`,
                                color: selectedDisaster === d.type ? d.color : 'var(--text-secondary)',
                            }}
                        >
                            {d.icon} {d.label}
                        </button>
                    ))}
                </div>
            </div>

            {/* Epicenter Zone */}
            <div className="mb-4">
                <label className="block text-xs uppercase tracking-wider mb-2" style={{ color: 'var(--text-secondary)' }}>
                    Epicenter Zone
                </label>
                <select
                    value={selectedZone}
                    onChange={e => setSelectedZone(e.target.value)}
                    className="w-full py-2 px-3 rounded-lg text-sm"
                    style={{
                        background: 'rgba(15, 23, 42, 0.8)',
                        border: '1px solid var(--glass-border)',
                        color: 'var(--text-primary)',
                        outline: 'none',
                    }}
                >
                    {ZONES.map(z => (
                        <option key={z.id} value={z.id}>{z.name}</option>
                    ))}
                </select>
            </div>

            {/* Intensity Slider */}
            <div className="mb-5">
                <label className="block text-xs uppercase tracking-wider mb-2" style={{ color: 'var(--text-secondary)' }}>
                    Intensity: <span style={{ color: intensity > 70 ? 'var(--danger)' : intensity > 40 ? 'var(--warning)' : 'var(--success)' }}>
                        {intensity}%
                    </span>
                </label>
                <input
                    type="range"
                    min="10"
                    max="100"
                    value={intensity}
                    onChange={e => setIntensity(Number(e.target.value))}
                    className="w-full"
                    style={{
                        accentColor: 'var(--primary)',
                    }}
                />
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col gap-2">
                <div className="flex gap-3">
                    {!running ? (
                        <button
                            onClick={handleStart}
                            disabled={loading}
                            className="btn-neon flex-1"
                            style={{ opacity: loading ? 0.6 : 1 }}
                        >
                            {loading ? '⏳ Starting...' : '▶ Launch Simulation'}
                        </button>
                    ) : (
                        <button onClick={onStop} className="btn-neon danger flex-1">
                            ■ Stop Simulation
                        </button>
                    )}
                </div>

                {/* Reset Button — always available */}
                <button
                    onClick={onReset}
                    disabled={loading}
                    className="w-full py-2 px-3 rounded-lg text-xs font-semibold uppercase tracking-wider transition-all duration-300"
                    style={{
                        background: 'rgba(255,255,255,0.03)',
                        border: '1px solid var(--glass-border)',
                        color: 'var(--text-secondary)',
                        opacity: loading ? 0.4 : 1,
                    }}
                >
                    🔄 Reset All
                </button>
            </div>
        </div>
    );
}
