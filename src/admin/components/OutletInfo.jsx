import { Building, MapPin, Navigation } from 'lucide-react';

const OutletInfo = ({ outletName, address, location }) => {
    if (!outletName && !address) return null;

    return (
        <div className="glass-card p-6 rounded-2xl border border-slate-700/50 shadow-xl bg-slate-900/60 backdrop-blur-xl">
            <div className="flex items-center gap-3 mb-6 pb-4 border-b border-white/5">
                <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center">
                    <Building className="w-5 h-5 text-blue-400" />
                </div>
                <h3 className="text-xl font-bold text-white tracking-tight">Service Location (Outlet)</h3>
            </div>

            <div className="space-y-4">
                <div className="bg-slate-900/40 rounded-2xl p-4 border border-white/5 group shadow-lg">
                    <div className="flex items-center gap-2 mb-2">
                        <Building className="w-4 h-4 text-blue-400" />
                        <span className="text-xs text-slate-500 font-bold uppercase tracking-tight group-hover:text-blue-400 Transition-colors">Branch Name</span>
                    </div>
                    <p className="font-black text-slate-100 text-sm tracking-tight group-hover:text-white transition-colors">{outletName || 'N/A'}</p>
                </div>

                <div className="bg-slate-900/40 rounded-2xl p-4 border border-white/5 group shadow-lg">
                    <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                            <MapPin className="w-4 h-4 text-blue-400" />
                            <span className="text-xs text-slate-500 font-bold uppercase tracking-tight group-hover:text-blue-400 transition-colors">Physical Address</span>
                        </div>
                        {location && location.lat && location.lng && (
                            <a
                                href={`https://www.google.com/maps/search/?api=1&query=${location.lat},${location.lng}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-blue-500/10 hover:bg-blue-500/20 border border-blue-500/20 text-blue-400 hover:text-blue-300 transition-all group/nav"
                                onClick={(e) => e.stopPropagation()}
                            >
                                <span className="text-[10px] font-bold uppercase tracking-wider">Navigate</span>
                                <Navigation className="w-3 h-3 group-hover/nav:translate-x-0.5 transition-transform" />
                            </a>
                        )}
                    </div>
                    <p className="font-black text-slate-100 text-sm tracking-tight group-hover:text-white transition-colors">{address || 'N/A'}</p>
                    {location && (
                        <div className="flex items-center gap-3 mt-3 pt-3 border-t border-white/5">
                            <span className="text-[10px] font-black text-slate-600 uppercase tracking-widest">
                                LAT: <span className="text-blue-500/70">{location.lat.toFixed(6)}</span>
                            </span>
                            <span className="text-[10px] font-black text-slate-600 uppercase tracking-widest">
                                LNG: <span className="text-blue-500/70">{location.lng.toFixed(6)}</span>
                            </span>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default OutletInfo;
