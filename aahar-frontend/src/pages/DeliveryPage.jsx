import { useState, useContext, useEffect, useRef } from 'react';
import { AuthContext } from '../context/AuthContext';
import { io } from 'socket.io-client';
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from 'react-leaflet';
import axios from 'axios';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

const DefaultIcon = L.icon({ iconUrl: icon, shadowUrl: iconShadow, iconAnchor: [12, 41] });
L.Marker.prototype.options.icon = DefaultIcon;

const bikeIcon = new L.Icon({
    iconUrl: 'https://cdn-icons-png.flaticon.com/512/3063/3063822.png',
    iconSize: [40, 40],
    iconAnchor: [20, 20]
});

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

const API_URL = 'https://aahar-ai-xs0e.onrender.com';

const ACHIEVEMENTS = [
    { icon: '🌟', title: 'First Delivery', desc: 'Completed your first trip', unlocked: true },
    { icon: '🔥', title: '10 Trips', desc: 'Delivered 10 food packages', unlocked: false },
    { icon: '💪', title: '100 Kgs', desc: 'Rescued 100 kg of food', unlocked: false },
    { icon: '🏆', title: 'Hero', desc: 'Fed 1000+ people', unlocked: false },
];

export default function DeliveryPage() {
    const { user } = useContext(AuthContext);
    const [isOnline, setIsOnline] = useState(false);
    const [stats, setStats] = useState({ trips: 0, kgs: 0 });
    const [activeStatus, setActiveStatus] = useState('none');
    const [activeTask, setActiveTask] = useState(null);
    const [elapsedTime, setElapsedTime] = useState(0);
    const [selectedTab, setSelectedTab] = useState('today');
    const [showMap, setShowMap] = useState(false);
    const [routeCoords, setRouteCoords] = useState([]);
    const [eta, setEta] = useState(null);
    const [currentLocation, setCurrentLocation] = useState([25.4358, 81.8463]);

    const socketRef = useRef(null);
    const watchIdRef = useRef(null);
    const timerRef = useRef(null);
    const lastFetchTimeRef = useRef(0);

    // Dynamic Route Calculation
    useEffect(() => {
        if (!showMap || !activeTask) return;
        
        const now = Date.now();
        // Throttle route calculation to once every 5 seconds to avoid spamming the API on every GPS micro-movement
        if (now - lastFetchTimeRef.current < 5000) return; 
        
        const targetCoords = activeStatus === 'none' ? activeTask.pickup : activeTask.dropoff;
        
        const fetchRoute = async () => {
            const routingUrl = `https://router.project-osrm.org/route/v1/driving/${currentLocation[1]},${currentLocation[0]};${targetCoords[1]},${targetCoords[0]}?overview=full&geometries=geojson`;
            try {
                const res = await axios.get(routingUrl);
                if (res.data.routes && res.data.routes.length > 0) {
                    const route = res.data.routes[0].geometry.coordinates.map(coord => [coord[1], coord[0]]);
                    setRouteCoords(route);
                    const durationSeconds = res.data.routes[0].duration;
                    setEta(Math.ceil(durationSeconds / 60));
                    lastFetchTimeRef.current = now;
                }
            } catch (error) {
                console.error("Routing error:", error);
            }
        };
        
        fetchRoute();
    }, [currentLocation, showMap, activeTask, activeStatus]);

    useEffect(() => {
        socketRef.current = io(API_URL);

        // Listen for real delivery assignments from the backend
        socketRef.current.on('delivery_assigned', (data) => {
            console.log("New Delivery Assigned!", data);
            
            setActiveTask({
                donationId: data.donationId,
                pickup: data.donorCoords || [25.4358, 81.8463],
                dropoff: data.ngoCoords || [25.4500, 81.8500],
                details: `${data.quantity || 'Food'} Meals - Pickup at Donor`,
                foodType: data.foodType || "Food Package",
                distance: data.distance || "Calculating..."
            });
            setActiveStatus('none');
        });

        return () => {
            if (watchIdRef.current) navigator.geolocation.clearWatch(watchIdRef.current);
            if (timerRef.current) clearInterval(timerRef.current);
            socketRef.current.off('delivery_assigned');
            socketRef.current.disconnect();
        };
    }, []);

    // Timer for active delivery
    useEffect(() => {
        if (activeTask && activeStatus !== 'none') {
            timerRef.current = setInterval(() => setElapsedTime(prev => prev + 1), 1000);
        } else {
            if (timerRef.current) clearInterval(timerRef.current);
            setElapsedTime(0);
        }
        return () => { if (timerRef.current) clearInterval(timerRef.current); };
    }, [activeTask, activeStatus]);

    const formatTime = (seconds) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };

    const toggleDutyStatus = (e) => {
        const checked = e.target.checked;
        setIsOnline(checked);

        if (checked) {
            if (!navigator.geolocation) return alert("Geolocation not supported");

            // Register this delivery agent with the backend so it can receive assignments
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    const lat = position.coords.latitude;
                    const lon = position.coords.longitude;
                    setCurrentLocation([lat, lon]);
                    socketRef.current.emit('register_delivery', {
                        id: user?.email,
                        coords: [lat, lon]
                    });
                    console.log('Registered as delivery agent with backend');
                },
                () => {
                    // Fallback: register with default coords
                    setCurrentLocation([25.4358, 81.8463]);
                    socketRef.current.emit('register_delivery', {
                        id: user?.email,
                        coords: [25.4358, 81.8463]
                    });
                }
            );

            // Start continuous GPS tracking
            watchIdRef.current = navigator.geolocation.watchPosition(
                (position) => {
                    const lat = position.coords.latitude;
                    const lon = position.coords.longitude;
                    setCurrentLocation([lat, lon]);
                    socketRef.current.emit('delivery_location_update', {
                        id: user?.email,
                        coords: [lat, lon]
                    });
                },
                (error) => console.warn("Tracking error:", error),
                { enableHighAccuracy: true, maximumAge: 0 }
            );

        } else {
            if (watchIdRef.current) {
                navigator.geolocation.clearWatch(watchIdRef.current);
                watchIdRef.current = null;
            }
            setActiveTask(null);
        }
    };

    const openEmbeddedMap = async (type) => {
        if (!activeTask) return;
        setShowMap(true);
    };

    const handleAction = () => {
        if (activeStatus === 'none') {
            setActiveStatus('picked_up');
            socketRef.current.emit('delivery_status_update', {
                donationId: activeTask.donationId,
                status: 'picked_up'
            });
        } else {
            alert("Delivery Complete! Great job. 🎉");
            setStats(prev => ({ trips: prev.trips + 1, kgs: prev.kgs + 15 }));
            setActiveStatus('none');
            socketRef.current.emit('delivery_status_update', {
                donationId: activeTask.donationId,
                status: 'delivered'
            });
            setShowMap(false);
            setRouteCoords([]);
            setEta(null);
            setActiveTask(null);
        }
    };

    const earningsData = {
        today: { amount: '₹0', trips: stats.trips },
        week: { amount: '₹0', trips: stats.trips },
        month: { amount: '₹0', trips: stats.trips },
    };

    return (
        <div className="min-h-screen bg-surface-50">
            {/* Duty Banner */}
            <div className={`transition-all duration-500 ${isOnline ? 'gradient-brand' : 'bg-surface-800'} text-white`}>
                <div className="max-w-2xl mx-auto px-4 sm:px-6 py-8">
                    <div className="flex items-center justify-between animate-fade-in">
                        <div className="flex items-center gap-4">
                            <div className="relative">
                                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-3xl ${isOnline ? 'bg-white/20 backdrop-blur-sm' : 'bg-white/10'}`}>
                                    🚴
                                </div>
                                {isOnline && (
                                    <>
                                        <span className="absolute -top-1 -right-1 w-4 h-4 bg-green-400 rounded-full border-2 border-white"></span>
                                        <span className="absolute -top-1 -right-1 w-4 h-4 bg-green-400 rounded-full animate-ping"></span>
                                    </>
                                )}
                            </div>
                            <div>
                                <h1 className="text-xl sm:text-2xl font-extrabold">
                                    {isOnline ? 'You are Online' : 'You are Offline'}
                                </h1>
                                <p className="text-white/70 text-sm mt-0.5">
                                    {isOnline ? '🟢 Scanning for nearby pickups...' : 'Toggle to start accepting deliveries'}
                                </p>
                            </div>
                        </div>

                        {/* Toggle Switch */}
                        <label className="relative inline-flex items-center cursor-pointer">
                            <input type="checkbox" className="sr-only peer" checked={isOnline} onChange={toggleDutyStatus} />
                            <div className="w-14 h-7 bg-white/20 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-6 after:w-6 after:transition-all after:shadow-md peer-checked:bg-green-400/80 backdrop-blur-sm"></div>
                        </label>
                    </div>
                </div>
            </div>

            <div className="max-w-2xl mx-auto px-4 sm:px-6 py-8">
                {/* Stats Cards */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8 -mt-6 relative z-10 animate-slide-up">
                    {[
                        { icon: '🚗', value: stats.trips, label: 'Trips Today', color: 'text-brand-500' },
                        { icon: '📦', value: `${stats.kgs} kg`, label: 'Food Rescued', color: 'text-success-500' },
                        { icon: '📏', value: '5.2 km', label: 'Distance', color: 'text-accent-500' },
                        { icon: '⭐', value: '4.9', label: 'Rating', color: 'text-yellow-500' },
                    ].map((stat, i) => (
                        <div key={i} className="stat-card text-center">
                            <div className="text-2xl mb-1">{stat.icon}</div>
                            <div className={`text-xl font-extrabold ${stat.color}`}>{stat.value}</div>
                            <div className="text-[10px] text-gray-500 font-semibold uppercase tracking-wide mt-1">{stat.label}</div>
                        </div>
                    ))}
                </div>

                {/* Earnings Card */}
                <div className="premium-card p-6 mb-6 animate-slide-up delay-200">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-extrabold text-gray-900 flex items-center gap-2">
                            <span>💰</span> Earnings
                        </h3>
                        <div className="flex bg-surface-100 rounded-xl p-0.5">
                            {['today', 'week', 'month'].map(tab => (
                                <button
                                    key={tab}
                                    onClick={() => setSelectedTab(tab)}
                                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                                        selectedTab === tab
                                            ? 'bg-white text-gray-900 shadow-sm'
                                            : 'text-gray-500 hover:text-gray-700'
                                    }`}
                                >
                                    {tab.charAt(0).toUpperCase() + tab.slice(1)}
                                </button>
                            ))}
                        </div>
                    </div>
                    <div className="flex items-baseline gap-2">
                        <span className="text-3xl font-extrabold text-gray-900">{earningsData[selectedTab].amount}</span>
                        <span className="text-sm text-gray-400">{earningsData[selectedTab].trips} trips</span>
                    </div>
                </div>

                {/* Scanning State */}
                {isOnline && !activeTask && (
                    <div className="premium-card p-8 text-center mb-6 animate-fade-in">
                        <div className="relative inline-block mb-4">
                            <div className="text-5xl animate-pulse-soft">📡</div>
                            <div className="absolute inset-0 w-16 h-16 mx-auto rounded-full border-2 border-brand-200 animate-radar"></div>
                        </div>
                        <p className="font-bold text-gray-700">Scanning for nearby pickups...</p>
                        <p className="text-xs text-gray-400 mt-1">Stay online to receive delivery requests</p>
                    </div>
                )}

                {/* Active Delivery Card */}
                {activeTask && (
                    <div className="premium-card overflow-hidden mb-6 animate-scale-in border-2 border-brand-100">
                        {/* Header */}
                        <div className="gradient-brand text-white px-6 py-4 flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <span className="text-2xl">📦</span>
                                <div>
                                    <h3 className="font-extrabold">Active Delivery</h3>
                                    <p className="text-white/80 text-xs">{activeTask.details}</p>
                                </div>
                            </div>
                            {activeStatus !== 'none' && (
                                <div className="bg-white/20 backdrop-blur-sm rounded-xl px-3 py-1.5 text-sm font-bold tabular-nums">
                                    ⏱️ {formatTime(elapsedTime)}
                                </div>
                            )}
                        </div>

                        <div className="p-6">
                            {/* Route Steps */}
                            <div className="space-y-0 mb-6">
                                {/* Pickup */}
                                <div className="flex items-start gap-4">
                                    <div className="flex flex-col items-center">
                                        <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm shadow-md ${
                                            activeStatus === 'none' ? 'gradient-brand text-white' : 'bg-green-400 text-white'
                                        }`}>
                                            {activeStatus === 'none' ? 'A' : '✓'}
                                        </div>
                                        <div className="w-0.5 h-12 bg-gray-200 my-1"></div>
                                    </div>
                                    <div className="flex-1 pb-6">
                                        <div className="flex justify-between items-start">
                                            <div>
                                                <p className="text-xs text-gray-400 font-bold uppercase tracking-wide">Pickup (Donor)</p>
                                                <p className="font-semibold text-gray-900 text-sm mt-0.5">{activeTask.foodType}</p>
                                                <p className="text-xs text-gray-500 mt-0.5">{activeTask.distance} away</p>
                                            </div>
                                            <button
                                                onClick={() => openEmbeddedMap('pickup')}
                                                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-50 text-blue-600 text-xs font-bold hover:bg-blue-100 transition-colors"
                                            >
                                                📍 Navigate
                                            </button>
                                        </div>
                                    </div>
                                </div>

                                {/* Dropoff */}
                                <div className="flex items-start gap-4">
                                    <div className="flex flex-col items-center">
                                        <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm shadow-md ${
                                            activeStatus === 'picked_up' ? 'gradient-brand text-white animate-pulse-soft' : 'bg-gray-200 text-gray-400'
                                        }`}>
                                            B
                                        </div>
                                    </div>
                                    <div className="flex-1">
                                        <div className="flex justify-between items-start">
                                            <div>
                                                <p className="text-xs text-gray-400 font-bold uppercase tracking-wide">Dropoff (NGO)</p>
                                                <p className="font-semibold text-gray-900 text-sm mt-0.5">NGO Center</p>
                                            </div>
                                            <button
                                                onClick={() => openEmbeddedMap('dropoff')}
                                                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-50 text-blue-600 text-xs font-bold hover:bg-blue-100 transition-colors"
                                            >
                                                📍 Navigate
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Action Button */}
                            <button
                                onClick={handleAction}
                                className={`w-full py-4 rounded-2xl font-extrabold text-base transition-all duration-300 text-white ${
                                    activeStatus === 'none'
                                        ? 'bg-blue-600 hover:bg-blue-700 hover:shadow-lg hover:shadow-blue-200'
                                        : 'gradient-success hover:shadow-lg hover:shadow-green-200'
                                }`}
                                id="delivery-action"
                            >
                                {activeStatus === 'none' ? '📦 Mark as Picked Up' : '✅ Mark as Delivered'}
                            </button>

                            {/* Embedded Map */}
                            {showMap && (
                                <div className="mt-6 rounded-xl overflow-hidden border border-gray-200 relative animate-scale-in">
                                    {eta && (
                                        <div className="absolute top-2 right-2 z-[1000] bg-white px-3 py-2 rounded-lg shadow-md flex items-center gap-2">
                                            <span className="text-xl">⏱️</span>
                                            <div>
                                                <div className="text-xs text-gray-500 font-bold uppercase">Estimated Time</div>
                                                <div className="text-sm font-extrabold text-brand-600">{eta} mins based on current traffic</div>
                                            </div>
                                        </div>
                                    )}
                                    <MapContainer center={currentLocation} zoom={14} className="w-full" style={{ height: '300px' }}>
                                        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                                        <MapController routeCoords={routeCoords} center={currentLocation} />
                                        
                                        <Marker position={currentLocation} icon={bikeIcon}>
                                            <Popup>You are here (Tracker)</Popup>
                                        </Marker>
                                        
                                        <Marker position={activeStatus === 'none' ? activeTask.pickup : activeTask.dropoff}>
                                            <Popup>Destination</Popup>
                                        </Marker>

                                        {routeCoords.length > 0 && (
                                            <Polyline positions={routeCoords} color="#3b82f6" weight={5} opacity={0.8} />
                                        )}
                                    </MapContainer>
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* Achievements */}
                <div className="premium-card p-6 animate-slide-up delay-400">
                    <h3 className="text-lg font-extrabold text-gray-900 mb-4 flex items-center gap-2">
                        <span>🏅</span> Achievements
                    </h3>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                        {ACHIEVEMENTS.map((badge, i) => (
                            <div
                                key={i}
                                className={`text-center p-4 rounded-2xl border-2 transition-all ${
                                    badge.unlocked
                                        ? 'border-yellow-200 bg-yellow-50'
                                        : 'border-gray-200 bg-gray-50 opacity-50'
                                }`}
                            >
                                <div className={`text-3xl mb-2 ${badge.unlocked ? '' : 'grayscale'}`}>{badge.icon}</div>
                                <div className="text-xs font-bold text-gray-800">{badge.title}</div>
                                <div className="text-[10px] text-gray-400 mt-0.5">{badge.desc}</div>
                                {badge.unlocked && (
                                    <span className="badge badge-success mt-2 text-[9px]">Unlocked</span>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}