export default function TimelineSlider({ timeline = [], viewingTick, onViewTick }) {
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
                    {!isLive && (
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
                        {isLive ? '● LIVE' : `Tick ${viewingTick + 1}/${maxTick + 1}`}
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
                    onChange={e => onViewTick(Number(e.target.value))}
                    className="flex-1"
                    style={{ accentColor: 'var(--primary)' }}
                />
                <span className="text-xs" style={{ color: 'var(--text-secondary)' }}>{maxTick + 1}</span>
            </div>
        </div>
    );
}
