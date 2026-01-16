import { useState, useEffect } from "react";
import { Eye, EyeOff, Shield, User, Mail, Lock, Loader2, CheckCircle2 } from "lucide-react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import LoadingState from "./common/LoadingState";

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
    <div className="min-h-screen flex relative overflow-hidden bg-slate-950">
      {loading && <LoadingState message={isAdminLogin ? "Verifying Credentials" : "Checking Profile"} fullPage={true} />}

      {/* Background gradients */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0">
        <div className="absolute top-[20%] -left-[10%] w-[60%] h-[60%] rounded-full bg-blue-600/10 blur-[120px]" />
        <div className="absolute -bottom-[20%] right-[10%] w-[50%] h-[50%] rounded-full bg-violet-600/10 blur-[120px]" />
      </div>

      {/* LEFT SIDE - BRANDING */}
      <div className="hidden lg:flex lg:w-1/2 bg-transparent
                      relative overflow-hidden z-10 transition-all duration-500">

        {/* Pattern overlay */}
        <div className="absolute inset-0 opacity-5">
          <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 brightness-100 contrast-150"></div>
        </div>

        <div className="relative z-10 flex flex-col justify-center px-16 text-white h-full">
          <div className="mb-8">
            <div className="flex items-center space-x-3 mb-8">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-violet-600 to-blue-600 flex items-center justify-center shadow-lg shadow-violet-500/20">
                <Shield className="w-7 h-7 text-white" />
              </div>
              <h1 className="text-2xl font-bold text-white tracking-tight">Aksecure</h1>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold mb-6 tracking-tight leading-tight">
              Secure your world with <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-400 to-blue-400">intelligent protection</span>
            </h1>
            <p className="text-lg text-slate-300 leading-relaxed max-w-md">
              Advanced surveillance, fire safety integration, and access control systems designed for the modern enterprise.
            </p>
          </div>

          <div className="space-y-5 mt-8">
            <div className="flex items-start space-x-4 group">
              <div className="w-10 h-10 rounded-xl bg-slate-800/80 flex items-center justify-center flex-shrink-0 border border-white/10 group-hover:border-blue-500/30 transition-colors">
                <Shield className="w-5 h-5 text-blue-400" />
              </div>
              <div>
                <p className="font-bold text-slate-200">Enterprise Grade</p>
                <p className="text-sm text-slate-400">Top-tier security protocols & encryption</p>
              </div>
            </div>

            <div className="flex items-start space-x-4 group">
              <div className="w-10 h-10 rounded-xl bg-slate-800/80 flex items-center justify-center flex-shrink-0 border border-white/10 group-hover:border-emerald-500/30 transition-colors">
                <Eye className="w-5 h-5 text-emerald-400" />
              </div>
              <div>
                <p className="font-bold text-slate-200">24/7 Monitoring</p>
                <p className="text-sm text-slate-400">Real-time surveillance & instant alerts</p>
              </div>
            </div>
          </div>

          {/* Copyright/Footer for left side */}
          <div className="absolute bottom-8 left-16 text-xs text-slate-500 font-medium">
            © {new Date().getFullYear()} Aksecure. All rights reserved.
          </div>
        </div>
      </div>

      {/* RIGHT SIDE - FORM */}
      <div className="flex-1 flex items-start sm:items-center justify-center p-4 sm:p-6 relative z-10">
        <div className="w-full max-w-md mt-6 sm:mt-0">

          {/* Toggle Auth Type - Positioned above card or inside, let's put it above for clean look or inside top-right */}
          <div className="flex justify-end mb-4">
            <button
              onClick={() => setIsAdminLogin(!isAdminLogin)}
              className="px-4 py-2 rounded-full text-xs font-bold bg-slate-800/40 hover:bg-slate-800/60 border border-white/5 text-slate-300 transition-all flex items-center gap-2 hover:text-white"
            >
              {isAdminLogin ? "Switch to User Login" : "Switch to Admin Portal"}
              {isAdminLogin ? <User className="w-3 h-3" /> : <Shield className="w-3 h-3" />}
            </button>
          </div>

          {/* Form Card */}
          <div className="glass-card p-6 sm:p-8 animate-fade-in-up border border-white/5 bg-slate-900/40 backdrop-blur-xl rounded-2xl sm:rounded-3xl shadow-2xl">

            {/* Header */}
            <div className="mb-8">
              <h2 className="text-3xl font-bold text-white mb-2 tracking-tight">
                {isAdminLogin ? "Admin Access" : "Welcome Back"}
              </h2>
              <p className="text-slate-400 text-sm">
                Enter your credentials to access your {isAdminLogin ? "admin portal" : "account"}.
              </p>
            </div>

            {/* Success Alert */}
            {loginSuccess && (
              <div className="mb-6 p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-xl flex items-center gap-3 animate-fade-in">
                <div className="w-6 h-6 rounded-full bg-emerald-500/20 flex items-center justify-center flex-shrink-0">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                </div>
                <p className="text-sm text-emerald-300 font-medium">Login successful. Redirecting...</p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">

              {/* Conditional Inputs */}
              {isAdminLogin ? (
                <div className="group">
                  <label className="block text-xs font-bold text-slate-400 mb-1.5 uppercase tracking-wider">Username</label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500 group-focus-within:text-violet-400 transition-colors" />
                    <input
                      type="text"
                      name="username"
                      value={formData.username}
                      onChange={handleChange}
                      className={`w-full pl-11 pr-4 py-3.5 rounded-xl glass-input outline-none bg-slate-950/50 border border-white/10 text-white placeholder:text-slate-600 focus:ring-2 focus:ring-violet-500/50 focus:border-transparent transition-all ${errors.username ? 'border-red-500/50 focus:ring-red-500/50' : ''}`}
                      placeholder="Admin username"
                    />
                  </div>
                  {errors.username && <p className="mt-1.5 text-xs text-red-400 font-medium">{errors.username}</p>}
                </div>
              ) : (
                <div className="group">
                  <label className="block text-xs font-bold text-slate-400 mb-1.5 uppercase tracking-wider">Email Address</label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500 group-focus-within:text-blue-400 transition-colors" />
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      className={`w-full pl-11 pr-4 py-3.5 rounded-xl glass-input outline-none bg-slate-950/50 border border-white/10 text-white placeholder:text-slate-600 focus:ring-2 focus:ring-blue-500/50 focus:border-transparent transition-all ${errors.email ? 'border-red-500/50 focus:ring-red-500/50' : ''}`}
                      placeholder="name@company.com"
                    />
                  </div>
                  {errors.email && <p className="mt-1.5 text-xs text-red-400 font-medium">{errors.email}</p>}
                </div>
              )}

              <div className="group">
                <label className="block text-xs font-bold text-slate-400 mb-1.5 uppercase tracking-wider">Password</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500 group-focus-within:text-blue-400 transition-colors" />
                  <input
                    type={showPassword ? "text" : "password"}
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    className={`w-full pl-11 pr-11 py-3.5 rounded-xl glass-input outline-none bg-slate-950/50 border border-white/10 text-white placeholder:text-slate-600 focus:ring-2 focus:ring-blue-500/50 focus:border-transparent transition-all ${errors.password ? 'border-red-500/50 focus:ring-red-500/50' : ''}`}
                    placeholder="••••••••"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors p-1"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
                {errors.password && <p className="mt-1.5 text-xs text-red-400 font-medium">{errors.password}</p>}
              </div>

              {/* Forgot Password Link */}
              <div className="flex justify-between items-center">
                <label className="flex items-center space-x-2 cursor-pointer group">
                  <input type="checkbox" className="w-4 h-4 rounded border-slate-700 bg-slate-800/50 text-blue-500 focus:ring-0 focus:ring-offset-0" />
                  <span className="text-xs text-slate-500 group-hover:text-slate-400 transition-colors">Remember me</span>
                </label>
                <Link to="/forgot-password" className="text-xs font-medium text-blue-400 hover:text-blue-300 transition-colors hover:underline">
                  Forgot password?
                </Link>
              </div>

              <button
                type="submit"
                disabled={loading}
                className={`w-full py-4 rounded-xl font-bold text-white shadow-lg transition-all transform hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed mt-2
                  ${isAdminLogin
                    ? 'bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 shadow-violet-500/25'
                    : 'bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 shadow-blue-500/25'
                  }`}
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Authenticating...
                  </span>
                ) : (
                  isAdminLogin ? "Access Admin Portal" : "Sign In to Account"
                )}
              </button>

            </form>

            {/* Footer */}
            {!isAdminLogin && (
              <div className="mt-8 pt-6 border-t border-white/5 text-center">
                <p className="text-slate-400 text-sm">
                  Don't have an account?{" "}
                  <Link to="/register" className="text-blue-400 hover:text-blue-300 font-bold hover:underline transition-all">
                    Register Now
                  </Link>
                </p>
              </div>
            )}

          </div>

          {/* Security Notice */}
          <p className="text-center text-[10px] text-slate-500 mt-6 uppercase tracking-wider font-bold opacity-60">
            Protected by enterprise-grade 256-bit encryption
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
