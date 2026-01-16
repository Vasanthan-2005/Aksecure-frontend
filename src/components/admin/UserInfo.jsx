import { User, Mail, Phone, Building, MapPin, Navigation } from 'lucide-react';

const UserInfo = ({ userData }) => {
  if (!userData) return null;

  return (
    <div className="glass-card p-6 rounded-2xl border border-slate-700/50 shadow-xl bg-slate-900/60 backdrop-blur-xl">
      <div className="flex items-center gap-3 mb-6 pb-4 border-b border-white/5">
        <div className="w-10 h-10 rounded-xl bg-violet-500/10 border border-violet-500/20 flex items-center justify-center">
          <User className="w-5 h-5 text-violet-400" />
        </div>
        <h3 className="text-xl font-bold text-white tracking-tight">User Information</h3>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-slate-900/40 rounded-2xl p-4 border border-white/5 hover:border-violet-500/20 hover:bg-slate-900/60 group shadow-lg">
          <div className="flex items-center gap-2 mb-2">
            <User className="w-4 h-4 text-violet-400" />
            <span className="text-xs text-slate-500 font-bold uppercase tracking-tight group-hover:text-violet-400">Name</span>
          </div>
          <p className="font-black text-slate-100 text-sm tracking-tight group-hover:text-white">{userData.name}</p>
        </div>
        <div className="bg-slate-900/40 rounded-2xl p-4 border border-white/5 hover:border-violet-500/20 hover:bg-slate-900/60 transition-all group shadow-lg">
          <div className="flex items-center gap-2 mb-2">
            <Building className="w-4 h-4 text-violet-400" />
            <span className="text-xs text-slate-500 font-bold uppercase tracking-tight group-hover:text-violet-400 transition-colors">Company</span>
          </div>
          <p className="font-black text-slate-100 text-sm tracking-tight group-hover:text-white transition-colors">
            {userData.companyName || 'N/A'}
          </p>
        </div>
        <div className="bg-slate-900/40 rounded-2xl p-4 border border-white/5 hover:border-violet-500/20 hover:bg-slate-900/60 transition-all group shadow-lg">
          <div className="flex items-center gap-2 mb-2">
            <Mail className="w-4 h-4 text-violet-400" />
            <span className="text-xs text-slate-500 font-bold uppercase tracking-tight group-hover:text-violet-400 transition-colors">Email</span>
          </div>
          <p className="font-black text-slate-100 text-sm tracking-tight break-all group-hover:text-white transition-colors">{userData.email}</p>
        </div>
        <div className="bg-slate-900/40 rounded-2xl p-4 border border-white/5 hover:border-violet-500/20 hover:bg-slate-900/60 group shadow-lg">
          <div className="flex items-center gap-2 mb-2">
            <Phone className="w-4 h-4 text-violet-400" />
            <span className="text-xs text-slate-500 font-bold uppercase tracking-tight group-hover:text-violet-400 transition-colors">Phone</span>
          </div>
          <p className="font-black text-slate-100 text-sm tracking-tight group-hover:text-white transition-colors">
            {userData.phone || 'N/A'}
          </p>
        </div>
        {userData.address && (
          <div className="md:col-span-2 bg-slate-900/40 rounded-2xl p-4 border border-white/5 hover:border-violet-500/20 hover:bg-slate-900/60 transition-all group shadow-lg">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-violet-400" />
                <span className="text-xs text-slate-500 font-bold uppercase tracking-tight group-hover:text-violet-400 transition-colors">Address</span>
              </div>
              <a
                href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(userData.address)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-blue-500/10 hover:bg-blue-500/20 border border-blue-500/20 text-blue-400 hover:text-blue-300 transition-all group/nav"
                title="Open in Google Maps"
                onClick={(e) => e.stopPropagation()}
              >
                <span className="text-[10px] font-bold uppercase tracking-wider">Navigate</span>
                <Navigation className="w-3 h-3 group-hover/nav:translate-x-0.5 transition-transform" />
              </a>
            </div>
            <p className="font-black text-slate-100 text-sm tracking-tight group-hover:text-white transition-colors">{userData.address}</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default UserInfo;

