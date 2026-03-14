import React, { useEffect, useMemo, useState } from 'react';
import { MapContainer, TileLayer, Marker, CircleMarker, Polyline, Polygon, Popup, useMap, useMapEvents, LayersControl, LayerGroup } from 'react-leaflet';
import MarkerClusterGroup from 'react-leaflet-cluster';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

const { Overlay } = LayersControl;

const CENTER = [19.0760, 72.8777];
const ZOOM = 11;

const COLORS = {
    critical: '#ef4444',
    warning: '#f59e0b',
    healthy: '#22c55e',
    info: '#3b82f6',
    muted: '#64748b',
};

function getRiskColor(score) {
    if (score > 70) return COLORS.critical;
    if (score > 40) return COLORS.warning;
    if (score > 15) return '#ca8a04';
    return COLORS.healthy;
}

function getStatusColor(status) {
    if (status === 'failed') return COLORS.critical;
    if (status === 'degraded') return COLORS.warning;
    return COLORS.healthy;
}

// SVG icon paths (consistent stroke-based icons)
const ICON_PATHS = {
    hospital: 'M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6',
    power_station: 'M13 2L3 14h9l-1 8 10-12h-9l1-8z',
    shelter: 'M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z',
    fire_station: 'M12 12c0-3 2.5-6 2.5-6s2.5 3 2.5 6a2.5 2.5 0 0 1-5 0z M8.5 14c0-2.5 3.5-7 3.5-7s3.5 4.5 3.5 7a3.5 3.5 0 0 1-7 0z',
    police_station: 'M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z',
    default: 'M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z M12 7v6 M12 17h.01',
};

function createCustomIcon(type, status) {
    const color = getStatusColor(status);
    const path = ICON_PATHS[type] || ICON_PATHS.default;
    const svg = `<svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="white" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="${path}"/></svg>`;
    return L.divIcon({
        html: `<div style="background:${color};border-radius:50%;width:18px;height:18px;display:flex;align-items:center;justify-content:center;box-shadow:0 1px 3px rgba(0,0,0,0.4);">${svg}</div>`,
        className: 'custom-infra-icon',
        iconSize: [18, 18],
        iconAnchor: [9, 9],
        popupAnchor: [0, -9],
    });
}

function createClusterCustomIcon(cluster) {
    const count = cluster.getChildCount();
    return L.divIcon({
        html: `<div style="background:${COLORS.muted};color:white;display:flex;align-items:center;justify-content:center;border-radius:50%;font-weight:600;font-family:Inter,system-ui;width:24px;height:24px;font-size:11px;box-shadow:0 1px 3px rgba(0,0,0,0.3);">${count}</div>`,
        className: 'marker-cluster',
        iconSize: [24, 24],
        iconAnchor: [12, 12],
    });
}

function MapUpdater({ center, zoom, onZoomChange }) {
    const map = useMap();
    useEffect(() => { map.setView(center, zoom); }, [center, zoom, map]);
    useMapEvents({ zoomend() { onZoomChange(map.getZoom()); } });
    return null;
}

const CityMap = React.memo(({ state, theme = 'dark', onZoneClick }) => {
    if (!state) return null;

    const [currentZoom, setCurrentZoom] = useState(ZOOM);
    const { zones = [], infrastructure = [], roads = [] } = state;

    // Only show critical infrastructure at default zoom, everything at higher zoom
    const hospitals = useMemo(() => infrastructure.filter(i => i.type === 'hospital'), [infrastructure]);
    const powerStations = useMemo(() => infrastructure.filter(i => i.type === 'power_station'), [infrastructure]);
    const shelters = useMemo(() => infrastructure.filter(i => i.type === 'shelter'), [infrastructure]);
    const otherInfra = useMemo(() => infrastructure.filter(i => !['hospital', 'power_station', 'shelter'].includes(i.type)), [infrastructure]);

    // Visibility thresholds — show less by default
    const showShelters = currentZoom > 11;
    const showMinorInfra = currentZoom > 13;
    const showMinorRoads = currentZoom > 11;

    const tileUrl = theme === 'light'
        ? "https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
        : "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png";

    const popupBg = theme === 'light' ? '#fff' : '#141b2d';
    const popupColor = theme === 'light' ? '#0f172a' : '#e2e8f0';

    return (
        <div style={{ position: 'relative', width: '100%', height: '100%' }}>
            <MapContainer center={CENTER} zoom={ZOOM} style={{ height: '100%', width: '100%', zIndex: 0 }} zoomControl={true}>
                <MapUpdater center={CENTER} zoom={ZOOM} onZoomChange={setCurrentZoom} />
                <TileLayer attribution='&copy; <a href="https://carto.com/">CARTO</a>' url={tileUrl} />

                <LayersControl position="topright">
                    <Overlay checked name="Risk Zones">
                        <LayerGroup>
                            {zones.map(zone => {
                                const isHighRisk = zone.risk_score > 60;
                                return (
                                    <Polygon
                                        key={zone.id}
                                        positions={zone.polygon}
                                        pathOptions={{
                                            color: getRiskColor(zone.risk_score),
                                            fillColor: getRiskColor(zone.risk_score),
                                            fillOpacity: isHighRisk ? 0.1 : 0.03,
                                            weight: isHighRisk ? 1.5 : 0.5,
                                            opacity: isHighRisk ? 0.6 : 0.25,
                                            dashArray: isHighRisk ? '4, 4' : null,
                                        }}
                                        eventHandlers={{ click: () => onZoneClick?.(zone) }}
                                    >
                                        <Popup>
                                            <div style={{ color: popupColor, background: popupBg, padding: 2 }}>
                                                <div style={{ fontWeight: 600, fontSize: 12, marginBottom: 2 }}>{zone.name}</div>
                                                <div style={{ fontSize: 11 }}>
                                                    Risk: <span style={{ color: getRiskColor(zone.risk_score), fontWeight: 600 }}>{zone.risk_score.toFixed(0)}%</span>
                                                </div>
                                                <div style={{ fontSize: 11, color: popupColor, opacity: 0.7 }}>Pop: {zone.population.toLocaleString()}</div>
                                            </div>
                                        </Popup>
                                    </Polygon>
                                );
                            })}

                            {/* Risk epicenters — only high risk areas */}
                            {currentZoom < 14 && zones.filter(z => z.risk_score > 55).map(zone => (
                                <CircleMarker
                                    key={`risk-${zone.id}`}
                                    center={zone.center}
                                    radius={Math.min(18, zone.risk_score / 5 + 3)}
                                    pathOptions={{
                                        color: getRiskColor(zone.risk_score),
                                        fillColor: getRiskColor(zone.risk_score),
                                        fillOpacity: zone.risk_score / 400,
                                        weight: zone.risk_score > 70 ? 1 : 0,
                                    }}
                                />
                            ))}
                        </LayerGroup>
                    </Overlay>

                    <Overlay checked name="Roads">
                        <LayerGroup>
                            {roads.map(road => {
                                // Only show blocked/degraded at default zoom
                                if (!road.blocked && road.status === 'operational' && !showMinorRoads) return null;
                                return (
                                    <Polyline
                                        key={road.id}
                                        positions={road.points}
                                        pathOptions={{
                                            color: road.blocked ? COLORS.critical : road.status === 'degraded' ? COLORS.warning : 'rgba(100,116,139,0.25)',
                                            weight: road.blocked ? 2.5 : 1,
                                            opacity: road.blocked ? 0.8 : 0.3,
                                            dashArray: road.blocked ? '5, 5' : null,
                                        }}
                                    >
                                        <Popup>
                                            <div style={{ color: popupColor, background: popupBg }}>
                                                <div style={{ fontWeight: 600, fontSize: 12 }}>{road.name}</div>
                                                <div style={{ fontSize: 11, color: getStatusColor(road.status), fontWeight: 600 }}>
                                                    {road.blocked ? 'BLOCKED' : road.status.toUpperCase()}
                                                </div>
                                            </div>
                                        </Popup>
                                    </Polyline>
                                );
                            })}
                        </LayerGroup>
                    </Overlay>

                    <Overlay checked name="Hospitals">
                        <MarkerClusterGroup chunkedLoading iconCreateFunction={createClusterCustomIcon} showCoverageOnHover={false} maxClusterRadius={50}>
                            {hospitals.map(infra => (
                                <Marker key={infra.id} position={[infra.lat, infra.lng]} icon={createCustomIcon(infra.type, infra.status)}>
                                    <Popup>
                                        <div style={{ color: popupColor, background: popupBg }}>
                                            <div style={{ fontWeight: 600, fontSize: 12 }}>{infra.name}</div>
                                            <div style={{ fontSize: 11, color: getStatusColor(infra.status), fontWeight: 600 }}>{infra.status.toUpperCase()}</div>
                                            <div style={{ fontSize: 11, opacity: 0.7 }}>Damage: {infra.damage.toFixed(0)}% · Load: {infra.current_load}/{infra.capacity}</div>
                                        </div>
                                    </Popup>
                                </Marker>
                            ))}
                        </MarkerClusterGroup>
                    </Overlay>

                    <Overlay checked name="Power">
                        <MarkerClusterGroup chunkedLoading iconCreateFunction={createClusterCustomIcon} showCoverageOnHover={false} maxClusterRadius={50}>
                            {powerStations.map(infra => (
                                <Marker key={infra.id} position={[infra.lat, infra.lng]} icon={createCustomIcon(infra.type, infra.status)}>
                                    <Popup>
                                        <div style={{ color: popupColor, background: popupBg }}>
                                            <div style={{ fontWeight: 600, fontSize: 12 }}>{infra.name}</div>
                                            <div style={{ fontSize: 11, color: getStatusColor(infra.status), fontWeight: 600 }}>{infra.status.toUpperCase()}</div>
                                            <div style={{ fontSize: 11, opacity: 0.7 }}>Damage: {infra.damage.toFixed(0)}%</div>
                                        </div>
                                    </Popup>
                                </Marker>
                            ))}
                        </MarkerClusterGroup>
                    </Overlay>

                    {showShelters && (
                        <Overlay checked name="Shelters">
                            <MarkerClusterGroup chunkedLoading iconCreateFunction={createClusterCustomIcon} showCoverageOnHover={false} maxClusterRadius={50}>
                                {shelters.map(infra => (
                                    <Marker key={infra.id} position={[infra.lat, infra.lng]} icon={createCustomIcon(infra.type, infra.status)}>
                                        <Popup>
                                            <div style={{ color: popupColor, background: popupBg }}>
                                                <div style={{ fontWeight: 600, fontSize: 12 }}>{infra.name}</div>
                                                <div style={{ fontSize: 11, color: getStatusColor(infra.status), fontWeight: 600 }}>{infra.status.toUpperCase()}</div>
                                                <div style={{ fontSize: 11, opacity: 0.7 }}>Capacity: {infra.capacity}</div>
                                            </div>
                                        </Popup>
                                    </Marker>
                                ))}
                            </MarkerClusterGroup>
                        </Overlay>
                    )}

                    {showMinorInfra && (
                        <Overlay checked name="Other">
                            <MarkerClusterGroup chunkedLoading iconCreateFunction={createClusterCustomIcon} showCoverageOnHover={false} maxClusterRadius={60}>
                                {otherInfra.map(infra => (
                                    <Marker key={infra.id} position={[infra.lat, infra.lng]} icon={createCustomIcon(infra.type, infra.status)}>
                                        <Popup>
                                            <div style={{ color: popupColor, background: popupBg }}>
                                                <div style={{ fontWeight: 600, fontSize: 12 }}>{infra.name}</div>
                                                <div style={{ fontSize: 11, color: getStatusColor(infra.status), fontWeight: 600 }}>{infra.status.toUpperCase()}</div>
                                            </div>
                                        </Popup>
                                    </Marker>
                                ))}
                            </MarkerClusterGroup>
                        </Overlay>
                    )}
                </LayersControl>
            </MapContainer>

            {/* Minimal legend — small floating pill in bottom-right */}
            <div style={{
                position: 'absolute', bottom: 8, right: 8, zIndex: 1000,
                padding: '4px 10px',
                background: 'rgba(11, 15, 25, 0.85)',
                borderRadius: 6,
                fontSize: 9,
                display: 'flex', alignItems: 'center', gap: 10,
                pointerEvents: 'none',
                border: '1px solid rgba(255,255,255,0.06)',
            }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: 3 }}>
                    <span style={{ width: 6, height: 6, borderRadius: '50%', background: COLORS.critical, display: 'inline-block' }} />
                    <span style={{ color: '#94a3b8' }}>Critical</span>
                </span>
                <span style={{ display: 'flex', alignItems: 'center', gap: 3 }}>
                    <span style={{ width: 6, height: 6, borderRadius: '50%', background: COLORS.warning, display: 'inline-block' }} />
                    <span style={{ color: '#94a3b8' }}>Warning</span>
                </span>
                <span style={{ display: 'flex', alignItems: 'center', gap: 3 }}>
                    <span style={{ width: 6, height: 6, borderRadius: '50%', background: COLORS.healthy, display: 'inline-block' }} />
                    <span style={{ color: '#94a3b8' }}>OK</span>
                </span>
            </div>
        </div>
    );
});

export default CityMap;
