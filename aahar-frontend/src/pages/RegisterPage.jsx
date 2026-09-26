import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../api/axios';

const ROLE_OPTIONS = [
    {
        value: 'donor',
        title: 'Food Donor',
        desc: 'I have surplus food to donate',
        color: 'border-accent-400 bg-accent-50',
        activeColor: 'border-accent-500 bg-accent-50 ring-4 ring-accent-100',
    },
    {
        value: 'ngo',
        title: 'NGO / Charity',
        desc: 'I collect and distribute food',
        color: 'border-blue-300 bg-blue-50',
        activeColor: 'border-blue-500 bg-blue-50 ring-4 ring-blue-100',
    },
    {
        value: 'delivery',
        title: 'Delivery Agent',
        desc: 'I can pick up and deliver food',
        color: 'border-success-400 bg-success-50',
        activeColor: 'border-success-500 bg-success-50 ring-4 ring-green-100',
    },
];

export default function RegisterPage() {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [role, setRole] = useState('donor');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const navigate = useNavigate();

    const handleRegister = async (e) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);

        try {
            await api.post('/api/auth/register', { name, email, password, role, coords: [25.4358, 81.8463] });
            alert("Account created! Please log in.");
            navigate('/login');
        } catch (err) {
            setError(err.response?.data?.error || 'Registration failed.');
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
                        Create Account
                    </h2>
                    <p className="text-white/80 text-lg mb-10 leading-relaxed">
                        Create an account to join the food redistribution network.
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

                    {/* Welcome */}
                    <div className="mb-8">
                        <h2 className="text-3xl font-extrabold text-gray-900 dark:text-white mb-2">Create Account</h2>
                        <p className="text-gray-500 dark:text-gray-400">Please provide your details.</p>
                    </div>

                    {/* Error */}
                    {error && (
                        <div className="toast-error flex items-center gap-2 mb-6">
                            <span className="text-sm font-semibold">{error}</span>
                        </div>
                    )}

                    <form onSubmit={handleRegister} className="space-y-5">
                        {/* Role Selection Cards */}
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">I want to join as</label>
                            <div className="grid grid-cols-3 gap-3">
                                {ROLE_OPTIONS.map((opt) => (
                                    <button
                                        key={opt.value}
                                        type="button"
                                        onClick={() => setRole(opt.value)}
                                        className={`relative p-3 rounded-2xl border-2 text-center transition-all duration-300 cursor-pointer ${
                                            role === opt.value ? opt.activeColor : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-[#1D1E36] hover:border-gray-300 dark:hover:border-gray-600'
                                        }`}
                                    >
                                        {role === opt.value && (
                                            <div className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-[#E23744] dark:bg-[#9D50E5] rounded-full flex items-center justify-center animate-scale-in">
                                                <span className="text-white text-xs">✓</span>
                                            </div>
                                        )}
                                        <div className="text-xs font-bold text-gray-800 dark:text-gray-200">{opt.title}</div>
                                        <div className="text-[10px] text-gray-400 dark:text-gray-500 mt-0.5 leading-tight">{opt.desc}</div>
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Name */}
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Organization / Name</label>
                            <div className="relative">
                                <input
                                    type="text"
                                    placeholder="e.g., Hotel Grand Palace"
                                    required
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    className="input-branded"
                                    id="register-name"
                                />
                            </div>
                        </div>

                        {/* Email */}
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
                                    id="register-email"
                                />
                            </div>
                        </div>

                        {/* Password */}
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Password</label>
                            <div className="relative">
                                <input
                                    type={showPassword ? 'text' : 'password'}
                                    placeholder="Create a strong password"
                                    required
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="input-branded pr-12"
                                    id="register-password"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors text-sm font-semibold"
                                >
                                    {showPassword ? 'Hide' : 'Show'}
                                </button>
                            </div>
                            {/* Password strength hint */}
                            {password && (
                                <div className="mt-2 flex gap-1">
                                    {[1, 2, 3, 4].map(i => (
                                        <div
                                            key={i}
                                            className={`h-1 flex-1 rounded-full transition-all duration-300 ${
                                                password.length >= i * 3
                                                    ? password.length >= 12 ? 'bg-green-400' : password.length >= 8 ? 'bg-yellow-400' : 'bg-red-400'
                                                    : 'bg-gray-200 dark:bg-gray-700'
                                            }`}
                                        ></div>
                                    ))}
                                </div>
                            )}
                        </div>

                        <button
                            type="submit"
                            disabled={isLoading}
                            className="btn-brand w-full"
                            id="register-submit"
                        >
                            {isLoading ? (
                                <>
                                    <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
                                    </svg>
                                    Creating Account...
                                </>
                            ) : (
                                'Create Free Account →'
                            )}
                        </button>

                        <p className="text-xs text-gray-400 dark:text-gray-500 text-center">
                            By registering, you agree to our Terms of Service and Privacy Policy.
                        </p>
                    </form>

                    {/* Login Link */}
                    <p className="text-center mt-6 text-sm text-gray-500 dark:text-gray-400">
                        Already have an account?{' '}
                        <Link to="/login" className="font-bold text-brand-500 dark:text-[#9D50E5] hover:text-brand-600 no-underline transition-colors">
                            Sign in →
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
}