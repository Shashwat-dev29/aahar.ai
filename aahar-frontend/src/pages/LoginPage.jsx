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
                <div className="relative z-10 text-white max-w-md text-center">
                    <h2 className="text-4xl font-extrabold mb-4 leading-tight">
                        Sign In
                    </h2>
                    <p className="text-white/80 text-lg mb-10 leading-relaxed">
                        Access your account to continue.
                    </p>
                </div>
            </div>

            {/* Right Form Panel */}
            <div className="w-full lg:w-1/2 flex items-center justify-center p-6 sm:p-12 bg-surface-50 dark:bg-[#0A0B1A] transition-colors duration-300">
                <div className="w-full max-w-md">
                    {/* Mobile Logo */}
                    <div className="lg:hidden text-center mb-8">
                        <div className="inline-flex items-center gap-2.5">
                            <span className="text-2xl font-extrabold" style={{ background: 'linear-gradient(135deg, #E23744, #FC6D2D)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Aahar</span>
                        </div>
                    </div>

                    {/* Welcome Text */}
                    <div className="mb-8">
                        <h2 className="text-3xl font-extrabold text-gray-900 dark:text-white mb-2">Sign In</h2>
                        <p className="text-gray-500 dark:text-gray-400">Please enter your credentials.</p>
                    </div>

                    {/* Error Message */}
                    {error && (
                        <div className="toast-error flex items-center gap-2 mb-6">
                            <span className="text-sm font-semibold">{error}</span>
                        </div>
                    )}

                    {/* Login Form */}
                    <form onSubmit={handleLogin} className="space-y-5">
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Email Address</label>
                            <div className="relative">
                                <input
                                    type="email"
                                    placeholder="you@example.com"
                                    required
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="input-branded"
                                    id="login-email"
                                />
                            </div>
                        </div>

                        <div>
                            <div className="flex justify-between items-center mb-2">
                                <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">Password</label>
                                <a href="#" className="text-xs font-semibold text-brand-500 dark:text-[#9D50E5] hover:text-brand-600 no-underline transition-colors">Forgot password?</a>
                            </div>
                            <div className="relative">
                                <input
                                    type={showPassword ? 'text' : 'password'}
                                    placeholder="Enter your password"
                                    required
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="input-branded pr-12"
                                    id="login-password"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors text-sm font-semibold"
                                >
                                    {showPassword ? 'Hide' : 'Show'}
                                </button>
                            </div>
                        </div>

                        {/* Remember Me */}
                        <div className="flex items-center gap-2">
                            <input type="checkbox" id="remember" className="w-4 h-4 rounded accent-brand-500 dark:accent-[#9D50E5] cursor-pointer" />
                            <label htmlFor="remember" className="text-sm text-gray-600 dark:text-gray-400 cursor-pointer">Remember me</label>
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
                        <div className="flex-1 h-px bg-gray-200 dark:bg-gray-700"></div>
                        <span className="text-xs text-gray-400 font-medium">OR CONTINUE WITH</span>
                        <div className="flex-1 h-px bg-gray-200 dark:bg-gray-700"></div>
                    </div>

                    {/* Social Login (visual) */}
                    <div className="grid grid-cols-2 gap-3">
                        <button className="flex items-center justify-center gap-2 py-3 px-4 rounded-xl border-2 border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 hover:bg-gray-50 dark:hover:bg-[#13142B] transition-all text-sm font-semibold text-gray-700 dark:text-gray-300">
                            Google
                        </button>
                        <button className="flex items-center justify-center gap-2 py-3 px-4 rounded-xl border-2 border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 hover:bg-gray-50 dark:hover:bg-[#13142B] transition-all text-sm font-semibold text-gray-700 dark:text-gray-300">
                            Facebook
                        </button>
                    </div>

                    {/* Register Link */}
                    <p className="text-center mt-8 text-sm text-gray-500 dark:text-gray-400">
                        Don't have an account?{' '}
                        <Link to="/register" className="font-bold text-brand-500 dark:text-[#9D50E5] hover:text-brand-600 no-underline transition-colors">
                            Create one free →
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
}