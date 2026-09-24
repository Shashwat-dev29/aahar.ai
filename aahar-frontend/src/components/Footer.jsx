import { Link, useLocation } from 'react-router-dom';

export default function Footer() {
    const location = useLocation();
    const isAuthPage = ['/login', '/register'].includes(location.pathname);
    if (isAuthPage) return null;

    return (
        <footer className="gradient-dark text-gray-300 mt-auto relative overflow-hidden">
            {/* Gradient Top Accent */}
            <div className="h-1 gradient-brand w-full"></div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-8">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 mb-12">
                    {/* Brand Column */}
                    <div className="lg:col-span-1">
                        <div className="flex items-center gap-2.5 mb-4">
                            <div className="w-9 h-9 gradient-brand rounded-xl flex items-center justify-center shadow-lg" style={{ boxShadow: '0 4px 14px rgba(226,55,68,0.3)' }}>
                                <span className="text-white text-lg">🍛</span>
                            </div>
                            <span className="text-2xl font-extrabold text-white tracking-tight">Aahar.AI</span>
                        </div>
                        <p className="text-sm text-gray-400 leading-relaxed mb-6">
                            AI-powered food redistribution platform connecting surplus food donors with NGOs and delivery agents to eliminate food waste.
                        </p>
                        {/* Social Icons */}
                        <div className="flex gap-3">
                            {[
                                { icon: '𝕏', href: '#', label: 'Twitter' },
                                { icon: '📸', href: '#', label: 'Instagram' },
                                { icon: '💻', href: '#', label: 'GitHub' },
                                { icon: '💼', href: '#', label: 'LinkedIn' },
                            ].map((social) => (
                                <a
                                    key={social.label}
                                    href={social.href}
                                    aria-label={social.label}
                                    className="w-9 h-9 rounded-xl bg-white/5 hover:bg-white/10 flex items-center justify-center transition-all duration-200 hover:scale-110 no-underline text-base"
                                >
                                    {social.icon}
                                </a>
                            ))}
                        </div>
                    </div>

                    {/* Quick Links */}
                    <div>
                        <h3 className="text-white font-bold text-sm uppercase tracking-wider mb-4">Quick Links</h3>
                        <ul className="space-y-3 list-none p-0">
                            {[
                                { to: '/', label: 'Home' },
                                { to: '/login', label: 'Login' },
                                { to: '/register', label: 'Register' },
                            ].map(link => (
                                <li key={link.to}>
                                    <Link to={link.to} className="text-sm text-gray-400 hover:text-white transition-colors duration-200 no-underline flex items-center gap-2">
                                        <span className="text-brand-400 text-xs">›</span> {link.label}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Portals */}
                    <div>
                        <h3 className="text-white font-bold text-sm uppercase tracking-wider mb-4">Portals</h3>
                        <ul className="space-y-3 list-none p-0">
                            {[
                                { to: '/donor', label: 'Donor Dashboard', icon: '🍽️' },
                                { to: '/ngo', label: 'NGO Feed', icon: '🏥' },
                                { to: '/delivery', label: 'Delivery Tracking', icon: '🚴' },
                            ].map(link => (
                                <li key={link.to}>
                                    <Link to={link.to} className="text-sm text-gray-400 hover:text-white transition-colors duration-200 no-underline flex items-center gap-2">
                                        <span>{link.icon}</span> {link.label}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Contact */}
                    <div>
                        <h3 className="text-white font-bold text-sm uppercase tracking-wider mb-4">Get in Touch</h3>
                        <ul className="space-y-3 list-none p-0">
                            <li className="flex items-start gap-2 text-sm text-gray-400">
                                <span className="mt-0.5">📍</span>
                                <span>Prayagraj, Uttar Pradesh, India</span>
                            </li>
                            <li className="flex items-center gap-2 text-sm text-gray-400">
                                <span>📧</span>
                                <a href="mailto:team@aahar.ai" className="text-gray-400 hover:text-white transition-colors no-underline">team@aahar.ai</a>
                            </li>
                            <li className="flex items-center gap-2 text-sm text-gray-400">
                                <span>🌐</span>
                                <a href="#" className="text-gray-400 hover:text-white transition-colors no-underline">www.aahar.ai</a>
                            </li>
                        </ul>
                        {/* Made in India badge */}
                        <div className="mt-6 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/5 text-xs text-gray-400">
                            Made with <span className="text-red-400">❤️</span> in India 🇮🇳
                        </div>
                    </div>
                </div>

                {/* Bottom Bar */}
                <div className="border-t border-white/10 pt-6 flex flex-col md:flex-row justify-between items-center gap-4">
                    <p className="text-xs text-gray-500">
                        © {new Date().getFullYear()} Aahar.AI. All rights reserved.
                    </p>
                    <div className="flex gap-6 text-xs text-gray-500">
                        <a href="#" className="hover:text-white transition-colors no-underline">Privacy Policy</a>
                        <a href="#" className="hover:text-white transition-colors no-underline">Terms of Service</a>
                        <a href="#" className="hover:text-white transition-colors no-underline">Cookie Policy</a>
                    </div>
                </div>
            </div>

            {/* Decorative gradient orb */}
            <div className="absolute bottom-0 right-0 w-64 h-64 rounded-full opacity-5" style={{ background: 'radial-gradient(circle, #E23744, transparent)', filter: 'blur(80px)' }}></div>
        </footer>
    );
}