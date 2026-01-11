import { useState, useEffect, useCallback, useRef } from 'react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { X, Eye, Loader2 } from 'lucide-react';
import { useInView } from 'react-intersection-observer';

const statusStyles = {
  'New': 'bg-emerald-50 text-emerald-700',
  'In Progress': 'bg-blue-50 text-blue-700',
  'Completed': 'bg-green-50 text-green-700',
  'Closed': 'bg-slate-100 text-slate-700'
};

const ServiceRequestListUser = ({ onRefresh }) => {
  const { user } = useAuth();
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState('');
  const [selectedImage, setSelectedImage] = useState(null);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const observer = useRef();
  const lastRequestRef = useCallback(node => {
    if (loading) return;
    if (observer.current) observer.current.disconnect();
    observer.current = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting && hasMore) {
        setPage(prevPage => prevPage + 1);
      }
    });
    if (node) observer.current.observe(node);
  }, [loading, hasMore]);

  // Fetch requests with pagination and server-side filtering
  const fetchRequests = useCallback(async (isLoadMore = false) => {
    try {
      if (!isLoadMore) {
        setLoading(true);
        setRequests([]);
      } else {
        setIsRefreshing(true);
      }

      const currentPage = isLoadMore ? page + 1 : 1;
      const response = await api.get(`/service-requests?page=${currentPage}&limit=10`);
      
      const newRequests = Array.isArray(response.data?.requests) ? response.data.requests : [];
      
      setRequests(prevRequests => 
        isLoadMore ? [...prevRequests, ...newRequests] : newRequests
      );
      
      setHasMore(response.data?.hasMore || false);
      setError('');
      
      if (isLoadMore) {
        setPage(currentPage);
      } else {
        setPage(1);
      }

      if (isLoadMore && onRefresh) {
        onRefresh();
      }
    } catch (err) {
      setError('Failed to load service requests');
      console.error(err);
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  }, [page, user?._id, user?.role, onRefresh]);

  // Initial load and refresh effect
  useEffect(() => {
    fetchRequests(false);
  }, [fetchRequests]);

  // Auto-refresh effect
  useEffect(() => {
    if (!document.hidden) {
      const interval = setInterval(() => {
        fetchRequests(false);
      }, 30000);
      
      return () => clearInterval(interval);
    }
  }, [fetchRequests]);

  if (loading && !isRefreshing) {
    return (
      <div className="flex justify-center items-center py-12">
        <Loader2 className="w-8 h-8 text-purple-600 animate-spin" />
        <span className="ml-2 text-gray-600">Loading service requests...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8 text-red-600">
        {error}
        <button 
          onClick={() => fetchRequests(false)}
          className="ml-2 px-3 py-1 bg-purple-100 text-purple-700 rounded hover:bg-purple-200"
        >
          Retry
        </button>
      </div>
    );
  }

  if (requests.length === 0 && !loading) {
    return (
      <div className="text-center py-12">
        <div className="text-gray-500 mb-4">No service requests found</div>
        <button
          onClick={() => fetchRequests(false)}
          className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
        >
          Refresh
        </button>
      </div>
    );
  }

  const isAdminReply = (timelineItem) => {
    if (!user || !timelineItem) return false;
    return timelineItem.addedBy !== user.name;
  };

  const getAdminRepliesInfo = (request) => {
    if (!request.timeline || request.timeline.length === 0) {
      return { count: 0, hasReplies: false };
    }
    const adminReplies = request.timeline.filter(item => isAdminReply(item));
    return {
      count: adminReplies.length,
      hasReplies: adminReplies.length > 0,
      lastReply: adminReplies.length > 0 ? adminReplies[adminReplies.length - 1] : null
    };
  };

  return (
    <div className="space-y-4">
      {requests.map((request, index) => {
        const adminRepliesInfo = getAdminRepliesInfo(request);
        const baseUrl = import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:5000';

        const isLastRequest = index === requests.length - 1;
        return (
          <div 
            key={request._id} 
            ref={isLastRequest && hasMore ? lastRequestRef : null}
            className="bg-white rounded-lg shadow-md p-6 ring-2 ring-purple-400"
          >
            <div className="flex justify-between items-start mb-4">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="text-xl font-semibold text-gray-800">{request.title}</h3>
                  {adminRepliesInfo.hasReplies && (
                    <span className="inline-flex items-center gap-1 px-2 py-1 bg-purple-100 text-purple-800 rounded-full text-xs font-medium">
                      Admin Replied
                      {adminRepliesInfo.count > 1 && ` (${adminRepliesInfo.count})`}
                    </span>
                  )}
                </div>
                <p className="text-sm text-gray-600">Service ID: {request.requestId}</p>
              </div>
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${statusStyles[request.status] || 'bg-slate-100 text-slate-700'}`}>
                {request.status}
              </span>
            </div>

            <p className="text-gray-700 mb-4">{request.description}</p>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-gray-600 mb-4">
              <div>
                <span className="font-medium">Category:</span> {request.category}
              </div>
              <div>
                <span className="font-medium">Created:</span> {new Date(request.createdAt).toLocaleDateString()}
              </div>
              {request.preferredVisitAt && (
                <div>
                  <span className="font-medium">Preferred Visit:</span> {new Date(request.preferredVisitAt).toLocaleString()}
                </div>
              )}
              {request.assignedVisitAt && (
                <div>
                  <span className="font-medium">Scheduled Visit:</span> {new Date(request.assignedVisitAt).toLocaleString()}
                </div>
              )}
            </div>

            {request.images && request.images.length > 0 && (
              <div className="mb-4">
                <p className="text-sm font-medium text-gray-700 mb-2">Images:</p>
                <div className="flex gap-2 flex-wrap">
                  {request.images.map((image, index) => {
                    const imageUrl = image.startsWith('http') ? image : `${baseUrl}${image}`;
                    return (
                      <div key={index} className="relative group cursor-pointer" onClick={() => setSelectedImage(imageUrl)}>
                        <img
                          src={imageUrl}
                          alt={`Service request image ${index + 1}`}
                          className="w-24 h-24 object-cover rounded-lg border border-gray-300 hover:border-purple-400 transition-all"
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

            {request.timeline && request.timeline.length > 0 && (() => {
              const adminReplies = request.timeline.filter(item => isAdminReply(item));
              if (adminReplies.length === 0) return null;
              
              return (
                <div className="mt-4 pt-4 border-t border-gray-200">
                  <p className="text-sm font-medium text-gray-700 mb-2">Admin Replies:</p>
                  <div className="space-y-2">
                    {adminReplies.map((item, index) => (
                      <div
                        key={index}
                        className="text-sm p-3 rounded-lg bg-purple-50 border border-purple-200"
                      >
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-medium text-purple-900">
                            {item.addedBy}
                          </span>
                          <span className="text-xs px-2 py-0.5 bg-purple-200 text-purple-800 rounded-full font-medium">
                            Admin
                          </span>
                        </div>
                        <p className="text-purple-800">
                          {item.note}
                        </p>
                        <span className="text-xs mt-1 block text-purple-600">
                          {new Date(item.addedAt).toLocaleString()}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })()}
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
          <Loader2 className="w-6 h-6 text-purple-600 animate-spin" />
        </div>
      )}
      
      {!hasMore && requests.length > 0 && (
        <div className="text-center py-4 text-sm text-gray-500">
          No more requests to load
        </div>
      )}
    </div>
  );
};

export default ServiceRequestListUser;
