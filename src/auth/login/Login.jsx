import { useState, useEffect } from "react";
import logo from '../../assets/logo-transparent.png';
import { Eye, EyeOff, Shield, User, Mail, Lock, Loader2, CheckCircle2, ArrowRight } from "lucide-react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import LoadingState from "../../common/components/LoadingState";

const Login = () => {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [isAdminLogin, setIsAdminLogin] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    username: ""
  });

  const [errors, setErrors] = useState({
    email: "",
    password: "",
    username: "",
    general: ""
  });
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [loginSuccess, setLoginSuccess] = useState(false);
  const [showMobileForm, setShowMobileForm] = useState(false);

  useEffect(() => {
    setFormData({ email: "", password: "", username: "" });
    setErrors({ email: "", password: "", username: "", general: "" });
    setShowPassword(false);
  }, [isAdminLogin]);

  const handleChange = (e) => {
    const fieldName = e.target.name;
    setFormData((prev) => ({
      ...prev,
      [fieldName]: e.target.value
    }));
    // Clear error for the field being edited
    setErrors((prev) => ({
      ...prev,
      [fieldName]: "",
      general: ""
    }));
  };

  const validateForm = () => {
    let isValid = true;
    const newErrors = { email: "", password: "", username: "", general: "" };

    if (isAdminLogin) {
      if (!formData.username.trim()) {
        newErrors.username = "Username is required";
        isValid = false;
      }
    } else {
      if (!formData.email.trim()) {
        newErrors.email = "Email is required";
        isValid = false;
      } else {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(formData.email.trim())) {
          newErrors.email = "Please enter a valid email address";
          isValid = false;
        }
      }
    }

    if (!formData.password) {
      newErrors.password = "Password is required";
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors({ email: "", password: "", username: "", general: "" });

    if (!validateForm()) return;

    setLoading(true);

    try {
      const credentials = isAdminLogin
        ? { username: formData.username.trim(), password: formData.password }
        : { email: formData.email.trim().toLowerCase(), password: formData.password };

      // Call API
      await login(credentials);

      // Show success animation
      setLoginSuccess(true);
      setLoading(false);

      // Redirect based on login type
      setTimeout(() => {
        if (isAdminLogin) navigate("/admin");
        else navigate("/");
      }, 700);

    } catch (err) {
      setLoading(false);
      const errorMessage = err?.response?.data?.message || "Login failed. Please try again.";

      const errorLower = errorMessage.toLowerCase();

      if (isAdminLogin) {
        if (errorLower.includes("password") || errorLower.includes("invalid credentials") || errorLower.includes("invalid password")) {
          setErrors(prev => ({
            ...prev,
            password: errorMessage,
            username: "",
            general: ""
          }));
        } else if (errorLower.includes("username") || errorLower.includes("user not found") || errorLower.includes("admin not found")) {
          setErrors(prev => ({
            ...prev,
            username: errorMessage,
            password: "",
            general: ""
          }));
        } else {
          setErrors(prev => ({
            ...prev,
            password: errorMessage,
            username: "",
            general: ""
          }));
        }
      } else {
        if (errorLower.includes("password") || errorLower.includes("invalid credentials") || errorLower.includes("invalid password")) {
          setErrors(prev => ({
            ...prev,
            password: errorMessage,
            email: "",
            general: ""
          }));
        } else if (errorLower.includes("email") || errorLower.includes("user not found") || errorLower.includes("account")) {
          setErrors(prev => ({
            ...prev,
            email: errorMessage,
            password: "",
            general: ""
          }));
        } else {
          setErrors(prev => ({
            ...prev,
            password: errorMessage,
            email: "",
            general: ""
          }));
        }
      }
    }
  };

  return (
    <div className="h-screen w-screen flex flex-col lg:flex-row relative overflow-hidden bg-[#020617] text-white">
      {loading && <LoadingState message={isAdminLogin ? "Verifying Credentials" : "Checking Profile"} fullPage={true} />}

      {/* LEFT PANEL - BRAND SECTION (Landing Page on Mobile) */}
      <div className={`absolute inset-0 lg:relative lg:w-1/2 flex flex-col justify-between p-8 sm:p-12 lg:p-20 overflow-hidden bg-gradient-to-b from-[#0A192F] to-[#020617] transition-all duration-700 ease-in-out z-20 ${showMobileForm ? '-translate-x-full lg:translate-x-0 opacity-0 lg:opacity-100' : 'translate-x-0 opacity-100'
        }`}>
        {/* Subtle Vignette & Glow */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-500/10 blur-[120px] rounded-full"></div>
          <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-indigo-500/10 blur-[120px] rounded-full"></div>
          <div className="absolute inset-0 shadow-[inner_0_0_100px_rgba(0,0,0,0.5)]"></div>
        </div>

        {/* Top Section: Logo */}
        <div className="relative z-10 flex-none flex items-center gap-3">
          <img src={logo} alt="AK SecureTech" className="h-20 lg:h-28 w-auto object-contain " />
        </div>

        {/* Middle Section: Headline, Description & Features */}
        <div className="relative z-10 flex-1 flex flex-col justify-center pt-6 lg:py-10">
          <div className="max-w-xl">
            <h1 className="text-4xl sm:text-5xl lg:text-[42px] font-extrabold tracking-tight leading-[1.2] mb-6 lg:mb-8">
              <span className="block text-white">Secure your world with</span>
              <span className="block text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-blue-400 to-blue-500 pb-1">
                intelligent protection
              </span>
            </h1>
            <p className="text-sm sm:text-base lg:text-lg text-slate-400/80 max-w-sm leading-relaxed font-medium mb-8 lg:mb-0">
              Advanced surveillance, fire safety integration, and access control systems designed for the modern enterprise.
            </p>

            {/* Feature Points (Moved up for mobile interaction) */}
            <div className="space-y-4 lg:space-y-5 lg:hidden mt-2">
              {[
                { icon: <Shield className="w-4 h-4 sm:w-5 h-5" />, title: "Enterprise Grade", sub: "Top-tier security", color: "text-blue-400" },
                { icon: <Eye className="w-4 h-4 sm:w-5 h-5" />, title: "24/7 Monitoring", sub: "Real-time alerts", color: "text-purple-400" },
                { icon: <User className="w-4 h-4 sm:w-5 h-5" />, title: "Centralized Control", sub: "Unified management", color: "text-indigo-400" }
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

            {/* Swipe Indicator (Mobile Only) - Moved to middle section bottom */}
            <div className="lg:hidden mt-12 pb-2">
              <button
                onClick={() => setShowMobileForm(true)}
                className="w-full px-4 py-3 rounded-full text-[11px] font-extrabold uppercase tracking-wider bg-white/5 border border-white/20 text-slate-300 hover:text-white hover:bg-white/10 transition-all flex justify-center items-center gap-2 active:scale-95"
              >
                Swipe to Login
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
          </div>
        </div>

        {/* Bottom Section: Features (Desktop Only) & Swipe button */}
        <div className="relative z-10 flex-none bottom-0">
          {/* Feature Points (Desktop Only) */}
          <div className="hidden lg:block space-y-5 mb-16">
            {[
              { icon: <Shield className="w-5 h-5" />, title: "Enterprise Grade", sub: "Top-tier security", color: "text-blue-400" },
              { icon: <Eye className="w-5 h-5" />, title: "24/7 Monitoring", sub: "Real-time alerts", color: "text-purple-400" },
              { icon: <User className="w-5 h-5" />, title: "Centralized Control", sub: "Unified management", color: "text-indigo-400" }
            ].map((feature, idx) => (
              <div key={idx} className="flex items-start gap-4">
                <div className={`w-9 h-9 rounded-full bg-slate-800/60 flex items-center justify-center flex-shrink-0 border border-white/10 ${feature.color}`}>
                  {feature.icon}
                </div>
                <div>
                  <h3 className="text-[15px] font-bold text-slate-200 leading-tight">{feature.title}</h3>
                  <p className="text-sm text-slate-500 font-medium">{feature.sub}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Swipe Indicator (Mobile Only) - REMOVED from bottom */}
        </div>
      </div>

      {/* RIGHT PANEL - LOGIN SECTION */}
      <div className={`absolute inset-0 lg:relative lg:flex-1 flex items-center justify-center p-4 sm:p-8 bg-[#020617] transition-all duration-700 ease-in-out z-10 ${showMobileForm ? 'translate-x-0 opacity-100' : 'translate-x-full lg:translate-x-0 opacity-0 lg:opacity-100'
        }`}>
        {/* Mobile Back Button */}
        <div className="lg:hidden absolute top-6 left-6 z-30">
          <button
            onClick={() => setShowMobileForm(false)}
            className="p-3 rounded-xl bg-white/5 border border-white/10 text-slate-400 active:scale-90 transition-all flex items-center gap-2 font-bold text-xs uppercase tracking-widest"
          >
            <ArrowRight className="w-4 h-4 rotate-180" />
            Back
          </button>
        </div>
        {/* Dark Background with subtle shading */}
        <div className="absolute inset-0 bg-[#020617]">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[60%] h-[60%] bg-indigo-500/5 blur-[150px] rounded-full"></div>
        </div>

        <div className="w-full max-w-[480px] relative z-10 flex flex-col items-center">
          {/* Glass Login Card */}
          <div className="w-full bg-slate-900/30 backdrop-blur-3xl border border-white/10 rounded-[32px] sm:rounded-[40px] p-6 sm:p-12 shadow-2xl relative">

            {/* Switch Toggle Pill */}
            <div className="flex flex-col sm:block mb-8 sm:mb-10 mt-2 sm:mt-6">
              {/* Switch Toggle Pill */}
              <div className="self-end mb-4 sm:mb-0 sm:absolute sm:top-8 sm:right-8">
                <button
                  onClick={() => setIsAdminLogin(!isAdminLogin)}
                  className="px-4 py-2 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-white/5 border border-white/20 text-slate-300 hover:text-white hover:bg-white/10 transition-all flex items-center gap-2"
                >
                  {isAdminLogin ? "User Login" : "Admin Portal"}
                  <Shield className="w-3 h-3" />
                </button>
              </div>

              {/* Card Content */}
              <div>
                <h2 className="text-3xl font-bold text-white mb-2 tracking-tight">
                  {isAdminLogin ? "Admin Access" : "Welcome Back"}
                </h2>
                <p className="text-slate-500 text-sm font-medium">
                  Enter your credentials to access your {isAdminLogin ? "admin portal" : "account"}.
                </p>
              </div>
            </div>

            {/* Success Alert */}
            {loginSuccess && (
              <div className="mb-6 p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl flex items-center gap-3">
                <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                <p className="text-sm text-emerald-300 font-medium">Authentication successful...</p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Conditional Inputs */}
              <div>
                <label className="block text-[10px] font-bold text-slate-500 mb-2 uppercase tracking-[0.15em]">
                  {isAdminLogin ? "Username" : "Email Address"}
                </label>
                <div className="relative group">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-blue-400 transition-colors">
                    {isAdminLogin ? <User className="w-5 h-5" /> : <Mail className="w-5 h-5" />}
                  </div>
                  <input
                    type={isAdminLogin ? "text" : "email"}
                    name={isAdminLogin ? "username" : "email"}
                    value={isAdminLogin ? formData.username : formData.email}
                    onChange={handleChange}
                    className={`w-full bg-black/40 border border-white/5 rounded-2xl pl-12 pr-4 py-4 text-white placeholder:text-slate-700 outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/20 transition-all ${(isAdminLogin ? errors.username : errors.email) ? 'border-red-500/50' : ''
                      }`}
                    placeholder={isAdminLogin ? "Admin username" : "Email address"}
                  />
                </div>
                {(isAdminLogin ? errors.username : errors.email) && (
                  <p className="mt-2 text-[11px] text-red-400 font-bold uppercase tracking-wider">
                    {isAdminLogin ? errors.username : errors.email}
                  </p>
                )}
              </div>

              <div>
                <div className="flex justify-between items-end mb-2">
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-[0.15em]">Password</label>
                </div>
                <div className="relative group">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-blue-400 transition-colors">
                    <Lock className="w-5 h-5" />
                  </div>
                  <input
                    type={showPassword ? "text" : "password"}
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    className={`w-full bg-black/40 border border-white/5 rounded-2xl pl-12 pr-12 py-4 text-white placeholder:text-slate-700 outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/20 transition-all ${errors.password ? 'border-red-500/50' : ''
                      }`}
                    placeholder="••••••••"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
                {errors.password && (
                  <p className="mt-2 text-[11px] text-red-400 font-bold uppercase tracking-wider">{errors.password}</p>
                )}
                {!isAdminLogin && (
                  <div className="mt-2 text-right">
                    <Link to="/forgot-password" title="Reset your password" className="text-[11px] font-bold text-blue-400 hover:text-blue-300 transition-colors uppercase tracking-wider">
                      Forgot password?
                    </Link>
                  </div>
                )}
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 text-white font-extrabold py-4 rounded-2xl shadow-[0_10px_20px_rgba(37,99,235,0.2)] transform active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed mt-0 uppercase tracking-widest text-[13px]"
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Processing...
                  </span>
                ) : (
                  isAdminLogin ? "Access Admin Portal" : "Sign In to Portal"
                )}
              </button>
            </form>

            {!isAdminLogin && (
              <div className="mt-10 text-center">
                <p className="text-slate-500 text-[11px] font-bold uppercase tracking-wider">
                  New here?{" "}
                  <Link to="/register" className="text-blue-400 hover:text-blue-300 transition-all">
                    Create an account
                  </Link>
                </p>
              </div>
            )}
          </div>

          <p className="text-[9px] mt-4 text-slate-500/60 font-medium uppercase tracking-[0.15em]">
            © {new Date().getFullYear()} AKSECURE. ALL RIGHTS RESERVED.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
