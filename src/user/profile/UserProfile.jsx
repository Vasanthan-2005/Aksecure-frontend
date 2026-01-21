import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import { User, Mail, Phone, Building, MapPin, Save, ArrowLeft, Loader2, Calendar, Clock, ExternalLink, Plus, Edit2 } from 'lucide-react';
import LoadingState from '../../common/components/LoadingState';
import { UserTopNav, UserBottomNav } from '../navigation/UserNavigation';
import OutletModal from '../../common/dialogs/OutletModal';

const UserProfile = () => {
  const { user, updateUser } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [fullUserData, setFullUserData] = useState(null);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    companyName: '',
    address: '',
    location: {
      lat: 0,
      lng: 0
    },
    outlets: []
  });
  const [showOutletModal, setShowOutletModal] = useState(false);
  const [initialEditIndex, setInitialEditIndex] = useState(null);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        setLoading(true);
        const response = await api.get('/auth/me');
        const userData = response.data;

        // Store full user data for displaying timestamps
        setFullUserData(userData);

        setFormData({
          name: userData.name || '',
          email: userData.email || '',
          phone: userData.phone || '',
          companyName: userData.companyName || '',
          address: userData.address || '',
          location: userData.location || { lat: 0, lng: 0 },
          outlets: userData.outlets || []
        });
      } catch (err) {
        console.error('Failed to fetch user data:', err);
        setError('Failed to load user data');
        // Fallback to context user data
        if (user) {
          setFullUserData(user);
          setFormData({
            name: user.name || '',
            email: user.email || '',
            phone: user.phone || '',
            companyName: user.companyName || '',
            address: user.address || '',
            location: user.location || { lat: 0, lng: 0 },
            outlets: user.outlets || []
          });
        }
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [user]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    setError('');
    setSuccess('');
  };

  const handleLocationSelect = (e) => {
    e.preventDefault();
    if (navigator.geolocation) {
      setLoading(true);
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setFormData(prev => ({
            ...prev,
            location: {
              lat: position.coords.latitude,
              lng: position.coords.longitude
            }
          }));
          setLoading(false);
          setSuccess('Location updated successfully!');
        },
        (err) => {
          setError('Failed to get location. Please enter address manually.');
          setLoading(false);
        }
      );
    } else {
      setError('Geolocation is not supported by your browser.');
    }
  };

  const handleSaveOutlets = (newOutlets) => {
    setFormData(prev => ({
      ...prev,
      outlets: newOutlets
    }));
    setError('');
    setSuccess('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setSaving(true);

    try {
      const response = await api.put('/auth/profile', formData);
      updateUser(response.data);
      setFullUserData(response.data);
      setSuccess('Profile updated successfully!');
      setTimeout(() => {
        navigate('/');
      }, 1500);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="h-screen bg-slate-950 flex flex-col overflow-hidden">
        <UserTopNav />
        <div className="flex-1 flex flex-col items-center justify-center p-4">
          <LoadingState message="Retrieving Profile Data" />
        </div>
        <UserBottomNav />
      </div>
    );
  }

  return (
    <div className="h-screen bg-slate-950 flex flex-col overflow-hidden relative">
      {saving && <LoadingState message="Saving Profile Changes..." fullPage={true} />}
      {/* Background gradients */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute top-[10%] left-[20%] w-[30%] h-[30%] rounded-full bg-blue-600/5 blur-[100px]" />
        <div className="absolute bottom-[20%] right-[10%] w-[40%] h-[40%] rounded-full bg-violet-600/5 blur-[100px]" />
      </div>

      <UserTopNav />

      <main className="flex-1 overflow-y-auto relative z-10 page-transition scrollbar-hide">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pt-4 pb-24 sm:pb-8 relative z-10">
          <div className="flex items-center justify-between mb-6 sm:mb-8">
            <div className="flex items-center gap-3 sm:gap-4">
              <button
                onClick={() => navigate('/')}
                className="group p-2.5 sm:p-3 rounded-2xl bg-slate-900/50 border border-white/5 text-slate-400 hover:text-white hover:bg-slate-800/80 transition-all active:scale-95"
              >
                <ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5 group-hover:-translate-x-1 transition-transform" />
              </button>
              <div>
                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest leading-none mb-1">Account settings</p>
                <p className="text-lg sm:text-xl font-bold text-white tracking-tight leading-none">Security Profile</p>
              </div>
            </div>
          </div>
          <div className="glass-card rounded-[2rem] sm:rounded-[32px] border border-white/5 p-1 relative overflow-hidden">
            <div className="bg-slate-950/20 rounded-[1.75rem] sm:rounded-[28px] p-5 sm:p-8 lg:p-12">
              <div className="flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-6 mb-8 sm:mb-12">
                <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl sm:rounded-3xl bg-gradient-to-br from-blue-600 to-violet-600 flex items-center justify-center shadow-xl shadow-blue-500/20 ring-4 ring-white/5">
                  <User className="w-8 h-8 sm:w-10 sm:h-10 text-white" />
                </div>
                <div>
                  <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white tracking-tight mb-1 sm:mb-2">Personal Identity</h1>
                  <p className="text-xs sm:text-sm text-slate-400 font-medium">Manage your contact information and office coordinates.</p>
                </div>
              </div>

              {loading ? (
                <div className="flex flex-col items-center justify-center py-20 gap-4">
                  <div className="w-10 h-10 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                  <p className="text-xs font-bold text-slate-500 uppercase tracking-[0.2em]">Authenticating Data</p>
                </div>
              ) : (
                <>
                  {error && (
                    <div className="mb-8 p-5 bg-red-500/10 border border-red-500/20 rounded-2xl flex items-center gap-3 animate-shake">
                      <div className="w-1.5 h-1.5 rounded-full bg-red-400"></div>
                      <p className="text-sm font-bold text-red-400">{error}</p>
                    </div>
                  )}

                  {success && (
                    <div className="mb-8 p-5 bg-green-500/10 border border-green-500/20 rounded-2xl flex items-center gap-3 animate-fade-in">
                      <div className="w-1.5 h-1.5 rounded-full bg-green-400"></div>
                      <p className="text-sm font-bold text-green-400">{success}</p>
                    </div>
                  )}

                  <form onSubmit={handleSubmit} className="space-y-10">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      {/* Name */}
                      <div className="space-y-3">
                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest ml-1">
                          <User className="w-3.5 h-3.5 inline mr-2 text-blue-400" />
                          Full Identity
                        </label>
                        <input
                          type="text"
                          name="name"
                          value={formData.name}
                          onChange={handleChange}
                          required
                          className="w-full px-5 py-4 bg-slate-900/50 border border-white/10 rounded-2xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500/50 transition-all font-medium"
                          placeholder="John Doe"
                        />
                      </div>

                      {/* Email */}
                      <div className="space-y-3">
                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest ml-1">
                          <Mail className="w-3.5 h-3.5 inline mr-2 text-blue-400" />
                          Access Email
                        </label>
                        <input
                          type="email"
                          name="email"
                          value={formData.email}
                          readOnly
                          className="w-full px-5 py-4 bg-slate-950/50 border border-white/5 rounded-2xl text-slate-500 font-medium cursor-not-allowed"
                          disabled
                        />
                        <p className="text-[10px] text-slate-600 font-bold uppercase tracking-tight ml-1">Immutable Security Credential</p>
                      </div>

                      {/* Phone */}
                      <div className="space-y-3">
                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest ml-1">
                          <Phone className="w-3.5 h-3.5 inline mr-2 text-blue-400" />
                          Contact Number
                        </label>
                        <input
                          type="tel"
                          name="phone"
                          value={formData.phone}
                          onChange={handleChange}
                          required
                          className="w-full px-5 py-4 bg-slate-900/50 border border-white/10 rounded-2xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500/50 transition-all font-medium"
                          placeholder="+91 XXXXX XXXXX"
                        />
                      </div>

                      {/* Company Name */}
                      <div className="space-y-3">
                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest ml-1">
                          <Building className="w-3.5 h-3.5 inline mr-2 text-blue-400" />
                          Organization
                        </label>
                        <input
                          type="text"
                          name="companyName"
                          value={formData.companyName}
                          onChange={handleChange}
                          required
                          className="w-full px-5 py-4 bg-slate-900/50 border border-white/10 rounded-2xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500/50 transition-all font-medium"
                          placeholder="Enterprise Co."
                        />
                      </div>
                    </div>

                    {/* Outlets Section */}
                    <div className="pt-8 border-t border-white/5 space-y-6">
                      <div className="flex items-center justify-between">
                        <h3 className="text-xl font-bold text-white tracking-tight flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg bg-blue-500/10 border border-blue-500/20 flex items-center justify-center">
                            <Building className="w-4 h-4 text-blue-400" />
                          </div>
                          Outlets & Locations
                        </h3>
                        <button
                          type="button"
                          onClick={() => {
                            setInitialEditIndex(null);
                            setShowOutletModal(true);
                          }}
                          className="px-5 py-2.5 bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 border border-blue-500/20 rounded-xl text-xs font-bold uppercase tracking-wider transition-all active:scale-95 flex items-center gap-2"
                        >
                          <Plus className="w-4 h-4" />
                          Manage Outlets
                        </button>
                      </div>

                      <div className="grid grid-cols-1 gap-4">
                        {formData.outlets && formData.outlets.length > 0 ? (
                          formData.outlets.map((outlet, index) => (
                            <div
                              key={index}
                              className="group relative overflow-hidden bg-slate-900/40 border border-white/5 rounded-3xl p-6 transition-all hover:border-blue-500/30"
                            >
                              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                                <div className="flex items-start gap-4">
                                  <div className="w-12 h-12 rounded-2xl bg-blue-500/10 flex items-center justify-center flex-shrink-0">
                                    <MapPin className="w-6 h-6 text-blue-400" />
                                  </div>
                                  <div>
                                    <p className="text-white font-bold text-lg leading-tight">{outlet.outletName}</p>
                                    <p className="text-sm text-slate-400 mt-1 max-w-xl">{outlet.address}</p>
                                    <div className="flex items-center gap-3 mt-2">
                                      <span className="text-[10px] font-black text-slate-600 uppercase tracking-widest">
                                        LAT: <span className="text-blue-500/70">{outlet.location?.lat?.toFixed(4) || outlet.lat?.toFixed(4)}</span>
                                      </span>
                                      <span className="text-[10px] font-black text-slate-600 uppercase tracking-widest">
                                        LNG: <span className="text-blue-500/70">{outlet.location?.lng?.toFixed(4) || outlet.lng?.toFixed(4)}</span>
                                      </span>
                                    </div>
                                  </div>
                                </div>
                                <div className="flex items-center gap-2 w-full sm:w-auto">
                                  <button
                                    type="button"
                                    onClick={() => {
                                      setInitialEditIndex(index);
                                      setShowOutletModal(true);
                                    }}
                                    className="p-3 rounded-xl bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700 transition-colors"
                                  >
                                    <Edit2 className="w-4 h-4" />
                                  </button>
                                  <a
                                    href={`https://www.google.com/maps?q=${outlet.location?.lat || outlet.lat},${outlet.location?.lng || outlet.lng}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex-1 sm:flex-none px-6 py-3 bg-white text-slate-950 rounded-2xl font-bold text-xs hover:bg-blue-50 transition-all active:scale-95 flex items-center justify-center gap-2"
                                  >
                                    <ExternalLink className="w-4 h-4" />
                                    Navigate
                                  </a>
                                </div>
                              </div>
                            </div>
                          ))
                        ) : (
                          <div className="p-8 border-2 border-dashed border-white/5 rounded-3xl flex flex-col items-center justify-center text-center">
                            <Building className="w-12 h-12 text-slate-600 mb-4 opacity-20" />
                            <p className="text-slate-500 font-medium">No outlets registered for this account.</p>
                            <p className="text-xs text-slate-600 mt-1 uppercase tracking-widest font-bold">Please add at least one branch for navigation</p>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Account Information Section */}
                    {fullUserData && (fullUserData.createdAt || fullUserData.updatedAt) && (
                      <div className="pt-10 border-t border-white/5 space-y-6">
                        <h3 className="text-xl font-bold text-white tracking-tight flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
                            <Calendar className="w-4 h-4 text-emerald-400" />
                          </div>
                          Metadata logs
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          {fullUserData.createdAt && (
                            <div className="group relative overflow-hidden bg-slate-900/40 border border-white/5 rounded-3xl p-6 transition-all hover:border-emerald-500/30">
                              <div className="absolute top-0 right-0 p-8 opacity-[0.03] pointer-events-none group-hover:scale-110 transition-transform">
                                <Calendar className="w-20 h-20 text-white" />
                              </div>
                              <span className="text-[10px] font-black text-emerald-500 uppercase tracking-[0.2em] block mb-3">Onboarded officially</span>
                              <p className="text-xl font-bold text-white mb-1">
                                {new Date(fullUserData.createdAt).toLocaleDateString('en-US', {
                                  year: 'numeric',
                                  month: 'long',
                                  day: 'numeric'
                                })}
                              </p>
                              <p className="text-xs font-medium text-slate-500">
                                Digital Signature Verified • {new Date(fullUserData.createdAt).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                              </p>
                            </div>
                          )}
                          {fullUserData.updatedAt && (
                            <div className="group relative overflow-hidden bg-slate-900/40 border border-white/5 rounded-3xl p-6 transition-all hover:border-violet-500/30">
                              <div className="absolute top-0 right-0 p-8 opacity-[0.03] pointer-events-none group-hover:scale-110 transition-transform">
                                <Clock className="w-20 h-20 text-white" />
                              </div>
                              <span className="text-[10px] font-black text-violet-500 uppercase tracking-[0.2em] block mb-3">Last configuration</span>
                              <p className="text-xl font-bold text-white mb-1">
                                {new Date(fullUserData.updatedAt).toLocaleDateString('en-US', {
                                  year: 'numeric',
                                  month: 'long',
                                  day: 'numeric'
                                })}
                              </p>
                              <p className="text-xs font-medium text-slate-500">
                                Cloud Sync Completed • {new Date(fullUserData.updatedAt).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                              </p>
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Submit Button */}
                    <div className="flex flex-col sm:flex-row justify-end gap-4 pt-10 border-t border-white/5">
                      <button
                        type="button"
                        onClick={() => navigate('/')}
                        className="px-8 py-4 border border-white/10 bg-slate-900/50 text-slate-400 hover:text-white hover:border-white/20 rounded-2xl font-bold uppercase tracking-wider text-xs transition-all active:scale-95"
                      >
                        Discard Changes
                      </button>
                      <button
                        type="submit"
                        disabled={saving}
                        className="relative overflow-hidden group h-14 px-10 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-2xl font-bold uppercase tracking-wider text-sm transition-all hover:shadow-[0_0_25px_rgba(59,130,246,0.4)] disabled:opacity-50 active:scale-95 flex items-center justify-center min-w-[200px]"
                      >
                        <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform"></div>
                        <div className="relative z-10 flex items-center gap-2">
                          {saving ? (
                            <>
                              <Loader2 className="w-5 h-5 animate-spin" />
                              Encrypting...
                            </>
                          ) : (
                            <>
                              <Save className="w-5 h-5" />
                              Update Profile
                            </>
                          )}
                        </div>
                      </button>
                    </div>
                  </form>
                </>
              )}
            </div>
          </div>
        </div>
      </main>
      <OutletModal
        isOpen={showOutletModal}
        onClose={() => {
          setShowOutletModal(false);
          setInitialEditIndex(null);
        }}
        onSave={handleSaveOutlets}
        existingOutlets={formData.outlets}
        initialEditIndex={initialEditIndex}
      />
      <UserBottomNav />
    </div>
  );
};

export default UserProfile;
