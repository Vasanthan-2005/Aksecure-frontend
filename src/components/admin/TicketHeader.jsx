import { Calendar, Clock, Save, Loader2, CheckCircle2 } from 'lucide-react';
import { getStatusColor, getStatusIcon, getCategoryColor, statusOptions } from './utils.jsx';

const TicketHeader = ({ ticket, updateStatus, setUpdateStatus, visitDateTime, setVisitDateTime, errors, setErrors, updating, onUpdate }) => {
  return (
    <div className="glass-card p-6 rounded-2xl border border-slate-700/50 shadow-xl bg-slate-900/60 backdrop-blur-xl">
      <div className="flex items-start justify-between mb-6">
        <div className="flex-1">
          <div className="flex items-center gap-4 mb-3">
            <h2 className="text-3xl font-bold text-white tracking-tight">
              {ticket.title}
            </h2>
            <span
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-bold border shadow-lg shadow-black/20 ${getStatusColor(
                ticket.status
              )}`}
            >
              {getStatusIcon(ticket.status)}
              {ticket.status === 'Open' ? 'New' : ticket.status}
            </span>
          </div>
          <p className="text-sm text-slate-400 mb-3 font-medium">
            Ticket ID: <span className="font-mono text-slate-200 bg-slate-800 px-2 py-0.5 rounded border border-white/5">{ticket.ticketId}</span>
          </p>
          <span className={`inline-block px-3 py-1 rounded-lg text-xs font-bold border uppercase tracking-wider ${getCategoryColor(ticket.category)}`}>
            {ticket.category}
          </span>
        </div>

        {/* Update Ticket Form - Top Right */}
        <div className="ml-6 w-80 flex-shrink-0 animate-fade-in">
          <div className="bg-slate-800/40 rounded-xl p-4 border border-white/10 hover:border-white/20 transition-all">
            <h3 className="text-sm font-bold text-white mb-3 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              Update Status
            </h3>
            <div className="space-y-3">
              {errors.update && (
                <div className="p-2 bg-red-500/10 border border-red-500/20 rounded text-xs text-red-400 font-medium">
                  {errors.update}
                </div>
              )}
              <div className="flex items-end gap-2">
                <div className="flex-1">
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                    Status
                  </label>
                  <select
                    value={updateStatus}
                    onChange={(e) => {
                      setUpdateStatus(e.target.value);
                      setErrors(prev => ({ ...prev, status: '', update: '' }));
                    }}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:border-transparent text-sm bg-slate-900/80 transition-all cursor-pointer outline-none ${errors.status || errors.update
                        ? 'border-red-500/50 focus:ring-red-500/50 text-red-400'
                        : 'border-slate-600 focus:ring-blue-500/50 text-slate-200 hover:border-slate-500'
                      }`}
                  >
                    {statusOptions.map((status) => (
                      <option key={status} value={status}>
                        {status}
                      </option>
                    ))}
                  </select>
                </div>
                <button
                  onClick={onUpdate}
                  disabled={updating}
                  className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed text-sm font-bold shadow-lg shadow-emerald-500/20 whitespace-nowrap"
                >
                  {updating ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4" />
                      Save
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-slate-800/30 rounded-xl p-6 mb-6 border border-white/5">
        <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Description</h4>
        <p className="text-slate-200 leading-relaxed whitespace-pre-wrap break-words text-sm">{ticket.description}</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-slate-800/40 rounded-xl p-4 border border-white/5 hover:border-white/10 transition-all">
          <div className="flex items-center gap-2 mb-2">
            <Calendar className="w-4 h-4 text-slate-400" />
            <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Created</span>
          </div>
          <p className="font-bold text-white text-sm">
            {new Date(ticket.createdAt).toLocaleDateString()}
          </p>
          <p className="text-xs text-slate-500 mt-0.5 font-mono">
            {new Date(ticket.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </p>
        </div>
        {ticket.preferredVisitAt && (
          <div className="bg-blue-500/5 rounded-xl p-4 border border-blue-500/10 hover:border-blue-500/20 transition-all">
            <div className="flex items-center gap-2 mb-2">
              <Clock className="w-4 h-4 text-blue-400" />
              <span className="text-[10px] text-blue-400/80 font-bold uppercase tracking-wider">Preferred</span>
            </div>
            <p className="font-bold text-blue-100 text-sm">
              {new Date(ticket.preferredVisitAt).toLocaleDateString()}
            </p>
            <p className="text-xs text-blue-300/70 mt-0.5 font-mono">
              {new Date(ticket.preferredVisitAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </p>
          </div>
        )}
        {ticket.assignedVisitAt && (
          <div className="bg-emerald-500/5 rounded-xl p-4 border border-emerald-500/10 hover:border-emerald-500/20 transition-all">
            <div className="flex items-center gap-2 mb-2">
              <Clock className="w-4 h-4 text-emerald-400" />
              <span className="text-[10px] text-emerald-400/80 font-bold uppercase tracking-wider">Assigned</span>
            </div>
            <p className="font-bold text-emerald-100 text-sm">
              {new Date(ticket.assignedVisitAt).toLocaleDateString()}
            </p>
            <p className="text-xs text-emerald-300/70 mt-0.5 font-mono">
              {new Date(ticket.assignedVisitAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default TicketHeader;

