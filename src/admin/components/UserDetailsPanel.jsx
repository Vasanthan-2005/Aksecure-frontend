import { User, Building, Phone, MapPin, Ticket as TicketIcon, Trash2, Loader2, Users, Mail, Calendar, Clock, Wrench, Navigation, ExternalLink, ArrowLeft } from 'lucide-react';
import MapView from '../../common/components/MapView';

const UserDetailsPanel = ({ user, onDelete, deleting, onClose }) => {
  if (!user) {
    return (
      <div className="flex-1 overflow-y-auto bg-slate-950">
        <div className="flex items-center justify-center h-full min-h-[calc(100vh-4rem)] text-slate-500">
          <div className="text-center px-6">
            <div className="w-24 h-24 mx-auto mb-6 rounded-3xl bg-slate-900/50 flex items-center justify-center border border-white/5 relative overflow-hidden group">
              <div className="absolute inset-0 bg-violet-600/10 blur-xl group-hover:bg-violet-600/20" />
              <Users className="w-10 h-10 text-violet-400/50 group-hover:text-violet-400 z-10" />
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

      <div className="p-4 md:p-8 max-w-5xl mx-auto space-y-6 relative z-10">
        {/* Action Row */}
        <div className="flex items-center justify-between gap-2 mb-2">
          <button
            onClick={onClose}
            className="flex items-center gap-1.5 text-slate-400 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="text-sm font-medium">Back</span>
          </button>
        </div>
        {/* User Header */}
        <div className="glass-card p-4 md:p-8 rounded-2xl border border-slate-700/50 shadow-xl bg-slate-900/60 backdrop-blur-xl">
          <div className="flex items-start justify-between mb-4 md:mb-6">
            <div className="flex items-center gap-4 md:gap-6">
              <div className="w-16 h-16 md:w-24 md:h-24 rounded-2xl bg-gradient-to-br from-violet-600 to-indigo-600 flex items-center justify-center ring-4 ring-violet-500/20 shadow-lg shadow-violet-500/20">
                <User className="w-6 h-6 md:w-10 md:h-10 text-white" />
              </div>
              <div>
                <h2 className="text-xl md:text-3xl font-bold text-white tracking-tight mb-1 md:mb-2 line-clamp-1">
                  {user.name}
                </h2>
                <p className="text-sm md:text-base text-violet-300 font-medium mb-1 line-clamp-1">{user.email}</p>
                {user.companyName && (
                  <div className="flex items-center gap-2 mt-1 md:mt-2">
                    <span className="px-2 md:px-3 py-0.5 md:py-1 rounded-full bg-slate-800 text-slate-300 border border-slate-700 text-[10px] md:text-xs font-semibold">
                      {user.companyName}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* User Information */}
        <div className="glass-card p-4 md:p-8 rounded-2xl border border-slate-700/50 shadow-xl bg-slate-900/60 backdrop-blur-xl">
          <div className="flex items-center gap-3 mb-6 md:mb-8 pb-4 border-b border-white/5">
            <div className="w-8 h-8 md:w-10 md:h-10 rounded-xl bg-violet-500/10 border border-violet-500/20 flex items-center justify-center">
              <User className="w-4 h-4 md:w-5 md:h-5 text-violet-400" />
            </div>
            <div>
              <h3 className="text-lg md:text-xl font-bold text-white tracking-tight">User Information</h3>
              <p className="text-[10px] md:text-xs text-slate-400 mt-0.5">Account and contact details</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Email */}
            <div className="group bg-slate-800/40 rounded-xl p-5 border border-white/5 hover:border-violet-500/30 hover:bg-slate-800/60">
              <div className="flex items-center gap-2 mb-3">
                <Mail className="w-4 h-4 text-violet-400" />
                <span className="text-xs text-slate-500 font-bold uppercase tracking-tight group-hover:text-violet-300/80">Email</span>
              </div>
              <p className="text-base font-medium text-slate-200 break-all group-hover:text-white">
                {user.email || 'N/A'}
              </p>
            </div>

            {/* Phone */}
            <div className="group bg-slate-800/40 rounded-xl p-5 border border-white/5 hover:border-violet-500/30 hover:bg-slate-800/60">
              <div className="flex items-center gap-2 mb-3">
                <Phone className="w-4 h-4 text-violet-400" />
                <span className="text-xs text-slate-500 font-bold uppercase tracking-tight group-hover:text-violet-300/80">Phone</span>
              </div>
              <p className="text-base font-medium text-slate-200 group-hover:text-white">
                {user.phone || 'N/A'}
              </p>
            </div>

            {/* Company */}
            <div className="group bg-slate-800/40 rounded-xl p-5 border border-white/5 hover:border-violet-500/30 hover:bg-slate-800/60">
              <div className="flex items-center gap-2 mb-3">
                <Building className="w-4 h-4 text-violet-400" />
                <span className="text-xs text-slate-500 font-bold uppercase tracking-tight group-hover:text-violet-300/80">Company</span>
              </div>
              <p className="text-base font-medium text-slate-200 group-hover:text-white">
                {user.companyName || 'N/A'}
              </p>
            </div>

            {/* Role */}
            <div className="group bg-slate-800/40 rounded-xl p-5 border border-white/5 hover:border-violet-500/30 hover:bg-slate-800/60">
              <div className="flex items-center gap-2 mb-3">
                <User className="w-4 h-4 text-violet-400" />
                <span className="text-xs text-slate-500 font-bold uppercase tracking-tight group-hover:text-violet-300/80">Role</span>
              </div>
              <div className="mt-1">
                <span className={`px-3 py-1 rounded-lg text-xs font-bold uppercase tracking-wider ${user.role === 'admin'
                  ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30 shadow-[0_0_15px_rgba(245,158,11,0.1)]'
                  : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 shadow-[0_0_15px_rgba(16,185,129,0.1)]'
                  }`}>
                  {user.role || 'user'}
                </span>
              </div>
            </div>

            {/* Branch Locations Section */}
            {(user.outlets?.length > 0 || user.address) && (
              <div className="md:col-span-2 space-y-6">
                <div className="flex items-center gap-3 pb-4 border-b border-white/5">
                  <div className="w-8 h-8 md:w-10 md:h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
                    <Building className="w-4 h-4 md:w-5 md:h-5 text-emerald-400" />
                  </div>
                  <div>
                    <h3 className="text-lg md:text-xl font-bold text-white tracking-tight">Branch Locations</h3>
                    <p className="text-[10px] md:text-xs text-slate-400 mt-0.5">Registered outlets and physical addresses</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {user.outlets?.length > 0 ? (
                    user.outlets.map((outlet, index) => (
                      <div key={index} className="group bg-slate-800/40 rounded-2xl p-5 border border-white/5 hover:border-emerald-500/30 hover:bg-slate-800/60 transition-all shadow-lg">
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center border border-emerald-500/20 group-hover:bg-emerald-500/20">
                              <Building className="w-4 h-4 text-emerald-400" />
                            </div>
                            <span className="font-bold text-white tracking-tight">{outlet.outletName}</span>
                          </div>
                          {(outlet.location?.lat && outlet.location?.lng) && (
                            <a
                              href={`https://www.google.com/maps/dir/?api=1&destination=${outlet.location.lat},${outlet.location.lng}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 hover:bg-emerald-500/20 hover:text-white transition-all shadow-lg shadow-emerald-500/5 group/nav"
                              title="Open in Maps"
                              onClick={(e) => e.stopPropagation()}
                            >
                              <Navigation className="w-4 h-4 group-hover/nav:translate-x-0.5 group-hover/nav:-translate-y-0.5 transition-transform" />
                            </a>
                          )}
                        </div>
                        <div className="space-y-3">
                          <div className="flex items-start gap-2">
                            <MapPin className="w-4 h-4 text-slate-500 mt-1 flex-shrink-0" />
                            <p className="text-sm text-slate-400 leading-relaxed group-hover:text-slate-200 transition-colors">
                              {outlet.address}
                            </p>
                          </div>
                          {outlet.location && (
                            <div className="flex items-center gap-3 pt-3 border-t border-white/5 opacity-50 group-hover:opacity-100 transition-opacity">
                              <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">
                                LAT: <span className="text-emerald-500/70">{outlet.location.lat?.toFixed(6)}</span>
                              </span>
                              <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">
                                LNG: <span className="text-emerald-500/70">{outlet.location.lng?.toFixed(6)}</span>
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                    ))
                  ) : (
                    /* Legacy User Address Fallback */
                    <div className="col-span-2 group bg-slate-800/40 rounded-2xl p-5 border border-white/5 hover:border-violet-500/30 hover:bg-slate-800/60 transition-all shadow-lg">
                      <div className="flex items-center gap-2 mb-3">
                        <MapPin className="w-4 h-4 text-violet-400" />
                        <span className="text-xs text-slate-500 font-bold uppercase tracking-tight">Primary Address (Legacy)</span>
                      </div>
                      <p className="text-base font-medium text-slate-200 leading-relaxed mb-4 group-hover:text-white">{user.address}</p>
                      {user.location && (
                        <div className="space-y-4">
                          <div className="mt-2 rounded-xl overflow-hidden border border-white/5 group-hover:border-violet-500/20">
                            <MapView location={user.location} />
                          </div>
                          <a
                            href={`https://www.google.com/maps/dir/?api=1&destination=${user.location.lat},${user.location.lng}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center justify-center gap-2 w-full py-3 px-4 bg-violet-500/10 hover:bg-violet-500/20 border border-violet-500/20 hover:border-violet-500/40 text-violet-400 rounded-xl font-bold text-sm group/nav"
                          >
                            <ExternalLink className="w-4 h-4 group-hover/nav:translate-x-0.5 group-hover/nav:-translate-y-0.5" />
                            Open Navigation for Directions
                          </a>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Account Metrics Section */}
            <div className="md:col-span-2 space-y-6">
              <div className="flex items-center gap-3 pb-4 border-b border-white/5">
                <div className="w-8 h-8 md:w-10 md:h-10 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center">
                  <Navigation className="w-4 h-4 md:w-5 md:h-5 text-blue-400" />
                </div>
                <div>
                  <h3 className="text-lg md:text-xl font-bold text-white tracking-tight">Account Metrics</h3>
                  <p className="text-[10px] md:text-xs text-slate-400 mt-0.5">Registration and activity summary</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Registration Date */}
                {user.createdAt && (
                  <div className="group bg-slate-800/40 rounded-xl p-5 border border-white/5 hover:border-emerald-500/30 hover:bg-slate-800/60 transition-all">
                    <div className="flex items-center gap-2 mb-3">
                      <Calendar className="w-4 h-4 text-emerald-400" />
                      <span className="text-xs text-slate-500 font-bold uppercase tracking-tight group-hover:text-emerald-300/80">Registered</span>
                    </div>
                    <p className="text-base font-medium text-slate-200 group-hover:text-white">
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
                      <span className="text-xs text-slate-500 font-bold uppercase tracking-tight group-hover:text-blue-300/80">Last Updated</span>
                    </div>
                    <p className="text-base font-medium text-slate-200 group-hover:text-white">
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

                {/* Total Service Requests */}
                <div className="relative overflow-hidden rounded-xl p-6 border border-emerald-500/30 bg-emerald-500/5 group hover:bg-emerald-500/10 transition-all">
                  <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-all">
                    <Wrench className="w-20 h-20 text-emerald-500 rotate-12" />
                  </div>
                  <div className="relative z-10">
                    <div className="flex items-center gap-2 mb-2">
                      <Wrench className="w-5 h-5 text-emerald-400" />
                      <span className="text-xs text-emerald-300 font-bold uppercase tracking-wider">Total Services</span>
                    </div>
                    <p className="text-4xl font-bold text-white tracking-tight">{user.serviceCount || 0}</p>
                  </div>
                </div>

                {/* Total Tickets */}
                <div className="relative overflow-hidden rounded-xl p-6 border border-blue-500/30 bg-blue-500/5 group hover:bg-blue-500/10 transition-all">
                  <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-all">
                    <TicketIcon className="w-20 h-20 text-blue-500 rotate-12" />
                  </div>
                  <div className="relative z-10">
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
    </div>
  );
};

export default UserDetailsPanel;

