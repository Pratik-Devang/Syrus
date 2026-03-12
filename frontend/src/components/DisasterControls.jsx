import { useState } from 'react';

const DISASTERS = [
    { type: 'flood', label: 'Flood', icon: '🌊', color: '#3b82f6' },
    { type: 'earthquake', label: 'Earthquake', icon: '🌍', color: '#f59e0b' },
];

const ZONES = [
    { id: 'z1', name: 'Central District' },
    { id: 'z2', name: 'Riverside Zone' },
    { id: 'z3', name: 'Industrial Area' },
    { id: 'z4', name: 'South Residential' },
    { id: 'z5', name: 'North Commercial' },
    { id: 'z6', name: 'East Suburbs' },
    { id: 'z7', name: 'West Heritage' },
    { id: 'z8', name: 'Lake District' },
];

export default function DisasterControls({ onStart, onStop, running }) {
    const [selectedDisaster, setSelectedDisaster] = useState('flood');
    const [selectedZone, setSelectedZone] = useState('z1');
    const [intensity, setIntensity] = useState(70);

    const handleStart = () => {
        onStart(selectedDisaster, selectedZone, intensity);
    };

    return (
        <div className="glass-card p-5 animate-slide-up">
            <h3 className="font-display text-sm tracking-widest mb-4" style={{ color: 'var(--primary)' }}>
                ⚠️ DISASTER CONTROL
            </h3>

            {/* Disaster Type */}
            <div className="mb-4">
                <label className="block text-xs uppercase tracking-wider mb-2" style={{ color: 'var(--text-secondary)' }}>
                    Event Type
                </label>
                <div className="flex gap-2">
                    {DISASTERS.map(d => (
                        <button
                            key={d.type}
                            onClick={() => setSelectedDisaster(d.type)}
                            className="flex-1 py-2 px-3 rounded-lg text-sm font-semibold transition-all duration-300"
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
            <div className="flex gap-3">
                {!running ? (
                    <button onClick={handleStart} className="btn-neon flex-1">
                        ▶ Launch Simulation
                    </button>
                ) : (
                    <button onClick={onStop} className="btn-neon danger flex-1">
                        ■ Stop Simulation
                    </button>
                )}
            </div>
        </div>
    );
}
