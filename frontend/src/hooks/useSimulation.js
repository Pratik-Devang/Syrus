import { useState, useEffect, useRef, useCallback } from 'react';

const WS_URL = 'ws://127.0.0.1:8000/ws';
const API_BASE = 'http://127.0.0.1:8000';

export function useSimulation() {
    const [state, setState] = useState(null);
    const [connected, setConnected] = useState(false);
    const [timeline, setTimeline] = useState([]);
    const [viewingTick, setViewingTick] = useState(null);
    const wsRef = useRef(null);
    const reconnectTimer = useRef(null);

    const connect = useCallback(() => {
        if (wsRef.current?.readyState === WebSocket.OPEN) return;

        const ws = new WebSocket(WS_URL);

        ws.onopen = () => {
            setConnected(true);
            console.log('[WS] Connected');
        };

        ws.onmessage = (event) => {
            try {
                const data = JSON.parse(event.data);
                setState(data);
                if (data.tick > 0) {
                    setTimeline(prev => {
                        const next = [...prev, data];
                        return next.length > 60 ? next.slice(-60) : next;
                    });
                }
            } catch (e) {
                console.error('[WS] Parse error:', e);
            }
        };

        ws.onclose = () => {
            setConnected(false);
            console.log('[WS] Disconnected, reconnecting...');
            reconnectTimer.current = setTimeout(connect, 3000);
        };

        ws.onerror = (err) => {
            console.error('[WS] Error:', err);
            ws.close();
        };

        wsRef.current = ws;
    }, []);

    useEffect(() => {
        connect();
        return () => {
            if (wsRef.current) wsRef.current.close();
            if (reconnectTimer.current) clearTimeout(reconnectTimer.current);
        };
    }, [connect]);

    const startSimulation = async (disasterType, epicenterZone, intensity = 70) => {
        try {
            const res = await fetch(`${API_BASE}/api/start`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    type: disasterType,
                    epicenter_zone: epicenterZone,
                    intensity: intensity,
                }),
            });
            setTimeline([]);
            setViewingTick(null);
            return await res.json();
        } catch (e) {
            console.error('Start failed:', e);
        }
    };

    const stopSimulation = async () => {
        try {
            const res = await fetch(`${API_BASE}/api/stop`, { method: 'POST' });
            return await res.json();
        } catch (e) {
            console.error('Stop failed:', e);
        }
    };

    const runWhatIf = async (action, targetZone = null, amount = 1) => {
        try {
            const res = await fetch(`${API_BASE}/api/whatif`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    action: action,
                    target_zone: targetZone,
                    amount: amount,
                }),
            });
            return await res.json();
        } catch (e) {
            console.error('What-if failed:', e);
        }
    };

    const viewTick = (tickIndex) => {
        if (tickIndex === null || tickIndex === undefined) {
            setViewingTick(null);
            return;
        }
        if (timeline[tickIndex]) {
            setViewingTick(tickIndex);
        }
    };

    const displayState = viewingTick !== null && timeline[viewingTick]
        ? timeline[viewingTick]
        : state;

    return {
        state: displayState,
        liveState: state,
        connected,
        timeline,
        viewingTick,
        startSimulation,
        stopSimulation,
        runWhatIf,
        viewTick,
    };
}
