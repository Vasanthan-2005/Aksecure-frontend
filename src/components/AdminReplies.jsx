import { useState, useEffect } from 'react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { MessageSquare, Clock, Check, Calendar } from 'lucide-react';
import LoadingState from './common/LoadingState';

const AdminReplies = ({ refreshKey = 0 }) => {
  const { user } = useAuth();
  const [adminReplies, setAdminReplies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [markingAsSeen, setMarkingAsSeen] = useState({});

  useEffect(() => {
    if (user) {
      fetchAdminReplies();
      const interval = setInterval(fetchAdminReplies, 2000);
      return () => clearInterval(interval);
    }
  }, [refreshKey, user]);

  const fetchAdminReplies = async () => {
    try {
      const [ticketsResponse, serviceRequestsResponse] = await Promise.all([
        api.get('/tickets'),
        api.get('/service-requests')
      ]);
      const tickets = Array.isArray(ticketsResponse.data) ? ticketsResponse.data : (ticketsResponse.data?.tickets || []);
      const serviceRequestsData = serviceRequestsResponse.data;
      const serviceRequests = Array.isArray(serviceRequestsData) ? serviceRequestsData : (serviceRequestsData?.requests || []);

      const unseenReplies = [];
      const userId = user?._id || user?.id;

      const collectReplies = (collection, type) => {
        if (!Array.isArray(collection)) return;
        (collection || []).forEach(entry => {
          if (entry.timeline && entry.timeline.length > 0) {
            entry.timeline.forEach((item, index) => {
              if (item.addedBy !== user.name) {
                const seenBy = item.seenBy || [];
                const isSeen = seenBy.some(seenUserId => {
                  const seenId = seenUserId._id || seenUserId;
                  return seenId.toString() === userId.toString();
                });

                if (!isSeen) {
                  unseenReplies.push({
                    ...item,
                    sourceType: type,
                    sourceId: entry._id,
                    publicId: type === 'ticket' ? entry.ticketId : entry.requestId,
                    title: entry.title,
                    category: entry.category,
                    status: entry.status,
                    createdAt: entry.createdAt,
                    assignedVisitAt: entry.assignedVisitAt,
                    preferredVisitAt: entry.preferredVisitAt,
                    preferredTimeSlot: entry.preferredTimeSlot,
                    timelineIndex: index
                  });
                }
              }
            });
          }
        });
      };

      collectReplies(tickets, 'ticket');
      collectReplies(serviceRequests, 'service-request');

      // Sort by date (newest first)
      unseenReplies.sort((a, b) => new Date(b.addedAt) - new Date(a.addedAt));
      setAdminReplies(unseenReplies);
      setError('');
    } catch (err) {
      setError('Failed to load admin replies');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleMarkAsSeen = async (reply, replyIndex) => {
    const key = `${reply.sourceType}-${reply.sourceId}-${reply.timelineIndex}`;
    setMarkingAsSeen(prev => ({ ...prev, [key]: true }));

    try {
      if (reply.sourceType === 'service-request') {
        await api.put(`/service-requests/${reply.sourceId}/replies/${reply.timelineIndex}/seen`);
      } else {
        await api.put(`/tickets/${reply.sourceId}/replies/${reply.timelineIndex}/seen`);
      }
      setAdminReplies(prev => prev.filter((_, index) => index !== replyIndex));
    } catch (err) {
      console.error('Failed to mark reply as seen:', err);
      alert('Failed to mark reply as seen');
    } finally {
      setMarkingAsSeen(prev => ({ ...prev, [key]: false }));
    }
  };

  if (loading) {
    return <LoadingState message="Retrieving Updates" />;
  }

  if (error) {
    return (
      <div className="text-center py-8 text-red-400">{error}</div>
    );
  }

  if (adminReplies.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="w-16 h-16 rounded-2xl bg-slate-900/50 border border-white/5 flex items-center justify-center mx-auto mb-4">
          <MessageSquare className="w-8 h-8 text-slate-500" />
        </div>
        <p className="text-white font-bold text-lg">All caught up!</p>
        <p className="text-sm text-slate-500 mt-1 max-w-xs mx-auto">
          No new messages from our support team. We'll notify you here once there's an update.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {adminReplies.map((reply, index) => {
        const key = `${reply.sourceType}-${reply.sourceId}-${reply.timelineIndex}`;
        const isMarking = markingAsSeen[key];
        const scheduledAt = reply.assignedVisitAt || reply.preferredVisitAt;

        const getSlotLabel = (isoString, fallbackSlot) => {
          if (fallbackSlot) return fallbackSlot;
          if (!isoString || isNaN(new Date(isoString).getTime())) return null;
          const hours = new Date(isoString).getHours();
          if (hours >= 9 && hours < 12) return 'Morning (9 AM – 12 PM)';
          if (hours >= 12 && hours < 15) return 'Afternoon (12 PM – 3 PM)';
          if (hours >= 15 && hours < 18) return 'Evening (3 PM – 6 PM)';
          return null;
        };
        const slotLabel = getSlotLabel(scheduledAt, reply.preferredTimeSlot);

        return (
          <div
            key={index}
            className="group relative overflow-hidden rounded-2xl border border-white/5 bg-slate-900/40 p-6 hover:bg-slate-800/60 transition-all duration-300 hover:shadow-2xl hover:border-blue-500/30"
          >
            <div className="absolute top-0 right-0 p-8 opacity-[0.03] pointer-events-none group-hover:opacity-[0.05] transition-opacity">
              <MessageSquare className="w-24 h-24 text-white" />
            </div>
            <div className="flex items-start gap-4 relative z-10">
              <div className="flex-shrink-0">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-600 to-violet-600 flex items-center justify-center shadow-lg shadow-blue-500/20">
                  <MessageSquare className="w-6 h-6 text-white" />
                </div>
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-3 mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="font-bold text-white group-hover:text-blue-400 transition-colors">
                        {reply.addedBy || 'Support Specialist'}
                      </span>
                      <span className="px-2 py-0.5 bg-blue-500/10 text-blue-400 border border-blue-500/20 rounded-full text-[10px] font-bold uppercase tracking-wider">
                        Official Team
                      </span>
                    </div>
                    <div className="text-sm">
                      <p className="font-semibold text-slate-300 mb-1">
                        Re: {reply.title}
                      </p>
                      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-500 font-mono">
                        <span className="uppercase">{reply.sourceType === 'ticket' ? 'Ticket' : 'Srv Req'} #{reply.publicId}</span>
                        <span>•</span>
                        <span>{reply.category}</span>
                      </div>
                      {scheduledAt && (
                        <div className="mt-3 inline-flex items-center gap-2 px-3 py-1.5 bg-amber-500/10 border border-amber-500/20 rounded-xl text-xs font-bold text-amber-500">
                          <Calendar className="w-3.5 h-3.5" />
                          <span>Scheduled: {new Date(scheduledAt).toLocaleString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric'
                          })}{slotLabel ? ` @ ${slotLabel}` : ''}</span>
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5 text-[10px] text-slate-500 font-medium whitespace-nowrap bg-slate-950/40 px-2 py-1 rounded-lg border border-white/5">
                    <Clock className="w-3 h-3" />
                    <span>{new Date(reply.addedAt).toLocaleString()}</span>
                  </div>
                </div>
                <div className="bg-slate-950/40 rounded-2xl p-5 border border-white/5 mb-4 group-hover:border-blue-500/10 transition-colors">
                  <p className="text-slate-400 text-sm whitespace-pre-wrap leading-relaxed">
                    {reply.note}
                  </p>
                </div>
                <button
                  onClick={() => handleMarkAsSeen(reply, index)}
                  disabled={isMarking}
                  className="inline-flex items-center gap-2 px-5 py-2.5 bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white rounded-xl border border-white/10 transition-all disabled:opacity-50 disabled:cursor-not-allowed text-xs font-bold uppercase tracking-wider"
                >
                  <Check className="w-4 h-4" />
                  {isMarking ? 'Acknowledging...' : 'Acknowledge Update'}
                </button>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default AdminReplies;
