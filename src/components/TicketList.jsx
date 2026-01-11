import { useState, useEffect, useCallback, useRef } from 'react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { Eye, Loader2, RefreshCw } from 'lucide-react';
import { useInView } from 'react-intersection-observer';
import { toast } from 'react-toastify';

const TicketList = ({ onRefresh }) => {
  const { user } = useAuth();
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedImage, setSelectedImage] = useState(null);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const observer = useRef();
  const lastTicketRef = useCallback(node => {
    if (loading) return;
    if (observer.current) observer.current.disconnect();
    observer.current = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting && hasMore) {
        setPage(prevPage => prevPage + 1);
      }
    });
    if (node) observer.current.observe(node);
  }, [loading, hasMore]);

  // Fetch tickets with pagination and server-side filtering
  const fetchTickets = useCallback(async (isLoadMore = false) => {
    try {
      if (!isLoadMore) {
        setLoading(true);
        setTickets([]);
        setError('');
      } else {
        setIsRefreshing(true);
      }

      const currentPage = isLoadMore ? page + 1 : 1;
      
      // First, try to get tickets from the /tickets endpoint
      let response;
      try {
        response = await api.get('/tickets');
        
        // If we get an array, use it directly
        if (Array.isArray(response.data)) {
          const newTickets = response.data;
          setTickets(prevTickets => isLoadMore ? [...prevTickets, ...newTickets] : newTickets);
          setHasMore(newTickets.length === 10);
        } 
        // If we get an object with a tickets array
        else if (response.data && Array.isArray(response.data.tickets)) {
          const newTickets = response.data.tickets;
          setTickets(prevTickets => isLoadMore ? [...prevTickets, ...newTickets] : newTickets);
          setHasMore(response.data.hasMore || false);
        } 
        // If the response is in an unexpected format
        else {
          console.warn('Unexpected response format:', response.data);
          setTickets([]);
          setHasMore(false);
        }
      } catch (err) {
        console.error('Error fetching tickets:', err);
        throw err;
      }
      
      if (isLoadMore) {
        setPage(currentPage);
      }
    } catch (err) {
      console.error('Error in fetchTickets:', err);
      const errorMessage = err.response?.data?.message || 'Failed to load tickets. Please try again.';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  }, [page]);

  // Initial load and refresh effect
  useEffect(() => {
    fetchTickets(false);
  }, [fetchTickets]);

  // Initial load
  useEffect(() => {
    fetchTickets(false);
  }, [fetchTickets]);

  if (loading && !isRefreshing) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <Loader2 className="w-8 h-8 text-blue-600 animate-spin mb-2" />
        <span className="text-gray-600">Loading tickets...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8 text-red-600">
        {error}
        <button 
          onClick={() => fetchTickets(false)}
          className="ml-2 px-3 py-1 bg-blue-100 text-blue-700 rounded hover:bg-blue-200"
        >
          Retry
        </button>
      </div>
    );
  }

  if (tickets.length === 0 && !loading) {
    return (
      <div className="text-center py-12">
        <div className="text-gray-500 mb-4">
          {error ? (
            <div className="text-red-500 mb-4">{error}</div>
          ) : (
            <div>No tickets found</div>
          )}
        </div>
        <button
          onClick={() => fetchTickets(false)}
          className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          disabled={isRefreshing}
        >
          {isRefreshing ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Refreshing...
            </>
          ) : (
            <>
              <RefreshCw className="w-4 h-4" />
              Refresh
            </>
          )}
        </button>
      </div>
    );
  }

  const getStatusColor = (status) => {
    const statusMap = {
      'New': 'bg-emerald-100 text-emerald-800',
      'In Progress': 'bg-blue-100 text-blue-800',
      'Closed': 'bg-slate-100 text-slate-800',
      'Open': 'bg-emerald-100 text-emerald-800',
      'Completed': 'bg-green-100 text-green-800'
    };
    return statusMap[status] || 'bg-gray-100 text-gray-800';
  };

  const isAdminReply = (timelineItem) => {
    if (!user || !timelineItem) return false;
    return timelineItem.addedBy !== user.name;
  };

  const getAdminRepliesInfo = (ticket) => {
    if (!ticket.timeline || ticket.timeline.length === 0) {
      return { count: 0, hasReplies: false };
    }
    const adminReplies = ticket.timeline.filter(item => isAdminReply(item));
    return {
      count: adminReplies.length,
      hasReplies: adminReplies.length > 0,
      lastReply: adminReplies.length > 0 ? adminReplies[adminReplies.length - 1] : null
    };
  };

  return (
    <div className="space-y-4">
      {tickets.map((ticket, index) => {
        const adminRepliesInfo = getAdminRepliesInfo(ticket);
        const isLastTicket = index === tickets.length - 1;
        const adminReplies = ticket.timeline ? ticket.timeline.filter(item => isAdminReply(item)) : [];
        
        return (
          <div 
            key={ticket._id} 
            ref={isLastTicket && hasMore ? lastTicketRef : null}
            className="bg-white rounded-xl shadow-sm p-6 ring-2 ring-purple-400 hover:shadow-md transition-shadow duration-200"
          >
            <div className="flex justify-between items-start mb-4">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="text-xl font-semibold text-gray-800">{ticket.title}</h3>
                  {adminRepliesInfo.hasReplies && (
                    <span className="inline-flex items-center gap-1 px-2 py-1 bg-purple-100 text-purple-800 rounded-full text-xs font-medium">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-3 w-3"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6"
                        />
                      </svg>
                      Admin Replied
                      {adminRepliesInfo.count > 1 && ` (${adminRepliesInfo.count})`}
                    </span>
                  )}
                </div>
                <p className="text-sm text-gray-600">Ticket ID: {ticket.ticketId}</p>
              </div>
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(ticket.status)}`}>
                {ticket.status === 'Open' ? 'New' : ticket.status}
              </span>
            </div>

            <p className="text-gray-700 mb-4">{ticket.description}</p>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-gray-600 mb-4">
              <div>
                <span className="font-medium">Category:</span> {ticket.category || 'N/A'}
              </div>
              <div>
                <span className="font-medium">Created:</span> {new Date(ticket.createdAt).toLocaleDateString()}
              </div>
              {ticket.preferredVisitAt ? (
                <div>
                  <span className="font-medium">Preferred Visit:</span> {new Date(ticket.preferredVisitAt).toLocaleString()}
                </div>
              ) : (
                <div>
                  <span className="font-medium">Preferred Visit:</span> Not specified
                </div>
              )}
              {ticket.assignedVisitAt ? (
                <div>
                  <span className="font-medium">Scheduled Visit:</span> {new Date(ticket.assignedVisitAt).toLocaleString()}
                </div>
              ) : (
                <div>
                  <span className="font-medium">Scheduled Visit:</span> Not scheduled
                </div>
              )}
            </div>

            {ticket.images && ticket.images.length > 0 && (
              <div className="mb-4">
                <p className="text-sm font-medium text-gray-700 mb-2">Images:</p>
                <div className="flex gap-3 flex-wrap">
                  {ticket.images.map((image, index) => {
                    const imageUrl = image.startsWith('http') 
                      ? image 
                      : `${import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:5000'}${image}`;
                    return (
                      <div key={index} className="relative group cursor-pointer" onClick={() => setSelectedImage(imageUrl)}>
                        <img
                          src={imageUrl}
                          alt={`Ticket image ${index + 1}`}
                          className="w-24 h-24 object-cover rounded-lg border-2 border-gray-200 hover:border-purple-400 transition-all"
                        />
                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all rounded-lg flex items-center justify-center">
                          <Eye className="w-5 h-5 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {adminReplies.length > 0 && (
              <div className="mt-4 pt-4 border-t border-gray-200">
                <p className="text-sm font-medium text-gray-700 mb-2">Admin Replies:</p>
                <div className="space-y-3">
                  {adminReplies.map((item, index) => (
                    <div
                      key={index}
                      className="text-sm p-4 rounded-lg bg-purple-50 border border-purple-100 shadow-sm"
                    >
                      <div className="flex items-start gap-3">
                        <div className="bg-purple-100 p-1.5 rounded-full">
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-5 w-5 text-purple-600"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                            />
                          </svg>
                        </div>
                        <div className="flex-1">
                          <div className="flex flex-wrap items-center gap-2 mb-1">
                            <span className="font-medium text-purple-900">
                              {item.addedBy}
                            </span>
                            <span className="text-xs px-2 py-0.5 bg-purple-100 text-purple-800 rounded-full font-medium">
                              Admin
                            </span>
                            <span className="text-xs text-purple-600 ml-auto">
                              {new Date(item.addedAt).toLocaleString()}
                            </span>
                          </div>
                          <p className="text-purple-800 mt-1">
                            {item.note}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        );
      })}

      {selectedImage && (
        <div 
          className="fixed inset-0 bg-black/95 z-[9999] flex items-center justify-center p-4"
          onClick={() => setSelectedImage(null)}
        >
          <div className="relative w-full h-full flex items-center justify-center">
            <button
              onClick={() => setSelectedImage(null)}
              className="absolute top-4 right-4 z-10 w-12 h-12 flex items-center justify-center bg-white/10 hover:bg-white/20 text-white rounded-full transition-all backdrop-blur-sm"
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
      
      {isRefreshing && (
        <div className="flex justify-center py-4">
          <Loader2 className="w-6 h-6 text-blue-600 animate-spin" />
        </div>
      )}
      
      {!hasMore && tickets.length > 0 && (
        <div className="text-center py-4 text-sm text-gray-500">
          No more tickets to load
        </div>
      )}
    </div>
  );
};

export default TicketList;

