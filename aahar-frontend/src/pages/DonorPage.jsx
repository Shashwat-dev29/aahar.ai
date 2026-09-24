import { useState, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import api from '../api/axios';

const FOOD_TYPES = [
    { value: 'cooked_veg', icon: '🥗', label: 'Cooked Veg', color: 'border-green-300 bg-green-50', activeColor: 'border-green-500 bg-green-50 ring-4 ring-green-100' },
    { value: 'cooked_nonveg', icon: '🍗', label: 'Cooked Non-Veg', color: 'border-orange-300 bg-orange-50', activeColor: 'border-orange-500 bg-orange-50 ring-4 ring-orange-100' },
    { value: 'raw_vegetables', icon: '🥬', label: 'Raw Vegetables', color: 'border-emerald-300 bg-emerald-50', activeColor: 'border-emerald-500 bg-emerald-50 ring-4 ring-emerald-100' },
    { value: 'packaged', icon: '📦', label: 'Packaged Food', color: 'border-blue-300 bg-blue-50', activeColor: 'border-blue-500 bg-blue-50 ring-4 ring-blue-100' },
    { value: 'dairy', icon: '🥛', label: 'Dairy Products', color: 'border-yellow-300 bg-yellow-50', activeColor: 'border-yellow-500 bg-yellow-50 ring-4 ring-yellow-100' },
    { value: 'bakery', icon: '🍞', label: 'Bakery Items', color: 'border-amber-300 bg-amber-50', activeColor: 'border-amber-500 bg-amber-50 ring-4 ring-amber-100' },
];

const RECENT_DONATIONS = [
    { type: '🥗', food: 'Cooked Veg', qty: 30, time: '2 hrs ago', status: 'Delivered', statusColor: 'badge-success' },
    { type: '🍗', food: 'Non-Veg Biryani', qty: 50, time: '5 hrs ago', status: 'In Transit', statusColor: 'badge-warning' },
    { type: '🥬', food: 'Fresh Vegetables', qty: 20, time: 'Yesterday', status: 'Completed', statusColor: 'badge-success' },
];

export default function DonorPage() {
    const { user } = useContext(AuthContext);
    const [foodType, setFoodType] = useState('cooked_veg');
    const [quantity, setQuantity] = useState('');
    const [prepTime, setPrepTime] = useState('');
    const [location, setLocation] = useState('25.4358, 81.8463');
    const [status, setStatus] = useState({ type: '', message: '' });
    const [isBroadcasting, setIsBroadcasting] = useState(false);
    const [isDetecting, setIsDetecting] = useState(false);

    const detectLocation = () => {
        setIsDetecting(true);
        setLocation("Detecting...");
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    const lat = position.coords.latitude.toFixed(4);
                    const lon = position.coords.longitude.toFixed(4);
                    setLocation(`${lat}, ${lon}`);
                    setIsDetecting(false);
                },
                (error) => {
                    console.warn("Location access denied.", error);
                    alert("Could not detect location. Check browser permissions.");
                    setLocation("25.4358, 81.8463");
                    setIsDetecting(false);
                }
            );
        } else {
            alert("Geolocation is not supported by this browser.");
            setLocation("25.4358, 81.8463");
            setIsDetecting(false);
        }
    };

    const handleBroadcast = async (e) => {
        e.preventDefault();
        setIsBroadcasting(true);
        setStatus({ type: '', message: '' });

        try {
            const coordsArray = location.split(',').map(coord => parseFloat(coord.trim()));
            const lat = coordsArray[0];
            const lon = coordsArray[1];

            let realTemp = 35.0;
            try {
                const weatherRes = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current_weather=true`);
                if (weatherRes.ok) {
                    const weatherData = await weatherRes.json();
                    realTemp = weatherData.current_weather.temperature;
                }
            } catch (err) {
                console.warn("Could not fetch live weather, using fallback temperature.", err);
            }

            const payload = {
                foodType: foodType,
                quantity: parseInt(quantity),
                prepTime: prepTime.replace('T', ' '),
                currentTemp: realTemp,
                donorCoords: coordsArray
            };

            await api.post('/api/donations/broadcast', payload);
            setStatus({ type: 'success', message: '🎉 Broadcasted successfully! Nearby NGOs have been notified.' });
            setQuantity('');
            setPrepTime('');
        } catch (error) {
            console.error("Broadcast Error:", error);
            const errorMsg = error.response?.data?.error || "Engine calculation failed.";
            setStatus({ type: 'error', message: errorMsg });
        } finally {
            setIsBroadcasting(false);
        }
    };

    return (
        <div className="min-h-screen bg-surface-50">
            {/* Welcome Banner */}
            <div className="gradient-brand text-white">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 animate-fade-in">
                        <div>
                            <h1 className="text-2xl sm:text-3xl font-extrabold">
                                Hello, {user?.email?.split('@')[0] || 'Donor'}! 👋
                            </h1>
                            <p className="text-white/80 mt-1">Ready to save some food today?</p>
                        </div>
                        <span className="badge bg-white/20 text-white border border-white/20 backdrop-blur-sm text-sm px-4 py-1.5">
                            🍽️ Donor Account
                        </span>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Stats Row */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8 -mt-12 relative z-10 animate-slide-up">
                    {[
                        { icon: '📦', value: '12', label: 'Total Donations', color: 'text-brand-500' },
                        { icon: '👥', value: '450+', label: 'People Fed', color: 'text-success-500' },
                        { icon: '📡', value: '3', label: 'Active Listings', color: 'text-accent-500' },
                        { icon: '⭐', value: '4.8', label: 'Impact Score', color: 'text-yellow-500' },
                    ].map((stat, i) => (
                        <div key={i} className="stat-card text-center" style={{ animationDelay: `${i * 0.1}s` }}>
                            <div className="text-3xl mb-2">{stat.icon}</div>
                            <div className={`text-2xl font-extrabold ${stat.color}`}>{stat.value}</div>
                            <div className="text-xs text-gray-500 font-semibold uppercase tracking-wide mt-1">{stat.label}</div>
                        </div>
                    ))}
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Main Form */}
                    <div className="lg:col-span-2 animate-slide-up delay-200">
                        <div className="premium-card p-6 sm:p-8">
                            <div className="flex items-center gap-3 mb-6">
                                <div className="w-10 h-10 gradient-brand rounded-xl flex items-center justify-center shadow-md">
                                    <span className="text-white text-xl">🍛</span>
                                </div>
                                <div>
                                    <h2 className="text-xl font-extrabold text-gray-900">List Surplus Food</h2>
                                    <p className="text-sm text-gray-500">Fill in the details to broadcast to nearby NGOs</p>
                                </div>
                            </div>

                            <form onSubmit={handleBroadcast} className="space-y-6">
                                {/* Food Type Selector */}
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-3">Food Type</label>
                                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                                        {FOOD_TYPES.map(type => (
                                            <button
                                                key={type.value}
                                                type="button"
                                                onClick={() => setFoodType(type.value)}
                                                className={`relative p-3 rounded-2xl border-2 text-center transition-all duration-300 cursor-pointer ${
                                                    foodType === type.value ? type.activeColor : 'border-gray-200 bg-white hover:border-gray-300'
                                                }`}
                                            >
                                                {foodType === type.value && (
                                                    <div className="absolute -top-1.5 -right-1.5 w-5 h-5 gradient-brand rounded-full flex items-center justify-center animate-scale-in">
                                                        <span className="text-white text-xs">✓</span>
                                                    </div>
                                                )}
                                                <div className="text-2xl mb-1">{type.icon}</div>
                                                <div className="text-xs font-bold text-gray-700">{type.label}</div>
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {/* Quantity */}
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">Quantity (servings)</label>
                                    <div className="relative">
                                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-lg">👥</span>
                                        <input
                                            type="number"
                                            value={quantity}
                                            onChange={(e) => setQuantity(e.target.value)}
                                            placeholder="Number of people it can feed"
                                            className="input-branded pl-12"
                                            required
                                            min="1"
                                            id="donor-quantity"
                                        />
                                    </div>
                                </div>

                                {/* Prep Time */}
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">Preparation Time</label>
                                    <div className="relative">
                                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-lg">🕐</span>
                                        <input
                                            type="datetime-local"
                                            value={prepTime}
                                            onChange={(e) => setPrepTime(e.target.value)}
                                            className="input-branded pl-12"
                                            required
                                            id="donor-prep-time"
                                        />
                                    </div>
                                </div>

                                {/* Location */}
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">Pickup Location</label>
                                    <div className="flex gap-3">
                                        <div className="relative flex-1">
                                            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-lg">📍</span>
                                            <input
                                                type="text"
                                                value={location}
                                                onChange={(e) => setLocation(e.target.value)}
                                                placeholder="Lat, Lon"
                                                className="input-branded pl-12"
                                                required
                                                id="donor-location"
                                            />
                                        </div>
                                        <button
                                            type="button"
                                            onClick={detectLocation}
                                            disabled={isDetecting}
                                            className="flex items-center gap-2 px-4 py-3 rounded-xl border-2 border-gray-200 bg-white hover:bg-gray-50 hover:border-gray-300 transition-all text-sm font-semibold text-gray-700 whitespace-nowrap"
                                        >
                                            {isDetecting ? (
                                                <svg className="animate-spin h-4 w-4 text-brand-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
                                                </svg>
                                            ) : (
                                                <span>🛰️</span>
                                            )}
                                            {isDetecting ? 'Detecting...' : 'Auto-Detect'}
                                        </button>
                                    </div>
                                </div>

                                {/* Submit */}
                                <button
                                    type="submit"
                                    disabled={isBroadcasting}
                                    className="btn-brand w-full text-base"
                                    id="donor-broadcast"
                                >
                                    {isBroadcasting ? (
                                        <>
                                            <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
                                            </svg>
                                            Calculating Optimal Route...
                                        </>
                                    ) : (
                                        <>📡 Broadcast to Nearest NGOs</>
                                    )}
                                </button>
                            </form>

                            {/* Status Toast */}
                            {status.message && (
                                <div className={`mt-6 flex items-center gap-3 animate-slide-up ${status.type === 'success' ? 'toast-success' : 'toast-error'}`}>
                                    <span className="text-xl">{status.type === 'error' ? '❌' : '✅'}</span>
                                    <span className="text-sm font-semibold">{status.message}</span>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Sidebar — Recent Activity */}
                    <div className="animate-slide-up delay-300">
                        <div className="premium-card p-6">
                            <h3 className="text-lg font-extrabold text-gray-900 mb-4 flex items-center gap-2">
                                <span>📋</span> Recent Donations
                            </h3>
                            <div className="space-y-4">
                                {RECENT_DONATIONS.map((item, i) => (
                                    <div key={i} className="flex items-center gap-3 p-3 rounded-xl bg-surface-50 hover:bg-surface-100 transition-colors">
                                        <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center text-xl shadow-sm flex-shrink-0">
                                            {item.type}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="text-sm font-semibold text-gray-800 truncate">{item.food}</div>
                                            <div className="text-xs text-gray-400">{item.qty} servings • {item.time}</div>
                                        </div>
                                        <span className={`badge ${item.statusColor} text-[10px]`}>{item.status}</span>
                                    </div>
                                ))}
                            </div>

                            <div className="section-divider"></div>

                            {/* Quick Tips */}
                            <h4 className="text-sm font-bold text-gray-700 mb-3">💡 Tips for Donors</h4>
                            <ul className="space-y-2 text-xs text-gray-500 list-none p-0">
                                <li className="flex items-start gap-2">
                                    <span className="text-brand-400 mt-0.5">•</span>
                                    Broadcast early for faster pickups
                                </li>
                                <li className="flex items-start gap-2">
                                    <span className="text-brand-400 mt-0.5">•</span>
                                    Ensure food is properly packed
                                </li>
                                <li className="flex items-start gap-2">
                                    <span className="text-brand-400 mt-0.5">•</span>
                                    Accurate location = faster delivery
                                </li>
                            </ul>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}