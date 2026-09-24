import { Link } from 'react-router-dom';
import { useState, useEffect, useRef } from 'react';

function AnimatedCounter({ target, suffix = '' }) {
    const [count, setCount] = useState(0);
    const ref = useRef(null);
    const [visible, setVisible] = useState(false);

    useEffect(() => {
        const observer = new IntersectionObserver(
            ([entry]) => { if (entry.isIntersecting) setVisible(true); },
            { threshold: 0.3 }
        );
        if (ref.current) observer.observe(ref.current);
        return () => observer.disconnect();
    }, []);

    useEffect(() => {
        if (!visible) return;
        let start = 0;
        const duration = 1500;
        const step = (timestamp) => {
            if (!start) start = timestamp;
            const progress = Math.min((timestamp - start) / duration, 1);
            const eased = 1 - Math.pow(1 - progress, 3);
            setCount(Math.floor(eased * target));
            if (progress < 1) requestAnimationFrame(step);
        };
        requestAnimationFrame(step);
    }, [visible, target]);

    return <span ref={ref}>{count.toLocaleString()}{suffix}</span>;
}

const HOW_IT_WORKS = [
    {
        step: '01',
        icon: '🍽️',
        title: 'Donor Lists Surplus Food',
        desc: 'Restaurants, hotels, and individuals list their surplus food with details like type, quantity, and freshness.',
        color: 'from-brand-500 to-accent-500',
    },
    {
        step: '02',
        icon: '🤖',
        title: 'AI Calculates Optimal Route',
        desc: 'Our AI engine factors in shelf life, weather, distance, and traffic to find the nearest NGO and fastest route.',
        color: 'from-accent-500 to-yellow-500',
    },
    {
        step: '03',
        icon: '🚴',
        title: 'Delivery Agent Picks Up',
        desc: 'A verified delivery volunteer picks up the food and delivers it to the NGO, tracked in real-time on a live map.',
        color: 'from-success-500 to-teal-500',
    },
];

const TESTIMONIALS = [
    {
        name: 'Rajesh Gupta',
        role: 'Hotel Owner, Prayagraj',
        text: '"AaharAI made it so easy to donate our leftover food. We used to throw away 50kg daily — now it feeds 200+ people."',
        avatar: '👨‍🍳',
    },
    {
        name: 'Priya Sharma',
        role: 'NGO Director, Lucknow',
        text: '"The real-time alerts are a game-changer. We get notified instantly when fresh food is available nearby."',
        avatar: '👩‍💼',
    },
    {
        name: 'Amit Yadav',
        role: 'Delivery Volunteer',
        text: '"I love being part of this movement. The app navigation makes pickups and deliveries seamless."',
        avatar: '🚴',
    },
];

export default function LandingPage() {
    return (
        <div className="min-h-screen overflow-hidden">
            {/* Sticky CTA Header for Landing */}
            <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-xl border-b border-gray-100" style={{ boxShadow: '0 1px 12px rgba(0,0,0,0.04)' }}>
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between h-16">
                        <Link to="/" className="flex items-center gap-2.5 no-underline">
                            <div className="w-9 h-9 gradient-brand rounded-xl flex items-center justify-center shadow-lg" style={{ boxShadow: '0 4px 14px rgba(226,55,68,0.3)' }}>
                                <span className="text-white text-lg">🍛</span>
                            </div>
                            <span className="text-xl font-extrabold" style={{ background: 'linear-gradient(135deg, #E23744, #FC6D2D)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                                Aahar.AI
                            </span>
                        </Link>
                        <div className="flex items-center gap-3">
                            <Link to="/login" className="text-sm font-semibold text-gray-600 hover:text-gray-900 no-underline transition-colors px-4 py-2 rounded-xl hover:bg-gray-50">
                                Login
                            </Link>
                            <Link to="/register" className="btn-brand text-sm py-2.5 px-5 no-underline">
                                Get Started →
                            </Link>
                        </div>
                    </div>
                </div>
            </nav>

            {/* Hero Section */}
            <section className="relative gradient-brand overflow-hidden">
                {/* Decorative elements */}
                <div className="absolute top-[-10%] left-[-5%] w-96 h-96 rounded-full bg-white/5 animate-float"></div>
                <div className="absolute bottom-[-20%] right-[-5%] w-[500px] h-[500px] rounded-full bg-white/5 animate-float" style={{ animationDelay: '1s' }}></div>
                <div className="absolute top-[20%] right-[15%] w-32 h-32 rounded-full bg-white/5 animate-float" style={{ animationDelay: '2s' }}></div>

                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 sm:py-28 relative z-10">
                    <div className="max-w-3xl mx-auto text-center text-white">
                        <div className="inline-flex items-center gap-2 bg-white/15 backdrop-blur-sm rounded-full px-4 py-1.5 mb-8 border border-white/20 animate-fade-in">
                            <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
                            <span className="text-xs font-semibold text-white/90">AI-Powered Food Rescue Platform</span>
                        </div>

                        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold leading-tight mb-6 animate-slide-up">
                            Don't Waste Food,{' '}
                            <span className="relative">
                                <span className="relative z-10">Redistribute It.</span>
                                <svg className="absolute -bottom-2 left-0 w-full" height="12" viewBox="0 0 200 12" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M2 8C50 2 150 2 198 8" stroke="rgba(255,255,255,0.4)" strokeWidth="3" strokeLinecap="round" />
                                </svg>
                            </span>
                        </h1>

                        <p className="text-lg sm:text-xl text-white/80 mb-10 max-w-2xl mx-auto leading-relaxed animate-slide-up delay-100">
                            Connect surplus food from restaurants, hotels, and events with NGOs that need it most — powered by AI for maximum freshness and minimum waste.
                        </p>

                        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-slide-up delay-200">
                            <Link to="/register" className="btn-brand bg-white text-brand-600 hover:bg-gray-100 hover:shadow-xl text-base py-4 px-8 no-underline" style={{ background: '#ffffff', color: '#E23744' }}>
                                Start Donating Free →
                            </Link>
                            <Link to="/register" className="btn-outline border-white/40 text-white hover:bg-white/10 text-base py-4 px-8 no-underline">
                                I'm an NGO
                            </Link>
                        </div>
                    </div>
                </div>
            </section>

            {/* Impact Stats */}
            <section className="bg-white py-16 border-b border-gray-100">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
                        {[
                            { icon: '🍽️', value: 10000, suffix: '+', label: 'Meals Redistributed' },
                            { icon: '🏥', value: 50, suffix: '+', label: 'NGOs Connected' },
                            { icon: '🚴', value: 200, suffix: '+', label: 'Delivery Volunteers' },
                            { icon: '🌍', value: 15, suffix: '+', label: 'Cities Reached' },
                        ].map((stat, i) => (
                            <div key={i} className="text-center">
                                <div className="text-4xl mb-3">{stat.icon}</div>
                                <div className="text-3xl sm:text-4xl font-extrabold text-gray-900">
                                    <AnimatedCounter target={stat.value} suffix={stat.suffix} />
                                </div>
                                <div className="text-sm text-gray-500 font-medium mt-1">{stat.label}</div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* How It Works */}
            <section className="py-20 bg-surface-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-16">
                        <span className="badge badge-brand text-sm mb-4">How It Works</span>
                        <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-900 mt-4">
                            Three Steps to Zero Food Waste
                        </h2>
                        <p className="text-gray-500 mt-3 max-w-lg mx-auto">
                            Our AI connects the dots between surplus food and hungry people in under 5 minutes.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {HOW_IT_WORKS.map((item, i) => (
                            <div key={i} className="premium-card p-8 text-center group">
                                <div className={`w-16 h-16 mx-auto mb-6 rounded-2xl bg-gradient-to-br ${item.color} flex items-center justify-center text-3xl shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                                    {item.icon}
                                </div>
                                <div className="text-xs font-extrabold text-brand-400 uppercase tracking-widest mb-2">Step {item.step}</div>
                                <h3 className="text-xl font-extrabold text-gray-900 mb-3">{item.title}</h3>
                                <p className="text-sm text-gray-500 leading-relaxed">{item.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Roles Section */}
            <section className="py-20 bg-white">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-16">
                        <span className="badge badge-success text-sm mb-4">Join As</span>
                        <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-900 mt-4">
                            Choose Your Role
                        </h2>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {[
                            {
                                icon: '🍽️',
                                title: 'Food Donor',
                                desc: 'Restaurants, caterers, and individuals with surplus food. List it in seconds and we find the nearest NGO.',
                                cta: 'Start Donating',
                                gradient: 'from-orange-400 to-red-500',
                                bg: 'bg-orange-50',
                            },
                            {
                                icon: '🏥',
                                title: 'NGO / Charity',
                                desc: 'Receive real-time alerts when fresh food is available near you. Accept with one tap and track your delivery.',
                                cta: 'Register NGO',
                                gradient: 'from-blue-400 to-indigo-500',
                                bg: 'bg-blue-50',
                            },
                            {
                                icon: '🚴',
                                title: 'Delivery Hero',
                                desc: 'Volunteer to pick up and deliver food packages. GPS-tracked routes and impact badges await you.',
                                cta: 'Become a Hero',
                                gradient: 'from-green-400 to-emerald-500',
                                bg: 'bg-green-50',
                            },
                        ].map((role, i) => (
                            <div key={i} className={`premium-card p-8 ${role.bg} border border-transparent hover:border-gray-200`}>
                                <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${role.gradient} flex items-center justify-center text-3xl shadow-lg mb-6`}>
                                    {role.icon}
                                </div>
                                <h3 className="text-xl font-extrabold text-gray-900 mb-3">{role.title}</h3>
                                <p className="text-sm text-gray-600 leading-relaxed mb-6">{role.desc}</p>
                                <Link to="/register" className="btn-brand text-sm py-2.5 no-underline">
                                    {role.cta} →
                                </Link>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Testimonials */}
            <section className="py-20 bg-surface-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-16">
                        <span className="badge badge-warning text-sm mb-4">Testimonials</span>
                        <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-900 mt-4">
                            Loved by the Community
                        </h2>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {TESTIMONIALS.map((t, i) => (
                            <div key={i} className="premium-card p-8">
                                <div className="text-4xl mb-4">{t.avatar}</div>
                                <p className="text-gray-600 text-sm leading-relaxed mb-6 italic">{t.text}</p>
                                <div>
                                    <p className="font-bold text-gray-900 text-sm">{t.name}</p>
                                    <p className="text-xs text-gray-400">{t.role}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* CTA Banner */}
            <section className="gradient-brand py-20">
                <div className="max-w-3xl mx-auto text-center px-4 sm:px-6">
                    <h2 className="text-3xl sm:text-4xl font-extrabold text-white mb-4">
                        Ready to Make a Difference?
                    </h2>
                    <p className="text-white/80 text-lg mb-8 max-w-xl mx-auto">
                        Join Aahar.AI today and be part of the movement to end food waste in India. It's free, fast, and impactful.
                    </p>
                    <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                        <Link to="/register" className="btn-brand bg-white text-brand-600 text-base py-4 px-8 no-underline" style={{ background: '#ffffff', color: '#E23744' }}>
                            Create Free Account →
                        </Link>
                        <Link to="/login" className="btn-outline border-white/40 text-white hover:bg-white/10 text-base py-4 px-8 no-underline">
                            Sign In
                        </Link>
                    </div>
                </div>
            </section>

            {/* Footer is handled by the App shell */}
        </div>
    );
}
