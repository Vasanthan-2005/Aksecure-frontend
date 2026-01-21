import { useState, useRef } from 'react';
import { X, Send, Clock, MessageSquare, Loader2, FileText, XCircle, Upload, IndianRupee } from 'lucide-react';
import DatePicker from '../calendars/DatePicker';
// PriceTableEditor removed as per request


const timeSlotOptions = [
  { value: '09:00', label: 'Morning (9 AM – 12 PM)' },
  { value: '12:00', label: 'Afternoon (12 PM – 3 PM)' },
  { value: '15:00', label: 'Evening (3 PM – 6 PM)' },
];

const ReplyModal = ({ isOpen, onClose, ticket, onReply, updating }) => {
  const [replyMessage, setReplyMessage] = useState('');
  const [preferredDate, setPreferredDate] = useState('');
  const [preferredSlot, setPreferredSlot] = useState('');
  const [errors, setErrors] = useState({ message: '', schedule: '' });
  const [selectedImages, setSelectedImages] = useState([]);
  const [imagePreviews, setImagePreviews] = useState([]);
  const fileInputRef = useRef(null);

  // Get today's date in YYYY-MM-DD format for min attribute
  const today = new Date().toISOString().split('T')[0];

  if (!isOpen) return null;

  const handleImageSelect = (e) => {
    const files = Array.from(e.target.files);
    const validFiles = files.filter(file => {
      const isValidType = file.type.startsWith('image/') || file.type === 'application/pdf';
      const isValidSize = file.size <= 5 * 1024 * 1024; // 5MB
      return isValidType && isValidSize;
    });

    if (validFiles.length + selectedImages.length > 3) {
      setErrors(prev => ({ ...prev, message: 'Maximum 3 images allowed' }));
      return;
    }

    const newImages = [...selectedImages, ...validFiles];
    setSelectedImages(newImages);

    // Create previews
    const newPreviews = validFiles.map(file => URL.createObjectURL(file));
    setImagePreviews(prev => [...prev, ...newPreviews]);

    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const removeImage = (index) => {
    const newImages = selectedImages.filter((_, i) => i !== index);
    const newPreviews = imagePreviews.filter((_, i) => i !== index);

    // Revoke object URL to prevent memory leaks
    URL.revokeObjectURL(imagePreviews[index]);

    setSelectedImages(newImages);
    setImagePreviews(newPreviews);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setErrors({ message: '', schedule: '' });

    if (!replyMessage.trim()) {
      setErrors(prev => ({ ...prev, message: 'Reply message is required' }));
      return;
    }

    if (replyMessage.trim().length < 3) {
      setErrors(prev => ({ ...prev, message: 'Reply message must be at least 3 characters long' }));
      return;
    }

    // Scheduling time is now required
    if (!preferredDate || !preferredSlot) {
      setErrors(prev => ({ ...prev, schedule: 'Please select both scheduling date and time slot' }));
      return;
    }

    const combined = new Date(`${preferredDate}T${preferredSlot}`);
    const now = new Date();
    if (isNaN(combined.getTime()) || combined < now) {
      setErrors(prev => ({ ...prev, schedule: 'Scheduling time cannot be in the past' }));
      return;
    }
    const visitDateTimeIso = combined.toISOString();

    // Call the parent handler and wait for result
    try {
      // priceItems and totalPrice are now empty/zero as the feature is removed
      const success = await onReply(replyMessage.trim(), visitDateTimeIso, selectedImages, [], 0);

      if (success !== false) {
        // Clean up preview URLs
        imagePreviews.forEach(url => URL.revokeObjectURL(url));

        setReplyMessage('');
        setPreferredDate('');
        setPreferredSlot('');
        setSelectedImages([]);
        setImagePreviews([]);
        setErrors({ message: '', schedule: '' });
        onClose();
      }
    } catch (error) {
      console.error('Error in reply submission:', error);
    }
  };

  const handleClose = () => {
    if (!updating) {
      // Clean up preview URLs
      imagePreviews.forEach(url => URL.revokeObjectURL(url));

      setReplyMessage('');
      setPreferredDate('');
      setPreferredSlot('');
      setPreferredSlot('');
      setSelectedImages([]);
      setImagePreviews([]);
      setErrors({ message: '', schedule: '' });
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center md:pt-20 md:p-4 bg-black/60 backdrop-blur-sm overflow-hidden">
      <div className="bg-slate-900 w-[94%] md:w-full md:max-w-2xl h-auto max-h-[85dvh] md:max-h-[calc(100vh-8rem)] flex flex-col shadow-2xl border border-slate-700/50 ring-1 ring-white/10 rounded-2xl">
        {/* Header - Fixed at top */}
        <div className="flex-shrink-0 bg-slate-900 border-b border-white/5 px-4 md:px-6 py-3 md:py-4 flex items-center justify-between z-10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center ring-1 ring-blue-500/20">
              <MessageSquare className="w-5 h-5 text-blue-400" />
            </div>
            <div>
              <h2 className="text-base md:text-xl font-bold text-white tracking-tight">Reply to User</h2>
              <p className="text-[10px] md:text-sm text-slate-400">
                {ticket?.ticketId ? `Ticket: ${ticket.ticketId}` : ticket?.requestId ? `Service Request: ${ticket.requestId}` : 'Reply'}
              </p>
            </div>
          </div>
          <button
            onClick={handleClose}
            disabled={updating}
            className="p-2 hover:bg-white/5 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed text-slate-400 hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content - Scrollable Content Area */}
        <div className="flex-1 overflow-y-auto p-3 md:p-6 custom-scrollbar">
          <form id="reply-form" onSubmit={handleSubmit} className="space-y-3 md:space-y-6">
            {/* Ticket/Service Request Info */}
            <div className="bg-slate-800/40 rounded-xl p-2.5 md:p-4 border border-white/5">
              <p className="text-[9px] md:text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-0.5">
                {ticket?.ticketId ? 'Ticket Title' : ticket?.requestId ? 'Service Request Title' : 'Title'}
              </p>
              <p className="text-sm md:text-base font-bold text-white mb-2 md:mb-3">{ticket?.title}</p>
              <p className="text-[9px] md:text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-0.5">User</p>
              <p className="text-xs md:text-sm text-slate-300 font-medium flex items-center gap-2">
                <span className="w-1.5 md:w-2 h-1.5 md:h-2 rounded-full bg-blue-500"></span>
                {ticket?.userId?.name} <span className="text-slate-500 font-normal">({ticket?.userId?.companyName})</span>
              </p>
            </div>

            {/* Reply Message */}
            <div>
              <label className="block text-xs md:text-sm font-bold text-slate-300 mb-1.5 md:mb-2">
                <div className="flex items-center gap-1.5 md:gap-2">
                  <MessageSquare className="w-3.5 md:w-4 h-3.5 md:h-4 text-blue-400" />
                  Reply Message <span className="text-red-400">*</span>
                </div>
              </label>
              <textarea
                value={replyMessage}
                onChange={(e) => {
                  setReplyMessage(e.target.value);
                  setErrors(prev => ({ ...prev, message: '' }));
                }}
                placeholder="Type your reply message here..."
                rows={3}
                disabled={updating}
                className={`w-full px-4 py-3 bg-slate-950/50 border rounded-xl focus:ring-2 focus:border-transparent resize-none font-medium text-slate-200 placeholder:text-slate-600 md:min-h-[160px] ${errors.message
                  ? 'border-red-500/50 focus:ring-red-500/50'
                  : 'border-slate-700 focus:ring-blue-500/50 hover:border-slate-600'
                  } disabled:opacity-50 disabled:cursor-not-allowed`}
              />
              {errors.message && (
                <p className="mt-1.5 text-xs text-red-400 font-medium">{errors.message}</p>
              )}
            </div>

            {/* Quote Bill / File Upload */}
            <div>
              <label className="block text-xs md:text-sm font-bold text-slate-300 mb-1.5 md:mb-2">
                <div className="flex items-center gap-1.5 md:gap-2">
                  <FileText className="w-3.5 md:w-4 h-3.5 md:h-4 text-violet-400" />
                  Quote Bill (Upload Files)
                </div>
              </label>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*,application/pdf"
                multiple
                onChange={handleImageSelect}
                disabled={updating || selectedImages.length >= 3}
                className="hidden"
                id="file-upload"
              />
              <label
                htmlFor="file-upload"
                className={`inline-flex items-center gap-2 px-4 py-2 border rounded-xl cursor-pointer font-medium text-sm ${updating || selectedImages.length >= 3
                  ? 'border-slate-700 bg-slate-800 text-slate-500 cursor-not-allowed'
                  : 'border-slate-600 bg-slate-800/50 text-slate-300 hover:bg-slate-700 hover:border-slate-500 hover:text-white'
                  }`}
              >
                <Upload className="w-4 h-4" />
                {selectedImages.length >= 3 ? 'Maximum 3 files' : 'Upload Bill'}
              </label>
              <p className="mt-1.5 text-xs text-slate-500">You can attach up to 3 files (Images or PDF, max 5MB each)</p>

              {/* File Previews */}
              {imagePreviews.length > 0 && (
                <div className="mt-3 grid grid-cols-3 gap-3">
                  {imagePreviews.map((preview, index) => {
                    const isPdf = selectedImages[index]?.type === 'application/pdf';
                    return (
                      <div key={index} className="relative group">
                        {isPdf ? (
                          <div className="w-full h-24 flex flex-col items-center justify-center bg-slate-800 rounded-lg border border-white/10 group-hover:border-white/20">
                            <FileText className="w-8 h-8 text-slate-400 mb-1" />
                            <span className="text-[10px] text-slate-400 uppercase">PDF</span>
                          </div>
                        ) : (
                          <img
                            src={preview}
                            alt={`Preview ${index + 1}`}
                            className="w-full h-24 object-cover rounded-lg border border-white/10 group-hover:border-white/20"
                          />
                        )}
                        <button
                          type="button"
                          onClick={() => removeImage(index)}
                          className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 hover:bg-red-600 shadow-lg"
                          disabled={updating}
                        >
                          <XCircle className="w-4 h-4" />
                        </button>
                        <p className="mt-1 text-xs text-slate-500 truncate px-1">
                          {selectedImages[index]?.name}
                        </p>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Scheduling Date & Time Slot */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs md:text-sm font-bold text-slate-300 mb-1.5 md:mb-2">
                  <div className="flex items-center gap-1.5 md:gap-2">
                    <Clock className="w-3.5 md:w-4 h-3.5 md:h-4 text-emerald-400" />
                    Scheduling Date <span className="text-red-400">*</span>
                  </div>
                </label>
                <DatePicker
                  selectedDate={preferredDate}
                  onChange={(date) => {
                    setPreferredDate(date);
                    setErrors(prev => ({ ...prev, schedule: '' }));


                  }}
                  minDate={today}
                />
              </div>

              <div>
                <label className="block text-xs md:text-sm font-bold text-slate-300 mb-1.5 md:mb-2">
                  <div className="flex items-center gap-1.5 md:gap-2">
                    <Clock className="w-3.5 md:w-4 h-3.5 md:h-4 text-emerald-400" />
                    Time Slot <span className="text-red-400">*</span>
                  </div>
                </label>
                <div className="flex flex-col gap-2">
                  {timeSlotOptions.map((slot) => {


                    const isSelected = preferredSlot === slot.value;

                    return (
                      <button
                        key={slot.value}
                        type="button"
                        onClick={() => {
                          setPreferredSlot(slot.value);
                          setErrors(prev => ({ ...prev, schedule: '' }));
                        }}
                        disabled={updating}
                        className={`
                        w-full px-3 md:px-4 py-2.5 md:py-3 rounded-xl border flex items-center justify-between group transition-all
                        ${isSelected
                            ? 'bg-blue-600/20 border-blue-500/50 text-white shadow-lg shadow-blue-500/10'
                            : 'bg-slate-950/50 border-slate-700 text-slate-400 hover:bg-slate-800 hover:text-white hover:border-slate-600'}
                      `}
                      >
                        <div className="flex items-center gap-2">
                          <div className={`w-1.5 md:w-2 h-1.5 md:h-2 rounded-full ${isSelected ? 'bg-blue-400' : 'bg-slate-600'}`}></div>
                          <span className="font-semibold text-xs md:text-sm">{slot.label}</span>
                        </div>


                      </button>
                    );
                  })}
                </div>

              </div>
            </div>
            {
              errors.schedule && (
                <p className="mt-1 text-xs text-red-400 font-medium">{errors.schedule}</p>
              )
            }
          </form>
        </div>

        {/* Footer - Fixed at bottom */}
        <div className="flex-shrink-0 bg-slate-900 border-t border-white/5 px-4 md:px-6 py-3 md:py-4 flex items-center justify-end gap-3 z-10">
          <button
            type="button"
            onClick={handleClose}
            disabled={updating}
            className="px-4 py-2 text-sm font-medium rounded-xl text-slate-300 hover:text-white hover:bg-white/5 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Cancel
          </button>
          <button
            type="submit"
            form="reply-form"
            disabled={updating}
            className="px-5 py-2 text-sm font-semibold rounded-xl bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {updating ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Sending...
              </>
            ) : (
              <>
                <Send className="w-4 h-4" />
                Send Reply
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ReplyModal;
