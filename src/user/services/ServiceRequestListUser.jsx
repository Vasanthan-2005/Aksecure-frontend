import { useState, useEffect, useCallback, useRef } from 'react';
import { createPortal } from 'react-dom';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { X, Eye, Loader2, ChevronLeft, ChevronRight, Trash2, Calendar, Clock, MessageSquare, Tag, IndianRupee } from 'lucide-react';
import { getStatusColor, getStatusBorderColor, getCategoryColor, getStatusIcon } from '../../admin/utils';
import { useInView } from 'react-intersection-observer';
import { toast } from 'react-toastify';
import LoadingState from '../../common/components/LoadingState';
import ImageViewer from '../../common/components/ImageViewer';
import PriceTableModal from '../../common/dialogs/PriceTableModal';

// use imported getStatusColor instead

const ServiceRequestListUser = ({ onRefresh }) => {
  const { user } = useAuth();
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState('');
  const [selectedImage, setSelectedImage] = useState(null);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [requestToDelete, setRequestToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedQuote, setSelectedQuote] = useState(null);
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
      }, 60000); // Optimized for performance (60s)

      return () => clearInterval(interval);
    }
  }, [fetchRequests]);

  // Handle ESC key to close modal
  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === 'Escape') setSelectedImage(null);
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, []);

  // Scroll lock for image modal
  useEffect(() => {
    if (selectedImage || showDeleteModal) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [selectedImage, showDeleteModal]);

  if (loading && !isRefreshing) {
    return <LoadingState message="Loading service requests" />;
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

  const handleDeleteRequest = async () => {
    if (!requestToDelete) return;

    setIsDeleting(true);
    try {
      await api.delete(`/service-requests/${requestToDelete._id}`);
      // Remove the deleted request from the list
      setRequests(prevRequests =>
        prevRequests.filter(req => req._id !== requestToDelete._id)
      );
      toast.success('Service request deleted successfully');
      setShowDeleteModal(false);
      setRequestToDelete(null);
    } catch (err) {
      console.error('Error deleting service request:', err);
      toast.error(err.response?.data?.message || 'Failed to delete service request');
    } finally {
      setIsDeleting(false);
    }
  };


  return (
    <div className="space-y-4">
      {requests.map((request, index) => {
        const adminRepliesInfo = getAdminRepliesInfo(request);
        const baseUrl = import.meta.env.VITE_API_URL?.replace(/\/api\/?$/, '') || 'http://localhost:5000';

        const isLastRequest = index === requests.length - 1;
        return (
          <div
            key={request._id}
            ref={isLastRequest && hasMore ? lastRequestRef : null}
            className={`group relative overflow-hidden rounded-2xl border transition-all duration-300 hover:shadow-2xl hover:-translate-y-1 ${getStatusBorderColor(request.status)}`}
          >
            {/* Status accent line */}
            <div className={`absolute top-0 left-0 bottom-0 w-1 ${request.status === 'New' || request.status === 'Open' ? 'bg-amber-500' : request.status === 'In Progress' ? 'bg-blue-500' : 'bg-green-500'}`}></div>

            <div className="p-4 sm:p-5">
              <div className="flex flex-col sm:flex-row justify-between items-start gap-4 mb-4 sm:mb-6">
                <div className="flex-1 min-w-0 w-full">
                  <div className="flex items-start sm:items-center justify-between sm:justify-start gap-2 sm:gap-3 mb-2 sm:mb-1">
                    <h3 className="text-lg sm:text-xl font-bold text-white group-hover:text-blue-400 transition-colors leading-tight break-words flex-1">
                      {request.title}
                    </h3>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setRequestToDelete(request);
                        setShowDeleteModal(true);
                      }}
                      className="p-1.5 text-red-500 hover:bg-red-400/10 rounded-xl transition-all border border-transparent hover:border-red-400/20 sm:hidden"
                      title="Delete request"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="flex items-center gap-2 mb-3 flex-wrap">
                    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[8px] font-bold border uppercase tracking-wider ${getStatusColor(request.status)}`}>
                      {getStatusIcon(request.status)}
                      {request.status}
                    </span>
                    {adminRepliesInfo.hasReplies && (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-violet-500/10 text-violet-400 border border-violet-500/20 rounded-full text-[8px] font-bold uppercase tracking-wider">
                        <MessageSquare className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
                        {adminRepliesInfo.count} {adminRepliesInfo.count === 1 ? 'Reply' : 'Replies'}
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-3 sm:gap-4 text-[9px] sm:text-[10px] text-slate-500 font-mono text-uppercase">
                    <span>{request.requestId}</span>
                    <span className="flex items-center gap-1">
                      <Calendar className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
                      {new Date(request.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setRequestToDelete(request);
                    setShowDeleteModal(true);
                  }}
                  className="hidden sm:block p-1.5 sm:p-2 text-red-500 hover:bg-red-400/10 rounded-xl transition-all border border-transparent hover:border-red-400/20 self-start"
                  title="Delete request"
                >
                  <Trash2 className="w-4 h-4 sm:w-5 sm:h-5" />
                </button>
              </div>

              <p className="text-slate-400 text-sm leading-relaxed mb-4 whitespace-pre-wrap">
                {request.description}
              </p>

              <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-3 p-2.5 sm:p-3 rounded-xl bg-slate-900/40 border border-white/5 mb-5">
                <div className="space-y-0.5 sm:space-y-1">
                  <p className="text-[9px] sm:text-[10px] font-bold text-slate-500 uppercase tracking-wider">Category</p>
                  <p className={`text-[11px] sm:text-xs font-semibold ${getCategoryColor(request.category)}`}>
                    {request.category || 'General'}
                  </p>
                </div>
                <div className="space-y-0.5 sm:space-y-1">
                  <p className="text-[9px] sm:text-[10px] font-bold text-slate-500 uppercase tracking-wider">Created At</p>
                  <p className="text-[11px] sm:text-xs font-semibold text-slate-300">
                    {new Date(request.createdAt).toLocaleDateString()}
                  </p>
                </div>

                {request.assignedVisitAt && (
                  <div className="space-y-0.5 sm:space-y-1">
                    <p className="text-[9px] sm:text-[10px] font-bold text-slate-500 uppercase tracking-wider">Scheduled Visit</p>
                    <p className="text-[11px] sm:text-xs font-semibold text-blue-400">
                      {new Date(request.assignedVisitAt).toLocaleDateString()}
                    </p>
                  </div>
                )}
              </div>

              {request.images && request.images.length > 0 && (
                <div className="mb-6">
                  <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-3">Service Attachments</p>
                  <div className="flex gap-3 flex-wrap">
                    {request.images.map((image, index) => {
                      const imageUrl = image.startsWith('http') ? image : `${baseUrl}${image.startsWith('/') ? '' : '/'}${image}`;
                      return (
                        <div
                          key={index}
                          className="relative group/img cursor-pointer"
                          onClick={() => {
                            const allImageUrls = request.images.map(img =>
                              img.startsWith('http') ? img : `${baseUrl}${img.startsWith('/') ? '' : '/'}${img}`
                            );
                            setSelectedImage({
                              url: imageUrl,
                              index: index,
                              allImages: allImageUrls
                            });
                          }}
                        >
                          <img
                            src={imageUrl}
                            alt={`Service request image ${index + 1}`}
                            className="w-24 h-24 object-cover rounded-xl border border-white/10 group-hover/img:border-blue-500/50 transition-all"
                          />
                          <div className="absolute inset-0 bg-blue-600/20 opacity-0 group-hover/img:opacity-100 transition-opacity rounded-xl flex items-center justify-center">
                            <Eye className="w-5 h-5 text-white" />
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
                  <div className="mt-6 pt-6 border-t border-white/5 space-y-4">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-1.5 h-4 bg-violet-500 rounded-full shadow-[0_0_10px_rgba(139,92,246,0.5)]"></div>
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Admin Support Activity</p>
                    </div>
                    <div className="space-y-4">
                      {adminReplies.map((item, index) => {
                        const images = item.images || [];
                        return (
                          <div key={index} className="bg-white/[0.02] border border-white/5 rounded-2xl p-5 relative overflow-hidden group/reply">
                            <div className="absolute top-0 right-0 p-4 opacity-[0.03] pointer-events-none group-hover/reply:opacity-[0.05] transition-opacity">
                              <MessageSquare className="w-12 h-12 text-white" />
                            </div>
                            <div className="flex items-start gap-4">
                              <div className="flex-shrink-0">
                                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-600 to-indigo-600 flex items-center justify-center shadow-lg shadow-violet-500/10">
                                  <span className="text-white font-bold text-xs">A</span>
                                </div>
                              </div>
                              <div className="flex-1">
                                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 sm:gap-2 mb-2 sm:mb-3">
                                  <p className="text-sm font-bold text-white group-hover/reply:text-violet-400 transition-colors">
                                    {(item.addedBy && item.addedBy.toLowerCase().includes('sivadass')) ? 'Admin Team' : (item.addedBy || 'Support Team')}
                                  </p>
                                  <div className="flex items-center gap-1 text-[9px] sm:text-[10px] text-slate-500 font-medium">
                                    <Clock className="w-3 h-3" />
                                    {new Date(item.addedAt).toLocaleString('en-IN', {
                                      dateStyle: 'short',
                                      timeStyle: 'short'
                                    })}
                                  </div>
                                </div>
                                <p className="text-sm text-slate-400 leading-relaxed mb-4">{item.note}</p>

                                {images.length > 0 && (
                                  <div className="mt-3 grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-5 gap-3">
                                    {images.map((image, imgIndex) => {
                                      const imageUrl = image.startsWith('http') ? image : `${baseUrl}${image.startsWith('/') ? '' : '/'}${image}`;
                                      return (
                                        <div
                                          key={imgIndex}
                                          className="relative group/replyimg cursor-pointer"
                                          onClick={() => {
                                            const allImageUrls = images.map(img => img.startsWith('http') ? img : `${baseUrl}${img.startsWith('/') ? '' : '/'}${img}`);
                                            setSelectedImage({ url: imageUrl, index: imgIndex, allImages: allImageUrls });
                                          }}
                                        >
                                          <img
                                            src={imageUrl}
                                            alt={`Admin attachment ${imgIndex + 1}`}
                                            className="w-full h-20 object-cover rounded-xl border border-white/10 group-hover/replyimg:border-violet-500/50 transition-all"
                                          />
                                          <div className="absolute inset-0 bg-violet-600/20 opacity-0 group-hover/replyimg:opacity-100 transition-opacity rounded-xl flex items-center justify-center">
                                            <Eye className="w-4 h-4 text-white" />
                                          </div>
                                        </div>
                                      );
                                    })}
                                  </div>
                                )}
                                {item.priceList && item.priceList.length > 0 && (
                                  <div className="mt-4 pt-4 border-t border-white/5">
                                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                                      <div className="flex items-center gap-2">
                                        <div className="w-7 h-7 rounded-lg bg-emerald-500/10 flex items-center justify-center">
                                          <IndianRupee className="w-3.5 h-3.5 text-emerald-400" />
                                        </div>
                                        <div className="flex flex-col">
                                          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider leading-tight">Quotation Available</span>
                                          <span className="text-[9px] text-slate-500 uppercase tracking-tighter">Fixed Price Estimate</span>
                                        </div>
                                      </div>
                                      <button
                                        type="button"
                                        onClick={() => setSelectedQuote({ items: item.priceList, total: item.totalPrice })}
                                        className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-4 py-2.5 sm:py-2 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/20 rounded-xl text-xs font-bold transition-all active:scale-95"
                                      >
                                        <IndianRupee className="w-3.5 h-3.5" />
                                        View Estimated Bill
                                      </button>
                                    </div>
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })()}
            </div>
          </div>
        );
      })}

      {/* Quote Modal */}
      <PriceTableModal
        isOpen={!!selectedQuote}
        onClose={() => setSelectedQuote(null)}
        items={selectedQuote?.items}
        totalPrice={selectedQuote?.total}
      />

      {selectedImage && (
        <ImageViewer
          images={selectedImage.allImages}
          initialIndex={selectedImage.index}
          onClose={() => setSelectedImage(null)}
        />
      )}

      {
        isRefreshing && (
          <div className="flex justify-center py-4">
            <Loader2 className="w-6 h-6 text-purple-600 animate-spin" />
          </div>
        )
      }

      {
        !hasMore && requests.length > 0 && (
          <div className="text-center py-4 text-sm text-gray-500">
            No more requests to load
          </div>
        )
      }

      {
        showDeleteModal && requestToDelete && createPortal(
          <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/80 backdrop-blur-md p-4 animate-fade-in">
            <div className="bg-slate-900 rounded-3xl shadow-2xl max-w-lg w-full border border-white/10 p-8 relative overflow-hidden animate-scale-in">
              <div className="absolute top-0 right-0 p-12 opacity-[0.02] pointer-events-none">
                <Trash2 className="w-32 h-32 text-white" />
              </div>

              <div className="relative z-10">
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-12 h-12 rounded-2xl bg-red-500/10 border border-red-500/20 flex items-center justify-center shadow-lg shadow-red-500/5">
                    <Trash2 className="w-6 h-6 text-red-400" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-white tracking-tight">Purge Request</h3>
                    <p className="text-sm text-slate-500 mt-1">
                      Delete request <span className="font-bold text-slate-300">#{requestToDelete.requestId}</span>
                    </p>
                  </div>
                </div>

                <div className="bg-red-500/5 border border-red-500/10 rounded-2xl p-4 text-sm text-red-200/70 mb-8 leading-relaxed">
                  This will permanently remove the service request and all associated history. This operation is irreversible.
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={() => {
                      setShowDeleteModal(false);
                      setRequestToDelete(null);
                    }}
                    className="flex-1 px-6 py-3 rounded-2xl border border-white/5 text-slate-400 font-bold hover:bg-white/5 transition-all"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleDeleteRequest}
                    disabled={isDeleting}
                    className="flex-1 px-6 py-3 rounded-2xl bg-gradient-to-r from-red-600 to-rose-600 text-white font-bold hover:shadow-lg hover:shadow-red-600/20 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    {isDeleting ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Wiping Data...
                      </>
                    ) : (
                      'Purge Request'
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>,
          document.body
        )
      }
    </div >
  );
};

export default ServiceRequestListUser;
