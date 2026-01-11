import { useState, useEffect } from 'react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { MessageSquare, Clock, Check, Calendar } from 'lucide-react';

const AdminReplies = ({ refreshKey = 0 }) => {
  const { user } = useAuth();
  const [adminReplies, setAdminReplies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [markingAsSeen, setMarkingAsSeen] = useState({});

  useEffect(() => {
    if (user) {
      fetchAdminReplies();
    }
  }, [refreshKey, user]);

  const fetchAdminReplies = async () => {
    try {
      const [ticketsResponse, serviceRequestsResponse] = await Promise.all([
        api.get('/tickets'),
        api.get('/service-requests')
      ]);
      const tickets = ticketsResponse.data;
      const serviceRequests = serviceRequestsResponse.data;
      
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
    return (
      <div className="text-center py-8 text-slate-600">
        Loading admin replies...
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8 text-red-600">{error}</div>
    );
  }

  if (adminReplies.length === 0) {
    return (
      <div className="text-center py-8 text-slate-600">
        <MessageSquare className="w-12 h-12 mx-auto mb-3 text-slate-400" />
        <p className="text-slate-700 font-medium">No admin replies yet</p>
        <p className="text-sm text-slate-500 mt-1">
          You'll see replies from our admin team here once they respond to your tickets or service requests.
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
            className="bg-white rounded-xl border-2 border-blue-200 shadow-md p-6 hover:shadow-lg transition-shadow"
          >
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center ring-2 ring-blue-100">
                  <MessageSquare className="w-6 h-6 text-white" />
                </div>
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-3 mb-2">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-semibold text-blue-900">
                        {reply.addedBy}
                      </span>
                      <span className="px-2 py-0.5 bg-blue-100 text-blue-800 rounded-full text-xs font-medium">
                        Admin
                      </span>
                    </div>
                    <div className="text-sm text-slate-600 mb-3">
                      <p className="font-medium text-slate-900">
                        Replied to: {reply.title}
                      </p>
                      <p className="text-xs text-slate-500 mt-1">
                        {reply.sourceType === 'ticket' ? 'Ticket' : 'Service Request'} ID: {reply.publicId} • {reply.category}
                      </p>
                      {scheduledAt && (
                        <p className="text-xs text-blue-600 mt-1 font-semibold inline-flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          Scheduled: {new Date(scheduledAt).toLocaleString('en-US', {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric',
                            hour12: true
                          })}{slotLabel ? ` • ${slotLabel}` : ''}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5 text-xs text-slate-500 whitespace-nowrap">
                    <Clock className="w-3.5 h-3.5" />
                    <span>{new Date(reply.addedAt).toLocaleString()}</span>
                  </div>
                </div>
                <div className="bg-blue-50 rounded-lg p-4 border border-blue-200 mb-3">
                  <p className="text-slate-800 whitespace-pre-wrap leading-relaxed">
                    {reply.note}
                  </p>
                </div>
                <button
                  onClick={() => handleMarkAsSeen(reply, index)}
                  disabled={isMarking}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium"
                >
                  <Check className="w-4 h-4" />
                  {isMarking ? 'Marking...' : 'Mark as Seen'}
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
