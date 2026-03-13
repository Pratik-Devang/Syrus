export default function TimelineSlider({ timeline = [], viewingTick, onViewTick, running = false }) {
    if (timeline.length === 0) return null;

    const maxTick = timeline.length - 1;
    const isLive = viewingTick === null;

    return (
        <div className="glass-card p-4 animate-slide-up">
            <div className="flex items-center justify-between mb-2">
                <h3 className="font-display text-xs tracking-widest" style={{ color: 'var(--primary)' }}>
                    ⏱️ SIMULATION TIMELINE
                </h3>
                <div className="flex items-center gap-2">
                    {!isLive && !running && (
                        <button
                            onClick={() => onViewTick(null)}
                            className="text-xs px-3 py-1 rounded-md font-semibold transition-all"
                            style={{
                                background: 'rgba(0, 240, 255, 0.15)',
                                color: 'var(--primary)',
                                border: '1px solid rgba(0, 240, 255, 0.3)',
                            }}
                        >
                            ◉ LIVE
                        </button>
                    )}
                    <span className="text-xs" style={{ color: isLive ? 'var(--success)' : 'var(--warning)' }}>
                        {isLive ? `● LIVE — Tick ${maxTick + 1}` : `Tick ${viewingTick + 1}/${maxTick + 1}`}
                    </span>
                </div>
            </div>

            <div className="flex items-center gap-3">
                <span className="text-xs" style={{ color: 'var(--text-secondary)' }}>1</span>
                <input
                    type="range"
                    min={0}
                    max={maxTick}
                    value={viewingTick !== null ? viewingTick : maxTick}
                    onChange={e => {
                        // Only allow scrubbing when simulation is stopped
                        if (!running) {
                            onViewTick(Number(e.target.value));
                        }
                    }}
                    disabled={running}
                    className="flex-1"
                    style={{ accentColor: 'var(--primary)', opacity: running ? 0.6 : 1 }}
                />
                <span className="text-xs" style={{ color: 'var(--text-secondary)' }}>{maxTick + 1}</span>
            </div>

            {running && (
                <div className="mt-1 text-xs text-center" style={{ color: 'var(--text-secondary)' }}>
                    Timeline scrubbing available after stopping simulation
                </div>
            )}
        </div>
    );
}
