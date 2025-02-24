import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import './home.css';

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
        attribution=''
    />
);

const CyberMap = ({ allCams, query_found_cam, query_found_res }) => {

    const [view, setView] = useState({
        center: [40.7128, -74.0060],
        zoom: 6
    });
    const [selectedCam, setSelectedCam] = useState(null);
    const [autoOpenDone, setAutoOpenDone] = useState(false);

    const defaultIcon = createDotIcon();

    function ChangeView({ center, zoom }) {
        const map = useMap();
        useEffect(() => {
            map.flyTo(center, zoom, { duration: 1 });
        }, [center, zoom, map]);
        return null;
    }

    useEffect(() => {
        if (query_found_cam?.location && !autoOpenDone) {
            try {
                const [lat, lng] = query_found_cam.location.split(',').map(Number);

                // Set proper coordinates and higher zoom
                setView({
                    center: [lat, lng],
                    zoom: 10 // Closer zoom level
                });
                setSelectedCam(query_found_cam);
                setAutoOpenDone(true);

            } catch (e) {
                console.error('Invalid query camera coordinates:', e);
            }
        }
    }, [query_found_cam, autoOpenDone]);

    const CentralPopup = () => {
        if (!selectedCam) return null;

        return (
            <div className="fixed inset-0 flex items-center justify-center z-[1000] pointer-events-none" onClick={() => setSelectedCam(null)}>
                <div className="bg-black border-2 border-green-500 w-3/4 h-3/4 flex relative pointer-events-auto p-2">
                    <button
                        className="absolute top-2 right-2 text-green-500 hover:text-green-700"
                    >
                        X
                    </button>
                    <div className="w-1/2 border-r-2 border-green-500 p-4">
                        <img
                            src={selectedCam.image_url}
                            alt="Camera feed"
                            className="w-full h-full object-contain"
                        />
                    </div>
                    <div className="w-1/2 p-4 font-mono text-green-500">
                        <div className="terminal-text">
                            > INITIALIZING SURVEILLANCE MODULE...
                            <br />
                            > SYSTEM TIME: {new Date().toLocaleTimeString()}
                            <br />
                            > CAMERA ID: {selectedCam.uid}

                        </div>

                        {selectedCam.uid === query_found_cam?.uid &&
                            <div className="terminal-text">
                                <br />
                                > QUERY RESULT:
                                <br />
                                {query_found_res.name}
                            </div>

                        }
                    </div>
                </div>
            </div>
        );
    };

    return (
        <div className="h-screen w-full cyber-map-container">
            <MapContainer
                center={view.center}
                zoom={view.zoom}
                style={{ height: '100%', width: '100%' }}
                attributionControl={false}
            >
                <ChangeView center={view.center} zoom={view.zoom} />
                <DarkTileLayer />
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