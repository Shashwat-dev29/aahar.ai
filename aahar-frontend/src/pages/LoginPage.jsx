import { useState, useContext } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/axios';
import { AuthContext } from '../context/AuthContext';

export default function LoginPage() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const { login } = useContext(AuthContext);

    const handleLogin = async (e) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);

        try {
            const res = await api.post('/api/auth/login', { email, password });
            login(res.data);
        } catch (err) {
            setError(err.response?.data?.error || 'Invalid email or password.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex">
            {/* Left Hero Panel */}
            <div className="hidden lg:flex lg:w-1/2 gradient-brand relative overflow-hidden items-center justify-center p-12">
                {/* Decorative circles */}
                <div className="absolute top-[-10%] left-[-10%] w-96 h-96 rounded-full bg-white/5 animate-float"></div>
                <div className="absolute bottom-[-15%] right-[-10%] w-80 h-80 rounded-full bg-white/5 animate-float" style={{ animationDelay: '1.5s' }}></div>
                <div className="absolute top-[40%] right-[5%] w-40 h-40 rounded-full bg-white/5 animate-float" style={{ animationDelay: '0.8s' }}></div>

                <div className="relative z-10 text-white max-w-md text-center">
                    <div className="text-8xl mb-8 animate-float">🍛</div>
                    <h2 className="text-4xl font-extrabold mb-4 leading-tight">
                        Every Meal<br />Matters.
                    </h2>
                    <p className="text-white/80 text-lg mb-10 leading-relaxed">
                        Join thousands of donors, NGOs, and delivery heroes making zero food waste a reality through AI-powered redistribution.
                    </p>

                    {/* Impact Stats */}
                    <div className="grid grid-cols-3 gap-4">
                        {[
                            { value: '10K+', label: 'Meals Saved' },
                            { value: '500+', label: 'Active Donors' },
                            { value: '50+', label: 'NGOs Connected' },
                        ].map((stat, i) => (
                            <div key={i} className="bg-white/10 backdrop-blur-sm rounded-2xl p-4 border border-white/10">
                                <div className="text-2xl font-extrabold text-white">{stat.value}</div>
                                <div className="text-xs text-white/70 mt-1 font-medium">{stat.label}</div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Right Form Panel */}
            <div className="w-full lg:w-1/2 flex items-center justify-center p-6 sm:p-12 bg-surface-50">
                <div className="w-full max-w-md animate-slide-up">
                    {/* Mobile Logo */}
                    <div className="lg:hidden text-center mb-8">
                        <div className="inline-flex items-center gap-2.5">
                            <div className="w-10 h-10 gradient-brand rounded-xl flex items-center justify-center shadow-lg" style={{ boxShadow: '0 4px 14px rgba(226,55,68,0.3)' }}>
                                <span className="text-white text-xl">🍛</span>
                            </div>
                            <span className="text-2xl font-extrabold" style={{ background: 'linear-gradient(135deg, #E23744, #FC6D2D)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Aahar.AI</span>
                        </div>
                    </div>

                    {/* Welcome Text */}
                    <div className="mb-8">
                        <h2 className="text-3xl font-extrabold text-gray-900 mb-2">Welcome back 👋</h2>
                        <p className="text-gray-500">Sign in to continue your food rescue mission.</p>
                    </div>

                    {/* Error Message */}
                    {error && (
                        <div className="toast-error flex items-center gap-2 mb-6 animate-shake">
                            <span className="text-lg">⚠️</span>
                            <span className="text-sm font-semibold">{error}</span>
                        </div>
                    )}

                    {/* Login Form */}
                    <form onSubmit={handleLogin} className="space-y-5">
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">Email Address</label>
                            <div className="relative">
                                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-lg">📧</span>
                                <input
                                    type="email"
                                    placeholder="you@example.com"
                                    required
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="input-branded pl-12"
                                    id="login-email"
                                />
                            </div>
                        </div>

                        <div>
                            <div className="flex justify-between items-center mb-2">
                                <label className="text-sm font-semibold text-gray-700">Password</label>
                                <a href="#" className="text-xs font-semibold text-brand-500 hover:text-brand-600 no-underline transition-colors">Forgot password?</a>
                            </div>
                            <div className="relative">
                                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-lg">🔒</span>
                                <input
                                    type={showPassword ? 'text' : 'password'}
                                    placeholder="Enter your password"
                                    required
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="input-branded pl-12 pr-12"
                                    id="login-password"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors text-sm"
                                >
                                    {showPassword ? '🙈' : '👁️'}
                                </button>
                            </div>
                        </div>

                        {/* Remember Me */}
                        <div className="flex items-center gap-2">
                            <input type="checkbox" id="remember" className="w-4 h-4 rounded accent-brand-500 cursor-pointer" />
                            <label htmlFor="remember" className="text-sm text-gray-600 cursor-pointer">Remember me</label>
                        </div>

                        <button
                            type="submit"
                            disabled={isLoading}
                            className="btn-brand w-full"
                            id="login-submit"
                        >
                            {isLoading ? (
                                <>
                                    <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
                                    </svg>
                                    Signing in...
                                </>
                            ) : (
                                'Sign In'
                            )}
                        </button>
                    </form>

                    {/* Divider */}
                    <div className="flex items-center gap-3 my-6">
                        <div className="flex-1 h-px bg-gray-200"></div>
                        <span className="text-xs text-gray-400 font-medium">OR CONTINUE WITH</span>
                        <div className="flex-1 h-px bg-gray-200"></div>
                    </div>

                    {/* Social Login (visual) */}
                    <div className="grid grid-cols-2 gap-3">
                        <button className="flex items-center justify-center gap-2 py-3 px-4 rounded-xl border-2 border-gray-200 hover:border-gray-300 hover:bg-gray-50 transition-all text-sm font-semibold text-gray-700">
                            <span className="text-lg">🔵</span> Google
                        </button>
                        <button className="flex items-center justify-center gap-2 py-3 px-4 rounded-xl border-2 border-gray-200 hover:border-gray-300 hover:bg-gray-50 transition-all text-sm font-semibold text-gray-700">
                            <span className="text-lg">📘</span> Facebook
                        </button>
                    </div>

                    {/* Register Link */}
                    <p className="text-center mt-8 text-sm text-gray-500">
                        Don't have an account?{' '}
                        <Link to="/register" className="font-bold text-brand-500 hover:text-brand-600 no-underline transition-colors">
                            Create one free →
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
}