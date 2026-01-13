import { Shield, LogOut, LayoutDashboard, Ticket, Users } from 'lucide-react';

const AdminNavigation = ({ user, logout, activeTab, setActiveTab, onDashboardClick, onTicketsClick, onUsersClick }) => {
  return (
    <nav className="glass sticky top-0 z-50 border-b border-white/5 bg-slate-900/50 backdrop-blur-xl">
      <div className="max-w-[1920px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">

          {/* Logo Section */}
          <button
            onClick={() => {
              setActiveTab("dashboard");
              if (onDashboardClick) onDashboardClick();
            }}
            className="flex items-center gap-3 group hover:opacity-80 transition-opacity cursor-pointer"
          >
            <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-blue-600 to-violet-600 flex items-center justify-center shadow-lg shadow-blue-500/20 group-hover:shadow-blue-500/40 transition-all duration-300">
              <Shield className="w-5 h-5 text-white" />
            </div>
            <div className="hidden lg:block text-left">
              <p className="text-lg font-black text-white tracking-tighter group-hover:text-blue-400 transition-colors">Admin Portal</p>
              <p className="text-[10px] text-slate-500 font-black uppercase tracking-[0.2em]">Management System</p>
            </div>
          </button>


          {/* User Profile & Logout */}
          <div className="flex items-center gap-4">
            <div className="hidden sm:flex items-center gap-3 px-4 py-2 rounded-xl border border-white/5 bg-slate-800/50 hover:bg-slate-800 transition-colors backdrop-blur-md">
              <div className="h-8 w-8 rounded-full bg-gradient-to-br from-blue-500 to-violet-500 p-[1px] shadow-lg shadow-blue-500/20">
                <div className="h-full w-full rounded-full bg-slate-900 flex items-center justify-center">
                  <Shield className="w-3.5 h-3.5 text-blue-400" />
                </div>
              </div>
              <div className="flex flex-col items-start pr-2">
                <span className="text-sm font-black text-slate-100 tracking-tight">{user?.name}</span>
                <span className="text-[9px] text-blue-500 font-black uppercase tracking-widest px-1.5 py-0.5 bg-blue-500/10 rounded-md">Super Admin</span>
              </div>
            </div>

            <button
              onClick={logout}
              className="inline-flex items-center gap-2.5 px-5 py-2.5 rounded-2xl text-[11px] font-black uppercase tracking-widest text-red-400 hover:text-white bg-red-500/5 hover:bg-red-500 shadow-lg shadow-red-500/5 hover:shadow-red-500/20 border border-red-500/20 hover:border-red-500 transition-all duration-500 group"
              title="Logout"
            >
              <LogOut className="w-4 h-4 group-hover:-translate-x-1 transition-transform duration-500" />
              <span className="hidden sm:inline">Logout</span>
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default AdminNavigation;
