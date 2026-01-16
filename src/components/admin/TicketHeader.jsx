import { Calendar, Clock, Save, Loader2, CheckCircle2 } from 'lucide-react';
import { getStatusColor, getStatusIcon, getCategoryColor, statusOptions } from './utils.jsx';

const TicketHeader = ({ ticket, updateStatus, setUpdateStatus, visitDateTime, setVisitDateTime, errors, setErrors, updating, onUpdate }) => {
  return (
    <div className="glass-card p-6 rounded-2xl border border-slate-700/50 shadow-xl bg-slate-900/60 backdrop-blur-xl">
      <div className="flex items-start justify-between mb-6">
        <div className="flex-1">
          <div className="flex items-center gap-4 mb-4">
            <h2 className="text-3xl font-bold text-white tracking-tight">
              {ticket.title}
            </h2>
            <span
              className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-[11px] font-black uppercase tracking-widest border shadow-xl shadow-black/40 ${getStatusColor(
                ticket.status
              )}`}
            >
              <div className={`w-2 h-2 rounded-full ${ticket.status === 'Open' ? 'bg-emerald-400' : ticket.status === 'In Progress' ? 'bg-blue-400' : 'bg-green-400'}`} />
              {getStatusIcon(ticket.status)}
              {ticket.status === 'Open' ? 'New' : ticket.status}
            </span>
          </div>
          <p className="text-sm text-slate-500 mb-4 font-black uppercase tracking-widest">
            REFERENCE ID: <span className="font-mono text-slate-200 bg-slate-900 px-3 py-1 rounded-lg border border-white/5 ml-2 text-base">{ticket.ticketId}</span>
          </p>
          <span className={`inline-block px-4 py-1.5 rounded-xl text-[10px] font-black border uppercase tracking-[0.2em] shadow-lg ${getCategoryColor(ticket.category)}`}>
            {ticket.category}
          </span>
        </div>

        {/* Update Ticket Form - Top Right */}
        <div className="ml-6 w-80 flex-shrink-0">
          <div className="bg-slate-800/40 rounded-xl p-4 border border-white/10 hover:border-white/20">
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
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-tight mb-2">
                    Status
                  </label>
                  <select
                    value={updateStatus}
                    onChange={(e) => {
                      setUpdateStatus(e.target.value);
                      setErrors(prev => ({ ...prev, status: '', update: '' }));
                    }}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:border-transparent text-sm bg-slate-900/80 cursor-pointer outline-none ${errors.status || errors.update
                      ? 'border-red-500/50 focus:ring-red-500/50 text-red-400'
                      : 'border-slate-600 focus:ring-blue-500/50 text-slate-200 hover:border-slate-500'
                      }`}
                  >
                    {statusOptions.filter(option => option !== 'New').map((status) => (
                      <option key={status} value={status}>
                        {status}
                      </option>
                    ))}
                  </select>
                </div>
                <button
                  onClick={onUpdate}
                  disabled={updating}
                  className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl disabled:opacity-50 disabled:cursor-not-allowed text-[11px] font-black uppercase tracking-widest shadow-lg shadow-emerald-500/20 whitespace-nowrap border border-emerald-500/50"
                >
                  {updating ? (
                    <Loader2 className="w-4 h-4" />
                  ) : (
                    <>
                      <Save className="w-4 h-4" />
                      UPDATE
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-slate-900/40 rounded-2xl p-6 mb-8 border border-white/5 shadow-lg">
        <h4 className="text-sm font-bold text-slate-500 uppercase tracking-tight mb-3">Description</h4>
        <p className="text-slate-100 leading-relaxed whitespace-pre-wrap break-words text-base tracking-tight font-medium font-sans">{ticket.description}</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-slate-900/40 rounded-2xl p-5 border border-white/5 hover:border-violet-500/20 group shadow-lg">
          <div className="flex items-center gap-3 mb-3">
            <Calendar className="w-4 h-4 text-violet-400" />
            <span className="text-xs text-slate-500 font-bold uppercase tracking-tight group-hover:text-violet-300">Created</span>
          </div>
          <p className="font-bold text-slate-100 text-base tracking-tight group-hover:text-white">
            {new Date(ticket.createdAt).toLocaleDateString()}
          </p>
          <p className="text-sm text-slate-500 mt-0.5 font-mono">
            {new Date(ticket.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </p>
        </div>
        {ticket.preferredVisitAt && (
          <div className="bg-blue-500/5 rounded-2xl p-5 border border-blue-500/10 hover:border-blue-500/30 group shadow-lg">
            <div className="flex items-center gap-3 mb-3">
              <Clock className="w-4 h-4 text-blue-400" />
              <span className="text-xs text-blue-500/60 font-bold uppercase tracking-tight group-hover:text-blue-400">Preferred</span>
            </div>
            <p className="font-bold text-blue-100 text-base tracking-tight group-hover:text-white">
              {new Date(ticket.preferredVisitAt).toLocaleDateString()}
            </p>
            <p className="text-sm text-blue-300/70 mt-0.5 font-mono">
              {new Date(ticket.preferredVisitAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </p>
          </div>
        )}
        {ticket.assignedVisitAt && (
          <div className="bg-emerald-500/5 rounded-2xl p-5 border border-emerald-500/10 hover:border-emerald-500/30 group shadow-lg">
            <div className="flex items-center gap-3 mb-3">
              <Clock className="w-4 h-4 text-emerald-400" />
              <span className="text-xs text-emerald-500/60 font-bold uppercase tracking-tight group-hover:text-emerald-400">Assigned</span>
            </div>
            <p className="font-bold text-emerald-100 text-base tracking-tight group-hover:text-white">
              {new Date(ticket.assignedVisitAt).toLocaleDateString()}
            </p>
            <p className="text-sm text-emerald-300/70 mt-0.5 font-mono">
              {new Date(ticket.assignedVisitAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </p>
          </div>
        )}
        {ticket.completedAt && (
          <div className="bg-slate-900/40 rounded-2xl p-5 border border-white/5 hover:border-slate-500/30 group shadow-lg">
            <div className="flex items-center gap-3 mb-3">
              <CheckCircle2 className="w-4 h-4 text-slate-400" />
              <span className="text-xs text-slate-500 font-bold uppercase tracking-tight group-hover:text-slate-300">Completed</span>
            </div>
            <p className="font-bold text-slate-200 text-base tracking-tight group-hover:text-white">
              {new Date(ticket.completedAt).toLocaleDateString()}
            </p>
            <p className="text-sm text-slate-400/70 mt-0.5 font-mono">
              {new Date(ticket.completedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default TicketHeader;

