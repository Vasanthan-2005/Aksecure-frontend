import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Shield, LogOut, User as UserIcon, Ticket, FileText } from 'lucide-react';

const UserNavigation = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    return (
        <nav className="glass sticky top-0 z-50 border-b border-white/5">
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
                            className="hidden md:inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium text-slate-300 hover:text-white hover:bg-white/5 border border-transparent hover:border-white/10 transition-all"
                        >
                            <Ticket className="w-4 h-4" />
                            My Tickets
                        </button>

                        <button
                            onClick={() => navigate('/service-requests')}
                            className="hidden md:inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium text-slate-300 hover:text-white hover:bg-white/5 border border-transparent hover:border-white/10 transition-all"
                        >
                            <FileText className="w-4 h-4" />
                            My Requests
                        </button>

                        <div className="h-6 w-px bg-white/10 hidden md:block" />

                        {/* Profile */}
                        <button
                            onClick={() => navigate('/profile')}
                            className="hidden sm:flex items-center gap-3 px-3 py-1.5 rounded-xl border border-white/5 bg-white/5 hover:bg-white/10 hover:border-white/10 transition-all group"
                        >
                            <div className="h-8 w-8 rounded-full bg-gradient-to-br from-blue-500 to-violet-500 p-[1px]">
                                <div className="h-full w-full rounded-full bg-slate-900 flex items-center justify-center group-hover:bg-transparent transition-colors">
                                    <UserIcon className="w-4 h-4 text-blue-400 group-hover:text-white transition-colors" />
                                </div>
                            </div>
                            <div className="flex flex-col items-start pr-2">
                                <span className="text-sm font-medium text-slate-200 group-hover:text-white transition-colors">
                                    {user?.name?.split(' ')[0]}
                                </span>
                                <span className="text-[10px] text-slate-500 group-hover:text-slate-400">
                                    {user?.companyName}
                                </span>
                            </div>
                        </button>

                        <button
                            onClick={logout}
                            className="inline-flex items-center gap-2 p-2 sm:px-4 sm:py-2 rounded-xl text-xs font-medium text-red-400 hover:text-red-300 hover:bg-red-500/10 border border-transparent hover:border-red-500/20 transition-all"
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
