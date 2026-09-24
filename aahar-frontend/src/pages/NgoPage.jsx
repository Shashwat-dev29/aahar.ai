import { useState, useEffect, useContext } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from 'react-leaflet';
import { io } from 'socket.io-client';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import 'leaflet/dist/leaflet.css';

import L from 'leaflet';
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';
const DefaultIcon = L.icon({ iconUrl: icon, shadowUrl: iconShadow, iconAnchor: [12, 41] });
L.Marker.prototype.options.icon = DefaultIcon;

const API_URL = 'https://aahar-ai-xs0e.onrender.com';
let socket;

function MapController({ routeCoords, center }) {
    const map = useMap();
    useEffect(() => {
        if (routeCoords.length > 0) {
            map.fitBounds(routeCoords, { padding: [50, 50] });
        } else if (center) {
            map.setView(center, 13);
        }
    }, [routeCoords, center, map]);
    return null;
}

const STEP_TRACKER = [
    { label: 'Requested', icon: '📡' },
    { label: 'Accepted', icon: '✅' },
    { label: 'Picked Up', icon: '🚴' },
    { label: 'Delivered', icon: '🎉' },
];

export default function NgoPage() {
    const { user } = useContext(AuthContext);
    const [feed, setFeed] = useState([]);
    const [ngoLocation, setNgoLocation] = useState([25.4358, 81.8463]);
    const [donorLocation, setDonorLocation] = useState(null);
    const [routeCoords, setRouteCoords] = useState([]);
    const [deliveryAgentLoc, setDeliveryAgentLoc] = useState(null);

    useEffect(() => {
        socket = io(API_URL);

        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    const lat = position.coords.latitude;
                    const lon = position.coords.longitude;
                    setNgoLocation([lat, lon]);
                    socket.emit('register_ngo', { id: user.email, coords: [lat, lon] });
                },
                (error) => {
                    console.warn("Location denied, using fallback.", error);
                    socket.emit('register_ngo', { id: user.email, coords: ngoLocation });
                }
            );
        }

        socket.on('new_food_alert', (data) => {
            setFeed(prev => [...prev, { ...data, accepted: false, step: 0 }]);
        });

        socket.on('delivery_status_updated', (data) => {
            setFeed(prev => prev.map(item => {
                if (item.donationId === data.donationId) {
                    return { ...item, step: data.status === 'picked_up' ? 2 : 3 };
                }
                return item;
            }));
        });

        socket.on('update_delivery_marker', (data) => {
            setDeliveryAgentLoc([data.coords[0], data.coords[1]]);
        });

        return () => {
            socket.off('new_food_alert');
            socket.off('delivery_status_updated');
            socket.off('update_delivery_marker');
            socket.disconnect();
        };
    }, [user.email]);

    const acceptDonation = async (index, donorLat, donorLon) => {
        const updatedFeed = [...feed];
        const item = updatedFeed[index];
        item.accepted = true;
        item.step = 1; // 1 = Accepted
        setFeed(updatedFeed);
        
        // Show route on map
        setDonorLocation([donorLat, donorLon]);

        // Emit to backend so delivery agents are assigned
        socket.emit('ngo_accepted_donation', {
            donationId: item.donationId,
            foodType: item.foodType,
            quantity: item.quantity,
            donorCoords: [donorLat, donorLon],
            ngoCoords: ngoLocation
        });

        const routingUrl = `https://router.project-osrm.org/route/v1/driving/${ngoLocation[1]},${ngoLocation[0]};${donorLon},${donorLat}?overview=full&geometries=geojson`;

        try {
            const res = await axios.get(routingUrl);
            if (res.data.routes && res.data.routes.length > 0) {
                const route = res.data.routes[0].geometry.coordinates.map(coord => [coord[1], coord[0]]);
                setRouteCoords(route);
            }
        } catch (error) {
            alert("Routing service is currently unavailable.");
        }
    };

    const bikeIcon = new L.Icon({
        iconUrl: 'https://cdn-icons-png.flaticon.com/512/3063/3063822.png',
        iconSize: [40, 40],
        iconAnchor: [20, 20]
    });

    const getFreshnessColor = (hours) => {
        if (!hours) return { color: 'bg-gray-300', text: 'text-gray-500', pct: 30 };
        if (hours > 6) return { color: 'bg-green-400', text: 'text-green-600', pct: 90 };
        if (hours > 3) return { color: 'bg-yellow-400', text: 'text-yellow-600', pct: 60 };
        return { color: 'bg-red-400', text: 'text-red-600', pct: 30 };
    };

    const acceptedCount = feed.filter(f => f.accepted).length;
    const pendingCount = feed.filter(f => !f.accepted).length;

    return (
        <div className="min-h-screen bg-surface-50">
            {/* Dashboard Header */}
            <div className="gradient-brand text-white">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 animate-fade-in">
                        <div>
                            <h1 className="text-2xl sm:text-3xl font-extrabold">NGO Dashboard 🏥</h1>
                            <p className="text-white/80 mt-1">Monitor incoming food donations in real-time</p>
                        </div>
                        <span className="badge bg-white/20 text-white border border-white/20 backdrop-blur-sm text-sm px-4 py-1.5">
                            🏥 NGO Account
                        </span>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Stats */}
                <div className="grid grid-cols-3 gap-4 mb-8 -mt-12 relative z-10 animate-slide-up">
                    {[
                        { icon: '📡', value: feed.length, label: 'Total Alerts', color: 'text-brand-500' },
                        { icon: '✅', value: acceptedCount, label: 'Accepted', color: 'text-success-500' },
                        { icon: '⏳', value: pendingCount, label: 'Pending', color: 'text-accent-500' },
                    ].map((stat, i) => (
                        <div key={i} className="stat-card text-center">
                            <div className="text-3xl mb-2">{stat.icon}</div>
                            <div className={`text-2xl font-extrabold ${stat.color}`}>{stat.value}</div>
                            <div className="text-xs text-gray-500 font-semibold uppercase tracking-wide mt-1">{stat.label}</div>
                        </div>
                    ))}
                </div>

                <div className="flex flex-col lg:flex-row gap-8">
                    {/* Feed Panel */}
                    <div className="w-full lg:w-[380px] flex-shrink-0 animate-slide-up delay-200">
                        <div className="premium-card p-6">
                            <h2 className="text-lg font-extrabold text-gray-900 mb-4 flex items-center gap-2">
                                <span>📡</span> Live Request Feed
                                {pendingCount > 0 && (
                                    <span className="badge badge-brand animate-pulse-soft ml-auto">{pendingCount} New</span>
                                )}
                            </h2>

                            <div className="space-y-4 max-h-[600px] overflow-y-auto pr-1" style={{ scrollbarWidth: 'thin' }}>
                                {feed.length === 0 ? (
                                    <div className="text-center py-12">
                                        <div className="relative inline-block mb-4">
                                            <div className="text-5xl animate-pulse-soft">📡</div>
                                            <div className="absolute inset-0 w-16 h-16 mx-auto rounded-full border-2 border-brand-200 animate-radar"></div>
                                        </div>
                                        <p className="text-gray-500 font-semibold">Waiting for donations...</p>
                                        <p className="text-xs text-gray-400 mt-1">Alerts appear here in real-time</p>
                                    </div>
                                ) : (
                                    feed.map((item, idx) => {
                                        const freshness = getFreshnessColor(item.shelfLife?.remaining_hours);
                                        return (
                                            <div
                                                key={idx}
                                                className={`rounded-2xl border transition-all duration-300 overflow-hidden ${
                                                    item.accepted
                                                        ? 'bg-surface-50 border-gray-200'
                                                        : 'bg-white border-gray-200 hover:border-brand-200 hover:shadow-md'
                                                }`}
                                            >
                                                {item.accepted ? (
                                                    <div className="p-4">
                                                        <div className="flex items-center gap-2 mb-3">
                                                            <span className="text-xl">✅</span>
                                                            <span className="font-bold text-success-600 text-sm">Donation Accepted</span>
                                                        </div>
                                                        {/* Step Tracker */}
                                                        <div className="flex items-center gap-1">
                                                            {STEP_TRACKER.map((step, si) => (
                                                                <div key={si} className="flex items-center flex-1">
                                                                    <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs flex-shrink-0 ${
                                                                        si <= item.step
                                                                            ? 'gradient-brand text-white shadow-md'
                                                                            : 'bg-gray-200 text-gray-400'
                                                                    }`}>
                                                                        {step.icon}
                                                                    </div>
                                                                    {si < STEP_TRACKER.length - 1 && (
                                                                        <div className={`flex-1 h-0.5 mx-1 rounded ${si < item.step ? 'bg-brand-400' : 'bg-gray-200'}`}></div>
                                                                    )}
                                                                </div>
                                                            ))}
                                                        </div>
                                                        <p className="text-xs text-gray-500 mt-2 text-center">
                                                            {item.step === 1 ? 'Navigating to pickup location...' : item.step === 2 ? 'Out for delivery to you...' : 'Delivery completed!'}
                                                        </p>
                                                    </div>
                                                ) : (
                                                    <div className="p-4">
                                                        <div className="flex items-start gap-3 mb-3">
                                                            <div className="w-10 h-10 rounded-xl bg-brand-50 flex items-center justify-center text-xl flex-shrink-0">
                                                                {item.foodType?.includes('veg') ? '🥗' : item.foodType?.includes('nonveg') ? '🍗' : '📦'}
                                                            </div>
                                                            <div className="flex-1 min-w-0">
                                                                <p className="font-bold text-gray-900 text-sm capitalize">
                                                                    {(item.foodType || 'food').replace(/_/g, ' ')}
                                                                </p>
                                                                <p className="text-xs text-gray-500 mt-0.5">
                                                                    Serves {item.quantity || '?'} people
                                                                </p>
                                                            </div>
                                                        </div>

                                                        {/* Freshness Bar */}
                                                        <div className="mb-3">
                                                            <div className="flex justify-between items-center mb-1">
                                                                <span className="text-xs font-semibold text-gray-600">Freshness</span>
                                                                <span className={`text-xs font-bold ${freshness.text}`}>
                                                                    {item.shelfLife?.remaining_hours || '?'} hrs left
                                                                </span>
                                                            </div>
                                                            <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                                                                <div
                                                                    className={`h-full rounded-full ${freshness.color} transition-all duration-500`}
                                                                    style={{ width: `${freshness.pct}%` }}
                                                                ></div>
                                                            </div>
                                                        </div>

                                                        <button
                                                            onClick={() => acceptDonation(idx, item.routing.donor_coordinates[0], item.routing.donor_coordinates[1])}
                                                            className="btn-brand w-full py-3 text-sm"
                                                            id={`accept-donation-${idx}`}
                                                        >
                                                            ✅ Accept & View Route
                                                        </button>
                                                    </div>
                                                )}
                                            </div>
                                        );
                                    })
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Map Panel */}
                    <div className="flex-1 animate-slide-up delay-300">
                        <div className="premium-card overflow-hidden">
                            <div className="p-4 border-b border-gray-100 flex items-center justify-between">
                                <h2 className="text-lg font-extrabold text-gray-900 flex items-center gap-2">
                                    <span>🗺️</span> Live Map View
                                </h2>
                                <div className="flex items-center gap-2">
                                    <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
                                    <span className="text-xs text-gray-500 font-medium">Real-time</span>
                                </div>
                            </div>
                            <div className="relative" style={{ zIndex: 0 }}>
                                <MapContainer center={ngoLocation} zoom={13} className="w-full rounded-b-2xl" style={{ height: '560px' }}>
                                    <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                                    <MapController routeCoords={routeCoords} center={ngoLocation} />

                                    <Marker position={ngoLocation}>
                                        <Popup>
                                            <div className="text-center">
                                                <strong>📍 Your Location</strong><br />
                                                <span className="text-xs text-gray-500">NGO Headquarters</span>
                                            </div>
                                        </Popup>
                                    </Marker>

                                    {donorLocation && (
                                        <Marker position={donorLocation}>
                                            <Popup>
                                                <div className="text-center">
                                                    <strong>🍽️ Pickup Location</strong><br />
                                                    <span className="text-xs text-gray-500">Food Donor</span>
                                                </div>
                                            </Popup>
                                        </Marker>
                                    )}

                                    {deliveryAgentLoc && (
                                        <Marker position={deliveryAgentLoc} icon={bikeIcon}>
                                            <Popup>
                                                <div className="text-center">
                                                    <strong>🚴 Delivery Agent</strong><br />
                                                    <span className="text-xs text-gray-500">En Route</span>
                                                </div>
                                            </Popup>
                                        </Marker>
                                    )}

                                    {routeCoords.length > 0 && (
                                        <Polyline positions={routeCoords} color="#E23744" weight={5} opacity={0.8} />
                                    )}
                                </MapContainer>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}