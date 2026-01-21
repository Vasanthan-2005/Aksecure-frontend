import { Shield, MessageSquare, Trash2, ArrowLeft } from 'lucide-react';
import TicketHeader from './TicketHeader';
import UserInfo from '../components/UserInfo';
import ImageGallery from '../components/ImageGallery';
import Timeline from '../components/Timeline';
import OutletInfo from '../components/OutletInfo';

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
  onDelete,
  onClose
}) => {
  if (!ticket) {
    return (
      <div className="flex-1 overflow-y-auto bg-slate-950">
        <div className="flex items-center justify-center h-full min-h-[calc(100vh-4rem)] text-slate-500">
          <div className="text-center px-6">
            <div className="w-24 h-24 mx-auto mb-6 rounded-3xl bg-slate-900/50 flex items-center justify-center border border-white/5 relative overflow-hidden group">
              <div className="absolute inset-0 bg-blue-600/10 blur-xl group-hover:bg-blue-600/20" />
              <Shield className="w-10 h-10 text-blue-400/50 group-hover:text-blue-400 z-10" />
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

        <div className="p-3 md:p-4 space-y-2 md:space-y-4 relative z-10 w-full max-w-full">
          {/* Action Row */}
          <div className="flex items-center justify-between gap-2 mb-2">
            <button
              onClick={onClose}
              className="flex items-center gap-1.5 text-slate-400 hover:text-white transition-colors"
            >
              <ArrowLeft className="w-4 h-4 md:w-5 md:h-5" />
              <span className="font-bold text-xs md:text-sm">Back to Tickets</span>
            </button>
            <div className="flex gap-2">
              <button
                onClick={() => setShowReplyModal(true)}
                className="inline-flex items-center gap-1.5 px-3 md:px-5 py-1.5 md:py-2.5 bg-blue-500 hover:bg-blue-600 text-white rounded-lg md:rounded-xl text-[10px] md:text-sm font-semibold border border-blue-400 shadow-lg"
              >
                <MessageSquare className="w-3.5 h-3.5 md:w-4 md:h-4" />
                <span className="md:inline">Reply</span>
              </button>
              {onDelete && (
                <button
                  onClick={onDelete}
                  className="inline-flex items-center justify-center p-1.5 md:px-5 md:py-2.5 bg-red-500/10 text-red-400 border border-red-500/20 rounded-lg md:rounded-xl hover:bg-red-500/20 hover:text-white transition-colors"
                  title="Delete Ticket"
                >
                  <Trash2 className="w-3.5 h-3.5 md:w-4 md:h-4" />
                  <span className="hidden md:inline ml-2 text-sm font-semibold">Delete</span>
                </button>
              )}
            </div>
          </div>

          <div>
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

          <div className="mt-4">
            {(ticket.outletName || ticket.address) && (
              <OutletInfo
                outletName={ticket.outletName}
                address={ticket.address}
                location={ticket.location}
              />
            )}
          </div>

          <div className="mt-4">
            {ticket.userId && <UserInfo userData={ticket.userId} />}
          </div>

          <div className="mt-4">
            {ticket.images && ticket.images.length > 0 && <ImageGallery images={ticket.images} />}
          </div>

          <div className="mt-4">
            {ticket.timeline && ticket.timeline.length > 0 && (
              <Timeline timeline={ticket.timeline} currentUserName={user?.name} />
            )}
          </div>
        </div>
      </div>

    </>
  );
};

export default TicketDetailsPanel;
