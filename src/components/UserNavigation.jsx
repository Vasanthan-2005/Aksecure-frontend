import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Shield, LogOut, User as UserIcon, Ticket, FileText } from 'lucide-react';

const UserNavigation = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();

    const isActive = (path) => location.pathname === path;

    return (
        <nav className="sticky top-0 z-50 bg-slate-900/50 backdrop-blur-xl border-b border-white/5 transition-all duration-300">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center h-20">

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
