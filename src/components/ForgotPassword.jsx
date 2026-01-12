import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Shield, Mail, MailCheck } from 'lucide-react';
import { toast } from 'react-toastify';
import api from '../services/api';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);

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
    <div className="min-h-screen flex relative overflow-hidden bg-slate-950">

      {/* Background gradients */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0">
        <div className="absolute top-[20%] -left-[10%] w-[60%] h-[60%] rounded-full bg-blue-600/10 blur-[120px]" />
        <div className="absolute -bottom-[20%] right-[10%] w-[50%] h-[50%] rounded-full bg-violet-600/10 blur-[120px]" />
      </div>

      {/* LEFT SIDE - BRANDING */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 
                      relative overflow-hidden z-10">

        {/* Pattern overlay */}
        <div className="absolute inset-0 opacity-5">
          <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 brightness-100 contrast-150"></div>
        </div>

        <div className="relative z-10 flex flex-col justify-center px-16 text-white">
          <div className="mb-8">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-violet-600 to-blue-600 flex items-center justify-center mb-6 shadow-lg shadow-blue-500/20">
              <Shield className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-4xl font-bold mb-4 tracking-tight">
              AK SecureTech
            </h1>
            <p className="text-lg text-slate-300 leading-relaxed max-w-md mb">
              Reset your password securely and regain access to your surveillance dashboard.
            </p>
          </div>

          <div className="space-y-4 mt-8">
            <div className="flex items-start space-x-3">
              <div className="w-6 h-6 rounded-full bg-slate-800/80 flex items-center justify-center flex-shrink-0 mt-0.5 border border-white/10">
                <div className="w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_10px_rgba(52,211,153,0.5)]"></div>
              </div>
              <div>
                <p className="font-medium">Secure Reset</p>
                <p className="text-sm text-slate-400">Encrypted links for your security</p>
              </div>
            </div>

            <div className="flex items-start space-x-3">
              <div className="w-6 h-6 rounded-full bg-slate-800/80 flex items-center justify-center flex-shrink-0 mt-0.5 border border-white/10">
                <div className="w-2 h-2 rounded-full bg-blue-400 shadow-[0_0_10px_rgba(96,165,250,0.5)]"></div>
              </div>
              <div>
                <p className="font-medium">Instant Delivery</p>
                <p className="text-sm text-slate-400">Check your inbox within seconds</p>
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* RIGHT SIDE - FORM */}
      <div className="flex-1 flex items-center justify-center p-6 relative z-10">
        <div className="w-full max-w-md">

          {/* Back Button */}
          <div className="flex justify-start mb-6">
            <Link
              to="/login"
              className="inline-flex items-center space-x-2 px-4 py-2 text-xs font-medium text-slate-400 
                         hover:text-white bg-slate-800/30 hover:bg-slate-800/50 rounded-lg border border-white/5 
                         transition-all duration-200"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Login</span>
            </Link>
          </div>

          {/* Form Card */}
          <div className="glass-card p-8 animate-fade-in-up">

            {/* Header */}
            <div className="text-center mb-8">
              <div className={`inline-flex items-center justify-center w-14 h-14 rounded-2xl mb-4 shadow-lg transition-transform hover:scale-105 duration-300 ${isSuccess ? 'bg-emerald-500/10 text-emerald-400' : 'bg-blue-500/10 text-blue-400'
                }`}>
                {isSuccess ?
                  <MailCheck className="w-7 h-7" /> :
                  <Mail className="w-7 h-7" />
                }
              </div>
              <h2 className="text-2xl font-bold text-white">
                {isSuccess ? "Check Your Email" : "Forgot Password"}
              </h2>
              <p className="text-slate-400 mt-2 text-sm">
                {isSuccess
                  ? "We've sent you a password reset link"
                  : "Enter your email to receive a reset link"}
              </p>
            </div>

            {!isSuccess ? (
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="group">
                  <label htmlFor="email" className="block text-xs font-medium text-slate-400 mb-1.5 uppercase tracking-wider">
                    Email Address
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500 group-focus-within:text-blue-400 transition-colors" />
                    <input
                      id="email"
                      name="email"
                      type="email"
                      autoComplete="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full pl-11 pr-4 py-3 rounded-xl glass-input outline-none 
                                 focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all"
                      placeholder="you@company.com"
                    />
                  </div>
                </div>

                {message && !isSuccess && (
                  <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl flex items-start space-x-3">
                    <div className="w-5 h-5 rounded-full bg-red-500/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <span className="text-red-400 text-xs font-bold">!</span>
                    </div>
                    <p className="text-sm text-red-300 flex-1">{message}</p>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3.5 rounded-xl font-semibold text-white shadow-lg shadow-blue-500/25 transition-all transform hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed
                            bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500"
                >
                  {loading ? (
                    <span className="flex items-center justify-center gap-2">
                      <span className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                      Sending...
                    </span>
                  ) : "Send Reset Link"}
                </button>
              </form>
            ) : (
              <div className="text-center space-y-6">
                <div className="p-6 bg-emerald-500/10 border border-emerald-500/20 rounded-xl">
                  <p className="text-sm text-emerald-300 font-medium mb-2">
                    Link Sent Successfully!
                  </p>
                  <p className="text-sm text-emerald-400/80">
                    We've sent an email to <span className="font-semibold text-emerald-300">{email}</span> with instructions to reset your password.
                  </p>
                </div>

                <div className="space-y-3">
                  <p className="text-xs text-slate-500">
                    Didn't receive the email? Check your spam folder or try again.
                  </p>
                  <button
                    onClick={() => {
                      setIsSuccess(false);
                      setEmail('');
                      setMessage('');
                    }}
                    className="w-full py-2.5 text-sm font-medium text-blue-400 hover:text-blue-300 
                             border border-blue-500/30 rounded-lg hover:bg-blue-500/10 transition-colors"
                  >
                    Try Again
                  </button>
                </div>
              </div>
            )}

            {/* Footer */}
            {!isSuccess && (
              <div className="mt-8 pt-6 border-t border-white/5 text-center">
                <Link
                  to="/login"
                  className="text-sm font-medium text-slate-400 hover:text-white transition-colors"
                >
                  Return to Login
                </Link>
              </div>
            )}

          </div>

          {/* Security Notice */}
          <p className="text-center text-xs text-slate-500 mt-6">
            Protected by enterprise-grade encryption
          </p>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
