import { X, Wrench, MessageSquare } from 'lucide-react';

const ServiceSelectionDialog = ({ isOpen, onClose, onNewService, onQueryRaising, category }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md transition-all duration-300">
      <div className="glass-card max-w-md w-full rounded-[32px] border border-white/5 p-1 relative overflow-hidden animate-scale-in">
        <div className="bg-slate-900/90 rounded-[28px] overflow-hidden">
          {/* Header */}
          <div className="px-8 py-6 border-b border-white/5 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-500/20 to-violet-500/20 border border-white/10 flex items-center justify-center">
                <Wrench className="w-6 h-6 text-blue-400" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-white tracking-tight">Select Action</h2>
                <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mt-0.5">{category}</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2.5 hover:bg-white/5 rounded-xl transition-all text-slate-500 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Content */}
          <div className="p-8 space-y-5">
            <p className="text-sm font-medium text-slate-400 mb-2 px-1">
              Choose how you'd like to proceed with <span className="text-white font-bold">{category}</span>:
            </p>

            <button
              onClick={onNewService}
              className="w-full text-left p-6 rounded-[24px] border border-white/5 bg-slate-950/40 hover:bg-slate-800/60 hover:border-violet-500/40 transition-all group active:scale-[0.98]"
            >
              <div className="flex items-center gap-5">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-violet-600/20 to-violet-700/20 border border-violet-500/20 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                  <Wrench className="w-7 h-7 text-violet-400" />
                </div>
                <div className="flex-1">
                  <h3 className="font-bold text-lg text-white mb-1">New Service</h3>
                  <p className="text-xs font-medium text-slate-500 leading-relaxed uppercase tracking-wider">
                    Installation or specialized setup
                  </p>
                </div>
              </div>
            </button>

            <button
              onClick={onQueryRaising}
              className="w-full text-left p-6 rounded-[24px] border border-white/5 bg-slate-950/40 hover:bg-slate-800/60 hover:border-blue-500/40 transition-all group active:scale-[0.98]"
            >
              <div className="flex items-center gap-5">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-600/20 to-blue-700/20 border border-blue-500/20 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                  <MessageSquare className="w-7 h-7 text-blue-400" />
                </div>
                <div className="flex-1">
                  <h3 className="font-bold text-lg text-white mb-1">Raise Ticket</h3>
                  <p className="text-xs font-medium text-slate-500 leading-relaxed uppercase tracking-wider">
                    Issue reporting & support query
                  </p>
                </div>
              </div>
            </button>
          </div>

          <div className="px-8 pb-8 pt-2">
            <button
              onClick={onClose}
              className="w-full py-4 text-xs font-bold uppercase tracking-[0.2em] text-slate-500 hover:text-white transition-colors"
            >
              Dismiss
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ServiceSelectionDialog;



