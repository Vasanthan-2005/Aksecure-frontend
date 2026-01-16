import { useState, useRef } from 'react';
import { X, Send, Clock, MessageSquare, Loader2, Image as ImageIcon, XCircle, Star } from 'lucide-react';
import DatePicker from './DatePicker';

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
      const isValidType = file.type.startsWith('image/');
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
      const success = await onReply(replyMessage.trim(), visitDateTimeIso, selectedImages);

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
      setSelectedImages([]);
      setImagePreviews([]);
      setErrors({ message: '', schedule: '' });
      onClose();
    }
  };

  return (
    <div className="fixed top-20 left-0 right-0 bottom-0 z-40 flex items-start justify-center pt-8 pb-8 px-4 bg-black/60 backdrop-blur-sm overflow-y-auto">
      <div className="bg-slate-900 rounded-2xl shadow-2xl max-w-2xl w-full max-h-[calc(100vh-8rem)] overflow-y-auto border border-slate-700/50 ring-1 ring-white/10">
        {/* Header */}
        <div className="sticky top-0 bg-slate-900/95 backdrop-blur-xl border-b border-white/5 px-6 py-4 flex items-center justify-between z-10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center ring-1 ring-blue-500/20">
              <MessageSquare className="w-5 h-5 text-blue-400" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white tracking-tight">Reply to User</h2>
              <p className="text-sm text-slate-400">
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

        {/* Content */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Ticket/Service Request Info */}
          <div className="bg-slate-800/40 rounded-xl p-4 border border-white/5">
            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">
              {ticket?.ticketId ? 'Ticket Title' : ticket?.requestId ? 'Service Request Title' : 'Title'}
            </p>
            <p className="text-base font-bold text-white mb-3">{ticket?.title}</p>
            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">User</p>
            <p className="text-sm text-slate-300 font-medium flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-blue-500"></span>
              {ticket?.userId?.name} <span className="text-slate-500 font-normal">({ticket?.userId?.companyName})</span>
            </p>
          </div>

          {/* Reply Message */}
          <div>
            <label className="block text-sm font-bold text-slate-300 mb-2">
              <div className="flex items-center gap-2">
                <MessageSquare className="w-4 h-4 text-blue-400" />
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
              rows={6}
              disabled={updating}
              className={`w-full px-4 py-3 bg-slate-950/50 border rounded-xl focus:ring-2 focus:border-transparent resize-none font-medium text-slate-200 placeholder:text-slate-600 ${errors.message
                ? 'border-red-500/50 focus:ring-red-500/50'
                : 'border-slate-700 focus:ring-blue-500/50 hover:border-slate-600'
                } disabled:opacity-50 disabled:cursor-not-allowed`}
            />
            {errors.message && (
              <p className="mt-1.5 text-xs text-red-400 font-medium">{errors.message}</p>
            )}
          </div>

          {/* Image Upload */}
          <div>
            <label className="block text-sm font-bold text-slate-300 mb-2">
              <div className="flex items-center gap-2">
                <ImageIcon className="w-4 h-4 text-violet-400" />
                Attach Images (Optional)
              </div>
            </label>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              multiple
              onChange={handleImageSelect}
              disabled={updating || selectedImages.length >= 3}
              className="hidden"
              id="image-upload"
            />
            <label
              htmlFor="image-upload"
              className={`inline-flex items-center gap-2 px-4 py-2 border rounded-xl cursor-pointer font-medium text-sm ${updating || selectedImages.length >= 3
                ? 'border-slate-700 bg-slate-800 text-slate-500 cursor-not-allowed'
                : 'border-slate-600 bg-slate-800/50 text-slate-300 hover:bg-slate-700 hover:border-slate-500 hover:text-white'
                }`}
            >
              <ImageIcon className="w-4 h-4" />
              {selectedImages.length >= 3 ? 'Maximum 3 images' : 'Select Images'}
            </label>
            <p className="mt-1.5 text-xs text-slate-500">You can attach up to 3 images (max 5MB each)</p>

            {/* Image Previews */}
            {imagePreviews.length > 0 && (
              <div className="mt-3 grid grid-cols-3 gap-3">
                {imagePreviews.map((preview, index) => (
                  <div key={index} className="relative group">
                    <img
                      src={preview}
                      alt={`Preview ${index + 1}`}
                      className="w-full h-24 object-cover rounded-lg border border-white/10 group-hover:border-white/20"
                    />
                    <button
                      type="button"
                      onClick={() => removeImage(index)}
                      className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 hover:bg-red-600 shadow-lg"
                      disabled={updating}
                    >
                      <XCircle className="w-4 h-4" />
                    </button>
                    <p className="mt-1 text-xs text-slate-500 truncate px-1">
                      {selectedImages[index].name}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Scheduling Date & Time Slot */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-bold text-slate-300 mb-2">
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-emerald-400" />
                  Scheduling Date <span className="text-red-400">*</span>
                </div>
              </label>
              <DatePicker
                selectedDate={preferredDate}
                onChange={(date) => {
                  setPreferredDate(date);
                  setErrors(prev => ({ ...prev, schedule: '' }));

                  // Auto-select slot if it matches preferred date
                  if (ticket?.preferredVisitAt) {
                    const prefDate = new Date(ticket.preferredVisitAt);
                    const prefDateStr = prefDate.toISOString().split('T')[0];
                    if (date === prefDateStr) {
                      const hour = prefDate.getHours();
                      let slot = '';
                      if (hour >= 9 && hour < 12) slot = '09:00';
                      else if (hour >= 12 && hour < 15) slot = '12:00';
                      else if (hour >= 15 && hour < 18) slot = '15:00';
                      if (slot) setPreferredSlot(slot);
                    }
                  }
                }}
                preferredDate={ticket?.preferredVisitAt}
                minDate={today}
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-slate-300 mb-2">
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-emerald-400" />
                  Time Slot <span className="text-red-400">*</span>
                </div>
              </label>
              <div className="flex flex-col gap-2">
                {timeSlotOptions.map((slot) => {
                  let isPreferred = false;
                  if (ticket?.preferredVisitAt) {
                    const date = new Date(ticket.preferredVisitAt);
                    const hour = date.getHours();
                    let prefTime = '';
                    if (hour >= 9 && hour < 12) prefTime = '09:00';
                    else if (hour >= 12 && hour < 15) prefTime = '12:00';
                    else if (hour >= 15 && hour < 18) prefTime = '15:00';
                    isPreferred = prefTime === slot.value;
                  }

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
                        w-full px-4 py-3 rounded-xl border flex items-center justify-between group transition-all
                        ${isSelected
                          ? 'bg-blue-600/20 border-blue-500/50 text-white shadow-lg shadow-blue-500/10'
                          : 'bg-slate-950/50 border-slate-700 text-slate-400 hover:bg-slate-800 hover:text-white hover:border-slate-600'}
                        ${isPreferred && !isSelected ? 'border-emerald-500/30 bg-emerald-500/5' : ''}
                      `}
                    >
                      <div className="flex items-center gap-2">
                        <div className={`w-2 h-2 rounded-full ${isSelected ? 'bg-blue-400' : isPreferred ? 'bg-emerald-400' : 'bg-slate-600'}`}></div>
                        <span className="font-semibold text-sm">{slot.label}</span>
                      </div>

                      {isPreferred && (
                        <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-emerald-500/10 border border-emerald-500/20">
                          <Star className="w-3 h-3 text-emerald-400 fill-emerald-400" />
                          <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider">Preferred</span>
                        </div>
                      )}
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

          {/* Actions */}
          <div className="flex items-center gap-3 pt-6 border-t border-white/5">
            <button
              type="button"
              onClick={handleClose}
              disabled={updating}
              className="flex-1 px-5 py-3 border border-slate-700 text-slate-300 rounded-xl hover:bg-slate-800 hover:text-white disabled:opacity-50 disabled:cursor-not-allowed font-semibold text-sm"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!replyMessage.trim() || !preferredDate || !preferredSlot || updating}
              className="flex-1 inline-flex items-center justify-center gap-2 px-5 py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-xl disabled:opacity-50 disabled:cursor-not-allowed font-bold text-sm shadow-lg shadow-blue-500/20"
            >
              {updating ? (
                <>
                  <Loader2 className="w-4 h-4" />
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
        </form >
      </div >
    </div >
  );
};

export default ReplyModal;
