import { useContext, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

export default function Header() {
    const { user, logout } = useContext(AuthContext);
    const location = useLocation();
    const [mobileOpen, setMobileOpen] = useState(false);
    const [profileOpen, setProfileOpen] = useState(false);

    // Hide header on auth pages
    const isAuthPage = ['/login', '/register'].includes(location.pathname);
    if (isAuthPage && !user) return null;

    const navLinks = user ? [
        { to: `/${user.role}`, label: 'Dashboard', icon: '📊' },
        ...(user.role === 'donor' ? [{ to: '/donor', label: 'Donate Food', icon: '🍽️' }] : []),
        ...(user.role === 'ngo' ? [{ to: '/ngo', label: 'NGO Feed', icon: '🏥' }] : []),
        ...(user.role === 'delivery' ? [{ to: '/delivery', label: 'Deliveries', icon: '🚴' }] : []),
    ] : [
        { to: '/', label: 'Home', icon: '🏠' },
        { to: '/login', label: 'Login', icon: '🔑' },
        { to: '/register', label: 'Register', icon: '📝' },
    ];

    const getUserInitial = () => {
        if (user?.email) return user.email.charAt(0).toUpperCase();
        return 'U';
    };

    const getRoleBadge = () => {
        const roles = {
            donor: { label: 'Donor', color: 'badge-success' },
            ngo: { label: 'NGO', color: 'badge-info' },
            delivery: { label: 'Delivery', color: 'badge-warning' },
        };
        return roles[user?.role] || { label: 'User', color: 'badge-brand' };
    };

    return (
        <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-xl border-b border-gray-100" style={{ boxShadow: '0 1px 12px rgba(0,0,0,0.04)' }}>
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-16">
                    {/* Logo */}
                    <Link to={user ? `/${user.role}` : '/'} className="flex items-center gap-2.5 no-underline group">
                        <div className="w-9 h-9 gradient-brand rounded-xl flex items-center justify-center shadow-lg group-hover:scale-105 transition-transform duration-300" style={{ boxShadow: '0 4px 14px rgba(226,55,68,0.3)' }}>
                            <span className="text-white text-lg">🍛</span>
                        </div>
                        <div>
                            <h1 className="text-xl font-extrabold tracking-tight leading-none" style={{ background: 'linear-gradient(135deg, #E23744, #FC6D2D)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                                Aahar.AI
                            </h1>
                            <p className="text-[10px] text-gray-400 font-medium leading-none -mt-0.5">Smart Food Redistribution</p>
                        </div>
                    </Link>

                    {/* Desktop Nav */}
                    <nav className="hidden md:flex items-center gap-1">
                        {navLinks.map(link => (
                            <Link
                                key={link.to}
                                to={link.to}
                                className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-200 no-underline ${
                                    location.pathname === link.to
                                        ? 'bg-brand-50 text-brand-600'
                                        : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                                }`}
                            >
                                <span className="text-base">{link.icon}</span>
                                {link.label}
                            </Link>
                        ))}
                    </nav>

                    {/* Right Side */}
                    <div className="flex items-center gap-3">
                        {user && (
                            <>
                                {/* Notification Bell */}
                                <button className="relative p-2 rounded-xl hover:bg-gray-50 transition-colors" aria-label="Notifications">
                                    <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                                    </svg>
                                    <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-brand-500 rounded-full"></span>
                                </button>

                                {/* Profile Dropdown */}
                                <div className="relative">
                                    <button
                                        onClick={() => setProfileOpen(!profileOpen)}
                                        className="flex items-center gap-2 p-1.5 pr-3 rounded-xl hover:bg-gray-50 transition-all duration-200 border border-transparent hover:border-gray-100"
                                    >
                                        <div className="w-8 h-8 gradient-brand rounded-full flex items-center justify-center text-white font-bold text-sm shadow-md">
                                            {getUserInitial()}
                                        </div>
                                        <svg className={`w-4 h-4 text-gray-400 transition-transform duration-200 ${profileOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                        </svg>
                                    </button>

                                    {profileOpen && (
                                        <div className="absolute right-0 mt-2 w-64 bg-white rounded-2xl shadow-xl border border-gray-100 py-2 animate-slide-down" style={{ boxShadow: '0 10px 40px rgba(0,0,0,0.1)' }}>
                                            <div className="px-4 py-3 border-b border-gray-50">
                                                <p className="text-sm font-bold text-gray-900">{user.email}</p>
                                                <span className={`badge ${getRoleBadge().color} mt-1`}>{getRoleBadge().label}</span>
                                            </div>
                                            <Link to={`/${user.role}`} className="flex items-center gap-2 px-4 py-2.5 text-sm text-gray-600 hover:bg-gray-50 transition-colors no-underline" onClick={() => setProfileOpen(false)}>
                                                <span>📊</span> My Dashboard
                                            </Link>
                                            <button
                                                onClick={() => { setProfileOpen(false); logout(); }}
                                                className="flex items-center gap-2 w-full px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors border-t border-gray-50"
                                            >
                                                <span>🚪</span> Sign Out
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </>
                        )}

                        {/* Mobile Toggle */}
                        <button
                            onClick={() => setMobileOpen(!mobileOpen)}
                            className="md:hidden p-2 rounded-xl hover:bg-gray-50 transition-colors"
                            aria-label="Toggle menu"
                        >
                            <div className="flex flex-col gap-1">
                                <span className={`w-5 h-0.5 bg-gray-600 rounded transition-all duration-300 ${mobileOpen ? 'rotate-45 translate-y-1.5' : ''}`}></span>
                                <span className={`w-5 h-0.5 bg-gray-600 rounded transition-all duration-300 ${mobileOpen ? 'opacity-0' : ''}`}></span>
                                <span className={`w-5 h-0.5 bg-gray-600 rounded transition-all duration-300 ${mobileOpen ? '-rotate-45 -translate-y-1.5' : ''}`}></span>
                            </div>
                        </button>
                    </div>
                </div>

                {/* Mobile Menu */}
                {mobileOpen && (
                    <div className="md:hidden border-t border-gray-100 py-3 animate-slide-down">
                        {navLinks.map(link => (
                            <Link
                                key={link.to}
                                to={link.to}
                                onClick={() => setMobileOpen(false)}
                                className={`flex items-center gap-2.5 px-4 py-3 rounded-xl text-sm font-semibold transition-all no-underline ${
                                    location.pathname === link.to
                                        ? 'bg-brand-50 text-brand-600'
                                        : 'text-gray-600 hover:bg-gray-50'
                                }`}
                            >
                                <span className="text-lg">{link.icon}</span>
                                {link.label}
                            </Link>
                        ))}
                    </div>
                )}
            </div>

            {/* Close dropdown on outside click */}
            {profileOpen && <div className="fixed inset-0 z-[-1]" onClick={() => setProfileOpen(false)} />}
        </header>
    );
}