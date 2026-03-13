import React, { useEffect, useRef, useMemo } from 'react';
import { MapContainer, TileLayer, Marker, CircleMarker, Polyline, Polygon, Popup, useMap, LayersControl, LayerGroup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

const { Overlay } = LayersControl;

const CENTER = [19.0760, 72.8777]; // Mumbai Center
const ZOOM = 11;

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

function createCustomIcon(type, status, theme) {
    const color = getStatusColor(status);
    let svgIcon = '';
    
    // Clean SVG icons for different types
    switch (type) {
        case 'hospital':
            svgIcon = `<svg viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>`;
            break;
        case 'power_station':
            svgIcon = `<svg viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/></svg>`;
            break;
        case 'shelter':
            svgIcon = `<svg viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/></svg>`;
            break;
        case 'fire_station':
            svgIcon = `<svg viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z"/><path d="M12 6c-3.31 0-6 2.69-6 6s2.69 6 6 6 6-2.69 6-6-2.69-6-6-6z"/></svg>`;
            break;
        case 'police_station':
             svgIcon = `<svg viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>`;
             break;
        default:
             svgIcon = `<svg viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/></svg>`;
    }

    return L.divIcon({
        html: `<div style="background-color: ${color}; border-radius: 50%; padding: 4px; box-shadow: 0 0 8px ${color}80; width: 24px; height: 24px; display: flex; align-items: center; justify-content: center;">${svgIcon}</div>`,
        className: 'custom-infra-icon',
        iconSize: [24, 24],
        iconAnchor: [12, 12],
        popupAnchor: [0, -12]
    });
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

function MapUpdater({ center, zoom }) {
    const map = useMap();
    useEffect(() => {
        map.setView(center, zoom);
    }, [center, zoom, map]);
    return null;
}

const CityMap = React.memo(({ state, theme = 'dark', onZoneClick }) => {
    if (!state) return null;

    const { zones = [], infrastructure = [], roads = [] } = state;

    // Filter infrastructure by type for layers
    const hospitals = useMemo(() => infrastructure.filter(i => i.type === 'hospital'), [infrastructure]);
    const powerStations = useMemo(() => infrastructure.filter(i => i.type === 'power_station'), [infrastructure]);
    const shelters = useMemo(() => infrastructure.filter(i => i.type === 'shelter'), [infrastructure]);
    const otherInfra = useMemo(() => infrastructure.filter(i => !['hospital', 'power_station', 'shelter'].includes(i.type)), [infrastructure]);

    const tileUrl = theme === 'light' 
        ? "https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
        : "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png";

    // CSS variables used inside popups based on theme
    const popupBg = theme === 'light' ? '#ffffff' : '#0f172a';
    const popupColor = theme === 'light' ? '#0f172a' : '#e2e8f0';

    return (
        <MapContainer
            center={CENTER}
            zoom={ZOOM}
            style={{ height: '100%', width: '100%' }}
            zoomControl={true}
        >
            <MapUpdater center={CENTER} zoom={ZOOM} />
            <TileLayer
                attribution='&copy; <a href="https://carto.com/">CARTO</a>'
                url={tileUrl}
            />

            <LayersControl position="topright">
                <Overlay checked name="Districts & Risk Overlays">
                    <LayerGroup>
                        {/* Zone Risk Polygons */}
                        {zones.map(zone => (
                            <Polygon
                                key={zone.id}
                                positions={zone.polygon}
                                pathOptions={{
                                    color: getRiskColor(zone.risk_score),
                                    fillColor: getRiskColor(zone.risk_score),
                                    fillOpacity: Math.min(0.4, zone.risk_score / 200 + 0.1),
                                    weight: zone.risk_score > 60 ? 3 : 1,
                                    dashArray: zone.risk_score > 60 ? '5, 5' : null
                                }}
                                eventHandlers={{
                                    click: () => onZoneClick?.(zone),
                                }}
                            >
                                <Popup>
                                    <div style={{ color: popupColor, background: popupBg, padding: '4px' }}>
                                        <div style={{ fontWeight: 800, fontSize: '1rem', marginBottom: 4 }}>{zone.name}</div>
                                        <div style={{ fontSize: '0.85rem', opacity: 0.9 }}>
                                            Risk Score: <span style={{ color: getRiskColor(zone.risk_score), fontWeight: 'bold' }}>{zone.risk_score.toFixed(0)}%</span>
                                        </div>
                                        <div style={{ fontSize: '0.85rem', opacity: 0.9 }}>
                                            Est. Population: {zone.population.toLocaleString()}
                                        </div>
                                        {zone.flood_prone && <div style={{ fontSize: '0.8rem', color: '#0ea5e9', marginTop: 4, fontWeight: 'bold' }}>🌊 Coastal / Flood-Prone</div>}
                                    </div>
                                </Popup>
                            </Polygon>
                        ))}
                        
                        {/* High Risk Animated Epicenters */}
                        {zones.filter(z => z.risk_score > 30).map(zone => (
                            <CircleMarker
                                key={`risk-${zone.id}`}
                                center={zone.center}
                                radius={Math.min(30, zone.risk_score / 3 + 10)}
                                pathOptions={{
                                    color: getRiskColor(zone.risk_score),
                                    fillColor: getRiskColor(zone.risk_score),
                                    fillOpacity: zone.risk_score / 250,
                                    weight: 2,
                                    className: zone.risk_score > 50 ? 'animate-pulse' : '',
                                }}
                            />
                        ))}
                    </LayerGroup>
                </Overlay>

                <Overlay checked name="Road Network">
                    <LayerGroup>
                        {roads.map(road => (
                            <Polyline
                                key={road.id}
                                positions={road.points}
                                pathOptions={{
                                    color: road.blocked ? '#ef4444' : road.status === 'degraded' ? '#f59e0b' : (theme === 'light' ? '#94a3b8' : '#334155'),
                                    weight: road.blocked ? 5 : 2,
                                    opacity: road.blocked ? 1 : 0.6,
                                    dashArray: road.blocked ? '10 8' : null,
                                }}
                            >
                                <Popup>
                                    <div style={{ color: popupColor, background: popupBg }}>
                                        <div style={{ fontWeight: 700 }}>{road.name}</div>
                                        <div style={{ fontSize: '0.8rem', color: getStatusColor(road.status), fontWeight: 'bold' }}>
                                            {road.blocked ? '🚧 SEVERELY BLOCKED' : road.status.toUpperCase()}
                                        </div>
                                    </div>
                                </Popup>
                            </Polyline>
                        ))}
                    </LayerGroup>
                </Overlay>

                <Overlay checked name="Hospitals">
                    <LayerGroup>
                        {hospitals.map(infra => (
                            <Marker key={infra.id} position={[infra.lat, infra.lng]} icon={createCustomIcon(infra.type, infra.status, theme)}>
                                <Popup>
                                    <div style={{ color: popupColor, background: popupBg }}>
                                        <div style={{ fontWeight: 800 }}>{infra.name}</div>
                                        <div style={{ fontSize: '0.8rem', color: getStatusColor(infra.status), marginTop: 2, fontWeight: 'bold' }}>
                                            {infra.status.toUpperCase()}
                                        </div>
                                        <div style={{ fontSize: '0.8rem', opacity: 0.8 }}>Damage: {infra.damage.toFixed(0)}%</div>
                                        <div style={{ fontSize: '0.8rem', opacity: 0.8 }}>Load: {infra.current_load}/{infra.capacity} Beds</div>
                                    </div>
                                </Popup>
                            </Marker>
                        ))}
                    </LayerGroup>
                </Overlay>

                <Overlay checked name="Power Grid">
                    <LayerGroup>
                        {powerStations.map(infra => (
                             <Marker key={infra.id} position={[infra.lat, infra.lng]} icon={createCustomIcon(infra.type, infra.status, theme)}>
                                <Popup>
                                    <div style={{ color: popupColor, background: popupBg }}>
                                        <div style={{ fontWeight: 800 }}>{infra.name}</div>
                                        <div style={{ fontSize: '0.8rem', color: getStatusColor(infra.status), marginTop: 2, fontWeight: 'bold' }}>{infra.status.toUpperCase()}</div>
                                        <div style={{ fontSize: '0.8rem', opacity: 0.8 }}>Damage: {infra.damage.toFixed(0)}%</div>
                                    </div>
                                </Popup>
                            </Marker>
                        ))}
                    </LayerGroup>
                </Overlay>

                <Overlay checked name="Shelters">
                    <LayerGroup>
                        {shelters.map(infra => (
                             <Marker key={infra.id} position={[infra.lat, infra.lng]} icon={createCustomIcon(infra.type, infra.status, theme)}>
                                <Popup>
                                    <div style={{ color: popupColor, background: popupBg }}>
                                        <div style={{ fontWeight: 800 }}>{infra.name}</div>
                                        <div style={{ fontSize: '0.8rem', color: getStatusColor(infra.status), marginTop: 2, fontWeight: 'bold' }}>{infra.status.toUpperCase()}</div>
                                        <div style={{ fontSize: '0.8rem', opacity: 0.8 }}>Capacity: {infra.capacity}</div>
                                    </div>
                                </Popup>
                            </Marker>
                        ))}
                    </LayerGroup>
                </Overlay>

                <Overlay name="Other Infrastructure">
                    <LayerGroup>
                        {otherInfra.map(infra => (
                             <Marker key={infra.id} position={[infra.lat, infra.lng]} icon={createCustomIcon(infra.type, infra.status, theme)}>
                                <Popup>
                                    <div style={{ color: popupColor, background: popupBg }}>
                                        <div style={{ fontWeight: 800 }}>{infra.name}</div>
                                        <div style={{ fontSize: '0.8rem', color: getStatusColor(infra.status), marginTop: 2, fontWeight: 'bold' }}>{infra.status.toUpperCase()}</div>
                                    </div>
                                </Popup>
                            </Marker>
                        ))}
                    </LayerGroup>
                </Overlay>
            </LayersControl>
        </MapContainer>
    );
});

export default CityMap;
