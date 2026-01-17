import { Filter, AlertCircle, Calendar, Eye, X, Image as ImageIcon, Home, Trash2 } from 'lucide-react';
import { getStatusColor, getStatusIcon, getCategoryColor, getTicketStats, getStatusBorderColor, statusOptions } from './utils.jsx';
import TicketStats from './TicketStats';
import { useState } from 'react';
import SkeletonLoader from '../common/SkeletonLoader';

const TicketListPanel = ({
  tickets,
  searchTerm,
  setSearchTerm,
  statusFilter,
  setStatusFilter,
  selectedTicket,
  onTicketClick,
  error,
  onBackToDashboard,
  onRefresh,
  onDelete,
  loading
}) => {
  const [selectedImage, setSelectedImage] = useState(null);
  const filteredTickets = tickets.filter((ticket) => {
    const matchesSearch =
      ticket.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ticket.ticketId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ticket.description.toLowerCase().includes(searchTerm.toLowerCase());
    const normalizedStatus = ticket.status === 'Open' ? 'New' : ticket.status;
    const matchesStatus = statusFilter === 'All' || ticket.status === statusFilter || normalizedStatus === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const stats = getTicketStats(tickets);

  return (
    <div className="flex flex-col w-96 border-r border-white/5 bg-slate-900/50 backdrop-blur-sm relative z-20">
      <div className="p-4 border-b border-white/5 bg-slate-900/50 backdrop-blur-md sticky top-0 z-10 w-full">
        {onBackToDashboard && (
          <div className="mb-4">
            <button
              onClick={onBackToDashboard}
              className="flex items-center gap-2 px-3 py-1.5 text-xs font-semibold text-slate-400 hover:text-white hover:bg-white/5 rounded-lg border border-transparent hover:border-white/10"
            >
              <Home className="w-3.5 h-3.5" />
              Dashboard
            </button>
          </div>
        )}
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold text-white tracking-tight">All Tickets</h2>
          <div className="flex items-center gap-2">
            {onRefresh && (
              <button
                onClick={onRefresh}
                className="flex items-center gap-2 p-2 bg-slate-800 text-slate-300 hover:text-white rounded-xl hover:bg-slate-700 border border-slate-700 hover:border-slate-600"
                title="Refresh Data"
              >
                <AlertCircle className="w-4 h-4" />
              </button>
            )}
            <span className="px-2.5 py-0.5 bg-blue-500/10 text-blue-400 border border-blue-500/20 rounded-lg text-xs font-bold">
              {tickets.length}
            </span>
          </div>
        </div>

        <div className="mt-4 mb-2">
          <div className="flex items-center gap-2 mb-3 px-1">
            <div className="w-1 h-3 rounded-full bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.5)]"></div>
            <h3 className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Overview</h3>
          </div>
          <TicketStats stats={stats} showPercentage={false} showIcon={false} />
        </div>

        <div className="mt-4">
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-violet-400 flex-shrink-0" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="flex-1 px-3 py-2 bg-slate-800/50 border border-slate-700 rounded-xl focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500/50 text-xs text-slate-200 focus:outline-none appearance-none cursor-pointer hover:bg-slate-800"
            >
              <option value="All">All Status</option>
              {statusOptions.map((status) => (
                <option key={status} value={status}>
                  {status}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="mt-2 text-xs text-slate-500 font-medium px-1">
          <span className="text-slate-300 font-bold">{filteredTickets.length}</span> ticket{filteredTickets.length !== 1 ? 's' : ''} found
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar">
        {error && (
          <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-sm text-center">
            {error}
          </div>
        )}

        {loading ? (
          // Skeleton Loading State
          Array.from({ length: 5 }).map((_, index) => (
            <div
              key={index}
              className="w-full p-4 rounded-xl border border-white/5 bg-slate-900/40 relative overflow-hidden"
            >
              <div className="flex items-start justify-between gap-2 mb-2 pl-2">
                <div className="flex-1">
                  <SkeletonLoader variant="text" width="60%" className="mb-2" />
                  <SkeletonLoader variant="text" width="30%" height="10px" />
                </div>
                <SkeletonLoader variant="rectangular" width="60px" height="20px" />
              </div>
              <div className="pl-2 mb-3">
                <SkeletonLoader variant="text" width="90%" height="12px" className="mb-1" />
                <SkeletonLoader variant="text" width="70%" height="12px" />
              </div>
              <div className="flex items-center justify-between gap-2 pt-3 border-t border-white/5 pl-2">
                <SkeletonLoader variant="rectangular" width="80px" height="16px" />
                <SkeletonLoader variant="text" width="100px" height="12px" />
              </div>
            </div>
          ))
        ) : filteredTickets.length === 0 ? (
          <div className="text-center py-12 px-4">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-slate-800/50 flex items-center justify-center border border-white/5">
              <AlertCircle className="w-8 h-8 text-slate-600" />
            </div>
            <p className="text-slate-400 font-medium mb-1">
              {searchTerm || statusFilter !== 'All'
                ? 'No tickets match your filters'
                : 'No tickets found'}
            </p>
            <p className="text-xs text-slate-600 mt-1">
              {searchTerm || statusFilter !== 'All'
                ? 'Try adjusting your search or filter criteria'
                : 'Tickets will appear here once created'}
            </p>
          </div>
        ) : (
          filteredTickets.map((ticket) => (
            <button
              key={ticket._id}
              onClick={() => onTicketClick(ticket)}
              className={`w-full text-left p-4 rounded-xl border group relative overflow-hidden ${getStatusBorderColor(ticket.status)} ${selectedTicket?._id === ticket._id
                ? 'ring-2 ring-blue-500 ring-offset-2 ring-offset-slate-900 border-blue-500 shadow-[0_0_20px_rgba(59,130,246,0.2)]'
                : 'hover:border-white/20 hover:bg-white/5'
                }`}
            >
              {selectedTicket?._id === ticket._id && (
                <div className="absolute left-0 top-0 bottom-0 w-1 bg-blue-500" />
              )}
              <div className="flex items-start justify-between gap-2 mb-2 pl-2">
                <div className="flex-1 min-w-0">
                  <h3 className={`font-bold text-base mb-1 line-clamp-1 ${selectedTicket?._id === ticket._id ? 'text-white' : 'text-slate-300 group-hover:text-white'
                    }`}>
                    {ticket.title}
                  </h3>
                  <p className="text-[10px] font-mono text-slate-500">{ticket.ticketId}</p>
                </div>
                <span
                  className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-lg text-[10px] font-bold border flex-shrink-0 ${getStatusColor(
                    ticket.status
                  )}`}
                >
                  {getStatusIcon(ticket.status)}
                  {ticket.status === 'Open' ? 'New' : ticket.status}
                </span>
              </div>

              <div className="pl-2 mb-3">
                <p className="text-sm text-slate-400 line-clamp-2 leading-relaxed group-hover:text-slate-300">
                  {ticket.description}
                </p>
              </div>

              {ticket.images && ticket.images.length > 0 && (
                <div className="mb-3 pl-2 flex gap-2 flex-wrap">
                  {ticket.images.slice(0, 3).map((image, imgIndex) => {
                    const baseUrl = import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:5000';
                    const imageUrl = image.startsWith('http')
                      ? image
                      : `${baseUrl}${image}`;
                    return (
                      <div
                        key={imgIndex}
                        className="relative group/image cursor-pointer"
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedImage(imageUrl);
                        }}
                      >
                        <img
                          src={imageUrl}
                          alt={`Ticket image ${imgIndex + 1}`}
                          className="w-10 h-10 object-cover rounded-lg border border-white/10 group-hover/image:border-white/30"
                        />
                        <div className="absolute inset-0 bg-black/0 group-hover/image:bg-black/30 rounded-lg flex items-center justify-center">
                          <Eye className="w-3 h-3 text-white opacity-0 group-hover/image:opacity-100" />
                        </div>
                      </div>
                    );
                  })}
                  {ticket.images.length > 3 && (
                    <div className="w-10 h-10 rounded-lg border border-white/10 bg-slate-800 flex items-center justify-center text-[10px] font-bold text-slate-400">
                      +{ticket.images.length - 3}
                    </div>
                  )}
                </div>
              )}

              <div className="flex items-center justify-between gap-2 pt-3 border-t border-white/5 pl-2">
                <span className={`px-2 py-0.5 rounded-md text-[10px] uppercase font-bold border ${getCategoryColor(ticket.category)}`}>
                  {ticket.category}
                </span>
                <div className="flex items-center gap-1.5 text-[10px] text-slate-500 font-medium">
                  <Calendar className="w-3 h-3 flex-shrink-0" />
                  <span>{new Date(ticket.createdAt).toLocaleDateString()}</span>
                  {onDelete && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onDelete(ticket);
                      }}
                      className="ml-2 p-1.5 text-red-400 hover:text-red-300 bg-red-500/10 hover:bg-red-500/20 rounded-lg border border-red-500/20 hover:border-red-500/40"
                      title="Delete ticket"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>
            </button>
          ))
        )}
      </div>

      {selectedImage && (
        <div
          className="fixed inset-0 bg-black/95 z-[9999] flex items-center justify-center p-4 backdrop-blur-xl"
          onClick={() => setSelectedImage(null)}
        >
          <div className="relative w-full h-full flex items-center justify-center">
            <button
              onClick={() => setSelectedImage(null)}
              className="absolute top-4 right-4 z-10 w-12 h-12 flex items-center justify-center bg-white/10 hover:bg-white/20 text-white rounded-full backdrop-blur-sm"
              aria-label="Close"
            >
              <X className="w-6 h-6" />
            </button>
            <img
              src={selectedImage}
              alt="Full size"
              className="max-w-full max-h-full object-contain rounded-lg shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default TicketListPanel;
