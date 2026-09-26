import { useState, useContext, useEffect } from 'react';
import { AuthContext } from '../context/AuthContext';
import api from '../api/axios';

const FOOD_TYPES = [
    { value: 'cooked_veg', label: 'Cooked Veg', activeColor: 'border-green-500 bg-green-50 dark:bg-green-900/20 ring-4 ring-green-100 dark:ring-green-900/40' },
    { value: 'cooked_nonveg', label: 'Cooked Non-Veg', activeColor: 'border-orange-500 bg-orange-50 dark:bg-orange-900/20 ring-4 ring-orange-100 dark:ring-orange-900/40' },
    { value: 'raw_vegetables', label: 'Raw Vegetables', activeColor: 'border-emerald-500 bg-emerald-50 dark:bg-emerald-900/20 ring-4 ring-emerald-100 dark:ring-emerald-900/40' },
    { value: 'packaged', label: 'Packaged Food', activeColor: 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 ring-4 ring-blue-100 dark:ring-blue-900/40' },
    { value: 'dairy', label: 'Dairy Products', activeColor: 'border-yellow-500 bg-yellow-50 dark:bg-yellow-900/20 ring-4 ring-yellow-100 dark:ring-yellow-900/40' },
    { value: 'bakery', label: 'Bakery Items', activeColor: 'border-amber-500 bg-amber-50 dark:bg-amber-900/20 ring-4 ring-amber-100 dark:ring-amber-900/40' },
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
    const [stats, setStats] = useState({ totalDonations: 0, peopleFed: 0, activeListings: 0, impactScore: 0 });
    const [recentDonations, setRecentDonations] = useState([]);

    // Fetch real stats on load
    useEffect(() => {
        if (!user?.email) return;
        api.get(`/api/donations/my-stats?email=${user.email}`)
            .then(res => {
                setStats(res.data.stats);
                setRecentDonations(res.data.recentDonations);
            })
            .catch(err => console.error("Failed to fetch donor stats:", err));
    }, [user]);

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
                donorId: user?.email,
                foodType: foodType,
                quantity: parseInt(quantity),
                prepTime: prepTime.replace('T', ' '),
                currentTemp: realTemp,
                donorCoords: coordsArray
            };

            await api.post('/api/donations/broadcast', payload);
            setStatus({ type: 'success', message: 'Broadcasted successfully! Nearby NGOs have been notified.' });
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
        <div className="min-h-screen bg-surface-50 dark:bg-[#0A0B1A] transition-colors duration-300">
            {/* Welcome Banner */}
            <div className="gradient-brand text-white">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 animate-fade-in">
                        <div>
                            <h1 className="text-2xl sm:text-3xl font-extrabold">
                                Hello, {user?.email?.split('@')[0] || 'Donor'}
                            </h1>
                            <p className="text-white/80 mt-1">Welcome to your donor dashboard.</p>
                        </div>
                        <span className="badge bg-white/20 text-white border border-white/20 backdrop-blur-sm text-sm px-4 py-1.5">
                            Donor Account
                        </span>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Stats Row */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8 -mt-12 relative z-10 animate-slide-up">
                    {[
                        { value: stats.totalDonations, label: 'Total Donations', color: 'text-[#E23744] dark:text-[#9D50E5]' },
                        { value: stats.peopleFed, label: 'People Fed', color: 'text-success-500' },
                        { value: stats.activeListings, label: 'Active Listings', color: 'text-accent-500 dark:text-[#9D50E5]' },
                        { value: stats.impactScore, label: 'Impact Score', color: 'text-yellow-500' },
                    ].map((stat, i) => (
                        <div key={i} className="stat-card text-center" style={{ animationDelay: `${i * 0.1}s` }}>
                            <div className={`text-3xl font-extrabold ${stat.color}`}>{stat.value}</div>
                            <div className="text-xs text-gray-500 dark:text-gray-400 font-semibold uppercase tracking-wide mt-1">{stat.label}</div>
                        </div>
                    ))}
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Main Form */}
                    <div className="lg:col-span-2 animate-slide-up delay-200">
                        <div className="premium-card p-6 sm:p-8">
                            <div className="mb-6">
                                <h2 className="text-xl font-extrabold text-gray-900 dark:text-white">Submit a Food Donation</h2>
                                <p className="text-sm text-gray-500 dark:text-gray-400">Please fill out the form below.</p>
                            </div>

                            <form onSubmit={handleBroadcast} className="space-y-6">
                                {/* Food Type Selector */}
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">Food Type</label>
                                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                                        {FOOD_TYPES.map(type => (
                                            <button
                                                key={type.value}
                                                type="button"
                                                onClick={() => setFoodType(type.value)}
                                                className={`relative p-3 rounded-2xl border-2 text-center transition-all duration-300 cursor-pointer ${
                                                    foodType === type.value ? type.activeColor : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-[#1D1E36] hover:border-gray-300 dark:hover:border-gray-500'
                                                }`}
                                            >
                                                {foodType === type.value && (
                                                    <div className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-[#E23744] dark:bg-[#9D50E5] rounded-full flex items-center justify-center animate-scale-in shadow-md">
                                                        <span className="text-white text-xs">✓</span>
                                                    </div>
                                                )}
                                                <div className="text-xs font-bold text-gray-700 dark:text-gray-300 py-2">{type.label}</div>
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {/* Quantity */}
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Quantity (servings)</label>
                                    <div className="relative">
                                        <input
                                            type="number"
                                            value={quantity}
                                            onChange={(e) => setQuantity(e.target.value)}
                                            placeholder="Number of people it can feed"
                                            className="input-branded"
                                            required
                                            min="1"
                                            id="donor-quantity"
                                        />
                                    </div>
                                </div>

                                {/* Prep Time */}
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Preparation Time</label>
                                    <div className="relative">
                                        <input
                                            type="datetime-local"
                                            value={prepTime}
                                            onChange={(e) => {
                                                setPrepTime(e.target.value);
                                                if (e.target.value) e.target.blur(); // Auto-close calendar when fully selected
                                            }}
                                            className="input-branded"
                                            required
                                            id="donor-prep-time"
                                        />
                                    </div>
                                </div>

                                {/* Location */}
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Pickup Location</label>
                                    <div className="flex gap-3">
                                        <div className="relative flex-1">
                                            <input
                                                type="text"
                                                value={location}
                                                onChange={(e) => setLocation(e.target.value)}
                                                placeholder="Lat, Lon"
                                                className="input-branded"
                                                required
                                                id="donor-location"
                                            />
                                        </div>
                                        <button
                                            type="button"
                                            onClick={detectLocation}
                                            disabled={isDetecting}
                                            className="flex items-center gap-2 px-4 py-3 rounded-xl border-2 border-gray-200 dark:border-gray-700 bg-white dark:bg-[#1D1E36] hover:bg-gray-50 dark:hover:bg-[#13142B] hover:border-gray-300 dark:hover:border-gray-600 transition-all text-sm font-semibold text-gray-700 dark:text-gray-300 whitespace-nowrap"
                                        >
                                            {isDetecting ? (
                                                <svg className="animate-spin h-4 w-4 text-[#E23744] dark:text-[#9D50E5]" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
                                                </svg>
                                            ) : null}
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
                            <h3 className="text-lg font-extrabold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                                <span>📋</span> Recent Donations
                            </h3>
                            <div className="space-y-4">
                                {recentDonations.length === 0 ? (
                                    <div className="text-center py-6 text-gray-500 dark:text-gray-400 text-sm font-medium">
                                        No recent donations. Start saving food today!
                                    </div>
                                ) : (
                                    recentDonations.map((item, i) => (
                                        <div key={i} className="flex items-center gap-3 p-3 rounded-xl bg-surface-50 dark:bg-[#13142B] hover:bg-surface-100 dark:hover:bg-[#1D1E36] transition-colors">
                                            <div className="w-10 h-10 rounded-xl bg-white dark:bg-[#1D1E36] flex items-center justify-center text-xl shadow-sm flex-shrink-0">
                                                {item.foodType?.includes('veg') && !item.foodType?.includes('nonveg') ? '🥗' : item.foodType?.includes('nonveg') ? '🍗' : '📦'}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <div className="text-sm font-semibold text-gray-800 dark:text-gray-200 truncate capitalize">
                                                    {(item.foodType || '').replace(/_/g, ' ')}
                                                </div>
                                                <div className="text-xs text-gray-400 dark:text-gray-500">
                                                    {item.quantity} servings • {new Date(item.createdAt).toLocaleDateString()}
                                                </div>
                                            </div>
                                            <span className={`badge ${item.status === 'active' ? 'badge-brand' : 'badge-success'} text-[10px]`}>
                                                {item.status}
                                            </span>
                                        </div>
                                    ))
                                )}
                            </div>

                            <div className="section-divider"></div>

                            {/* Quick Tips */}
                            <h4 className="text-sm font-bold text-gray-700 dark:text-gray-300 mb-3">💡 Tips for Donors</h4>
                            <ul className="space-y-2 text-xs text-gray-500 dark:text-gray-400 list-none p-0">
                                <li className="flex items-start gap-2">
                                    <span className="text-[#E23744] dark:text-[#9D50E5] mt-0.5">•</span>
                                    Broadcast early for faster pickups
                                </li>
                                <li className="flex items-start gap-2">
                                    <span className="text-[#E23744] dark:text-[#9D50E5] mt-0.5">•</span>
                                    Ensure food is properly packed
                                </li>
                                <li className="flex items-start gap-2">
                                    <span className="text-[#E23744] dark:text-[#9D50E5] mt-0.5">•</span>
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