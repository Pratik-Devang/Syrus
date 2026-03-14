<<<<<<< HEAD
import React, { useEffect, useMemo, useState } from 'react';
import { MapContainer, TileLayer, Marker, CircleMarker, Polyline, Polygon, Popup, useMap, LayersControl, LayerGroup } from 'react-leaflet';
=======
import React, { useEffect, useRef, useMemo, useState } from 'react';
import { MapContainer, TileLayer, Marker, CircleMarker, Polyline, Polygon, Popup, useMap, useMapEvents, LayersControl, LayerGroup } from 'react-leaflet';
import MarkerClusterGroup from 'react-leaflet-cluster';
>>>>>>> 59b0bd9f8c42829afe3c389cb34f5c82a7fec1fb
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

const { Overlay } = LayersControl;

const CENTER = [19.0760, 72.8777]; // Mumbai Center
const ZOOM = 11;

// Color Palette for strict visual hierarchy
const COLORS = {
    critical: '#ef4444',
    warning: '#f59e0b',
    healthy: '#22c55e',
    info: '#0ea5e9',
    muted: '#64748b',
};

function getRiskColor(score) {
    if (score > 70) return COLORS.critical;
    if (score > 40) return COLORS.warning;
    if (score > 15) return '#eab308'; // soft yellow for low risk
    return COLORS.healthy;
}

function getStatusColor(status) {
    if (status === 'failed') return COLORS.critical;
    if (status === 'degraded') return COLORS.warning;
    return COLORS.healthy;
}

function createCustomIcon(type, status) {
    const color = getStatusColor(status);
    let svgIcon = '';

    // Clean, professional SVG icons
    switch (type) {
        case 'hospital':
<<<<<<< HEAD
            svgIcon = `<svg viewBox="0 0 24 24" fill="white" xmlns="http://www.w3.org/2000/svg"><path d="M19 10.5H13.5V5C13.5 4.17 12.83 3.5 12 3.5C11.17 3.5 10.5 4.17 10.5 5V10.5H5C4.17 10.5 3.5 11.17 3.5 12C3.5 12.83 4.17 13.5 5 13.5H10.5V19C10.5 19.83 11.17 20.5 12 20.5C12.83 20.5 13.5 19.83 13.5 19V13.5H19C19.83 13.5 20.5 12.83 20.5 12C20.5 11.17 19.83 10.5 19 10.5Z"/></svg>`;
            break;
        case 'power_station':
            svgIcon = `<svg viewBox="0 0 24 24" fill="white" xmlns="http://www.w3.org/2000/svg"><path d="M11.5 2L3.5 14H10.5L9.5 22L19.5 9H13L14.5 2Z"/></svg>`;
            break;
        case 'shelter':
            svgIcon = `<svg viewBox="0 0 24 24" fill="white" xmlns="http://www.w3.org/2000/svg"><path d="M12 3L2 12H5V20H19V12H22L12 3Z"/></svg>`;
            break;
        case 'fire_station':
            svgIcon = `<svg viewBox="0 0 24 24" fill="white" xmlns="http://www.w3.org/2000/svg"><path d="M17.5,10.6c0-0.1,0-0.2,0-0.2c-0.6-2-2.3-3.6-4.5-4.3C13,6.2,13.1,6.3,13.1,6.5c0,1-0.9,1.9-2,1.9c-0.5,0-1,0-1,0 c0-2.3,1-4.4,2.7-5.8C12.4,2.3,12,2,11.5,2C9,3.5,6,6.3,6,11.5C6,16,8.7,20,13,20c3.3,0,6-2.7,6-6C19,12.7,18.4,11.5,17.5,10.6z M13,18 c-2.2,0-4-1.8-4-4c0-0.9,0.3-1.8,0.8-2.5c0.6-0.8,1.4-1.3,2.4-1.5c1-0.2,2.1,0,3,0.6c0.8,0.6,1.4,1.4,1.6,2.4 c0.1,1,0,2.1-0.6,3C15.6,17.2,14.3,18,13,18z"/></svg>`;
            break;
        case 'police_station':
             svgIcon = `<svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path fill-rule="evenodd" clip-rule="evenodd" d="M12 2C12 2 5 5 5 12C5 18 12 22 12 22C12 22 19 18 19 12C19 5 12 2 12 2ZM12 7.5L13.5 11H17L14 13L15 16.5L12 14.5L9 16.5L10 13L7 11H10.5L12 7.5Z" fill="white"/></svg>`;
             break;
        default:
             svgIcon = `<svg viewBox="0 0 24 24" fill="white" xmlns="http://www.w3.org/2000/svg"><circle cx="12" cy="12" r="8"/></svg>`;
=======
            svgIcon = `<svg viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>`;
            break;
        case 'power_station':
            svgIcon = `<svg viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/></svg>`;
            break;
        case 'shelter':
            svgIcon = `<svg viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/></svg>`;
            break;
        case 'fire_station':
            svgIcon = `<svg viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z"/><path d="M12 6c-3.31 0-6 2.69-6 6s2.69 6 6 6 6-2.69 6-6-2.69-6-6-6z"/></svg>`;
            break;
        case 'police_station':
            svgIcon = `<svg viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>`;
            break;
        default:
            svgIcon = `<svg viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/></svg>`;
>>>>>>> 59b0bd9f8c42829afe3c389cb34f5c82a7fec1fb
    }

    // Professional compact marker without excessive glow
    return L.divIcon({
        html: `<div style="background-color: ${color}; border: 2px solid white; border-radius: 50%; padding: 4px; width: 22px; height: 22px; display: flex; align-items: center; justify-content: center; box-shadow: 0 2px 4px rgba(0,0,0,0.4);">${svgIcon}</div>`,
        className: 'custom-infra-icon',
        iconSize: [22, 22],
        iconAnchor: [11, 11],
        popupAnchor: [0, -11]
    });
}

<<<<<<< HEAD
function MapUpdater({ center, zoom }) {
=======
function createClusterCustomIcon(cluster) {
    const count = cluster.getChildCount();
    let size = 'Small';
    if (count > 10) size = 'Medium';
    if (count > 25) size = 'Large';

    // A clean generic grouping circle
    return L.divIcon({
        html: `<div style="background-color: ${COLORS.muted}; border: 2px solid white; color: white; display: flex; align-items: center; justify-content: center; border-radius: 50%; font-weight: bold; font-family: ui-sans-serif, system-ui; box-shadow: 0 2px 4px rgba(0,0,0,0.3); width: 30px; height: 30px; font-size: 13px;">${count}</div>`,
        className: `marker-cluster marker-cluster-${size}`,
        iconSize: [30, 30],
        iconAnchor: [15, 15]
    });
}

function MapUpdater({ center, zoom, onZoomChange }) {
>>>>>>> 59b0bd9f8c42829afe3c389cb34f5c82a7fec1fb
    const map = useMap();
    useEffect(() => {
        map.setView(center, zoom);
    }, [center, zoom, map]);

    useMapEvents({
        zoomend() {
            onZoomChange(map.getZoom());
        }
    });

    return null;
}

const CityMap = React.memo(({ state, theme = 'dark', onZoneClick }) => {
    const [showLegend, setShowLegend] = useState(true);

<<<<<<< HEAD
    const { zones = [], infrastructure = [], roads = [] } = state || {};
=======
    const [currentZoom, setCurrentZoom] = useState(ZOOM);
    const { zones = [], infrastructure = [], roads = [] } = state;
>>>>>>> 59b0bd9f8c42829afe3c389cb34f5c82a7fec1fb

    // Filter infrastructure by primary/secondary importance
    const hospitals = useMemo(() => infrastructure.filter(i => i.type === 'hospital'), [infrastructure]);
    const powerStations = useMemo(() => infrastructure.filter(i => i.type === 'power_station'), [infrastructure]);
    const shelters = useMemo(() => infrastructure.filter(i => i.type === 'shelter'), [infrastructure]);
    // The rest is considered minor (fire, police, comms)
    const otherInfra = useMemo(() => infrastructure.filter(i => !['hospital', 'power_station', 'shelter'].includes(i.type)), [infrastructure]);

<<<<<<< HEAD
    if (!state) return null;

    const tileUrl = "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png";
=======
    // Visiblity thresholds
    const showMinorInfra = currentZoom > 12;
    const isFarZoom = currentZoom < 11;

    const tileUrl = theme === 'light'
        ? "https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
        : "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png";

>>>>>>> 59b0bd9f8c42829afe3c389cb34f5c82a7fec1fb
    const popupBg = theme === 'light' ? '#ffffff' : '#0f172a';
    const popupColor = theme === 'light' ? '#0f172a' : '#e2e8f0';

    return (
        <div style={{ position: 'relative', width: '100%', height: '100%' }}>
            <MapContainer
                center={CENTER}
                zoom={ZOOM}
                style={{ height: '100%', width: '100%', zIndex: 0 }}
                zoomControl={true}
            >
                <MapUpdater center={CENTER} zoom={ZOOM} onZoomChange={setCurrentZoom} />
                <TileLayer
                    attribution='&copy; <a href="https://carto.com/">CARTO</a>'
                    url={tileUrl}
                />

                <LayersControl position="topright">
                    <Overlay checked name="Districts & Risk Overlays">
                        <LayerGroup>
                            {/* Very light zone hazard polygons */}
                            {zones.map(zone => {
                                const isHighRisk = zone.risk_score > 60;
                                return (
                                    <Polygon
                                        key={zone.id}
                                        positions={zone.polygon}
                                        pathOptions={{
                                            color: getRiskColor(zone.risk_score),
                                            fillColor: getRiskColor(zone.risk_score),
                                            // Make fill highly transparent
                                            fillOpacity: isHighRisk ? 0.15 : 0.05,
                                            weight: isHighRisk ? 2 : 1,
                                            // Soft borders unless critical risk
                                            opacity: isHighRisk ? 0.8 : 0.4,
                                            dashArray: isHighRisk ? '4, 4' : null
                                        }}
                                        eventHandlers={{ click: () => onZoneClick?.(zone) }}
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
                                );
                            })}

                            {/* Epicenters Only (skip at extremely close zoom to avoid noise) */}
                            {currentZoom < 14 && zones.filter(z => z.risk_score > 40).map(zone => (
                                <CircleMarker
                                    key={`risk-${zone.id}`}
                                    center={zone.center}
                                    radius={Math.min(25, zone.risk_score / 4 + 5)}
                                    pathOptions={{
                                        color: getRiskColor(zone.risk_score),
                                        fillColor: getRiskColor(zone.risk_score),
                                        fillOpacity: zone.risk_score / 300,
                                        weight: zone.risk_score > 60 ? 2 : 0,
                                        className: zone.risk_score > 60 ? 'animate-pulse' : '',
                                    }}
                                />
                            ))}
                        </LayerGroup>
                    </Overlay>

                    <Overlay checked name="Road Network">
                        <LayerGroup>
                            {roads.map(road => {
                                // Only draw non-blocked roads if we are zoomed in or if it's not a healthy road
                                if (!road.blocked && road.status === 'operational' && isFarZoom) return null;

                                return (
                                    <Polyline
                                        key={road.id}
                                        positions={road.points}
                                        pathOptions={{
                                            color: road.blocked ? COLORS.critical : road.status === 'degraded' ? COLORS.warning : (theme === 'light' ? '#cbd5e1' : '#475569'),
                                            weight: road.blocked ? 3 : 1.5,
                                            opacity: road.blocked ? 0.9 : 0.4,
                                            dashArray: road.blocked ? '6, 6' : null,
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
                                );
                            })}
                        </LayerGroup>
                    </Overlay>

                    <Overlay checked name="Hospitals">
                        <MarkerClusterGroup
                            chunkedLoading
                            iconCreateFunction={createClusterCustomIcon}
                            showCoverageOnHover={false}
                            maxClusterRadius={40}
                        >
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
                        </MarkerClusterGroup>
                    </Overlay>

                    <Overlay checked name="Power Grid">
                        <MarkerClusterGroup
                            chunkedLoading
                            iconCreateFunction={createClusterCustomIcon}
                            showCoverageOnHover={false}
                            maxClusterRadius={40}
                        >
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
                        </MarkerClusterGroup>
                    </Overlay>

                    <Overlay checked name="Shelters">
                        <MarkerClusterGroup
                            chunkedLoading
                            iconCreateFunction={createClusterCustomIcon}
                            showCoverageOnHover={false}
                            maxClusterRadius={40}
                        >
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
                        </MarkerClusterGroup>
                    </Overlay>

                    {showMinorInfra && (
                        <Overlay checked name="Minor Infrastructure">
                            <MarkerClusterGroup
                                chunkedLoading
                                iconCreateFunction={createClusterCustomIcon}
                                showCoverageOnHover={false}
                                maxClusterRadius={50}
                            >
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
                            </MarkerClusterGroup>
                        </Overlay>
                    )}
                </LayersControl>
            </MapContainer>

            {/* Custom Map Legend overlay */}
            <div
                className="glass-card"
                style={{
                    position: 'absolute',
                    bottom: '120px',
                    right: '20px',
                    zIndex: 1000,
                    padding: '12px 16px',
                    fontSize: '12px',
                    pointerEvents: 'none' // Don't block map interaction
                }}
            >
                <div style={{ fontWeight: 'bold', marginBottom: '8px', letterSpacing: '0.05em', color: 'var(--text-secondary)' }}>LEGEND</div>

<<<<<<< HEAD
                <Overlay checked name="Hospitals">
                    <LayerGroup>
                        {hospitals.map(infra => (
                            <Marker key={infra.id} position={[infra.lat, infra.lng]} icon={createCustomIcon(infra.type, infra.status)}>
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
                             <Marker key={infra.id} position={[infra.lat, infra.lng]} icon={createCustomIcon(infra.type, infra.status)}>
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
                             <Marker key={infra.id} position={[infra.lat, infra.lng]} icon={createCustomIcon(infra.type, infra.status)}>
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
                             <Marker key={infra.id} position={[infra.lat, infra.lng]} icon={createCustomIcon(infra.type, infra.status)}>
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

            {/* Map Legend Overlay */}
            <div 
                className={`absolute bottom-6 right-6 z-[1000] rounded-xl border backdrop-blur-md shadow-2xl transition-all duration-300 ${theme === 'dark' ? 'bg-slate-900/90 border-slate-700/50 text-slate-200' : 'bg-white/90 border-slate-200 shadow-slate-300/50 text-slate-800'}`}
                style={{ width: showLegend ? '240px' : '48px', overflow: 'hidden' }}
            >
                {/* Header (Clickable to toggle) */}
                <div 
                    onClick={() => setShowLegend(!showLegend)}
                    className={`flex items-center justify-between p-3 cursor-pointer select-none transition-colors ${theme === 'dark' ? 'hover:bg-slate-800/50' : 'hover:bg-slate-50'}`}
                >
                    <div className="flex items-center gap-2">
                        <svg className={`w-5 h-5 ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                        {showLegend && <span className="font-semibold text-sm uppercase tracking-wider">Map Legend</span>}
                    </div>
                    {showLegend && (
                        <svg className="w-4 h-4 opacity-50" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                    )}
                </div>

                {/* Legend Content */}
                <div 
                    className={`transition-all duration-300 ease-in-out ${showLegend ? 'max-h-[500px] opacity-100 border-t' : 'max-h-0 opacity-0'}`}
                    style={{ borderColor: theme === 'dark' ? 'rgba(51, 65, 85, 0.5)' : 'rgba(226, 232, 240, 1)' }}
                >
                    <div className="p-4 space-y-4 text-xs">
                        
                        {/* Infrastructure Icons */}
                        <div>
                            <div className={`font-semibold mb-2 pb-1 border-b ${theme === 'dark' ? 'border-slate-800' : 'border-slate-100'}`}>Infrastructure</div>
                            <div className="space-y-2">
                                <div className="flex items-center gap-3">
                                    <div className="w-6 h-6 rounded-full bg-slate-500/80 flex items-center justify-center">
                                        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="white" xmlns="http://www.w3.org/2000/svg"><path d="M19 10.5H13.5V5C13.5 4.17 12.83 3.5 12 3.5C11.17 3.5 10.5 4.17 10.5 5V10.5H5C4.17 10.5 3.5 11.17 3.5 12C3.5 12.83 4.17 13.5 5 13.5H10.5V19C10.5 19.83 11.17 20.5 12 20.5C12.83 20.5 13.5 19.83 13.5 19V13.5H19C19.83 13.5 20.5 12.83 20.5 12C20.5 11.17 19.83 10.5 19 10.5Z"/></svg>
                                    </div>
                                    <span>Hospital</span>
                                </div>
                                <div className="flex items-center gap-3">
                                    <div className="w-6 h-6 rounded-full bg-slate-500/80 flex items-center justify-center">
                                        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="white" xmlns="http://www.w3.org/2000/svg"><path d="M11.5 2L3.5 14H10.5L9.5 22L19.5 9H13L14.5 2Z"/></svg>
                                    </div>
                                    <span>Power Station</span>
                                </div>
                                <div className="flex items-center gap-3">
                                    <div className="w-6 h-6 rounded-full bg-slate-500/80 flex items-center justify-center">
                                        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="white" xmlns="http://www.w3.org/2000/svg"><path d="M12 3L2 12H5V20H19V12H22L12 3Z"/></svg>
                                    </div>
                                    <span>Shelter</span>
                                </div>
                                <div className="flex items-center gap-3">
                                    <div className="w-6 h-6 rounded-full bg-slate-500/80 flex items-center justify-center">
                                        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="white" xmlns="http://www.w3.org/2000/svg"><path d="M17.5,10.6c0-0.1,0-0.2,0-0.2c-0.6-2-2.3-3.6-4.5-4.3C13,6.2,13.1,6.3,13.1,6.5c0,1-0.9,1.9-2,1.9c-0.5,0-1,0-1,0 c0-2.3,1-4.4,2.7-5.8C12.4,2.3,12,2,11.5,2C9,3.5,6,6.3,6,11.5C6,16,8.7,20,13,20c3.3,0,6-2.7,6-6C19,12.7,18.4,11.5,17.5,10.6z M13,18 c-2.2,0-4-1.8-4-4c0-0.9,0.3-1.8,0.8-2.5c0.6-0.8,1.4-1.3,2.4-1.5c1-0.2,2.1,0,3,0.6c0.8,0.6,1.4,1.4,1.6,2.4 c0.1,1,0,2.1-0.6,3C15.6,17.2,14.3,18,13,18z"/></svg>
                                    </div>
                                    <span>Fire Station</span>
                                </div>
                                <div className="flex items-center gap-3">
                                    <div className="w-6 h-6 rounded-full bg-slate-500/80 flex items-center justify-center">
                                        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path fillRule="evenodd" clipRule="evenodd" d="M12 2C12 2 5 5 5 12C5 18 12 22 12 22C12 22 19 18 19 12C19 5 12 2 12 2ZM12 7.5L13.5 11H17L14 13L15 16.5L12 14.5L9 16.5L10 13L7 11H10.5L12 7.5Z" fill="white"/></svg>
                                    </div>
                                    <span>Police Station</span>
                                </div>
                            </div>
                        </div>

                        {/* Status Colors */}
                        <div className="pt-2">
                            <div className={`font-semibold mb-2 pb-1 border-b ${theme === 'dark' ? 'border-slate-800' : 'border-slate-100'}`}>Status / Damage</div>
                            <div className="space-y-2">
                                <div className="flex items-center gap-2">
                                    <div className="w-3 h-3 rounded-full bg-green-500"></div>
                                    <span>Operational / Low Risk</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                                    <span>Degraded / Med Risk</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <div className="w-3 h-3 rounded-full bg-amber-500"></div>
                                    <span>Warning / High Risk</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <div className="w-3 h-3 rounded-full bg-red-500"></div>
                                    <span>Failed / Severe</span>
                                </div>
                            </div>
                        </div>

                        {/* Roads */}
                        <div className="pt-2">
                            <div className={`font-semibold mb-2 pb-1 border-b ${theme === 'dark' ? 'border-slate-800' : 'border-slate-100'}`}>Routes</div>
                            <div className="space-y-2">
                                <div className="flex items-center gap-2">
                                    <div className="w-6 h-[2px] bg-slate-500"></div>
                                    <span>Clear Route</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <div className="w-6 h-[5px] bg-red-500 border-dashed border-t-2 border-black/20"></div>
                                    <span>Severely Blocked</span>
                                </div>
                            </div>
                        </div>

                    </div>
                </div>
            </div>
        </MapContainer>
=======
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px 24px' }}>
                    <div>
                        <div style={{ color: 'var(--text-secondary)', fontSize: '10px', fontWeight: 'bold', marginBottom: '4px' }}>SEVERITY</div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><div style={{ width: '12px', height: '12px', borderRadius: '50%', background: COLORS.critical }} /> Critical</div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><div style={{ width: '12px', height: '12px', borderRadius: '50%', background: COLORS.warning }} /> Degraded</div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><div style={{ width: '12px', height: '12px', borderRadius: '50%', background: COLORS.healthy }} /> Operational</div>
                    </div>

                    <div>
                        <div style={{ color: 'var(--text-secondary)', fontSize: '10px', fontWeight: 'bold', marginBottom: '4px' }}>OVERLAYS</div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><div style={{ width: '14px', height: '2px', borderTop: `2px dashed ${COLORS.critical}` }} /> Blocked Road</div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><div style={{ width: '12px', height: '12px', borderRadius: '50%', background: COLORS.critical, opacity: 0.3, border: `1px dashed ${COLORS.critical}` }} /> Impact Zone</div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><div style={{ width: '12px', height: '12px', borderRadius: '50%', border: '2px solid white', background: COLORS.muted }} /> Infra Cluster</div>
                    </div>
                </div>
            </div>
        </div>
>>>>>>> 59b0bd9f8c42829afe3c389cb34f5c82a7fec1fb
    );
});

export default CityMap;
