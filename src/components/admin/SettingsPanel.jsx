import { useState, useEffect } from 'react';
import { Phone, Mail, Headphones, Save, Loader2, CheckCircle2, X } from 'lucide-react';
import api from '../../services/api';

const SettingsPanel = ({ onClose }) => {
    const [settings, setSettings] = useState({
        supportPhone: '',
        supportEmail: '',
        supportWhatsApp: ''
    });
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState({ type: '', text: '' });

    useEffect(() => {
        fetchSettings();
    }, []);

    const fetchSettings = async () => {
        try {
            setLoading(true);
            const response = await api.get('/settings');
            setSettings(response.data);
        } catch (err) {
            console.error('Failed to fetch settings:', err);
            setMessage({ type: 'error', text: 'Failed to load settings' });
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async (e) => {
        e.preventDefault();
        try {
            setSaving(true);
            setMessage({ type: '', text: '' });
            const response = await api.put('/settings', settings);
            setSettings(response.data);
            setMessage({ type: 'success', text: 'Settings updated successfully!' });

            // Clear success message after 3 seconds
            setTimeout(() => setMessage({ type: '', text: '' }), 3000);
        } catch (err) {
            console.error('Failed to update settings:', err);
            setMessage({ type: 'error', text: err.response?.data?.message || 'Failed to update settings' });
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center py-20">
                <Loader2 className="w-10 h-10 text-blue-500 mb-4" />
                <p className="text-slate-400 font-medium">Loading system configurations...</p>
            </div>
        );
    }

    return (
        <div className="glass-card p-6 bg-slate-900/40 backdrop-blur-md border border-white/5 h-full overflow-y-auto custom-scrollbar">
            <div className="mb-6 flex justify-between items-start gap-4 ">
                <div>
                    <h2 className="text-2xl font-bold text-white flex items-center gap-3">
                        <div className="p-2 rounded-xl bg-blue-500/10 text-blue-400">
                            <Headphones className="w-6 h-6" />
                        </div>
                        Support Configuration
                    </h2>
                    <p className="text-slate-400 mt-2">Manage the contact information displayed to users in their portal.</p>
                </div>
                {onClose && (
                    <button
                        onClick={onClose}
                        className="p-2 rounded-xl bg-slate-800/50 hover:bg-slate-800 text-slate-400 hover:text-white border border-white/5"
                        title="Close Settings"
                    >
                        <X className="w-6 h-6" />
                    </button>
                )}
            </div>

            <form onSubmit={handleSave} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Support Phone */}
                    <div className="bg-slate-900/40 border border-white/5 rounded-2xl p-4 hover:border-blue-500/20 group">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="p-2 rounded-lg bg-blue-500/10 text-blue-400">
                                <Phone className="w-4 h-4" />
                            </div>
                            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Support Phone</label>
                        </div>
                        <input
                            type="text"
                            value={settings.supportPhone}
                            onChange={(e) => setSettings({ ...settings, supportPhone: e.target.value })}
                            className="w-full bg-slate-950/50 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 font-medium"
                            placeholder="+91 00000 00000"
                            required
                        />
                    </div>

                    {/* Support Email */}
                    <div className="bg-slate-900/40 border border-white/5 rounded-2xl p-4 hover:border-violet-500/20 group">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="p-2 rounded-lg bg-violet-500/10 text-violet-400">
                                <Mail className="w-4 h-4" />
                            </div>
                            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Support Email</label>
                        </div>
                        <input
                            type="email"
                            value={settings.supportEmail}
                            onChange={(e) => setSettings({ ...settings, supportEmail: e.target.value })}
                            className="w-full bg-slate-950/50 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-violet-500/50 font-medium"
                            placeholder="support@company.com"
                            required
                        />
                    </div>

                    {/* WhatsApp Number */}
                    <div className="bg-slate-900/40 border border-white/5 rounded-2xl p-4 hover:border-emerald-500/20 group md:col-span-2">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400">
                                <Phone className="w-4 h-4" />
                            </div>
                            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">WhatsApp Number</label>
                        </div>
                        <div className="flex gap-4 items-center">
                            <input
                                type="text"
                                value={settings.supportWhatsApp}
                                onChange={(e) => setSettings({ ...settings, supportWhatsApp: e.target.value })}
                                className="flex-1 bg-slate-950/50 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50 font-medium"
                                placeholder="917550212046"
                                required
                            />
                            <div className="px-4 py-2 bg-emerald-500/10 text-emerald-400 text-xs font-bold rounded-lg border border-emerald-500/20">
                                wa.me/{settings.supportWhatsApp}
                            </div>
                        </div>
                        <p className="text-[9px] text-slate-500 mt-1 px-1 italic">Digits only, include country code (e.g. 91 for India).</p>
                    </div>
                </div>

                {message.text && (
                    <div className={`p-4 rounded-2xl flex items-center gap-3 ${message.type === 'success'
                        ? 'bg-emerald-500/10 border border-emerald-500/20 text-emerald-400'
                        : 'bg-red-500/10 border border-red-500/20 text-red-400'
                        }`}>
                        {message.type === 'success' ? <CheckCircle2 className="w-5 h-5" /> : <div className="w-5 h-5 rounded-full bg-red-500/20 flex items-center justify-center font-bold text-xs">!</div>}
                        <p className="text-sm font-semibold">{message.text}</p>
                    </div>
                )}

                <div className="pt-4 flex justify-end gap-4">
                    {onClose && (
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-8 py-4 bg-slate-800/50 hover:bg-slate-800 text-slate-300 font-bold rounded-2xl border border-white/5"
                        >
                            Exit Settings
                        </button>
                    )}
                    <button
                        type="submit"
                        disabled={saving}
                        className="flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-blue-600 to-violet-600 hover:from-blue-500 hover:to-violet-500 text-white font-bold rounded-2xl disabled:opacity-50"
                    >
                        {saving ? (
                            <>
                                <Loader2 className="w-5 h-5" />
                                Saving Changes...
                            </>
                        ) : (
                            <>
                                <Save className="w-5 h-5" />
                                Update Configuration
                            </>
                        )}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default SettingsPanel;
