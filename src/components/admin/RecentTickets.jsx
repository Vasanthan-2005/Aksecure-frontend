import { Clock, Calendar, Ticket } from 'lucide-react';
import { getStatusColor, getStatusIcon, getCategoryColor } from './utils.jsx';

const RecentTickets = ({ tickets, selectedTicket, onTicketClick }) => {
  if (!tickets || tickets.length === 0) return null;

  return (
    <div className="p-4 h-full flex flex-col">
      <div className="glass-card flex-1 flex flex-col bg-slate-900/60 backdrop-blur-xl border border-slate-700/50 rounded-2xl p-4 shadow-xl overflow-hidden relative">
        <div className="flex items-center justify-between mb-4 sticky top-0 z-10">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-amber-500/10 flex items-center justify-center border border-amber-500/20">
              <Clock className="w-4 h-4 text-amber-500" />
            </div>
            <h3 className="text-base font-bold text-white tracking-tight">Recent Tickets</h3>
          </div>
          <span className="px-2 py-0.5 bg-amber-500/10 text-amber-400 border border-amber-500/20 rounded-lg text-[10px] font-bold uppercase tracking-wider">
            Latest 5
          </span>
        </div>
        <div className="space-y-2 overflow-y-auto custom-scrollbar flex-1 pr-1">
          {tickets.map((ticket) => (
            <button
              key={ticket._id}
              onClick={() => onTicketClick(ticket)}
              className={`w-full text-left p-3 rounded-xl border transition-all group relative overflow-hidden ${selectedTicket?._id === ticket._id
                  ? 'bg-blue-600/10 border-blue-500/50 shadow-[0_0_15px_rgba(59,130,246,0.1)]'
                  : 'bg-slate-800/40 border-white/5 hover:border-blue-500/30 hover:bg-slate-800/60'
                }`}
            >
              {selectedTicket?._id === ticket._id && (
                <div className="absolute left-0 top-0 bottom-0 w-1 bg-blue-500" />
              )}
              <div className="flex items-start justify-between gap-2 mb-1.5 pl-2">
                <div className="flex-1 min-w-0">
                  <h4 className={`font-bold text-xs mb-0.5 line-clamp-1 transition-colors ${selectedTicket?._id === ticket._id ? 'text-white' : 'text-slate-200 group-hover:text-white'}`}>
                    {ticket.title}
                  </h4>
                  <p className="font-mono text-slate-500 text-[10px]">{ticket.ticketId}</p>
                </div>
                <span
                  className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md text-[10px] font-bold border flex-shrink-0 uppercase tracking-wider ${getStatusColor(
                    ticket.status
                  )}`}
                >
                  {getStatusIcon(ticket.status)}
                  {ticket.status === 'Open' ? 'New' : ticket.status}
                </span>
              </div>
              <div className="flex items-center justify-between gap-2 pt-2 border-t border-white/5 pl-2">
                <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold border uppercase tracking-wider ${getCategoryColor(ticket.category)}`}>
                  {ticket.category}
                </span>
                <div className="flex items-center gap-1 text-[10px] text-slate-500 font-medium">
                  <Calendar className="w-3 h-3" />
                  <span>{new Date(ticket.createdAt).toLocaleDateString()}</span>
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default RecentTickets;

