import { Save, Clock, Loader2, ChevronsUp } from 'lucide-react';
import { statusOptions } from '../utils';

const TicketUpdateForm = ({
  updateStatus,
  setUpdateStatus,
  visitDateTime,
  setVisitDateTime,
  errors,
  setErrors,
  updating,
  onUpdate,
  currentStatus // Added currentStatus prop
}) => {
  return (
    <div className="glass-card p-6 rounded-2xl border border-slate-700/50 shadow-xl bg-slate-900/60 backdrop-blur-xl h-full">
      <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none group-hover:opacity-10 transition-opacity">
        <ChevronsUp className="w-24 h-24 text-blue-500" />
      </div>

      <div className="flex items-center gap-3 mb-5 relative z-10">
        <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center ring-1 ring-blue-500/20 border border-blue-500/10">
          <Save className="w-5 h-5 text-blue-400" />
        </div>
        <h3 className="text-xl font-bold text-white tracking-tight">Update Ticket</h3>
      </div>

      <div className="space-y-5 relative z-10">
        {errors.update && (
          <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-xl">
            <p className="text-sm text-red-400 font-medium">{errors.update}</p>
          </div>
        )}

        <div>
          <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">
            Status
          </label>
          <select
            value={updateStatus}
            onChange={(e) => {
              setUpdateStatus(e.target.value);
              setErrors(prev => ({ ...prev, status: '', update: '' }));
            }}
            className={`w-full px-4 py-3 bg-slate-950/50 border rounded-xl icon-select appearance-none cursor-pointer font-bold text-sm
                  ${currentStatus === 'Open' ? 'text-blue-400 border-blue-500/30 focus:border-blue-500 focus:ring-blue-500/20' : ''}
                  ${currentStatus === 'In Progress' ? 'text-amber-400 border-amber-500/30 focus:border-amber-500 focus:ring-amber-500/20' : ''}
                  ${currentStatus === 'Resolved' ? 'text-emerald-400 border-emerald-500/30 focus:border-emerald-500 focus:ring-emerald-500/20' : ''}
                  ${currentStatus === 'Closed' ? 'text-slate-400 border-slate-500/30 focus:border-slate-500 focus:ring-slate-500/20' : ''}
                  focus:outline-none focus:ring-2`}
          >
            {statusOptions.map((status) => (
              <option key={status} value={status}>
                {status}
              </option>
            ))}
          </select>
          {errors.status && (
            <p className="mt-1 text-xs text-red-400 font-medium">{errors.status}</p>
          )}
        </div>

        <div>
          <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">
            <div className="flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-blue-400 mb-0.5" />
              Assign Visit Time
            </div>
          </label>
          <input
            type="datetime-local"
            value={visitDateTime}
            onChange={(e) => {
              setVisitDateTime(e.target.value);
              setErrors(prev => ({ ...prev, visitDateTime: '', update: '' }));
            }}
            className={`w-full px-4 py-3 bg-slate-800/50 border rounded-xl focus:ring-2 focus:border-transparent transition-all font-medium text-slate-200 scheme-dark ${errors.visitDateTime || errors.update
              ? 'border-red-500/50 focus:ring-red-500/50'
              : 'border-slate-700 focus:ring-blue-500/50 hover:border-slate-600'
              }`}
          />
          {errors.visitDateTime && (
            <p className="mt-1 text-xs text-red-400 font-medium">{errors.visitDateTime}</p>
          )}
        </div>

        <button
          onClick={onUpdate}
          disabled={updating}
          className="w-full inline-flex items-center justify-center gap-2 px-5 py-3.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed font-bold text-sm shadow-lg shadow-blue-500/25 hover:shadow-blue-500/40 hover:-translate-y-0.5 active:translate-y-0"
        >
          {updating ? (
            <div className="flex items-center justify-center py-4 text-slate-400 gap-2">
              <Loader2 className="w-5 h-5" />
              <span>Updating status...</span>
            </div>
          ) : (
            <>
              <Save className="w-5 h-5" />
              Update Ticket
            </>
          )}
        </button>
      </div>
    </div>
  );
};

export default TicketUpdateForm;

