import { User, Building, Phone, MapPin, Ticket as TicketIcon, Trash2, Loader2, Users, Mail, Calendar, Clock, X, Navigation, ExternalLink } from 'lucide-react';
import MapView from '../common/MapView';

const UserDetailsPanel = ({ user, onDelete, deleting, onClose }) => {
  if (!user) {
    return (
      <div className="flex-1 overflow-y-auto bg-slate-950">
        <div className="flex items-center justify-center h-full min-h-[calc(100vh-4rem)] text-slate-500">
          <div className="text-center px-6">
            <div className="w-24 h-24 mx-auto mb-6 rounded-3xl bg-slate-900/50 flex items-center justify-center border border-white/5 relative overflow-hidden group">
              <div className="absolute inset-0 bg-violet-600/10 blur-xl group-hover:bg-violet-600/20 transition-all duration-500" />
              <Users className="w-10 h-10 text-violet-400/50 group-hover:text-violet-400 transition-colors z-10" />
            </div>
            <p className="text-xl font-bold text-white mb-2">Select a user</p>
            <p className="text-sm text-slate-500 max-w-md">Click on any user from the list to view their full profile and activity.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto bg-slate-950 relative custom-scrollbar">
      {/* Background gradients */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0">
        <div className="absolute top-0 right-0 w-[40%] h-[40%] rounded-full bg-violet-600/5 blur-[100px]" />
        <div className="absolute bottom-0 left-0 w-[30%] h-[30%] rounded-full bg-blue-600/5 blur-[100px]" />
      </div>

      <div className="p-8 max-w-5xl mx-auto space-y-6 relative z-10">
        {/* User Header */}
        <div className="glass-card p-8 rounded-2xl border border-slate-700/50 shadow-xl bg-slate-900/60 backdrop-blur-xl animate-fade-in-up">
          <div className="flex items-start justify-between mb-6">
            <div className="flex items-center gap-6">
              <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-violet-600 to-indigo-600 flex items-center justify-center ring-4 ring-violet-500/20 shadow-lg shadow-violet-500/20">
                <User className="w-10 h-10 text-white" />
              </div>
              <div>
                <h2 className="text-3xl font-bold text-white tracking-tight mb-2">
                  {user.name}
                </h2>
                <p className="text-base text-violet-300 font-medium mb-1">{user.email}</p>
                {user.companyName && (
                  <div className="flex items-center gap-2 mt-2">
                    <span className="px-3 py-1 rounded-full bg-slate-800 text-slate-300 border border-slate-700 text-xs font-semibold">
                      {user.companyName}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* User Information */}
        <div className="glass-card p-8 rounded-2xl border border-slate-700/50 shadow-xl bg-slate-900/60 backdrop-blur-xl animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
          <div className="flex items-center gap-3 mb-8 pb-4 border-b border-white/5">
            <div className="w-10 h-10 rounded-xl bg-violet-500/10 border border-violet-500/20 flex items-center justify-center">
              <User className="w-5 h-5 text-violet-400" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-white tracking-tight">User Information</h3>
              <p className="text-xs text-slate-400 mt-0.5">Account and contact details</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Email */}
            <div className="group bg-slate-800/40 rounded-xl p-5 border border-white/5 hover:border-violet-500/30 hover:bg-slate-800/60 transition-all">
              <div className="flex items-center gap-2 mb-3">
                <Mail className="w-4 h-4 text-violet-400" />
                <span className="text-xs text-slate-500 font-bold uppercase tracking-tight group-hover:text-violet-300/80 transition-colors">Email</span>
              </div>
              <p className="text-base font-medium text-slate-200 break-all group-hover:text-white transition-colors">
                {user.email || 'N/A'}
              </p>
            </div>

            {/* Phone */}
            <div className="group bg-slate-800/40 rounded-xl p-5 border border-white/5 hover:border-violet-500/30 hover:bg-slate-800/60 transition-all">
              <div className="flex items-center gap-2 mb-3">
                <Phone className="w-4 h-4 text-violet-400" />
                <span className="text-xs text-slate-500 font-bold uppercase tracking-tight group-hover:text-violet-300/80 transition-colors">Phone</span>
              </div>
              <p className="text-base font-medium text-slate-200 group-hover:text-white transition-colors">
                {user.phone || 'N/A'}
              </p>
            </div>

            {/* Company */}
            <div className="group bg-slate-800/40 rounded-xl p-5 border border-white/5 hover:border-violet-500/30 hover:bg-slate-800/60 transition-all">
              <div className="flex items-center gap-2 mb-3">
                <Building className="w-4 h-4 text-violet-400" />
                <span className="text-xs text-slate-500 font-bold uppercase tracking-tight group-hover:text-violet-300/80 transition-colors">Company</span>
              </div>
              <p className="text-base font-medium text-slate-200 group-hover:text-white transition-colors">
                {user.companyName || 'N/A'}
              </p>
            </div>

            {/* Role */}
            <div className="group bg-slate-800/40 rounded-xl p-5 border border-white/5 hover:border-violet-500/30 hover:bg-slate-800/60 transition-all">
              <div className="flex items-center gap-2 mb-3">
                <User className="w-4 h-4 text-violet-400" />
                <span className="text-xs text-slate-500 font-bold uppercase tracking-tight group-hover:text-violet-300/80 transition-colors">Role</span>
              </div>
              <p className="text-base font-medium text-slate-200 capitalize group-hover:text-white transition-colors">
                {user.role || 'user'}
              </p>
            </div>

            {/* Address */}
            {user.address && (
              <div className="md:col-span-2 group bg-slate-800/40 rounded-xl p-5 border border-white/5 hover:border-violet-500/30 hover:bg-slate-800/60 transition-all">
                <div className="flex items-center gap-2 mb-3">
                  <MapPin className="w-4 h-4 text-violet-400" />
                  <span className="text-xs text-slate-500 font-bold uppercase tracking-tight group-hover:text-violet-300/80 transition-colors">Address</span>
                </div>
                <p className="text-base font-medium text-slate-200 leading-relaxed group-hover:text-white transition-colors">{user.address}</p>
              </div>
            )}

            {/* Location Coordinates & Map */}
            {user.location && (
              <div className="md:col-span-2 space-y-4">
                <div className="group bg-amber-500/5 rounded-xl p-5 border border-amber-500/10 hover:border-amber-500/30 hover:bg-amber-500/10 transition-all">
                  <div className="flex items-center gap-2 mb-3">
                    <MapPin className="w-4 h-4 text-amber-500" />
                    <span className="text-xs text-amber-500/80 font-bold uppercase tracking-tight">Location Coordinates</span>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <span className="text-xs text-slate-500 font-bold block mb-1">Latitude</span>
                      <p className="text-base font-bold text-amber-400">{user.location.lat}</p>
                    </div>
                    <div>
                      <span className="text-xs text-slate-500 font-bold block mb-1">Longitude</span>
                      <p className="text-base font-bold text-amber-400">{user.location.lng}</p>
                    </div>
                  </div>
                </div>

                <div className="group bg-slate-800/40 rounded-2xl p-6 border border-white/5 hover:border-violet-500/30 transition-all">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-lg bg-violet-500/10 border border-violet-500/20 flex items-center justify-center">
                        <Navigation className="w-4 h-4 text-violet-400" />
                      </div>
                      <span className="text-sm font-bold text-white tracking-tight">View on Map</span>
                    </div>
                  </div>
                  <MapView location={user.location} />

                  <div className="mt-4">
                    <a
                      href={`https://www.google.com/maps/dir/?api=1&destination=${user.location.lat},${user.location.lng}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-center gap-2 w-full py-3 px-4 bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/20 hover:border-emerald-500/40 text-emerald-400 rounded-xl font-bold text-sm transition-all group/nav"
                    >
                      <ExternalLink className="w-4 h-4 group-hover/nav:translate-x-0.5 group-hover/nav:-translate-y-0.5 transition-transform" />
                      Open Navigation for Directions
                    </a>
                  </div>
                </div>
              </div>
            )}

            {/* Registration Date */}
            {user.createdAt && (
              <div className="group bg-slate-800/40 rounded-xl p-5 border border-white/5 hover:border-emerald-500/30 hover:bg-slate-800/60 transition-all">
                <div className="flex items-center gap-2 mb-3">
                  <Calendar className="w-4 h-4 text-emerald-400" />
                  <span className="text-xs text-slate-500 font-bold uppercase tracking-tight group-hover:text-emerald-300/80 transition-colors">Registered</span>
                </div>
                <p className="text-base font-medium text-slate-200 group-hover:text-white transition-colors">
                  {new Date(user.createdAt).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </p>
                <p className="text-sm text-slate-500 mt-1 font-mono">
                  {new Date(user.createdAt).toLocaleTimeString('en-US', {
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </p>
              </div>
            )}

            {/* Last Updated */}
            {user.updatedAt && (
              <div className="group bg-slate-800/40 rounded-xl p-5 border border-white/5 hover:border-blue-500/30 hover:bg-slate-800/60 transition-all">
                <div className="flex items-center gap-2 mb-3">
                  <Clock className="w-4 h-4 text-blue-400" />
                  <span className="text-xs text-slate-500 font-bold uppercase tracking-tight group-hover:text-blue-300/80 transition-colors">Last Updated</span>
                </div>
                <p className="text-base font-medium text-slate-200 group-hover:text-white transition-colors">
                  {new Date(user.updatedAt).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </p>
                <p className="text-sm text-slate-500 mt-1 font-mono">
                  {new Date(user.updatedAt).toLocaleTimeString('en-US', {
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </p>
              </div>
            )}

            {/* Total Tickets */}
            <div className="md:col-span-2 relative overflow-hidden rounded-xl p-6 border border-blue-500/30 bg-blue-500/5 group hover:bg-blue-500/10 transition-all">
              <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                <TicketIcon className="w-24 h-24 text-blue-500 rotate-12" />
              </div>
              <div className="relative z-10 flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <TicketIcon className="w-5 h-5 text-blue-400" />
                    <span className="text-xs text-blue-300 font-bold uppercase tracking-wider">Total Tickets</span>
                  </div>
                  <p className="text-4xl font-bold text-white tracking-tight">{user.ticketCount || 0}</p>
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
};

export default UserDetailsPanel;

