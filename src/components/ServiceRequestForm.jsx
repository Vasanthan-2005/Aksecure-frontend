import { useEffect, useState, useRef } from 'react';
import api from '../services/api';
import { Upload, X, Image as ImageIcon, ArrowLeft, Calendar, Clock, Wrench, Loader2, Building, MapPin, ChevronDown } from 'lucide-react';
import LoadingState from './common/LoadingState';
import { useAuth } from '../context/AuthContext';
import SuccessState from './common/SuccessState';
import { compressImage } from '../utils/imageUtils';

const categories = ['CCTV', 'Fire Alarm', 'Security Alarm', 'Electrical', 'Plumbing', 'Air Conditioning'];
const MAX_IMAGES = 5;

const ServiceRequestForm = ({ category, onSuccess, onCancel }) => {
  const [formData, setFormData] = useState({
    address: '',
    outletName: '',
    location: { lat: 0, lng: 0 }
  });
  const { user } = useAuth();
  const [images, setImages] = useState([]);
  const [imagePreviews, setImagePreviews] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const fileInputRef = useRef(null);
  const [isOutletDropdownOpen, setIsOutletDropdownOpen] = useState(false);
  const outletDropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (outletDropdownRef.current && !outletDropdownRef.current.contains(event.target)) {
        setIsOutletDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (category) {
      setFormData((prev) => ({ ...prev, category }));
    }
  }, [category]);

  // Fallback for users without outlets
  const displayOutlets = user?.outlets && user.outlets.length > 0
    ? user.outlets
    : [{
      outletName: user?.companyName || 'Main Branch',
      address: user?.address || '',
      location: user?.location || { lat: 0, lng: 0 }
    }];

  const handleOutletChange = (e) => {
    const selectedOutletName = e.target.value;
    const selectedOutlet = displayOutlets.find(o => o.outletName === selectedOutletName);

    if (selectedOutlet) {
      setFormData(prev => ({
        ...prev,
        outletName: selectedOutlet.outletName,
        address: selectedOutlet.address,
        location: {
          lat: selectedOutlet.location?.lat || selectedOutlet.lat,
          lng: selectedOutlet.location?.lng || selectedOutlet.lng
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        outletName: '',
        address: '',
        location: { lat: 0, lng: 0 }
      }));
    }
    setError('');
  };

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

    if (!formData.category || !formData.description || !formData.outletName) {
      setError('Category, description, and outlet selection are required.');
      setLoading(false);
      return;
    }


    try {
      const payload = new FormData();
      payload.append('category', formData.category);
      payload.append('title', `${formData.category || 'Service'} service request`);
      payload.append('description', formData.description.trim());
      payload.append('address', formData.address);
      payload.append('outletName', formData.outletName);
      payload.append('location[lat]', formData.location.lat);
      payload.append('location[lng]', formData.location.lng);



      // Compress and append images
      for (const image of images) {
        try {
          const compressed = await compressImage(image);
          payload.append('images', compressed);
        } catch (e) {
          console.error('Compression failed, using original', e);
          payload.append('images', image);
        }
      }

      // Submit the request and wait for response
      await api.post('/service-requests', payload, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      setFormData({
        category: category || '',
        description: '',
        address: '',
        outletName: '',
        location: { lat: 0, lng: 0 }
      });
      setImages([]);
      setImagePreviews([]);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
      setShowSuccess(true);
    } catch (err) {
      const message = err?.response?.data?.message || 'Failed to create service request. Please try again.';
      setError(message);
    } finally {
      setLoading(false);
    }
  };



  return (
    <div className="w-full relative overflow-hidden page-transition">
      {showSuccess && (
        <SuccessState
          title="Request Logged!"
          message="Your service request has been successfully recorded. A technician will review your requirements and reach out shortly."
          onComplete={onSuccess}
        />
      )}
      {loading && <LoadingState message={images.length > 0 ? "Optimizing & Sending..." : "Sending Request..."} fullPage={true} />}
      {/* Background gradients */}
      <div className="fixed top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0">
        <div className="absolute top-[15%] left-[10%] w-[40%] h-[40%] rounded-full bg-violet-600/5 blur-[120px]" />
        <div className="absolute bottom-[20%] right-[20%] w-[30%] h-[30%] rounded-full bg-blue-600/5 blur-[120px]" />
      </div>

      <div className="max-w-form mx-auto relative z-10 animate-scale-in">
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
          <div className="bg-slate-950/20 rounded-[28px] p-5 sm:p-8">
            <div className="flex items-center gap-3 sm:gap-4 mb-6 sm:mb-8">
              <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-gradient-to-br from-violet-600 to-violet-700 flex items-center justify-center shadow-lg shadow-violet-500/20 flex-shrink-0">
                <Wrench className="w-6 h-6 sm:w-7 sm:h-7 text-white" />
              </div>
              <div>
                <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight leading-tight">New Service</h2>
                <p className="text-slate-400 text-xs sm:text-sm mt-1">Request a new installation or specialized service.</p>
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
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-3 ml-1">Service Category</label>
                  <p className="text-[10px] text-slate-600 font-medium mb-3 ml-1">AUTOMATICALLY SELECTED BASED ON YOUR CHOICE</p>
                  <div className="relative group">
                    <select
                      name="category"
                      value={formData.category}
                      onChange={handleChange}
                      className="w-full compact-input bg-slate-900/50 border border-white/10 rounded-2xl text-white focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500/50 transition-all appearance-none cursor-not-allowed disabled:opacity-50 font-bold"
                      required
                      disabled={Boolean(category)}
                    >
                      <option value="" className="bg-slate-900">Choose Category</option>
                      {categories.map((item) => (
                        <option key={item} value={item} className="bg-slate-900">
                          {item}
                        </option>
                      ))}
                    </select>

                  </div>

                  {/* Outlet Selection */}
                  <div className='mt-4'>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-3 ml-1 flex items-center gap-2">
                      <Building className="w-3.5 h-3.5" />
                      Registered Outlet
                    </label>
                    <div className="relative group" ref={outletDropdownRef}>
                      <button
                        type="button"
                        onClick={() => setIsOutletDropdownOpen(!isOutletDropdownOpen)}
                        className="w-full h-14 bg-slate-900/50 border border-white/10 rounded-2xl px-5 text-left flex items-center justify-between group-hover:border-violet-500/50 transition-all focus:ring-2 focus:ring-violet-500/20"
                      >
                        <div className="flex items-center gap-3">
                          <Building className="w-5 h-5 text-violet-400" />
                          <div className="flex flex-col">
                            <span className="text-sm font-bold text-white leading-tight">
                              {formData.outletName || 'Select Registered Outlet'}
                            </span>
                            {!formData.outletName && (
                              <span className="text-[10px] text-slate-500 uppercase tracking-widest font-bold">
                                Select branch location
                              </span>
                            )}
                          </div>
                        </div>
                        <ChevronDown className={`w-5 h-5 text-slate-500 transition-transform duration-300 ${isOutletDropdownOpen ? 'rotate-180' : ''}`} />
                      </button>

                      {isOutletDropdownOpen && (
                        <div className="absolute top-full left-0 right-0 mt-3 bg-slate-900/95 backdrop-blur-xl border border-white/10 rounded-3xl shadow-2xl z-[100] max-h-[400px] overflow-hidden animate-fade-in-up">
                          <div className="p-2 overflow-y-auto max-h-[390px] custom-scrollbar">
                            {displayOutlets.map((outlet, index) => (
                              <button
                                key={index}
                                type="button"
                                onClick={() => {
                                  handleOutletChange({ target: { value: outlet.outletName } });
                                  setIsOutletDropdownOpen(false);
                                }}
                                className={`w-full text-left p-4 rounded-2xl transition-all mb-1 last:mb-0 group/item flex items-start gap-4 ${formData.outletName === outlet.outletName ? 'bg-violet-500/10 border border-violet-500/20' : 'hover:bg-white/5 border border-transparent'}`}
                              >
                                <div className={`p-2 rounded-xl flex-shrink-0 ${formData.outletName === outlet.outletName ? 'bg-violet-500/20' : 'bg-slate-800'}`}>
                                  <MapPin className={`w-4 h-4 ${formData.outletName === outlet.outletName ? 'text-violet-400' : 'text-slate-400'}`} />
                                </div>
                                <div className="flex-1 min-w-0">
                                  <p className={`text-sm font-bold mb-0.5 ${formData.outletName === outlet.outletName ? 'text-violet-400' : 'text-white'}`}>
                                    {outlet.outletName}
                                  </p>
                                  <p className="text-xs text-slate-400 leading-relaxed font-medium break-words">
                                    {outlet.address}
                                  </p>
                                </div>
                              </button>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                    {formData.address && (
                      <div className="mt-3 p-4 bg-violet-500/5 border border-violet-500/10 rounded-2xl animate-fade-in">
                        <div className="flex items-start gap-3">
                          <MapPin className="w-4 h-4 text-violet-400 mt-0.5 flex-shrink-0" />
                          <p className="text-xs text-slate-400 leading-relaxed">
                            <span className="text-violet-400 font-bold uppercase tracking-tighter mr-1">Address:</span>
                            {formData.address}
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-3 ml-1">Detailed Description</label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    rows="6"
                    placeholder="Describe what service you need in detail. Include specific requirements, location details, or special instructions..."
                    className="w-full px-5 py-4 bg-slate-900/50 border border-white/10 rounded-2xl text-white placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500/50 transition-all font-medium resize-none shadow-inner"
                    required
                  />
                </div>



                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-3 ml-1 flex items-center gap-2">
                    <Upload className="w-3.5 h-3.5" />
                    Area Images
                    <span className="text-[10px] text-slate-600 font-normal normal-case ml-auto">Optional • Max {MAX_IMAGES}</span>
                  </label>
                  <p className="text-[10px] text-slate-500 mb-3 ml-1 uppercase tracking-tight">Photos of the installation setup help us provide a better quote.</p>

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
                      className="flex flex-col items-center justify-center w-full h-40 border-2 border-dashed border-white/10 rounded-3xl bg-slate-950/20 hover:bg-slate-900/50 hover:border-violet-500/30 cursor-pointer transition-all group"
                    >
                      <div className="flex flex-col items-center justify-center pt-5 pb-6">
                        <div className="w-12 h-12 rounded-xl bg-violet-500/10 border border-violet-500/20 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                          <Upload className="w-6 h-6 text-violet-400" />
                        </div>
                        <p className="text-sm font-bold text-slate-300 mb-1">
                          <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-400 to-blue-400">Click to upload</span> or drag and drop
                        </p>
                        <p className="text-[10px] text-slate-500 font-medium uppercase tracking-widest">
                          JPG, PNG formats supported
                        </p>
                      </div>
                    </label>
                  </div>

                  {imagePreviews.length > 0 && (
                    <div className="mt-6 flex flex-wrap gap-4">
                      {imagePreviews.map((preview, index) => (
                        <div key={index} className="relative group/img">
                          <div className="w-20 h-20 rounded-xl overflow-hidden border border-white/10 bg-slate-900 shadow-xl group-hover/img:border-violet-500/50 transition-all">
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

              <div className="pt-8 border-t border-white/5">
                <p className="text-[10px] text-slate-600 mb-6 flex items-center gap-2 uppercase tracking-widest font-bold">
                  <span className="w-1.5 h-1.5 rounded-full bg-violet-500 animate-pulse"></span>
                  Professional installation guaranteed
                </p>
                <div className="flex flex-col sm:flex-row gap-4">
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full max-w-md mx-auto sm:mx-0 sm:flex-[2] relative overflow-hidden group h-14 bg-gradient-to-r from-violet-600 to-blue-600 text-white rounded-2xl font-bold uppercase tracking-wider text-sm transition-all hover:shadow-[0_0_25px_rgba(139,92,246,0.4)] disabled:opacity-50 active:scale-95 flex items-center justify-center shadow-lg shadow-violet-500/20 sm:shadow-none"
                  >
                    <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform"></div>
                    <div className="relative z-10 flex items-center gap-2">
                      {loading ? (
                        <>
                          <Loader2 className="w-5 h-5 animate-spin" />
                          <span>Requesting...</span>
                        </>
                      ) : (
                        <span>Confirm Service Request</span>
                      )}
                    </div>
                  </button>
                  <button
                    type="button"
                    onClick={onCancel}
                    className="w-full max-w-md mx-auto sm:mx-0 sm:flex-1 h-14 border border-white/10 bg-slate-900/50 text-slate-400 hover:text-white hover:border-white/20 rounded-2xl font-bold uppercase tracking-wider text-xs transition-all active:scale-95"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ServiceRequestForm;


