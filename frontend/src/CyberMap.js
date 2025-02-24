import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix leaflet default icon
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
    iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

const CyberMap = ({ allCams, query_found_cam }) => {

    console.log("INCOMING DATA TO MAP", allCams, query_found_cam);

    const [mapCenter, setMapCenter] = useState([40.7128, -74.0060]); // Default NYC
    const [mapZoom, setMapZoom] = useState(12);
    const [processedQueryCam, setProcessedQueryCam] = useState(null);

    // Custom icons
    const defaultIcon = L.Icon.Default;
    const queryCamIcon = new L.Icon({
        iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-red.png',
        iconSize: [25, 41],
        iconAnchor: [12, 41],
    });

    // Handle query camera updates
    useEffect(() => {
        if (query_found_cam?.location) {
            try {
                const [lat, lng] = query_found_cam.location.split(',').map(Number);
                if (!isNaN(lat) && !isNaN(lng)) {
                    setMapCenter([lat, lng]);
                    setMapZoom(16);
                    setProcessedQueryCam(query_found_cam);
                }
            } catch (e) {
                console.error('Invalid query camera coordinates:', e);
            }
        }
    }, [query_found_cam]);

    // Component to handle view changes
    const ChangeView = () => {
        const map = useMap();
        useEffect(() => {
            map.setView(mapCenter, mapZoom);
        }, [mapCenter, mapZoom, map]);
        return null;
    };

    return (
        <div className="h-screen w-full">
            <MapContainer
                center={mapCenter}
                zoom={mapZoom}
                style={{ height: '100%', width: '100%' }}
            >
                <ChangeView />
                <TileLayer
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                />

                {/* Render all cameras */}
                {allCams.map((cam) => {
                    try {
                        const [lat, lng] = cam.location?.split(',').map(Number);
                        if (isNaN(lat) || isNaN(lng)) return null;

                        return (
                            <Marker
                                key={cam.id}
                                position={[lat, lng]}
                                icon={cam.id === processedQueryCam?.id ? queryCamIcon : defaultIcon}
                            >
                                <Popup>
                                    <div className="p-2">
                                        <img
                                            src={cam.image_url}
                                            alt="Camera feed"
                                            className="w-48 h-48 object-cover mb-2"
                                        />
                                        <p className="text-xs text-gray-600">{cam.description}</p>
                                    </div>
                                </Popup>
                            </Marker>
                        );
                    } catch (e) {
                        console.error('Invalid camera coordinates:', cam.location);
                        return null;
                    }
                })}
            </MapContainer>
        </div>
    );
};

export default CyberMap;