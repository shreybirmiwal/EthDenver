import { MapContainer, TileLayer, Marker, useMap } from 'react-leaflet'
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { useEffect, useRef, useState } from 'react';
import { Popup } from 'react-leaflet';

const MapState = ({ allCams, query_found_cam }) => {
    const [selectedCam, setSelectedCam] = useState(null);
    const mapRef = useRef(null);

    // Custom green cyberpunk-style marker
    const createMarkerIcon = (isHighlighted = false) => L.divIcon({
        className: '',
        iconSize: [24, 24],
        html: `
      <div class="${isHighlighted ?
                'animate-pulse h-6 w-6 bg-green-400 blur-[1px]' :
                'h-4 w-4 bg-green-500'} 
        rounded-full border-2 border-green-300/30 shadow-cyber">
      </div>
    `
    });



    const flyToLocation = (latlng) => {
        mapRef.current?.flyTo(latlng, 12, {
            animate: true,
            duration: 1.5,
            easeLinearity: 0.25
        });
    };


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

                {/* All Camera Markers */}
                {allCams.map(cam => {
                    const [lat, lng] = cam.location.split(',').map(Number);
                    const isHighlighted = cam.uid === query_found_cam?.uid;

                    return (
                        <Marker
                            key={cam.uid}
                            position={[lat, lng]}
                            icon={createMarkerIcon(isHighlighted)}
                            eventHandlers={{
                                click: () => {
                                    setSelectedCam(cam);
                                    flyToLocation([lat, lng]);
                                }
                            }}
                        >
                            <Popup className="cyber-popup">
                                <img
                                    src={cam.image_url}
                                    className="w-[600px] h-[600px] object-cover mb-3 glow-border"
                                    alt="Camera feed"
                                />
                            </Popup>

                        </Marker>
                    );
                })}

            </MapContainer>

        </div>
    );
};


export default MapState;


