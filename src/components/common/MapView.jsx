import { MapContainer, TileLayer, Marker } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix for default marker icons in Leaflet with Webpack/Vite
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

let DefaultIcon = L.icon({
    iconUrl: icon,
    shadowUrl: iconShadow,
    iconSize: [25, 41],
    iconAnchor: [12, 41]
});

L.Marker.prototype.options.icon = DefaultIcon;

const MapView = ({ location }) => {
    if (!location || !location.lat || !location.lng) return null;

    const position = [location.lat, location.lng];

    return (
        <div className="relative h-64 w-full rounded-2xl overflow-hidden border border-white/10 glass-card">
            <MapContainer
                center={position}
                zoom={15}
                style={{ height: '100%', width: '100%', zIndex: 1 }}
                scrollWheelZoom={false}
                zoomControl={true}
                dragging={true}
                className="rounded-2xl"
            >
                <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                <Marker position={position} />
            </MapContainer>
        </div>
    );
};

export default MapView;
