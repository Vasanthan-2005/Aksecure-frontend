import { useState, useEffect } from "react";
import { Eye, EyeOff, Shield, User, Mail, Lock } from "lucide-react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

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
      {/* Background gradients */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0">
        <div className="absolute -top-[30%] -left-[10%] w-[70%] h-[70%] rounded-full bg-violet-600/10 blur-[120px]" />
        <div className="absolute top-[40%] -right-[10%] w-[60%] h-[60%] rounded-full bg-blue-600/10 blur-[120px]" />
        <div className="absolute bottom-[0%] left-[20%] w-[50%] h-[50%] rounded-full bg-emerald-600/5 blur-[100px]" />
      </div>

      <div className="w-full flex items-center justify-center relative z-10 p-4 sm:p-8">
        <div className="w-full max-w-4xl grid lg:grid-cols-2 gap-8 items-center">

          {/* Brand Section */}
          <div className="hidden lg:block space-y-8 pr-8">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-violet-600 to-blue-600 flex items-center justify-center shadow-lg shadow-violet-500/20">
                <Shield className="w-7 h-7 text-white" />
              </div>
              <h1 className="text-2xl font-bold text-white tracking-tight">Aksecure</h1>
            </div>

            <div className="space-y-6">
              <h2 className="text-4xl font-bold text-white leading-tight">
                Secure your world with <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-400 to-blue-400">intelligent protection</span>
              </h2>
              <p className="text-slate-400 text-lg leading-relaxed">
                Advanced surveillance, fire safety integration, and access control systems designed for the modern enterprise.
              </p>
            </div>

            <div className="flex flex-col gap-4">
              <div className="glass p-4 rounded-xl flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-blue-500/20 flex items-center justify-center text-blue-400">
                  <Shield className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-slate-200 font-medium">Enterprise Grade</h3>
                  <p className="text-slate-500 text-sm">Top-tier security protocols</p>
                </div>
              </div>
              <div className="glass p-4 rounded-xl flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-emerald-500/20 flex items-center justify-center text-emerald-400">
                  <Eye className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-slate-200 font-medium">24/7 Monitoring</h3>
                  <p className="text-slate-500 text-sm">Real-time surveillance & alerts</p>
                </div>
              </div>
            </div>
          </div>

          {/* Login Card */}
          <div className="glass-card p-6 sm:p-10 w-full max-w-md mx-auto relative overflow-hidden">

            {/* Toggle Auth Type */}
            <div className="absolute top-6 right-6 z-20">
              <button
                onClick={() => setIsAdminLogin(!isAdminLogin)}
                className="px-3 py-1.5 rounded-full text-xs font-medium bg-slate-800/50 hover:bg-slate-700/50 border border-white/5 text-slate-300 transition-all flex items-center gap-2"
              >
                {isAdminLogin ? "User Login" : "Admin Portal"}
                {isAdminLogin ? <User className="w-3 h-3" /> : <Shield className="w-3 h-3" />}
              </button>
            </div>

            <div className="mb-8 mt-2">
              <h2 className="text-2xl font-bold text-white mb-2">
                {isAdminLogin ? "Admin Access" : "Welcome Back"}
              </h2>
              <p className="text-slate-400 text-sm">
                Enter your credentials to access your account.
              </p>
            </div>

            {/* Success Alert */}
            {loginSuccess && (
              <div className="mb-6 p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-xl flex items-center gap-3">
                <div className="w-6 h-6 rounded-full bg-emerald-500/20 flex items-center justify-center flex-shrink-0">
                  <span className="text-emerald-400 text-xs font-bold">✓</span>
                </div>
                <p className="text-sm text-emerald-300 font-medium">Login successful</p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">

              {/* Conditional Inputs */}
              {isAdminLogin ? (
                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1.5 uppercase tracking-wider">Username</label>
                  <div className="relative group">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500 group-focus-within:text-violet-400 transition-colors" />
                    <input
                      type="text"
                      name="username"
                      value={formData.username}
                      onChange={handleChange}
                      className={`w-full pl-10 pr-4 py-3 rounded-xl glass-input outline-none ${errors.username ? 'border-red-500/50 focus:border-red-500' : ''}`}
                      placeholder="Admin username"
                    />
                  </div>
                  {errors.username && <p className="mt-1 text-xs text-red-400">{errors.username}</p>}
                </div>
              ) : (
                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1.5 uppercase tracking-wider">Email</label>
                  <div className="relative group">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500 group-focus-within:text-blue-400 transition-colors" />
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      className={`w-full pl-10 pr-4 py-3 rounded-xl glass-input outline-none ${errors.email ? 'border-red-500/50 focus:border-red-500' : ''}`}
                      placeholder="name@company.com"
                    />
                  </div>
                  {errors.email && <p className="mt-1 text-xs text-red-400">{errors.email}</p>}
                </div>
              )}

              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1.5 uppercase tracking-wider">Password</label>
                <div className="relative group">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500 group-focus-within:text-blue-400 transition-colors" />
                  <input
                    type={showPassword ? "text" : "password"}
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    className={`w-full pl-10 pr-10 py-3 rounded-xl glass-input outline-none ${errors.password ? 'border-red-500/50 focus:border-red-500' : ''}`}
                    placeholder="••••••••"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
                {errors.password && <p className="mt-1 text-xs text-red-400">{errors.password}</p>}
              </div>

              {/* Forgot Password Link */}
              <div className="flex justify-end">
                <Link to="/forgot-password" className="text-sm text-slate-400 hover:text-blue-400 transition-colors">
                  Forgot password?
                </Link>
              </div>

              <button
                type="submit"
                disabled={loading}
                className={`w-full py-3.5 rounded-xl font-semibold text-white shadow-lg transition-all transform hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed
                  ${isAdminLogin
                    ? 'bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 shadow-violet-500/25'
                    : 'bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 shadow-blue-500/25'
                  }`}
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <span className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                    Authenticating...
                  </span>
                ) : (
                  "Sign In"
                )}
              </button>

            </form>

            {/* Footer */}
            {!isAdminLogin && (
              <div className="mt-8 pt-6 border-t border-white/5 text-center">
                <p className="text-slate-400 text-sm">
                  New to Aksecure?{" "}
                  <Link to="/register" className="text-blue-400 hover:text-blue-300 font-medium hover:underline transition-all">
                    Create an account
                  </Link>
                </p>
              </div>
            )}

          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
