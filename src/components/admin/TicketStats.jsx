import { AlertCircle, Loader2, XCircle } from 'lucide-react';

const TicketStats = ({ stats }) => {
  return (
    <div className="grid grid-cols-3 gap-3">
      <div className="bg-slate-800/60 border border-emerald-500/20 rounded-xl p-3 hover:bg-slate-800/80 transition-colors group">
        <div className="flex items-center gap-1.5 mb-1.5">
          <AlertCircle className="w-3.5 h-3.5 text-emerald-400 group-hover:text-emerald-300 transition-colors flex-shrink-0" />
          <span className="text-xs text-emerald-400 group-hover:text-emerald-300 font-medium">
            New
          </span>
        </div>
        <p className="text-2xl font-bold text-white group-hover:text-emerald-200 transition-colors">
          {stats.new}
        </p>
      </div>
      <div className="bg-slate-800/60 border border-blue-500/20 rounded-xl p-3 hover:bg-slate-800/80 transition-colors group">
        <div className="flex items-center gap-1.5 mb-1.5">
          <Loader2 className="w-3.5 h-3.5 text-blue-400 group-hover:text-blue-300 transition-colors flex-shrink-0" />
          <span className="text-xs text-blue-400 group-hover:text-blue-300 font-medium">
            In Progress
          </span>
        </div>
        <p className="text-2xl font-bold text-white group-hover:text-blue-200 transition-colors">
          {stats.inProgress}
        </p>
      </div>
      <div className="bg-slate-800/60 border border-slate-500/20 rounded-xl p-3 hover:bg-slate-800/80 transition-colors group">
        <div className="flex items-center gap-1.5 mb-1.5">
          <XCircle className="w-3.5 h-3.5 text-slate-400 group-hover:text-slate-300 transition-colors flex-shrink-0" />
          <span className="text-xs text-slate-400 group-hover:text-slate-300 font-medium">
            Closed
          </span>
        </div>
        <p className="text-2xl font-bold text-white group-hover:text-slate-200 transition-colors">
          {stats.closed}
        </p>
      </div>
    </div>
  );
};

export default TicketStats;
