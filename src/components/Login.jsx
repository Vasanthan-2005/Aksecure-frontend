import { useState, useEffect } from "react";
import { Eye, EyeOff, Shield, User, Mail, Lock } from "lucide-react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import register from "./Register";

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
        // For admin login, check for username or password errors
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
          // For admin login, default to showing error on both fields or password
          setErrors(prev => ({
            ...prev,
            password: errorMessage,
            username: "",
            general: ""
          }));
        }
      } else {
        // For user login, check for email or password errors
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
          // For user login, default to showing error on password field
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

  const handleRegisterClick = () => {
    navigate("/register");
  };

  return (
    <div className="min-h-screen flex bg-gradient-to-br from-slate-500 to-slate-100">
      
      {/* LEFT SIDE - BRANDING */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 
                      relative overflow-hidden">
        
        {/* Pattern overlay */}
        <div className="absolute inset-0 opacity-5">
          <div className="absolute inset-0" style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
          }}></div>
        </div>

        <div className="relative z-10 flex flex-col justify-center px-16 text-white">
          <div className="mb-8">
            <div className="w-14 h-14 bg-white rounded-xl flex items-center justify-center mb-6">
              <Shield className="w-8 h-8 text-slate-900" />
            </div>
            <h1 className="text-4xl font-bold mb-4 tracking-tight">
              AK SecureTech Ltd
            </h1>
            <p className="text-lg text-slate-300 leading-relaxed max-w-md mb">
              Integrated surveillance and safety systems engineered to protect people, property, and critical environments.
            </p>
          </div>

          <div className="space-y-4 mt-8">
            <div className="flex items-start space-x-3">
              <div className="w-6 h-6 rounded-full bg-slate-700 flex items-center justify-center flex-shrink-0 mt-0.5">
                <div className="w-2 h-2 rounded-full bg-emerald-400"></div>
              </div>
              <div>
                <p className="font-medium">Advanced Surveillance</p>
                <p className="text-sm text-slate-400">Smart HD CCTV with instant alerts</p>
              </div>
            </div>

            <div className="flex items-start space-x-3">
              <div className="w-6 h-6 rounded-full bg-slate-700 flex items-center justify-center flex-shrink-0 mt-0.5">
                <div className="w-2 h-2 rounded-full bg-blue-400"></div>
              </div>
              <div>
                <p className="font-medium">Fire Safety Solutions</p>
                <p className="text-sm text-slate-400">Certified fire safety equipment</p>
              </div>
            </div>

            <div className="flex items-start space-x-3">
              <div className="w-6 h-6 rounded-full bg-slate-700 flex items-center justify-center flex-shrink-0 mt-0.5">
                <div className="w-2 h-2 rounded-full bg-violet-400"></div>
              </div>
              <div>
                <p className="font-medium">Access & Security Integration</p>
                <p className="text-sm text-slate-400">Integrated CCTV, alarms, and access control</p>
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* RIGHT SIDE - LOGIN FORM */}
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-md">
          
          {/* Toggle Button */}
          <div className="flex justify-end mb-6">
            <button
              onClick={() => setIsAdminLogin(!isAdminLogin)}
              className="inline-flex items-center space-x-2 px-4 py-2 text-sm font-medium text-slate-700 
                         hover:text-slate-900 bg-white hover:bg-slate-50 rounded-lg border border-slate-200 
                         transition-all duration-200 shadow-sm hover:shadow"
            >
              {isAdminLogin ? <User className="w-4 h-4" /> : <Shield className="w-4 h-4" />}
              <span>{isAdminLogin ? "User Login" : "Admin Login"}</span>
            </button>
          </div>

          {/* Login Card */}
          <div className="bg-white rounded-2xl shadow-xl border border-slate-200 p-8">

            {/* Header */}
            <div className="text-center mb-8">
              <div className={`inline-flex items-center justify-center w-12 h-12 rounded-xl mb-4 ${
                isAdminLogin ? 'bg-violet-100' : 'bg-blue-100'
              }`}>
                {isAdminLogin ? 
                  <Shield className="w-6 h-6 text-violet-600" /> : 
                  <User className="w-6 h-6 text-blue-600" />
                }
              </div>
              <h2 className="text-2xl font-bold text-slate-900">
                {isAdminLogin ? "Admin Access" : "Welcome Back"}
              </h2>
              <p className="text-slate-600 mt-1 text-sm">
                {isAdminLogin ? "System administration portal" : "Sign in to your account"}
              </p>
            </div>

            {/* Success Alert */}
            {loginSuccess && (
              <div className="mb-6 p-4 bg-emerald-50 border border-emerald-200 rounded-lg flex items-start space-x-3">
                <div className="w-5 h-5 rounded-full bg-emerald-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-emerald-600 text-xs font-bold">✓</span>
                </div>
                <p className="text-sm text-emerald-800 flex-1">Successfully logged in!</p>
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-5">
              
              {/* Admin Fields */}
              {isAdminLogin ? (
                <div>
                  <label htmlFor="username" className="block text-sm font-medium text-slate-700 mb-2">
                    Username
                  </label>
                  <div className="relative">
                    <User className={`absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 ${
                      errors.username ? 'text-red-400' : 'text-slate-400'
                    }`} />
                    <input
                      id="username"
                      type="text"
                      name="username"
                      value={formData.username}
                      onChange={handleChange}
                      className={`w-full pl-11 pr-4 py-3 border rounded-lg 
                                 outline-none transition-all text-slate-900 placeholder:text-slate-400 ${
                        errors.username
                          ? 'border-red-300 bg-red-50 focus:ring-2 focus:ring-red-500 focus:border-red-500'
                          : 'border-slate-300 focus:ring-2 focus:ring-violet-500 focus:border-transparent'
                      }`}
                      placeholder="Enter username"
                    />
                  </div>
                  {errors.username && (
                    <p className="mt-1.5 text-sm text-red-600 flex items-center gap-1.5">
                      <span className="text-red-500">•</span>
                      {errors.username}
                    </p>
                  )}
                </div>
              ) : (
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-slate-700 mb-2">
                    Email Address
                  </label>
                  <div className="relative">
                    <Mail className={`absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 ${
                      errors.email ? 'text-red-400' : 'text-slate-400'
                    }`} />
                    <input
                      id="email"
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      className={`w-full pl-11 pr-4 py-3 border rounded-lg 
                                 outline-none transition-all text-slate-900 placeholder:text-slate-400 ${
                        errors.email
                          ? 'border-red-300 bg-red-50 focus:ring-2 focus:ring-red-500 focus:border-red-500'
                          : 'border-slate-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent'
                      }`}
                      placeholder="you@company.com"
                    />
                  </div>
                  {errors.email && (
                    <p className="mt-1.5 text-sm text-red-600 flex items-center gap-1.5">
                      <span className="text-red-500">•</span>
                      {errors.email}
                    </p>
                  )}
                </div>
              )}

              {/* Password */}
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-slate-700 mb-2">
                  Password
                </label>
                <div className="relative">
                  <Lock className={`absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 ${
                    errors.password ? 'text-red-400' : 'text-slate-400'
                  }`} />
                  <input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    className={`w-full pl-11 pr-11 py-3 border rounded-lg 
                               outline-none transition-all text-slate-900 placeholder:text-slate-400 ${
                      errors.password
                        ? 'border-red-300 bg-red-50 focus:ring-2 focus:ring-red-500 focus:border-red-500'
                        : 'border-slate-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent'
                    }`}
                    placeholder="Enter password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className={`absolute right-3 top-1/2 -translate-y-1/2 transition-colors ${
                      errors.password ? 'text-red-400 hover:text-red-600' : 'text-slate-400 hover:text-slate-600'
                    }`}
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
                {errors.password && (
                  <p className="mt-1.5 text-sm text-red-600 flex items-center gap-1.5">
                    <span className="text-red-500">•</span>
                    {errors.password}
                  </p>
                )}
              </div>

              {/* Submit */}
              <button
                type="submit"
                disabled={loading}
                className={`w-full py-3 rounded-lg font-medium text-white transition-all duration-200
                           shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed ${
                  isAdminLogin 
                    ? 'bg-gradient-to-r from-violet-600 to-violet-700 hover:from-violet-700 hover:to-violet-800' 
                    : 'bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800'
                }`}
              >
                {loading ? "Signing in..." : "Sign In"}
              </button>
            </form>

            {/* Footer */}
            {!isAdminLogin && (
              <div className="mt-6 pt-6 border-t border-slate-200 text-center space-y-2">
                <p className="text-sm text-slate-600">
                  Don't have an account?{" "}
                  <button 
                    onClick={handleRegisterClick}
                    className="font-medium text-blue-600 hover:text-blue-700 transition-colors"
                  >
                    Create account
                  </button>
                </p>
                <div className="text-sm">
                  <Link to="/forgot-password" className="font-medium text-blue-600 hover:text-blue-500 transition-colors">
                    Forgot your password?
                  </Link>
                </div>
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

export default Login;
