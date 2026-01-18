import { useState, useRef, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Shield, LogOut, User as UserIcon, Ticket, FileText, Headphones, Phone, Mail, LayoutDashboard, MessageCircle } from 'lucide-react';
import api from '../services/api';

const navLinks = [
    { name: 'Dashboard', path: '/', icon: LayoutDashboard, color: 'blue' },
    { name: 'Tickets', path: '/tickets', icon: Ticket, color: 'blue' },
    { name: 'Services', path: '/service-requests', icon: FileText, color: 'violet' },
    { name: 'Profile', path: '/profile', icon: UserIcon, color: 'blue' },
];

export const UserTopNav = () => {
    const { logout, user } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();

    const [showSupport, setShowSupport] = useState(false);
    const [settings, setSettings] = useState({
        supportPhone: '+44 7448499338',
        supportEmail: 'sivadass.ac@gmail.com',
        supportWhatsApp: '447448499338'
    });
    const [unreadReplies, setUnreadReplies] = useState(0);
    const supportRef = useRef(null);

    const isActive = (path) => location.pathname === path;

    useEffect(() => {
        const fetchSettings = async () => {
            try {
                const response = await api.get('/settings');
                if (response.data) setSettings(response.data);
            } catch (err) {
                console.error('Failed to fetch support settings:', err);
                // Keep default values if API fails
            }
        };

        const fetchUnseenReplies = async () => {
            if (!user) return;
            try {
                const [ticketsResponse, serviceRequestsResponse] = await Promise.all([
                    api.get('/tickets'),
                    api.get('/service-requests')
                ]);
                const tickets = Array.isArray(ticketsResponse.data) ? ticketsResponse.data : (ticketsResponse.data?.tickets || []);
                const serviceRequestsData = serviceRequestsResponse.data;
                const serviceRequests = Array.isArray(serviceRequestsData) ? serviceRequestsData : (serviceRequestsData?.requests || []);

                let unseenCount = 0;
                const userId = user._id || user.id;

                const countUnseen = (collection) => {
                    if (!Array.isArray(collection)) return;
                    collection.forEach(entry => {
                        if (entry.timeline) {
                            entry.timeline.forEach(item => {
                                if (item.addedBy !== user.name) {
                                    const seenBy = item.seenBy || [];
                                    const isSeen = seenBy.some(seenUserId => {
                                        const seenId = seenUserId._id || seenUserId;
                                        return seenId?.toString() === userId?.toString();
                                    });
                                    if (!isSeen) unseenCount++;
                                }
                            });
                        }
                    });
                };

                countUnseen(tickets);
                countUnseen(serviceRequests);
                setUnreadReplies(unseenCount);
            } catch (err) {
                console.error('Failed to fetch unseen replies:', err);
            }
        };

        fetchSettings();
        fetchUnseenReplies();

        // Polling for unseen replies every 2 seconds
        const pollInterval = setInterval(fetchUnseenReplies, 2000);

        // Refresh settings when tab becomes visible (user returns from admin panel)
        const handleVisibilityChange = () => {
            if (!document.hidden) {
                fetchSettings();
                fetchUnseenReplies();
            }
        };
        document.addEventListener('visibilitychange', handleVisibilityChange);

        const handleClickOutside = (event) => {
            if (supportRef.current && !supportRef.current.contains(event.target)) {
                setShowSupport(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            clearInterval(pollInterval);
            document.removeEventListener('mousedown', handleClickOutside);
            document.removeEventListener('visibilitychange', handleVisibilityChange);
        };
    }, [user]);

    const scrollToReplies = () => {
        const element = document.getElementById('admin-replies-section');
        if (element) {
            element.scrollIntoView({ behavior: 'smooth' });
        }
    };

    return (
        <nav className="relative z-50 bg-slate-900/50 backdrop-blur-xl border-b border-white/5 transition-all duration-300 w-full shrink-0">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center h-16 sm:h-20">

                    {/* Logo Section */}
                    <div className="flex items-center gap-3 group cursor-pointer" onClick={() => navigate('/')}>
                        <div className="h-10 w-10 sm:h-11 sm:w-11 rounded-xl bg-gradient-to-br from-violet-600 to-blue-600 flex items-center justify-center shadow-lg shadow-blue-500/20 group-hover:scale-105 transition-transform duration-300">
                            <Shield className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                        </div>
                        <div>
                            <p className="text-sm sm:text-base font-bold text-white tracking-tight group-hover:text-blue-200 transition-colors">AK SecureTech</p>
                            <p className="text-[10px] text-slate-400 font-medium uppercase tracking-wider">User Portal</p>
                        </div>
                    </div>

                    {/* Desktop Actions */}
                    <div className="flex items-center gap-4">
                        <div className="hidden md:flex items-center gap-3">
                            {navLinks.slice(1, 4).map((link) => (
                                <button
                                    key={link.path}
                                    onClick={() => navigate(link.path)}
                                    className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-2xl text-xs font-bold uppercase tracking-wider transition-all active:scale-95 border ${isActive(link.path)
                                        ? `bg-${link.color}-500/10 text-white border-${link.color}-500/20 shadow-[0_0_15px_rgba(59,130,246,0.1)]`
                                        : 'text-slate-300 hover:text-white hover:bg-white/5 border-transparent hover:border-white/10'
                                        }`}
                                >
                                    <link.icon className={`w-4 h-4 ${isActive(link.path) ? `text-${link.color}-400` : `text-${link.color}-400/70`}`} />
                                    {link.name}
                                </button>
                            ))}
                        </div>
                        <div className="hidden md:flex items-center gap-3">
                            <button
                                onClick={scrollToReplies}
                                className={`relative flex items-center gap-2 px-4 py-2 rounded-2xl text-xs font-bold uppercase tracking-wider transition-all border border-blue-500/20 bg-blue-500/5 text-blue-400 hover:bg-blue-500/10 hover:border-blue-500/30 active:scale-95 group shadow-lg shadow-blue-500/5`}
                                title="Admin Replies"
                            >
                                <MessageCircle className="w-4 h-4" />
                                <span className="hidden lg:inline">Replies</span>
                                {unreadReplies > 0 && (
                                    <span className="absolute -top-1.5 -right-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white shadow-lg shadow-red-500/40 animate-pulse border-2 border-slate-900">
                                        {unreadReplies}
                                    </span>
                                )}
                            </button>
                        </div>

                        <div className="h-6 w-px bg-white/10 hidden md:block" />

                        {/* Support */}
                        <div className="relative" ref={supportRef}>
                            <button
                                className={`flex items-center gap-2 px-3 sm:px-4 py-2 rounded-2xl text-xs font-bold uppercase tracking-wider transition-all border ${showSupport
                                    ? 'bg-blue-500/20 text-blue-400 border-blue-500/30'
                                    : 'text-slate-300 hover:text-blue-400 hover:bg-blue-500/5 border-transparent hover:border-blue-500/20'
                                    }`}
                                onClick={() => setShowSupport(!showSupport)}
                            >
                                <Headphones className="w-4 h-4" />
                                <span className="hidden sm:inline">Support</span>
                            </button>

                            {/* Support Dropdown */}
                            {showSupport && (
                                <div className="absolute right-0 mt-2 w-64 max-w-[calc(100vw-2rem)] bg-slate-900/90 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl p-3 animate-scale-in z-[60]">
                                    <h4 className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em] mb-2 px-1">Contact Support</h4>
                                    <div className="space-y-2">
                                        <div
                                            className="flex items-center gap-3 p-2.5 rounded-xl bg-white/5 border border-white/5 hover:bg-white/10 hover:border-blue-500/20 transition-all cursor-pointer group"
                                            onClick={() => window.open(`tel:${settings.supportPhone}`)}
                                        >
                                            <div className="w-8 h-8 rounded-lg bg-blue-500/10 flex items-center justify-center text-blue-400 group-hover:scale-110 transition-transform">
                                                <Phone className="w-4 h-4" />
                                            </div>
                                            <div className="min-w-0">
                                                <p className="text-[9px] text-slate-500 font-bold uppercase tracking-wider">Phone</p>
                                                <p className="text-xs text-white font-bold truncate">{settings.supportPhone}</p>
                                            </div>
                                        </div>

                                        <div
                                            className="flex items-center gap-3 p-2.5 rounded-xl bg-white/5 border border-white/5 hover:bg-white/10 hover:border-violet-500/20 transition-all cursor-pointer group"
                                            onClick={() => window.open(`mailto:${settings.supportEmail}`)}
                                        >
                                            <div className="w-8 h-8 rounded-lg bg-violet-500/10 flex items-center justify-center text-violet-400 group-hover:scale-110 transition-transform">
                                                <Mail className="w-4 h-4" />
                                            </div>
                                            <div className="min-w-0">
                                                <p className="text-[9px] text-slate-500 font-bold uppercase tracking-wider">Email</p>
                                                <p className="text-xs text-white font-bold truncate">{settings.supportEmail}</p>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="mt-2 pt-2 border-t border-white/5">
                                        <button
                                            onClick={() => window.open(`https://wa.me/${settings.supportWhatsApp}`, '_blank')}
                                            className="w-full py-2.5 rounded-xl bg-emerald-500/5 hover:bg-emerald-500/10 text-emerald-500 text-[10px] font-bold uppercase tracking-widest transition-all border border-emerald-500/20 shadow-lg shadow-emerald-500/5"
                                        >
                                            Chat on WhatsApp
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Mobile Replied Icon */}
                        <div className="md:hidden">
                            <button
                                onClick={scrollToReplies}
                                className={`relative flex items-center justify-center p-2 rounded-2xl transition-all border border-blue-500/20 bg-blue-500/5 text-blue-400 active:scale-95 shadow-lg shadow-blue-500/5`}
                                title="Admin Replies"
                            >
                                <MessageCircle className="w-4.5 h-4.5" />
                                {unreadReplies > 0 && (
                                    <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[8px] font-bold text-white shadow-lg shadow-red-500/40 animate-pulse border border-slate-900">
                                        {unreadReplies}
                                    </span>
                                )}
                            </button>
                        </div>

                        <button
                            onClick={logout}
                            className="inline-flex items-center gap-2 p-2 sm:px-5 sm:py-2.5 rounded-2xl text-xs font-bold uppercase tracking-wider text-red-500 hover:text-white hover:bg-red-500/10 border border-transparent hover:border-red-500/20 transition-all active:scale-95"
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

export const UserBottomNav = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const isActive = (path) => location.pathname === path;

    return (
        <div className="md:hidden w-full bg-slate-900/90 backdrop-blur-2xl border-t border-white/10 px-6 py-2 shrink-0">
            <div className="flex items-center justify-around max-w-sm mx-auto">
                {navLinks.map((link) => (
                    <button
                        key={link.path}
                        onClick={() => navigate(link.path)}
                        className={`flex flex-col items-center justify-center gap-1 w-14 h-14 rounded-2xl transition-all relative group
                            ${isActive(link.path)
                                ? `text-white`
                                : 'text-slate-500 hover:text-slate-300'
                            }`}
                    >
                        <link.icon className={`w-5 h-5 transition-all duration-300 ${isActive(link.path) ? `text-${link.color}-400 scale-110` : 'group-hover:scale-110'}`} />
                        <span className="text-[9px] font-bold uppercase tracking-tighter opacity-80">{link.name}</span>

                        {/* Active Indicator Dot */}
                        {isActive(link.path) && (
                            <div className={`absolute -bottom-1 w-1 h-1 rounded-full bg-${link.color}-400 shadow-[0_0_10px_rgba(59,130,246,0.8)]`}></div>
                        )}
                    </button>
                ))}
            </div>
        </div>
    );
};

const UserNavigation = () => {
    return (
        <>
            <UserTopNav />
            <UserBottomNav />
        </>
    );
};

export default UserNavigation;
