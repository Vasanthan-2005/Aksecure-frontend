import { Shield, MessageSquare, Trash2 } from 'lucide-react';
import TicketHeader from './TicketHeader';
import UserInfo from './UserInfo';
import ImageGallery from './ImageGallery';
import Timeline from './Timeline';
import ReplyModal from './ReplyModal';

const TicketDetailsPanel = ({
  ticket,
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
  onUpdateTicket,
  onAddComment,
  showReplyModal,
  setShowReplyModal,
  onReply,
  onDelete
}) => {
  if (!ticket) {
    return (
      <div className="flex-1 overflow-y-auto bg-slate-950">
        <div className="flex items-center justify-center h-full min-h-[calc(100vh-4rem)] text-slate-500">
          <div className="text-center px-6">
            <div className="w-24 h-24 mx-auto mb-6 rounded-3xl bg-slate-900/50 flex items-center justify-center border border-white/5 relative overflow-hidden group">
              <div className="absolute inset-0 bg-blue-600/10 blur-xl group-hover:bg-blue-600/20 transition-all duration-500" />
              <Shield className="w-10 h-10 text-blue-400/50 group-hover:text-blue-400 transition-colors z-10" />
            </div>
            <p className="text-xl font-bold text-white mb-2">Select a ticket</p>
            <p className="text-sm text-slate-500 max-w-md">Click on any ticket from the list to view full details and management options</p>
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
          {/* Reply and Delete Buttons */}
          <div className="flex justify-end gap-3 mb-2 animate-fade-in-up">
            <button
              onClick={() => setShowReplyModal(true)}
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-blue-500 hover:bg-blue-600 text-white rounded-xl transition-all font-semibold shadow-lg shadow-blue-500/20 hover:shadow-blue-500/30 border border-blue-400"
            >
              <MessageSquare className="w-4 h-4" />
              Reply to User
            </button>
            {onDelete && (
              <button
                onClick={onDelete}
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-red-500/10 text-red-400 border border-red-500/20 rounded-xl hover:bg-red-500/20 hover:text-white hover:border-red-500/40 transition-all font-semibold shadow-sm hover:shadow-red-500/10"
              >
                <Trash2 className="w-4 h-4" />
                Delete Ticket
              </button>
            )}
          </div>

          <div className="animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
            <TicketHeader
              ticket={ticket}
              updateStatus={updateStatus}
              setUpdateStatus={setUpdateStatus}
              visitDateTime={visitDateTime}
              setVisitDateTime={setVisitDateTime}
              errors={errors}
              setErrors={setErrors}
              updating={updating}
              onUpdate={onUpdateTicket}
            />
          </div>

          <div className="animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
            {ticket.userId && <UserInfo userData={ticket.userId} />}
          </div>

          <div className="animate-fade-in-up" style={{ animationDelay: '0.3s' }}>
            {ticket.images && ticket.images.length > 0 && <ImageGallery images={ticket.images} />}
          </div>

          <div className="animate-fade-in-up" style={{ animationDelay: '0.4s' }}>
            {ticket.timeline && ticket.timeline.length > 0 && (
              <Timeline timeline={ticket.timeline} currentUserName={user?.name} />
            )}
          </div>
        </div>
      </div>

      {/* Reply Modal */}
      <ReplyModal
        isOpen={showReplyModal}
        onClose={() => setShowReplyModal(false)}
        ticket={ticket}
        onReply={onReply}
        updating={updating}
      />
    </>
  );
};

export default TicketDetailsPanel;

