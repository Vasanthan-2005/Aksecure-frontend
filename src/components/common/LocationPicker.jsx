import { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, useMapEvents, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { MapPin, Navigation, Crosshair } from 'lucide-react';

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

const LocationMarker = ({ position, setPosition }) => {
    const map = useMap();

    useMapEvents({
        click(e) {
            setPosition(e.latlng);
            map.flyTo(e.latlng, map.getZoom());
        },
    });

    return position === null ? null : (
        <Marker position={position} />
    );
};

// Component to handle flying to a new center
const ChangeView = ({ center }) => {
    const map = useMap();
    useEffect(() => {
        if (center) {
            map.flyTo(center, 18);
        }
    }, [center, map]);
    return null;
};

// Component to handle map size invalidation (useful after modal animations)
const MapResizeHandler = () => {
    const map = useMap();
    useEffect(() => {
        const timer = setTimeout(() => {
            map.invalidateSize();
        }, 300); // Wait for modal animation
        return () => clearTimeout(timer);
    }, [map]);
    return null;
};

const LocationPicker = ({ onLocationSelect, onAddressFetched, initialLocation, title = "Location Selection", subTitle = "Pick the location on the map" }) => {
    const [position, setPosition] = useState(initialLocation || null);
    const [error, setError] = useState(null);
    const [fetchingLocation, setFetchingLocation] = useState(false);

    // Sync position with initialLocation if it changes externally (e.g., from address geocoding)
    useEffect(() => {
        if (initialLocation) {
            const hasChanged = !position ||
                Math.abs(initialLocation.lat - position.lat) > 0.000001 ||
                Math.abs(initialLocation.lng - position.lng) > 0.000001;

            if (hasChanged) {
                setPosition(initialLocation);
            }
        }
    }, [initialLocation?.lat, initialLocation?.lng]);

    const handleGetCurrentLocation = () => {
        setFetchingLocation(true);
        setError(null);
        if (!navigator.geolocation) {
            setError("Geolocation is not supported by your browser");
            setFetchingLocation(false);
            return;
        }

        navigator.geolocation.getCurrentPosition(
            async (pos) => {
                const newPos = {
                    lat: pos.coords.latitude,
                    lng: pos.coords.longitude
                };
                setPosition(newPos);
                onLocationSelect(newPos);

                // Reverse geocode to get address for current location
                if (onAddressFetched) {
                    try {
                        const response = await fetch(
                            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${newPos.lat}&lon=${newPos.lng}&zoom=18&addressdetails=1`,
                            { headers: { 'User-Agent': 'Aksecure-App-Reverse' } }
                        );
                        const data = await response.json();
                        if (data && data.display_name) {
                            onAddressFetched(data.display_name);
                        }
                    } catch (err) {
                        console.error("Reverse geocoding error:", err);
                    }
                }

                setFetchingLocation(false);
            },
            (err) => {
                setError("Unable to retrieve your location. Please select it manually.");
                setFetchingLocation(false);
                console.error(err);
            },
            { enableHighAccuracy: true, timeout: 5000, maximumAge: 0 }
        );
    };

    const handleMapClick = async (latlng) => {
        setPosition(latlng);
        onLocationSelect(latlng);

        // Reverse geocode to get address for clicked point
        if (onAddressFetched) {
            try {
                const response = await fetch(
                    `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latlng.lat}&lon=${latlng.lng}&zoom=18&addressdetails=1`,
                    { headers: { 'User-Agent': 'Aksecure-App-Reverse' } }
                );
                const data = await response.json();
                if (data && data.display_name) {
                    onAddressFetched(data.display_name);
                }
            } catch (err) {
                console.error("Reverse geocoding error:", err);
            }
        }
    };

    return (
        <div className="space-y-4">
            <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
                <div>
                    <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">{title}</h3>
                    <p className="text-[10px] text-slate-500">{subTitle}</p>
                </div>
                <button
                    type="button"
                    onClick={handleGetCurrentLocation}
                    disabled={fetchingLocation}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 rounded-xl text-xs font-medium transition-all group border border-blue-500/20"
                >
                    {fetchingLocation ? (
                        <span className="w-3 h-3 border-2 border-blue-400/20 border-t-blue-400 rounded-full animate-spin" />
                    ) : (
                        <Navigation className="w-3 h-3 group-hover:scale-110 transition-transform" />
                    )}
                    {fetchingLocation ? 'Fetching...' : 'Use Current Location'}
                </button>
            </div>

            <div className="relative h-64 w-full rounded-2xl overflow-hidden border border-white/10 glass-card">
                <MapContainer
                    center={position || [20.5937, 78.9629]} // Starting point
                    zoom={position ? 13 : 2}
                    style={{ height: '100%', width: '100%', zIndex: 1 }}
                    className="rounded-2xl"
                >
                    <TileLayer
                        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    />
                    <LocationMarker position={position} setPosition={handleMapClick} />
                    {position && <ChangeView center={position} />}
                    <MapResizeHandler />
                </MapContainer>

                {!position && (
                    <div className="absolute inset-0 pointer-events-none flex items-center justify-center bg-slate-950/20 backdrop-blur-[1px] z-[1000]">
                        <div className="bg-slate-900/80 px-4 py-2 rounded-full border border-white/10 flex items-center gap-2 shadow-2xl">
                            <Crosshair className="w-4 h-4 text-blue-400 animate-pulse" />
                            <span className="text-xs text-slate-300 font-medium tracking-tight">Click on map to pick location</span>
                        </div>
                    </div>
                )}
            </div>

            {error && <p className="text-xs text-red-400 flex items-center gap-1.5 mt-2">
                <span className="w-1 h-1 rounded-full bg-red-400" />
                {error}
            </p>}

            {position && (
                <div className="flex items-center gap-4 p-3 bg-white/5 rounded-xl border border-white/5 animate-fade-in-up">
                    <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400">
                        <MapPin className="w-4 h-4" />
                    </div>
                    <div>
                        <p className="text-[10px] text-slate-500 uppercase font-semibold">Coordinates Selected</p>
                        <p className="text-xs text-slate-300 font-mono">
                            {position.lat.toFixed(6)}, {position.lng.toFixed(6)}
                        </p>
                    </div>
                </div>
            )}
        </div>
    );
};

export default LocationPicker;
