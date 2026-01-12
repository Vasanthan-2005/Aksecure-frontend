import { User, Mail, Phone, Building, MapPin } from 'lucide-react';

const UserInfo = ({ userData }) => {
  if (!userData) return null;

  return (
    <div className="glass-card p-6 rounded-2xl border border-slate-700/50 shadow-xl bg-slate-900/60 backdrop-blur-xl">
      <div className="flex items-center gap-3 mb-6 pb-4 border-b border-white/5">
        <div className="w-10 h-10 rounded-xl bg-violet-500/10 border border-violet-500/20 flex items-center justify-center">
          <User className="w-5 h-5 text-violet-400" />
        </div>
        <h3 className="text-xl font-bold text-white">User Information</h3>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-slate-800/40 rounded-xl p-4 border border-white/5 hover:border-violet-500/30 hover:bg-slate-800/60 transition-all group">
          <div className="flex items-center gap-2 mb-2">
            <User className="w-4 h-4 text-violet-400" />
            <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider group-hover:text-violet-300/80 transition-colors">Name</span>
          </div>
          <p className="font-medium text-slate-200 group-hover:text-white transition-colors">{userData.name}</p>
        </div>
        <div className="bg-slate-800/40 rounded-xl p-4 border border-white/5 hover:border-violet-500/30 hover:bg-slate-800/60 transition-all group">
          <div className="flex items-center gap-2 mb-2">
            <Building className="w-4 h-4 text-violet-400" />
            <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider group-hover:text-violet-300/80 transition-colors">Company</span>
          </div>
          <p className="font-medium text-slate-200 group-hover:text-white transition-colors">
            {userData.companyName || 'N/A'}
          </p>
        </div>
        <div className="bg-slate-800/40 rounded-xl p-4 border border-white/5 hover:border-violet-500/30 hover:bg-slate-800/60 transition-all group">
          <div className="flex items-center gap-2 mb-2">
            <Mail className="w-4 h-4 text-violet-400" />
            <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider group-hover:text-violet-300/80 transition-colors">Email</span>
          </div>
          <p className="font-medium text-slate-200 break-all group-hover:text-white transition-colors">{userData.email}</p>
        </div>
        <div className="bg-slate-800/40 rounded-xl p-4 border border-white/5 hover:border-violet-500/30 hover:bg-slate-800/60 transition-all group">
          <div className="flex items-center gap-2 mb-2">
            <Phone className="w-4 h-4 text-violet-400" />
            <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider group-hover:text-violet-300/80 transition-colors">Phone</span>
          </div>
          <p className="font-medium text-slate-200 group-hover:text-white transition-colors">
            {userData.phone || 'N/A'}
          </p>
        </div>
        {userData.address && (
          <div className="md:col-span-2 bg-slate-800/40 rounded-xl p-4 border border-white/5 hover:border-violet-500/30 hover:bg-slate-800/60 transition-all group">
            <div className="flex items-center gap-2 mb-2">
              <MapPin className="w-4 h-4 text-violet-400" />
              <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider group-hover:text-violet-300/80 transition-colors">Address</span>
            </div>
            <p className="font-medium text-slate-200 group-hover:text-white transition-colors">{userData.address}</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default UserInfo;

