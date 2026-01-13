import { useEffect, useState, useRef } from 'react';
import api from '../services/api';
import { Upload, X, Image as ImageIcon, ArrowLeft, Calendar, Clock } from 'lucide-react';
import LoadingState from './common/LoadingState';
import SuccessState from './common/SuccessState';

const categories = ['CCTV', 'Fire Alarm', 'Security Alarm', 'Electrical', 'Plumbing', 'Air Conditioning'];
const timeSlotOptions = [
  { value: '09:00', label: 'Morning (9 AM – 12 PM)' },
  { value: '12:00', label: 'Afternoon (12 PM – 3 PM)' },
  { value: '15:00', label: 'Evening (3 PM – 6 PM)' },
];
const MAX_IMAGES = 5;

const TicketForm = ({ category, onSuccess, onCancel }) => {
  const [formData, setFormData] = useState({
    category: category || '',
    title: '',
    description: '',
    preferredDate: '',
    preferredTimeSlot: '',
  });
  const [images, setImages] = useState([]);
  const [imagePreviews, setImagePreviews] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const fileInputRef = useRef(null);

  useEffect(() => {
    if (category) {
      setFormData((prev) => ({ ...prev, category }));
    }
  }, [category]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    setError('');
  };

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files || []);
    if (files.length > MAX_IMAGES) {
      setError(`You can upload up to ${MAX_IMAGES} images.`);
      const limitedFiles = files.slice(0, MAX_IMAGES);
      setImages(limitedFiles);
      createPreviews(limitedFiles);
      return;
    }
    setImages(files);
    createPreviews(files);
    setError('');
  };

  const createPreviews = (files) => {
    if (files.length === 0) {
      setImagePreviews([]);
      return;
    }

    const previews = [];
    let loadedCount = 0;

    files.forEach((file, index) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        previews[index] = { file, preview: reader.result };
        loadedCount++;
        if (loadedCount === files.length) {
          setImagePreviews(previews);
        }
      };
      reader.onerror = () => {
        loadedCount++;
        if (loadedCount === files.length) {
          setImagePreviews(previews);
        }
      };
      reader.readAsDataURL(file);
    });
  };

  const removeImage = (index) => {
    const newImages = images.filter((_, i) => i !== index);
    const newPreviews = imagePreviews.filter((_, i) => i !== index);
    setImages(newImages);
    setImagePreviews(newPreviews);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    if (!formData.category || !formData.title || !formData.description) {
      setError('Category, title, and description are required.');
      setLoading(false);
      return;
    }

    try {
      const payload = new FormData();
      payload.append('category', formData.category);
      payload.append('title', formData.title.trim());
      payload.append('description', formData.description.trim());

      if (formData.preferredDate && formData.preferredTimeSlot) {
        const preferredDateTime = `${formData.preferredDate}T${formData.preferredTimeSlot}`;
        payload.append('preferredVisitAt', new Date(preferredDateTime).toISOString());
      }

      images.forEach((image) => {
        payload.append('images', image);
      });

      // Start the API call but don't wait for it to complete
      const submitPromise = api.post('/tickets', payload, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      // Wait for 2 seconds minimum, then show success
      await Promise.all([
        submitPromise,
        new Promise(resolve => setTimeout(resolve, 2000))
      ]);

      setFormData({
        category: category || '',
        title: '',
        description: '',
        preferredDate: '',
        preferredTimeSlot: '',
      });
      setImages([]);
      setImagePreviews([]);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
      setShowSuccess(true);
    } catch (err) {
      const message = err?.response?.data?.message || 'Failed to create ticket. Please try again.';
      setError(message);
    } finally {
      setLoading(false);
    }
  };
  const getMinDate = () => {
    const now = new Date();
    now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
    return now.toISOString().slice(0, 10);
  };


  return (
    <div className="min-h-screen py-8 px-4 relative overflow-hidden">
      {showSuccess && (
        <SuccessState
          title="Ticket Raised!"
          message="Your priority ticket has been logged and assigned to our security team. You can track its progress in 'My Tickets'."
          onComplete={onSuccess}
        />
      )}
      {loading && <LoadingState message="Submitting Ticket..." fullPage={true} />}
      {/* Background gradients */}
      <div className="fixed top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0">
        <div className="absolute top-[20%] right-[10%] w-[40%] h-[40%] rounded-full bg-blue-600/5 blur-[120px]" />
        <div className="absolute bottom-[10%] left-[20%] w-[30%] h-[30%] rounded-full bg-violet-600/5 blur-[120px]" />
      </div>

      <div className="max-w-3xl mx-auto relative z-10">
        <button
          type="button"
          onClick={onCancel}
          className="group mb-8 inline-flex items-center gap-2 text-slate-400 hover:text-white transition-colors"
        >
          <div className="w-8 h-8 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center group-hover:border-white/20 transition-all">
            <ArrowLeft className="w-4 h-4" />
          </div>
          <span className="text-sm font-bold uppercase tracking-widest">Dashboard</span>
        </button>

        <div className="glass-card rounded-[32px] border border-white/5 p-1 relative overflow-hidden group">
          <div className="bg-slate-950/20 rounded-[28px] p-8 lg:p-10">
            <div className="flex items-center gap-4 mb-8">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-600 to-blue-700 flex items-center justify-center shadow-lg shadow-blue-500/20">
                <ImageIcon className="w-7 h-7 text-white" />
              </div>
              <div>
                <h2 className="text-3xl font-bold text-white tracking-tight">Raise a Ticket</h2>
                <p className="text-slate-400 text-sm mt-1">Briefly explain the issue and we'll help you out.</p>
              </div>
            </div>

            {error && (
              <div className="bg-red-500/10 border border-red-500/20 text-red-400 px-6 py-4 rounded-2xl mb-8 flex items-center gap-3 animate-shake">
                <div className="w-1.5 h-1.5 rounded-full bg-red-400"></div>
                <p className="text-sm font-medium">{error}</p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-8">
              <div className="space-y-6">
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-3 ml-1">Category</label>
                  <div className="relative group">
                    <select
                      name="category"
                      value={formData.category}
                      onChange={handleChange}
                      className="w-full px-5 py-4 bg-slate-900/50 border border-white/10 rounded-2xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500/50 transition-all appearance-none cursor-pointer disabled:opacity-50"
                      required
                      disabled={Boolean(category)}
                    >
                      <option value="" className="bg-slate-900">Select Issue Category</option>
                      {categories.map((item) => (
                        <option key={item} value={item} className="bg-slate-900">
                          {item}
                        </option>
                      ))}
                    </select>
                    <div className="absolute right-5 top-1/2 -translate-y-1/2 pointer-events-none text-slate-500 group-hover:text-blue-400 transition-colors">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" /></svg>
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-3 ml-1">Title</label>
                  <input
                    type="text"
                    name="title"
                    value={formData.title}
                    onChange={handleChange}
                    placeholder="E.g., Camera 4 is not recording"
                    className="w-full px-5 py-4 bg-slate-900/50 border border-white/10 rounded-2xl text-white placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500/50 transition-all font-medium"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-3 ml-1">Detailed Description</label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    rows="5"
                    placeholder="Provide specific details to help our engineers diagnose the problem faster..."
                    className="w-full px-5 py-4 bg-slate-900/50 border border-white/10 rounded-2xl text-white placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500/50 transition-all font-medium resize-none"
                    required
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-3 ml-1 flex items-center gap-2">
                      <Calendar className="w-3.5 h-3.5" />
                      Visit Date <span className="text-[10px] text-slate-600 font-normal normal-case">(Optional)</span>
                    </label>
                    <input
                      type="date"
                      name="preferredDate"
                      value={formData.preferredDate}
                      onChange={handleChange}
                      min={getMinDate()}
                      className="w-full px-5 py-4 bg-slate-900/50 border border-white/10 rounded-2xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500/50 transition-all font-medium [color-scheme:dark]"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-3 ml-1 flex items-center gap-2">
                      <Clock className="w-3.5 h-3.5" />
                      Visit Time <span className="text-[10px] text-slate-600 font-normal normal-case">(Optional)</span>
                    </label>
                    <div className="relative group">
                      <select
                        name="preferredTimeSlot"
                        value={formData.preferredTimeSlot}
                        onChange={handleChange}
                        className="w-full px-5 py-4 bg-slate-900/50 border border-white/10 rounded-2xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500/50 transition-all appearance-none cursor-pointer font-medium"
                      >
                        <option value="" className="bg-slate-900">Select Time Slot</option>
                        {timeSlotOptions.map((slot) => (
                          <option key={slot.value} value={slot.value} className="bg-slate-900">
                            {slot.label}
                          </option>
                        ))}
                      </select>
                      <div className="absolute right-5 top-1/2 -translate-y-1/2 pointer-events-none text-slate-500 group-hover:text-blue-400 transition-colors">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" /></svg>
                      </div>
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-3 ml-1 flex items-center gap-2">
                    <Upload className="w-3.5 h-3.5" />
                    Upload Evidence
                    <span className="text-[10px] text-slate-600 font-normal normal-case ml-auto">Max {MAX_IMAGES} images</span>
                  </label>

                  <div className="relative">
                    <input
                      type="file"
                      name="images"
                      accept="image/*"
                      multiple
                      onChange={handleFileChange}
                      ref={fileInputRef}
                      className="hidden"
                      id="image-upload"
                    />
                    <label
                      htmlFor="image-upload"
                      className="flex flex-col items-center justify-center w-full h-40 border-2 border-dashed border-white/10 rounded-3xl bg-slate-950/20 hover:bg-slate-900/50 hover:border-blue-500/30 cursor-pointer transition-all group"
                    >
                      <div className="flex flex-col items-center justify-center pt-5 pb-6">
                        <div className="w-12 h-12 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                          <Upload className="w-6 h-6 text-blue-400" />
                        </div>
                        <p className="text-sm font-bold text-slate-300 mb-1">
                          <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-violet-400">Click to upload</span> or drag and drop
                        </p>
                        <p className="text-[10px] text-slate-500 font-medium uppercase tracking-widest">
                          JPG, PNG up to {MAX_IMAGES} files
                        </p>
                      </div>
                    </label>
                  </div>

                  {imagePreviews.length > 0 && (
                    <div className="mt-6 flex flex-wrap gap-4">
                      {imagePreviews.map((preview, index) => (
                        <div key={index} className="relative group/img">
                          <div className="w-20 h-20 rounded-xl overflow-hidden border border-white/10 bg-slate-900 shadow-xl group-hover/img:border-blue-500/50 transition-all">
                            <img
                              src={preview.preview}
                              alt={`Preview ${index + 1}`}
                              className="w-full h-full object-cover"
                            />
                          </div>
                          <button
                            type="button"
                            onClick={() => removeImage(index)}
                            className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover/img:opacity-100 transition-all shadow-lg hover:scale-110"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-4 pt-4">
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-[2] relative overflow-hidden group h-14 bg-gradient-to-r from-blue-600 to-violet-600 text-white rounded-2xl font-bold uppercase tracking-wider text-sm transition-all hover:shadow-[0_0_25px_rgba(59,130,246,0.4)] disabled:opacity-50 active:scale-95 flex items-center justify-center"
                >
                  <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform"></div>
                  <span className="relative z-10">{loading ? 'Processing...' : 'Submit Priority Ticket'}</span>
                </button>
                <button
                  type="button"
                  onClick={onCancel}
                  className="flex-1 h-14 border border-white/10 bg-slate-900/50 text-slate-400 hover:text-white hover:border-white/20 rounded-2xl font-bold uppercase tracking-wider text-xs transition-all active:scale-95"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TicketForm;
