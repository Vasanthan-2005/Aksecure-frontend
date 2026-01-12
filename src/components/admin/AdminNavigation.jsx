import { Shield, LogOut, LayoutDashboard, Ticket, Users, FileText } from 'lucide-react';

const AdminNavigation = ({ user, logout, activeTab, setActiveTab }) => {
  return (
    <nav className="glass sticky top-0 z-50 border-b border-white/5 bg-slate-900/50 backdrop-blur-xl">
      <div className="max-w-[1920px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">

          {/* Logo Section */}
          <div className="flex items-center gap-3 group">
            <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-blue-600 to-violet-600 flex items-center justify-center shadow-lg shadow-blue-500/20 group-hover:shadow-blue-500/40 transition-all duration-300">
              <Shield className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="text-base font-bold text-white tracking-tight group-hover:text-blue-400 transition-colors">Admin Portal</p>
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Management System</p>
            </div>
          </div>

          {/* User Profile & Logout */}
          <div className="flex items-center gap-4">
            <div className="hidden sm:flex items-center gap-3 px-4 py-2 rounded-xl border border-white/5 bg-slate-800/50 hover:bg-slate-800 transition-colors backdrop-blur-md">
              <div className="h-8 w-8 rounded-full bg-gradient-to-br from-blue-500 to-violet-500 p-[1px] shadow-lg shadow-blue-500/20">
                <div className="h-full w-full rounded-full bg-slate-900 flex items-center justify-center">
                  <Shield className="w-3.5 h-3.5 text-blue-400" />
                </div>
              </div>
              <div className="flex flex-col items-start pr-2">
                <span className="text-sm font-bold text-slate-200 tracking-tight">{user?.name}</span>
                <span className="text-[10px] text-blue-400 font-bold uppercase tracking-wider">Administrator</span>
              </div>
            </div>

            <button
              onClick={logout}
              className="inline-flex items-center gap-2 p-2 sm:px-4 sm:py-2 rounded-xl text-xs font-bold text-red-400 hover:text-white hover:bg-red-500 shadow-lg shadow-red-500/10 hover:shadow-red-500/30 border border-red-500/20 hover:border-red-500 transition-all duration-300 group"
              title="Logout"
            >
              <LogOut className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
              <span className="hidden sm:inline">Logout</span>
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default AdminNavigation;

