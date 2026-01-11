import { Filter, AlertCircle, Calendar, Eye, X, Home } from 'lucide-react';
import { getStatusColor, getStatusIcon, getCategoryColor } from './utils.jsx';
import { useState } from 'react';

const serviceRequestStatusOptions = ['New', 'In Progress', 'Completed'];

const ServiceRequestListPanel = ({
  serviceRequests,
  searchTerm,
  setSearchTerm,
  statusFilter,
  setStatusFilter,
  selectedServiceRequest,
  onServiceRequestClick,
  error,
  onBackToDashboard,
  onRefresh
}) => {
  const [selectedImage, setSelectedImage] = useState(null);
  const filteredServiceRequests = serviceRequests.filter((request) => {
    const matchesSearch =
      request.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      request.requestId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      request.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'All' || request.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const stats = {
    total: serviceRequests.length,
    new: serviceRequests.filter(sr => sr.status === 'New').length,
    inProgress: serviceRequests.filter(sr => sr.status === 'In Progress').length,
    completed: serviceRequests.filter(sr => sr.status === 'Completed').length
  };

  return (
    <div className="h-full flex flex-col bg-slate-50">
      <div className="p-4 border-b border-slate-200 bg-slate-50 sticky top-0 z-10">
        {onBackToDashboard && (
          <div className="mb-3">
            <button
              onClick={onBackToDashboard}
              className="flex items-center gap-2 px-3 py-1.5 text-sm font-semibold text-slate-700 hover:bg-slate-50 rounded-lg transition-colors bg-slate-100 border border-slate-200"
            >
              <Home className="w-4 h-4" />
              Dashboard
            </button>
          </div>
        )}
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-bold text-slate-900">All Service Requests</h2>
          <div className="flex items-center gap-2">
            {onRefresh && (
              <button
                onClick={onRefresh}
                className="flex items-center gap-2 px-4 py-2 bg-gradient-to-br from-blue-600 to-blue-700 text-white rounded-xl font-semibold hover:from-blue-700 hover:to-blue-800 transition-all shadow-md hover:shadow-lg text-sm"
              >
                <AlertCircle className="w-4 h-4" />
                Refresh Data
              </button>
            )}
            <span className="px-2.5 py-0.5 bg-slate-100 text-slate-700 rounded-full text-xs font-semibold">
              {serviceRequests.length}
            </span>
          </div>
        </div>
        
        <div className="grid grid-cols-3 gap-2 mb-3">
          <div className="bg-gradient-to-br from-emerald-50 to-emerald-100/50 border border-emerald-200 rounded-lg p-2">
            <div className="flex items-center gap-1 mb-1">
              <AlertCircle className="w-3 h-3 text-emerald-600 flex-shrink-0" />
              <span className="text-xs text-emerald-700 font-medium">New</span>
            </div>
            <p className="text-base font-bold text-emerald-900">{stats.new}</p>
          </div>
          <div className="bg-gradient-to-br from-blue-50 to-blue-100/50 border border-blue-200 rounded-lg p-2">
            <div className="flex items-center gap-1 mb-1">
              <AlertCircle className="w-3 h-3 text-blue-600 flex-shrink-0" />
              <span className="text-xs text-blue-700 font-medium">In Progress</span>
            </div>
            <p className="text-base font-bold text-blue-900">{stats.inProgress}</p>
          </div>
          <div className="bg-gradient-to-br from-green-50 to-green-100/50 border border-green-200 rounded-lg p-2">
            <div className="flex items-center gap-1 mb-1">
              <AlertCircle className="w-3 h-3 text-green-600 flex-shrink-0" />
              <span className="text-xs text-green-700 font-medium">Completed</span>
            </div>
            <p className="text-base font-bold text-green-900">{stats.completed}</p>
          </div>
        </div>
        
        <div className="mt-3">
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-slate-500 flex-shrink-0" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="flex-1 px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-500 focus:border-slate-500 text-sm bg-white"
            >
              <option value="All">All Status</option>
              {serviceRequestStatusOptions.map((status) => (
                <option key={status} value={status}>
                  {status}
                </option>
              ))}
            </select>
          </div>
        </div>
        
        <div className="mt-2 text-xs text-slate-500 font-medium">
          {filteredServiceRequests.length} request{filteredServiceRequests.length !== 1 ? 's' : ''} found
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-slate-50">
        {error && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm text-center">
            {error}
          </div>
        )}
        
        {filteredServiceRequests.length === 0 ? (
          <div className="text-center py-12 px-4">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-slate-100 flex items-center justify-center">
              <AlertCircle className="w-8 h-8 text-slate-400" />
            </div>
            <p className="text-slate-500 font-medium mb-1">
              {searchTerm || statusFilter !== 'All'
                ? 'No service requests match your filters'
                : 'No service requests found'}
            </p>
            <p className="text-xs text-slate-400 mt-1">
              {searchTerm || statusFilter !== 'All'
                ? 'Try adjusting your search or filter criteria'
                : 'Service requests will appear here once created'}
            </p>
          </div>
        ) : (
          filteredServiceRequests.map((request) => (
            <button
              key={request._id}
              onClick={() => onServiceRequestClick(request)}
              className={`w-full text-left p-3 rounded-lg border transition-all group ${
                selectedServiceRequest?._id === request._id
                  ? 'border-slate-500 bg-gradient-to-br from-slate-50 to-slate-100/50 shadow-md'
                  : 'border-slate-200 bg-white hover:border-slate-400 hover:shadow-sm'
              }`}
            >
              <div className="flex items-start justify-between gap-2 mb-2">
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-slate-900 text-sm mb-1 line-clamp-1 group-hover:text-slate-700 transition-colors">
                    {request.title}
                    {request.userId?.companyName && (
                      <span className="text-xs font-normal text-slate-600 ml-2">
                        ({request.userId.companyName})
                      </span>
                    )}
                  </h3>
                  <p className="text-xs font-mono text-slate-600">{request.requestId}</p>
                </div>
                <span
                  className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold border flex-shrink-0 ${
                    request.status === 'New' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                    request.status === 'In Progress' ? 'bg-blue-50 text-blue-700 border-blue-200' :
                    request.status === 'Completed' ? 'bg-green-50 text-green-700 border-green-200' :
                    'bg-slate-50 text-slate-700 border-slate-200'
                  }`}
                >
                  {request.status}
                </span>
              </div>
              <p className="text-xs text-slate-600 line-clamp-2 mb-2 leading-relaxed">
                {request.description}
              </p>
              
              {request.images && request.images.length > 0 && (
                <div className="mb-2 flex gap-1.5 flex-wrap">
                  {request.images.slice(0, 3).map((image, imgIndex) => {
                    const baseUrl = import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:5000';
                    const imageUrl = image.startsWith('http') 
                      ? image 
                      : `${baseUrl}${image}`;
                    return (
                      <div
                        key={imgIndex}
                        className="relative group cursor-pointer"
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedImage(imageUrl);
                        }}
                      >
                        <img
                          src={imageUrl}
                          alt={`Service request image ${imgIndex + 1}`}
                          className="w-12 h-12 object-cover rounded border border-slate-200 hover:border-slate-400 transition-all"
                        />
                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-all rounded flex items-center justify-center">
                          <Eye className="w-3 h-3 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                        </div>
                      </div>
                    );
                  })}
                  {request.images.length > 3 && (
                    <div className="w-12 h-12 rounded border border-slate-200 bg-slate-100 flex items-center justify-center text-xs font-semibold text-slate-600">
                      +{request.images.length - 3}
                    </div>
                  )}
                </div>
              )}
              
              <div className="flex items-center justify-between gap-2 pt-2 border-t border-slate-100">
                <span className={`px-2 py-0.5 rounded text-xs font-medium border ${getCategoryColor(request.category)}`}>
                  {request.category}
                </span>
                <div className="flex items-center gap-1 text-xs text-slate-500">
                  <Calendar className="w-3 h-3 flex-shrink-0" />
                  <span>{new Date(request.createdAt).toLocaleDateString()}</span>
                </div>
              </div>
            </button>
          ))
        )}
      </div>
      
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
    </div>
  );
};

export default ServiceRequestListPanel;
