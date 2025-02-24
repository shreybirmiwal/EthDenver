import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import './home.css';

// Simple green dot icon
const createDotIcon = () => {
    return new L.DivIcon({
        className: 'green-dot-marker',
        iconSize: [12, 12],
        iconAnchor: [6, 6],
    });
};

const DarkTileLayer = () => (
    <TileLayer
        url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    />
);

const CyberMap = ({ allCams, query_found_cam }) => {
    const [mapCenter, setMapCenter] = useState([40.7128, -74.0060]);
    const [mapZoom, setMapZoom] = useState(12);
    const [selectedCam, setSelectedCam] = useState(null);
    const [autoOpenDone, setAutoOpenDone] = useState(false);

    // Simple green dot icon
    const defaultIcon = createDotIcon();

    // Handle initial query camera focus
    useEffect(() => {
        if (query_found_cam?.location && !autoOpenDone) {
            try {
                const [lat, lng] = query_found_cam.location.split(',').map(Number);
                if (!isNaN(lat) && !isNaN(lng)) {
                    setMapCenter([lat, lng]);
                    setMapZoom(16);
                    setSelectedCam(query_found_cam);
                    setAutoOpenDone(true);
                }
            } catch (e) {
                console.error('Invalid query camera coordinates:', e);
            }
        }
    }, [query_found_cam, autoOpenDone]);

    // Custom popup component
    const CentralPopup = () => {
        if (!selectedCam) return null;

        return (
            <div className="fixed inset-0 flex items-center justify-center z-[1000] pointer-events-none">
                <div className="bg-black border-2 border-green-500 w-3/4 h-3/4 flex">
                    {/* Left side - Camera feed */}
                    <div className="w-1/2 border-r-2 border-green-500 p-4">
                        <img
                            src={selectedCam.image_url}
                            alt="Camera feed"
                            className="w-full h-full object-contain"
                        />
                    </div>

                    {/* Right side - Terminal */}
                    <div className="w-1/2 p-4 font-mono text-green-500">
                        <div className="terminal-text">
              > INITIALIZING SURVEILLANCE MODULE...
                            <br />
              > SYSTEM TIME: {new Date().toLocaleTimeString()}
                            <br />
              > CAMERA ID: {selectedCam.id}
                            <br /><br />
              > HELLO WORLD
                        </div>
                    </div>
                </div>
            </div>
        );
    };

    return (
        <div className="h-screen w-full cyber-map-container">
            <MapContainer
                center={mapCenter}
                zoom={mapZoom}
                style={{ height: '100%', width: '100%' }}
            >
                <DarkTileLayer />

                {/* Render all cameras */}
                {allCams.map((cam) => {
                    try {
                        const [lat, lng] = cam.location?.split(',').map(Number);
                        if (isNaN(lat) || isNaN(lng)) return null;

                        return (
                            <Marker
                                key={cam.id}
                                position={[lat, lng]}
                                icon={defaultIcon}
                                eventHandlers={{
                                    click: () => {
                                        setSelectedCam(cam);
                                    }
                                }}
                            />
                        );
                    } catch (e) {
                        console.error('Invalid camera coordinates:', cam.location);
                        return null;
                    }
                })}
            </MapContainer>

            <CentralPopup />
        </div>
    );
};

export default CyberMap;