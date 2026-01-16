import { Shield, MessageSquare, Save, Loader2, Calendar, Clock, CheckCircle2 } from 'lucide-react';
import UserInfo from './UserInfo';
import ImageGallery from './ImageGallery';
import Timeline from './Timeline';
import ReplyModal from './ReplyModal';
import { getCategoryColor } from './utils.jsx';
import OutletInfo from './OutletInfo';

const serviceRequestStatusOptions = ['New', 'In Progress', 'Completed'];

const ServiceRequestDetailsPanel = ({
  serviceRequest,
  user,
  updateStatus,
  setUpdateStatus,
  visitDateTime,
  setVisitDateTime,
  newComment,
  setNewComment,
  errors,
  setErrors,
  updating,
  onUpdateServiceRequest,
  onAddComment,
  showReplyModal,
  setShowReplyModal,
  onReply
}) => {
  if (!serviceRequest) {
    return (
      <div className="flex-1 overflow-y-auto bg-slate-950">
        <div className="flex items-center justify-center h-full min-h-[calc(100vh-4rem)] text-slate-500">
          <div className="text-center px-6">
            <div className="w-24 h-24 mx-auto mb-6 rounded-3xl bg-slate-900/50 flex items-center justify-center border border-white/5 relative overflow-hidden group">
              <div className="absolute inset-0 bg-blue-600/10 blur-xl group-hover:bg-blue-600/20" />
              <Shield className="w-10 h-10 text-blue-400/50 group-hover:text-blue-400 z-10" />
            </div>
            <p className="text-xl font-bold text-white mb-2">Select a service request</p>
            <p className="text-sm text-slate-500 max-w-md">Click on any request from the list to view full details and management options</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="flex-1 overflow-y-auto bg-slate-950 relative custom-scrollbar">
        {/* Background gradients */}
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0">
          <div className="absolute top-0 right-0 w-[40%] h-[40%] rounded-full bg-blue-600/5 blur-[100px]" />
          <div className="absolute bottom-0 left-0 w-[30%] h-[30%] rounded-full bg-violet-600/5 blur-[100px]" />
        </div>

        <div className="p-4 space-y-4 relative z-10 w-full max-w-full">
          {/* Reply Button */}
          <div className="flex justify-end gap-3 mb-2">
            <button
              onClick={() => setShowReplyModal(true)}
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-blue-500 hover:bg-blue-600 text-white rounded-xl font-semibold shadow-lg shadow-blue-500/20 hover:shadow-blue-500/30 border border-blue-400"
            >
              <MessageSquare className="w-4 h-4" />
              Reply to User
            </button>
          </div>

          {/* Service Request Header */}
          <div className="glass-card p-6 rounded-2xl border border-slate-700/50 shadow-xl bg-slate-900/60 backdrop-blur-xl">
            <div className="flex items-start justify-between mb-6">
              <div className="flex-1">
                <div className="flex items-center gap-4 mb-4">
                  <h2 className="text-3xl font-bold text-white tracking-tight">
                    {serviceRequest.title}
                  </h2>
                  <span
                    className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-[11px] font-black uppercase tracking-widest border shadow-xl shadow-black/40 ${serviceRequest.status === 'New' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' :
                      serviceRequest.status === 'In Progress' ? 'bg-blue-500/10 text-blue-400 border-blue-500/20' :
                        serviceRequest.status === 'Completed' ? 'bg-green-500/10 text-green-400 border-green-500/20' :
                          'bg-slate-500/10 text-slate-400 border-slate-500/20'
                      }`}
                  >
                    <div className={`w-2 h-2 rounded-full ${serviceRequest.status === 'New' ? 'bg-emerald-400' : serviceRequest.status === 'In Progress' ? 'bg-blue-400' : 'bg-green-400'}`} />
                    {serviceRequest.status}
                  </span>
                </div>
                <p className="text-sm text-slate-500 mb-4 font-black uppercase tracking-widest">
                  REFERENCE ID: <span className="font-mono text-slate-200 bg-slate-900 px-3 py-1 rounded-lg border border-white/5 ml-2 text-base">{serviceRequest.requestId}</span>
                </p>
                <span className={`inline-block px-4 py-1.5 rounded-xl text-[10px] font-black border uppercase tracking-[0.2em] shadow-lg ${getCategoryColor(serviceRequest.category)}`}>
                  {serviceRequest.category}
                </span>
              </div>

              {/* Update Service Request Form - Top Right */}
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
                          {serviceRequestStatusOptions.filter(option => option !== 'New').map((status) => (
                            <option key={status} value={status}>
                              {status}
                            </option>
                          ))}
                        </select>
                      </div>
                      <button
                        onClick={onUpdateServiceRequest}
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

            <div className="bg-slate-800/30 rounded-xl p-6 mb-6 border border-white/5">
              <h4 className="text-sm font-bold text-slate-500 uppercase tracking-tight mb-3">Description</h4>
              <p className="text-slate-200 leading-relaxed whitespace-pre-wrap break-words text-base font-medium font-sans">{serviceRequest.description}</p>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-slate-800/40 rounded-xl p-4 border border-white/5 hover:border-white/10">
                <div className="flex items-center gap-2 mb-2">
                  <Calendar className="w-4 h-4 text-slate-400" />
                  <span className="text-xs text-slate-500 font-bold uppercase tracking-tight">Created</span>
                </div>
                <p className="font-bold text-white text-base">
                  {new Date(serviceRequest.createdAt).toLocaleDateString()}
                </p>
                <p className="text-sm text-slate-500 mt-0.5 font-mono">
                  {new Date(serviceRequest.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </p>
              </div>
              {serviceRequest.preferredVisitAt && (
                <div className="bg-blue-500/5 rounded-xl p-4 border border-blue-500/10 hover:border-blue-500/20">
                  <div className="flex items-center gap-2 mb-2">
                    <Clock className="w-4 h-4 text-blue-400" />
                    <span className="text-xs text-blue-400/80 font-bold uppercase tracking-tight">Preferred</span>
                  </div>
                  <p className="font-bold text-blue-100 text-base">
                    {new Date(serviceRequest.preferredVisitAt).toLocaleDateString()}
                  </p>
                  <p className="text-sm text-blue-300/70 mt-0.5 font-mono">
                    {new Date(serviceRequest.preferredVisitAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
              )}
              {serviceRequest.assignedVisitAt && (
                <div className="bg-emerald-500/5 rounded-xl p-4 border border-emerald-500/10 hover:border-emerald-500/20">
                  <div className="flex items-center gap-2 mb-2">
                    <Clock className="w-4 h-4 text-emerald-400" />
                    <span className="text-xs text-emerald-400/80 font-bold uppercase tracking-tight">Assigned</span>
                  </div>
                  <p className="font-bold text-emerald-100 text-base">
                    {new Date(serviceRequest.assignedVisitAt).toLocaleDateString()}
                  </p>
                  <p className="text-sm text-emerald-300/70 mt-0.5 font-mono">
                    {new Date(serviceRequest.assignedVisitAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
              )}
              {serviceRequest.completedAt && (
                <div className="bg-slate-700/20 rounded-xl p-4 border border-slate-600/30 hover:border-slate-500/40">
                  <div className="flex items-center gap-2 mb-2">
                    <CheckCircle2 className="w-4 h-4 text-slate-400" />
                    <span className="text-xs text-slate-400/80 font-bold uppercase tracking-tight">Completed</span>
                  </div>
                  <p className="font-bold text-slate-200 text-base">
                    {new Date(serviceRequest.completedAt).toLocaleDateString()}
                  </p>
                  <p className="text-sm text-slate-400/70 mt-0.5 font-mono">
                    {new Date(serviceRequest.completedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
              )}
            </div>
          </div>

          <div className="mt-4">
            {(serviceRequest.outletName || serviceRequest.address) && (
              <OutletInfo
                outletName={serviceRequest.outletName}
                address={serviceRequest.address}
                location={serviceRequest.location}
              />
            )}
          </div>

          <div className="mt-4">
            {serviceRequest.userId && <UserInfo userData={serviceRequest.userId} />}
          </div>

          <div className="mt-4">
            {serviceRequest.images && serviceRequest.images.length > 0 && <ImageGallery images={serviceRequest.images} />}
          </div>

          <div className="mt-4">
            {serviceRequest.timeline && serviceRequest.timeline.length > 0 && (
              <Timeline timeline={serviceRequest.timeline} currentUserName={user?.name} />
            )}
          </div>
        </div>
      </div>

      {/* Reply Modal */}
      <ReplyModal
        isOpen={showReplyModal}
        onClose={() => setShowReplyModal(false)}
        ticket={serviceRequest}
        onReply={onReply}
        updating={updating}
      />
    </>
  );
};

export default ServiceRequestDetailsPanel;



