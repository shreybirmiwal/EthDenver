import React, { useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import { motion } from 'framer-motion';
import SpyAnalysisOverlay from './SpyAnalysisOverlay';

function ChangeView({ center, zoom }) {
    const map = useMap();
    useEffect(() => {
        if (center) {
            map.flyTo(center, zoom, {
                animate: true,
                duration: 1.5,
                easeLinearity: 0.25
            });
        }
    }, [center, zoom, map]);
    return null;
}

const createMarkerIcon = (isHighlighted = false) =>
    L.divIcon({
        className: '',
        iconSize: [24, 24],
        html: (
            <div className={`h-4 w-4 ${isHighlighted ? 'bg-red-500' : 'bg-green-500'} 
        rounded-full border-2 border-green-300/30 shadow-cyber pulse`} />
        )
    });

const CyberMap = ({
    selectedCam,
    allCams,
    query_found_res,
    onCameraSelect,
    onFaceSearch
}) => {
    const mapRef = useRef(null);

    useEffect(() => {
        if (selectedCam && mapRef.current) {
            const [lat, lng] = selectedCam.location.split(',').map(Number);
            const map = mapRef.current;

            map.flyTo([lat, lng], 16, {
                animate: true,
                duration: 1.5
            });

            // Open popup after animation
            setTimeout(() => {
                const marker = Object.values(map._layers)
                    .find(layer => layer.options?.icon?.options?.className === 'selected-camera');
                if (marker) marker.openPopup();
            }, 1500);
        }
    }, [selectedCam]);

    return (
        <div className="h-screen w-screen bg-black relative overflow-hidden">
            <MapContainer
                ref={mapRef}
                center={[34, 60]}
                zoom={3}
                className="h-full w-full"
                attributionControl={false}
                zoomControl={false}
            >
                <TileLayer
                    url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
                    className="map-tiles"
                />

                {selectedCam && (
                    <ChangeView
                        center={selectedCam.location.split(',').map(Number)}
                        zoom={16}
                    />
                )}

                {allCams.map(cam => {
                    const [lat, lng] = cam.location.split(',').map(Number);
                    const isHighlighted = cam.uid === selectedCam?.uid;

                    return (
                        <Marker
                            key={cam.uid}
                            position={[lat, lng]}
                            icon={createMarkerIcon(isHighlighted)}
                            eventHandlers={{
                                click: () => {
                                    onCameraSelect(cam);
                                    if (cam.face_search) {
                                        onFaceSearch(cam);
                                    }
                                }
                            }}
                        >
                            <Popup className="cyber-popup">
                                <div className="relative">
                                    <img
                                        src={cam.image_url}
                                        className="w-[600px] h-[400px] object-cover glow-border"
                                        alt="Camera feed"
                                    />
                                    {cam.face_search && (
                                        <div className="absolute inset-0 bg-black/50 p-4">
                                            <SpyAnalysisOverlay data={query_found_res} />
                                        </div>
                                    )}
                                </div>
                            </Popup>
                        </Marker>
                    );
                })}
            </MapContainer>

            {query_found_res && (
                <SpyAnalysisOverlay data={query_found_res} />
            )}
        </div>
    );
};

export default CyberMap;