import React, { useEffect, useMemo, useState } from 'react';
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

function createCustomIcon(type, status) {
    const color = getStatusColor(status);
    let svgIcon = '';
    
    // Clean SVG icons for different types
    switch (type) {
        case 'hospital':
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
    }

    return L.divIcon({
        html: `<div style="background-color: ${color}99; border-radius: 50%; padding: 4px; box-shadow: 0 0 8px ${color}66; width: 24px; height: 24px; display: flex; align-items: center; justify-content: center;">${svgIcon}</div>`,
        className: 'custom-infra-icon',
        iconSize: [24, 24],
        iconAnchor: [12, 12],
        popupAnchor: [0, -12]
    });
}

function MapUpdater({ center, zoom }) {
    const map = useMap();
    useEffect(() => {
        map.setView(center, zoom);
    }, [center, zoom, map]);
    return null;
}

const CityMap = React.memo(({ state, theme = 'dark', onZoneClick }) => {
    const [showLegend, setShowLegend] = useState(true);

    const { zones = [], infrastructure = [], roads = [] } = state || {};

    // Filter infrastructure by type for layers
    const hospitals = useMemo(() => infrastructure.filter(i => i.type === 'hospital'), [infrastructure]);
    const powerStations = useMemo(() => infrastructure.filter(i => i.type === 'power_station'), [infrastructure]);
    const shelters = useMemo(() => infrastructure.filter(i => i.type === 'shelter'), [infrastructure]);
    const otherInfra = useMemo(() => infrastructure.filter(i => !['hospital', 'power_station', 'shelter'].includes(i.type)), [infrastructure]);

    if (!state) return null;

    const tileUrl = "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png";
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
                                    fillOpacity: Math.min(0.25, zone.risk_score / 300 + 0.03),
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
    );
});

export default CityMap;
