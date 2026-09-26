import { Link } from 'react-router-dom';
import { useState, useEffect, useRef } from 'react';



const HOW_IT_WORKS = [
    {
        step: '01',
        title: 'Donor Lists Surplus Food',
        desc: 'Restaurants, hotels, and individuals list their surplus food with details like type, quantity, and freshness.',
        color: 'from-brand-500 to-accent-500',
    },
    {
        step: '02',
        title: 'System Calculates Optimal Route',
        desc: 'Our engine factors in shelf life, weather, distance, and traffic to find the nearest NGO and fastest route.',
        color: 'from-accent-500 to-yellow-500',
    },
    {
        step: '03',
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
        <div className="min-h-screen overflow-hidden dark:bg-[#0A0B1A] transition-colors duration-300">
            {/* Sticky CTA Header for Landing */}
            <nav className="sticky top-0 z-50 bg-white/80 dark:bg-[#121212]/90 backdrop-blur-xl border-b border-gray-100 dark:border-[#2A2B42]" style={{ boxShadow: '0 1px 12px rgba(0,0,0,0.04)' }}>
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between h-16">
                        <Link to="/" className="flex items-center gap-2.5 no-underline">
                            <span className="text-xl font-extrabold" style={{ background: 'linear-gradient(135deg, #E23744, #FC6D2D)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                                Aahar
                            </span>
                        </Link>
                        <div className="flex items-center gap-3">
                            <Link to="/login" className="text-sm font-semibold text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white no-underline transition-colors px-4 py-2 rounded-xl hover:bg-gray-50 dark:hover:bg-[#1D1E36]">
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
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 sm:py-28 relative z-10">
                    <div className="max-w-3xl mx-auto text-center text-white">
                        <div className="inline-flex items-center gap-2 bg-white/15 backdrop-blur-sm rounded-full px-4 py-1.5 mb-8 border border-white/20">
                            <span className="text-xs font-semibold text-white/90">Food Rescue Platform</span>
                        </div>

                        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold leading-tight mb-6">
                            Smart Food Redistribution
                        </h1>

                        <p className="text-lg sm:text-xl text-white/80 mb-10 max-w-2xl mx-auto leading-relaxed">
                            Connect surplus food from restaurants, hotels, and events with NGOs that need it most.
                        </p>

                        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-slide-up delay-200">
                            <Link to="/register" className="btn-brand bg-white text-[#E23744] dark:text-[#9D50E5] hover:bg-gray-100 dark:hover:bg-gray-200 hover:shadow-xl text-base py-4 px-8 no-underline">
                                Start Donating Free →
                            </Link>
                            <Link to="/register" className="btn-outline border-white/40 text-white hover:bg-white/10 text-base py-4 px-8 no-underline">
                                I'm an NGO
                            </Link>
                        </div>
                    </div>
                </div>
            </section>



            {/* How It Works */}
            <section className="py-20 bg-surface-50 dark:bg-[#0A0B1A] transition-colors duration-300">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-16">
                        <span className="badge badge-brand text-sm mb-4">How It Works</span>
                        <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-900 dark:text-white mt-4">
                            Three Steps to Zero Food Waste
                        </h2>
                        <p className="text-gray-500 dark:text-gray-400 mt-3 max-w-lg mx-auto">
                            Our AI connects the dots between surplus food and hungry people in under 5 minutes.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {HOW_IT_WORKS.map((item, i) => (
                            <div key={i} className="premium-card p-8 text-center group">
                                <div className="text-xs font-extrabold text-brand-400 uppercase tracking-widest mb-2">Step {item.step}</div>
                                <h3 className="text-xl font-extrabold text-gray-900 dark:text-white mb-3">{item.title}</h3>
                                <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed">{item.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Roles Section */}
            <section className="py-20 bg-white dark:bg-[#13142B] transition-colors duration-300">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-16">
                        <span className="badge badge-success text-sm mb-4">Join As</span>
                        <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-900 dark:text-white mt-4">
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
                            <div key={i} className={`premium-card p-8 ${role.bg} dark:bg-[#1D1E36] border border-transparent hover:border-gray-200 dark:hover:border-gray-600`}>
                                <h3 className="text-xl font-extrabold text-gray-900 dark:text-white mb-3">{role.title}</h3>
                                <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed mb-6">{role.desc}</p>
                                <Link to="/register" className="btn-brand text-sm py-2.5 no-underline">
                                    {role.cta} →
                                </Link>
                            </div>
                        ))}
                    </div>
                </div>
            </section>



            {/* CTA Banner */}
            <section className="gradient-brand py-20">
                <div className="max-w-3xl mx-auto text-center px-4 sm:px-6">
                    <h2 className="text-3xl sm:text-4xl font-extrabold text-white mb-4">
                        Get Started
                    </h2>
                    <p className="text-white/80 text-lg mb-8 max-w-xl mx-auto">
                        Join Aahar today and be part of the food redistribution network.
                    </p>
                    <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                        <Link to="/register" className="btn-brand bg-white text-[#E23744] dark:text-[#9D50E5] hover:bg-gray-100 dark:hover:bg-gray-200 text-base py-4 px-8 no-underline">
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
