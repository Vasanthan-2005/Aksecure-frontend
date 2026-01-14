import { useState, useRef, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Shield, LogOut, User as UserIcon, Ticket, FileText, Headphones, Phone, Mail } from 'lucide-react';

const UserNavigation = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();

    const [showSupport, setShowSupport] = useState(false);
    const [settings, setSettings] = useState({
        supportPhone: '+91 75502 12046',
        supportEmail: 'support@aksecuretech.com',
        supportWhatsApp: '917550212046'
    });
    const supportRef = useRef(null);

    const isActive = (path) => location.pathname === path;

    useEffect(() => {
        const fetchSettings = async () => {
            try {
                const response = await fetch(`${import.meta.env.VITE_API_URL}/settings`);
                const data = await response.json();
                if (data) setSettings(data);
            } catch (err) {
                console.error('Failed to fetch support settings:', err);
            }
        };
        fetchSettings();

        const handleClickOutside = (event) => {
            if (supportRef.current && !supportRef.current.contains(event.target)) {
                setShowSupport(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    return (
        <nav className="sticky top-0 z-50 bg-slate-900/50 backdrop-blur-xl border-b border-white/5 transition-all duration-300">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center h-16">

                    {/* Logo Section */}
                    <div className="flex items-center gap-3 group cursor-pointer" onClick={() => navigate('/')}>
                        <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-violet-600 to-blue-600 flex items-center justify-center shadow-lg shadow-blue-500/20 group-hover:scale-105 transition-transform duration-300">
                            <Shield className="w-5 h-5 text-white" />
                        </div>
                        <div>
                            <p className="text-sm font-bold text-white tracking-tight group-hover:text-blue-200 transition-colors">AK SecureTech</p>
                            <p className="text-[10px] text-slate-400 font-medium uppercase tracking-wider">User Portal</p>
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-4">

                        <button
                            onClick={() => navigate('/tickets')}
                            className={`hidden md:inline-flex items-center gap-2 px-5 py-2.5 rounded-2xl text-xs font-bold uppercase tracking-wider transition-all active:scale-95 border ${isActive('/tickets')
                                ? 'bg-blue-500/10 text-white border-blue-500/20'
                                : 'text-slate-300 hover:text-white hover:bg-white/5 border-transparent hover:border-white/10'
                                }`}
                        >
                            <Ticket className={`w-4 h-4 ${isActive('/tickets') ? 'text-blue-400' : 'text-blue-400/70'}`} />
                            My Tickets
                        </button>

                        <button
                            onClick={() => navigate('/service-requests')}
                            className={`hidden md:inline-flex items-center gap-2 px-5 py-2.5 rounded-2xl text-xs font-bold uppercase tracking-wider transition-all active:scale-95 border ${isActive('/service-requests')
                                ? 'bg-violet-500/10 text-white border-violet-500/20'
                                : 'text-slate-300 hover:text-white hover:bg-white/5 border-transparent hover:border-white/10'
                                }`}
                        >
                            <FileText className={`w-4 h-4 ${isActive('/service-requests') ? 'text-violet-400' : 'text-violet-400/70'}`} />
                            My Requests
                        </button>

                        <div className="h-6 w-px bg-white/10 hidden md:block" />

                        {/* Profile */}
                        <button
                            onClick={() => navigate('/profile')}
                            className={`hidden sm:flex items-center gap-3 px-4 py-2 rounded-2xl border transition-all group active:scale-95 ${isActive('/profile')
                                ? 'bg-blue-500/10 border-blue-500/20'
                                : 'bg-slate-900/40 border-white/5 hover:bg-slate-800/60'
                                }`}
                        >
                            <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-blue-500/20 to-violet-500/20 p-[1px] border border-white/10">
                                <div className={`h-full w-full rounded-xl flex items-center justify-center transition-colors ${isActive('/profile') ? 'bg-transparent' : 'bg-slate-900 group-hover:bg-transparent'
                                    }`}>
                                    <UserIcon className={`w-4 h-4 transition-colors ${isActive('/profile') ? 'text-white' : 'text-blue-400 group-hover:text-white'
                                        }`} />
                                </div>
                            </div>
                            <div className="flex flex-col items-start pr-1">
                                <span className={`text-xs font-bold tracking-tight transition-colors ${isActive('/profile') ? 'text-blue-400' : 'text-white'
                                    }`}>
                                    {user?.name?.split(' ')[0]}
                                </span>
                                <span className={`text-[10px] font-medium transition-colors uppercase tracking-wider ${isActive('/profile') ? 'text-blue-300' : 'text-slate-500 group-hover:text-blue-400'
                                    }`}>
                                    {user?.companyName}
                                </span>
                            </div>
                        </button>

                        <div className="relative" ref={supportRef}>
                            <button
                                className={`hidden lg:flex items-center gap-2 px-4 py-2 rounded-2xl text-xs font-bold uppercase tracking-wider transition-all border ${showSupport
                                    ? 'bg-blue-500/20 text-blue-400 border-blue-500/30'
                                    : 'text-slate-300 hover:text-blue-400 hover:bg-blue-500/5 border-transparent hover:border-blue-500/20'
                                    }`}
                                onClick={() => setShowSupport(!showSupport)}
                            >
                                <Headphones className="w-4 h-4" />
                                Support
                            </button>

                            {/* Support Dropdown */}
                            {showSupport && (
                                <div className="absolute right-0 mt-2 w-72 bg-slate-900/90 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl p-4 animate-scale-in">
                                    <h4 className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em] mb-4 px-1">Contact Support</h4>
                                    <div className="space-y-3">
                                        <div
                                            className="flex items-center gap-4 p-3 rounded-xl bg-white/5 border border-white/5 hover:bg-white/10 hover:border-blue-500/20 transition-all cursor-pointer group"
                                            onClick={() => window.open(`tel:${settings.supportPhone}`)}
                                        >
                                            <div className="w-10 h-10 rounded-lg bg-blue-500/10 flex items-center justify-center text-blue-400 group-hover:scale-110 transition-transform">
                                                <Phone className="w-5 h-5" />
                                            </div>
                                            <div>
                                                <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Phone</p>
                                                <p className="text-sm text-white font-semibold">{settings.supportPhone}</p>
                                            </div>
                                        </div>

                                        <div
                                            className="flex items-center gap-4 p-3 rounded-xl bg-white/5 border border-white/5 hover:bg-white/10 hover:border-violet-500/20 transition-all cursor-pointer group"
                                            onClick={() => window.open(`mailto:${settings.supportEmail}`)}
                                        >
                                            <div className="w-10 h-10 rounded-lg bg-violet-500/10 flex items-center justify-center text-violet-400 group-hover:scale-110 transition-transform">
                                                <Mail className="w-5 h-5" />
                                            </div>
                                            <div>
                                                <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Email</p>
                                                <p className="text-sm text-white font-semibold">{settings.supportEmail}</p>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="mt-4 pt-4 border-t border-white/5">
                                        <button
                                            onClick={() => window.open(`https://wa.me/${settings.supportWhatsApp}`, '_blank')}
                                            className="w-full py-2.5 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 text-[10px] font-bold uppercase tracking-wider transition-all border border-emerald-500/20"
                                        >
                                            Chat on WhatsApp
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>

                        <div className="h-6 w-px bg-white/10 hidden lg:block" />

                        <button
                            onClick={logout}
                            className="inline-flex items-center gap-2 p-3 sm:px-5 sm:py-2.5 rounded-2xl text-xs font-bold uppercase tracking-wider text-red-500 hover:text-white hover:bg-red-500/10 border border-transparent hover:border-red-500/20 transition-all active:scale-95"
                            title="Logout"
                        >
                            <LogOut className="w-4 h-4" />
                            <span className="hidden sm:inline">Logout</span>
                        </button>
                    </div>
                </div>
            </div>
        </nav>
    );
};

export default UserNavigation;
