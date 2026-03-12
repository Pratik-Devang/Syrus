import { useEffect, useRef } from 'react';
import { MapContainer, TileLayer, CircleMarker, Polyline, Polygon, Popup, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';

const CENTER = [28.6139, 77.2090];
const ZOOM = 14;

function getRiskColor(score) {
    if (score > 70) return '#ef4444';
    if (score > 40) return '#f59e0b';
    if (score > 15) return '#eab308';
    return '#22c55e';
}

function getStatusColor(status) {
    if (status === 'failed') return '#ef4444';
    if (status === 'degraded') return '#f59e0b';
    return '#22c55e';
}

function getInfraIcon(type) {
    switch (type) {
        case 'hospital': return '🏥';
        case 'power_station': return '⚡';
        case 'shelter': return '🏠';
        default: return '📍';
    }
}

function AnimatedCircle({ center, radius, color, opacity = 0.3, pulsing = false }) {
    const ref = useRef();
    useEffect(() => {
        if (pulsing && ref.current) {
            const el = ref.current.getElement?.();
            if (el) el.style.animation = 'pulse-danger 1.5s ease-in-out infinite';
        }
    }, [pulsing]);

    return (
        <CircleMarker
            ref={ref}
            center={center}
            radius={radius}
            pathOptions={{
                color: color,
                fillColor: color,
                fillOpacity: opacity,
                weight: 2,
            }}
        />
    );
}

function MapUpdater({ center }) {
    const map = useMap();
    useEffect(() => {
        map.setView(center, ZOOM);
    }, []);
    return null;
}

export default function CityMap({ state, onZoneClick }) {
    if (!state) return null;

    const { zones = [], infrastructure = [], roads = [] } = state;

    return (
        <div className="glass-card overflow-hidden" style={{ height: '100%', minHeight: '400px' }}>
            <MapContainer
                center={CENTER}
                zoom={ZOOM}
                style={{ height: '100%', width: '100%', borderRadius: '16px' }}
                zoomControl={true}
            >
                <MapUpdater center={CENTER} />
                <TileLayer
                    attribution='&copy; OpenStreetMap'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />

                {/* Zone Polygons */}
                {zones.map(zone => (
                    <Polygon
                        key={zone.id}
                        positions={zone.polygon}
                        pathOptions={{
                            color: getRiskColor(zone.risk_score),
                            fillColor: getRiskColor(zone.risk_score),
                            fillOpacity: Math.min(0.5, zone.risk_score / 150 + 0.05),
                            weight: 2,
                        }}
                        eventHandlers={{
                            click: () => onZoneClick?.(zone),
                        }}
                    >
                        <Popup>
                            <div style={{ color: '#e2e8f0', minWidth: '160px' }}>
                                <div style={{ fontWeight: 700, fontSize: '0.95rem', marginBottom: 4 }}>{zone.name}</div>
                                <div style={{ fontSize: '0.8rem', opacity: 0.8 }}>
                                    Risk: <span style={{ color: getRiskColor(zone.risk_score), fontWeight: 600 }}>{zone.risk_score.toFixed(0)}%</span>
                                </div>
                                <div style={{ fontSize: '0.8rem', opacity: 0.8 }}>
                                    Hazard: {zone.hazard_intensity.toFixed(1)}
                                </div>
                                <div style={{ fontSize: '0.8rem', opacity: 0.8 }}>
                                    Pop: {zone.population.toLocaleString()}
                                </div>
                                {zone.flood_prone && <div style={{ fontSize: '0.75rem', color: '#60a5fa', marginTop: 2 }}>🌊 Flood-prone zone</div>}
                            </div>
                        </Popup>
                    </Polygon>
                ))}

                {/* Pulsing risk circles */}
                {zones.filter(z => z.risk_score > 30).map(zone => (
                    <AnimatedCircle
                        key={`risk-${zone.id}`}
                        center={zone.center}
                        radius={Math.min(25, zone.risk_score / 4 + 5)}
                        color={getRiskColor(zone.risk_score)}
                        opacity={zone.risk_score / 200}
                        pulsing={zone.risk_score > 60}
                    />
                ))}

                {/* Roads */}
                {roads.map(road => (
                    <Polyline
                        key={road.id}
                        positions={road.points}
                        pathOptions={{
                            color: road.blocked ? '#ef4444' : road.status === 'degraded' ? '#f59e0b' : '#22c55e',
                            weight: road.blocked ? 4 : 3,
                            opacity: 0.8,
                            dashArray: road.blocked ? '10 6' : null,
                        }}
                    >
                        <Popup>
                            <div style={{ color: '#e2e8f0' }}>
                                <div style={{ fontWeight: 700 }}>{road.name}</div>
                                <div style={{ fontSize: '0.8rem', color: getStatusColor(road.status) }}>
                                    {road.blocked ? '🚧 BLOCKED' : road.status.toUpperCase()}
                                </div>
                                <div style={{ fontSize: '0.8rem', opacity: 0.7 }}>Damage: {road.damage.toFixed(0)}%</div>
                            </div>
                        </Popup>
                    </Polyline>
                ))}

                {/* Infrastructure Markers */}
                {infrastructure.map(infra => (
                    <CircleMarker
                        key={infra.id}
                        center={[infra.lat, infra.lng]}
                        radius={10}
                        pathOptions={{
                            color: getStatusColor(infra.status),
                            fillColor: getStatusColor(infra.status),
                            fillOpacity: 0.8,
                            weight: 2,
                        }}
                    >
                        <Popup>
                            <div style={{ color: '#e2e8f0', minWidth: '150px' }}>
                                <div style={{ fontWeight: 700, fontSize: '0.95rem' }}>
                                    {getInfraIcon(infra.type)} {infra.name}
                                </div>
                                <div style={{ fontSize: '0.8rem', color: getStatusColor(infra.status), marginTop: 2 }}>
                                    {infra.status.toUpperCase()}
                                </div>
                                <div style={{ fontSize: '0.8rem', opacity: 0.7 }}>
                                    Damage: {infra.damage.toFixed(0)}%
                                </div>
                                {infra.type === 'hospital' && (
                                    <div style={{ fontSize: '0.8rem', opacity: 0.7 }}>
                                        Load: {infra.current_load}/{infra.capacity}
                                    </div>
                                )}
                            </div>
                        </Popup>
                    </CircleMarker>
                ))}
            </MapContainer>
        </div>
    );
}
