import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import { User, Mail, Phone, Building, MapPin, Save, ArrowLeft, Loader2, Calendar, Clock, ExternalLink } from 'lucide-react';
import LoadingState from './common/LoadingState';
import UserNavigation from './UserNavigation';

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
    }
  });

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
          location: userData.location || { lat: 0, lng: 0 }
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
            location: user.location || { lat: 0, lng: 0 }
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
      <div className="min-h-screen bg-slate-950 flex flex-col">
        <UserNavigation />
        <div className="flex-1 flex flex-col items-center justify-center pt-20">
          <LoadingState message="Retrieving Profile Data" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 relative overflow-hidden flex flex-col">
      {saving && <LoadingState message="Saving Profile Changes..." fullPage={true} />}
      {/* Background gradients */}
      <div className="fixed top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0">
        <div className="absolute top-[10%] left-[20%] w-[30%] h-[30%] rounded-full bg-blue-600/5 blur-[100px]" />
        <div className="absolute bottom-[20%] right-[10%] w-[40%] h-[40%] rounded-full bg-violet-600/5 blur-[100px]" />
      </div>

      <UserNavigation />

      <main className="flex-1 overflow-y-auto relative z-10 page-transition">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 relative z-10">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-4">
              <button
                onClick={() => navigate('/')}
                className="group p-3 rounded-2xl bg-slate-900/50 border border-white/5 text-slate-400 hover:text-white hover:bg-slate-800/80 transition-all active:scale-95"
              >
                <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
              </button>
              <div>
                <p className="text-xs font-bold text-slate-500 uppercase tracking-widest leading-none mb-1">Account settings</p>
                <p className="text-xl font-bold text-white tracking-tight leading-none">Security Profile</p>
              </div>
            </div>
          </div>
          <div className="glass-card rounded-[32px] border border-white/5 p-1 relative overflow-hidden">
            <div className="bg-slate-950/20 rounded-[28px] p-8 lg:p-12">
              <div className="flex flex-col md:flex-row md:items-center gap-6 mb-12">
                <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-blue-600 to-violet-600 flex items-center justify-center shadow-xl shadow-blue-500/20 ring-4 ring-white/5">
                  <User className="w-10 h-10 text-white" />
                </div>
                <div>
                  <h1 className="text-3xl md:text-4xl font-bold text-white tracking-tight mb-2">Personal Identity</h1>
                  <p className="text-slate-400 font-medium">Manage your contact information and office coordinates.</p>
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

                    {/* Address */}
                    <div className="space-y-3">
                      <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest ml-1">
                        <MapPin className="w-3.5 h-3.5 inline mr-2 text-blue-400" />
                        Physical Address
                      </label>
                      <textarea
                        name="address"
                        value={formData.address}
                        onChange={handleChange}
                        required
                        rows={4}
                        className="w-full px-5 py-4 bg-slate-900/50 border border-white/10 rounded-2xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500/50 transition-all font-medium resize-none shadow-inner"
                        placeholder="Complete office or residence address..."
                      />
                    </div>

                    {/* Location Section */}
                    <div className="pt-8 border-t border-white/5 space-y-6">
                      <div className="flex items-center justify-between">
                        <h3 className="text-xl font-bold text-white tracking-tight flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg bg-blue-500/10 border border-blue-500/20 flex items-center justify-center">
                            <MapPin className="w-4 h-4 text-blue-400" />
                          </div>
                          Geo-Navigation
                        </h3>
                        <button
                          type="button"
                          onClick={handleLocationSelect}
                          disabled={loading}
                          className="px-5 py-2.5 bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 border border-blue-500/20 rounded-xl text-xs font-bold uppercase tracking-wider transition-all disabled:opacity-50 active:scale-95 flex items-center gap-2"
                        >
                          {loading ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : (
                            <>
                              <MapPin className="w-4 h-4" />
                              Use Current Location
                            </>
                          )}
                        </button>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="relative group/lat">
                          <span className="absolute left-5 top-1/2 -translate-y-1/2 text-[10px] font-black text-slate-600 uppercase tracking-widest group-focus-within/lat:text-blue-500/50 transition-colors">LAT</span>
                          <input
                            type="number"
                            step="any"
                            value={formData.location.lat}
                            onChange={(e) => setFormData(prev => ({
                              ...prev,
                              location: { ...prev.location, lat: parseFloat(e.target.value) || 0 }
                            }))}
                            className="w-full pl-14 pr-5 py-4 bg-slate-900/50 border border-white/10 rounded-2xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500/50 transition-all font-mono text-sm"
                          />
                        </div>
                        <div className="relative group/lng">
                          <span className="absolute left-5 top-1/2 -translate-y-1/2 text-[10px] font-black text-slate-600 uppercase tracking-widest group-focus-within/lng:text-blue-500/50 transition-colors">LNG</span>
                          <input
                            type="number"
                            step="any"
                            value={formData.location.lng}
                            onChange={(e) => setFormData(prev => ({
                              ...prev,
                              location: { ...prev.location, lng: parseFloat(e.target.value) || 0 }
                            }))}
                            className="w-full pl-14 pr-5 py-4 bg-slate-900/50 border border-white/10 rounded-2xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500/50 transition-all font-mono text-sm"
                          />
                        </div>
                      </div>

                      {formData.location.lat !== 0 && formData.location.lng !== 0 && (
                        <div className="p-1 rounded-[2.5rem] bg-gradient-to-br from-blue-600/20 via-slate-900/40 to-violet-600/20 border border-white/5 overflow-hidden">
                          <div className="bg-slate-950/40 rounded-[2.25rem] p-6 flex flex-col sm:flex-row items-center justify-between gap-6">
                            <div className="flex items-center gap-4">
                              <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center">
                                <ExternalLink className="w-6 h-6 text-slate-400" />
                              </div>
                              <div>
                                <p className="text-white font-bold leading-tight">Interactive Map Link</p>
                                <p className="text-xs text-slate-500 uppercase tracking-widest font-bold mt-1">Satellite Coordinates Locked</p>
                              </div>
                            </div>
                            <a
                              href={`https://www.google.com/maps?q=${formData.location.lat},${formData.location.lng}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="w-full sm:w-auto px-8 py-3.5 bg-white text-slate-950 rounded-2xl font-bold text-sm hover:bg-blue-50 transition-all shadow-[0_0_20px_rgba(255,255,255,0.1)] active:scale-95 flex items-center justify-center gap-2"
                            >
                              <MapPin className="w-4 h-4" />
                              Open Navigation
                            </a>
                          </div>
                        </div>
                      )}
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
    </div>
  );
};

export default UserProfile;
