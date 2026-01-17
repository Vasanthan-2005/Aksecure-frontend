import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, Shield, Mail, MailCheck, Loader2, CheckCircle2 } from 'lucide-react';
import { toast } from 'react-toastify';
import api from '../services/api';
import LoadingState from './common/LoadingState';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);
  const navigate = useNavigate();

  // Keep track of mounting to avoid state updates on unmount
  const mounted = useRef(true);
  useEffect(() => {
    return () => { mounted.current = false };
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email) {
      toast.error('Please enter your email');
      return;
    }

    try {
      setLoading(true);
      setMessage('');

      // WORKAROUND: Check if user exists by attempting login with dummy password
      try {
        await api.post('/auth/login', {
          email: email,
          password: "Action_Verify_User_" + Math.random().toString(36)
        });
      } catch (loginError) {
        const errorMsg = loginError.response?.data?.message?.toLowerCase() || '';

        if (errorMsg.includes('user') ||
          errorMsg.includes('account') ||
          errorMsg.includes('email') ||
          errorMsg.includes('not found')) {
          setLoading(false);
          setMessage('Email address not registered');
          toast.error('Email address not registered');
          return;
        }
      }

      await api.post('/auth/forgot-password', { email });
      setIsSuccess(true);
      setMessage('Password reset link has been sent to your email');
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Failed to send reset link';
      setMessage(errorMessage);
      toast.error(errorMessage);
    } finally {
      if (!mounted.current) return;
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen lg:h-screen flex flex-col lg:flex-row relative overflow-x-hidden overflow-y-auto lg:overflow-hidden bg-[#020617] text-white">
      {loading && <LoadingState message="Verifying Identity" fullPage={true} />}

      {/* LEFT PANEL - BRAND SECTION */}
      <div className="flex lg:w-1/2 relative flex-col justify-between p-8 sm:p-12 lg:p-20 overflow-hidden bg-gradient-to-b from-[#0A192F] to-[#020617] min-h-[35vh] lg:h-screen">
        {/* Subtle Vignette & Glow */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-500/10 blur-[120px] rounded-full"></div>
          <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-indigo-500/10 blur-[120px] rounded-full"></div>
          <div className="absolute inset-0 shadow-[inner_0_0_100px_rgba(0,0,0,0.5)]"></div>
        </div>

        {/* Top Section: Logo */}
        <div className="relative z-10 flex-none">
          <div className="w-12 h-12 lg:w-14 lg:h-14 rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-700 flex items-center justify-center shadow-[0_0_20px_rgba(37,99,235,0.4)]">
            <Shield className="w-7 h-7 lg:w-8 lg:h-8 text-white" />
          </div>
        </div>

        {/* Middle Section: Headline & Description */}
        <div className="relative z-10 flex-1 flex flex-col justify-center py-10">
          <div className="max-w-xl">
            <h1 className="text-2xl sm:text-4xl lg:text-[42px] font-extrabold tracking-tight leading-[1.2] mb-4 lg:mb-6">
              <span className="block text-white">Regain your access</span>
              <span className="block text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-blue-400 to-blue-500 pb-1">
                securely & instantly
              </span>
            </h1>
            <p className="text-xs sm:text-base lg:text-lg text-slate-400/80 max-w-sm leading-relaxed font-medium">
              Forgot your password? No worries. Enter your details and we'll help you get back to your surveillance dashboard in no time.
            </p>
          </div>
        </div>

        {/* Bottom Section: Features */}
        <div className="relative z-10 flex-none bottom-0">
          <div className="space-y-4 lg:space-y-5 mb-8 lg:mb-0">
            {[
              { icon: <Shield className="w-4 h-4 sm:w-5 h-5" />, title: "Secure Recovery", sub: "Encrypted recovery links", color: "text-blue-400" },
              { icon: <MailCheck className="w-4 h-4 sm:w-5 h-5" />, title: "Instant Delivery", sub: "Verification links in seconds", color: "text-purple-400" },
              { icon: <CheckCircle2 className="w-4 h-4 sm:w-5 h-5" />, title: "2FA Integration", sub: "Multi-layer security", color: "text-indigo-400" }
            ].map((feature, idx) => (
              <div key={idx} className="flex items-start gap-3 sm:gap-4">
                <div className={`w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-slate-800/60 flex items-center justify-center flex-shrink-0 border border-white/10 ${feature.color}`}>
                  {feature.icon}
                </div>
                <div>
                  <h3 className="text-xs sm:text-[15px] font-bold text-slate-200 leading-tight">{feature.title}</h3>
                  <p className="text-[10px] sm:text-sm text-slate-500 font-medium">{feature.sub}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* RIGHT PANEL - FORM SECTION */}
      <div className="flex-1 flex items-center justify-center p-4 sm:p-8 relative overflow-hidden">
        {/* Dark Background with subtle shading */}
        <div className="absolute inset-0 bg-[#020617]">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[60%] h-[60%] bg-indigo-500/5 blur-[150px] rounded-full"></div>
        </div>

        <div className="w-full max-w-[480px] relative z-10 flex flex-col items-center">
          {/* Back Button Pin */}
          <div className="absolute -top-12 left-0 lg:left-0">
            <Link
              to="/login"
              className="flex items-center gap-2 text-[10px] font-bold text-slate-500 hover:text-white uppercase tracking-widest transition-all"
            >
              <ArrowLeft className="w-3 h-3" />
              Back to Login
            </Link>
          </div>

          {/* Glass Card */}
          <div className="w-full bg-slate-900/30 backdrop-blur-3xl border border-white/10 rounded-[32px] sm:rounded-[40px] p-6 sm:p-12 shadow-2xl relative">
            
            {/* Header */}
            <div className="mb-10">
              <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-6 shadow-lg transition-transform duration-300 ${isSuccess ? 'bg-emerald-500/10 text-emerald-400' : 'bg-blue-500/10 text-blue-400'}`}>
                {isSuccess ? <MailCheck className="w-7 h-7" /> : <Mail className="w-7 h-7" />}
              </div>
              <h2 className="text-3xl font-bold text-white mb-2 tracking-tight">
                {isSuccess ? "Check Your Email" : "Forgot Password?"}
              </h2>
              <p className="text-slate-500 text-sm font-medium">
                {isSuccess 
                  ? "A recovery link has been sent to your registered email address." 
                  : "Enter your registered email and we'll send you a link to reset your password."}
              </p>
            </div>

            {!isSuccess ? (
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 mb-2 uppercase tracking-[0.15em]">
                    Email Address
                  </label>
                  <div className="relative group">
                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-blue-400 transition-colors">
                      <Mail className="w-5 h-5" />
                    </div>
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className={`w-full bg-black/40 border border-white/5 rounded-2xl pl-12 pr-4 py-4 text-white placeholder:text-slate-700 outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/20 transition-all ${message ? 'border-red-500/50' : ''}`}
                      placeholder="admin@company.com"
                    />
                  </div>
                  {message && (
                    <p className="mt-2 text-[11px] text-red-400 font-bold uppercase tracking-wider">{message}</p>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 text-white font-extrabold py-4 rounded-2xl shadow-[0_10px_20px_rgba(37,99,235,0.2)] transform active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed uppercase tracking-widest text-[13px]"
                >
                  {loading ? (
                    <span className="flex items-center justify-center gap-2">
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Processing...
                    </span>
                  ) : "Send Recovery Link"}
                </button>
              </form>
            ) : (
              <div className="space-y-6 animate-fade-in">
                <div className="p-6 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl">
                  <p className="text-sm text-emerald-400 leading-relaxed font-medium">
                    We've sent an email to <span className="text-white font-bold">{email}</span> with instructions to reset your password. Please check your inbox and spam folder.
                  </p>
                </div>
                
                <button
                  onClick={() => {
                    setIsSuccess(false);
                    setEmail('');
                    setMessage('');
                  }}
                  className="w-full py-4 rounded-2xl border border-white/10 text-slate-300 font-bold text-xs uppercase tracking-widest hover:bg-white/5 transition-all active:scale-[0.98]"
                >
                  Try alternate email
                </button>
              </div>
            )}
          </div>

          {/* Encryption & Copyright Notice */}
          <div className="mt-10 text-center w-full">
            <p className="text-[9px] text-slate-500/60 font-medium uppercase tracking-[0.15em]">
              © {new Date().getFullYear()} AKSECURE. ALL RIGHTS RESERVED.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
