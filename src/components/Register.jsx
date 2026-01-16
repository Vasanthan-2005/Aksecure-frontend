import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import LoadingState from "./common/LoadingState";
import { Eye, EyeOff, Shield, User, Mail, Lock, Building2, Phone, MapPin, CheckCircle2, ArrowRight, XCircle, Edit2, Trash2 } from "lucide-react";
import OutletModal from "./common/OutletModal";

const Register = () => {
  const [formData, setFormData] = useState({
    name: "",
    companyName: "",
    phone: "",
    email: "",
    password: "",
    confirmPassword: ""
  });

  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState(0);
  const [outlets, setOutlets] = useState([]);
  const [showOutletModal, setShowOutletModal] = useState(false);
  const [initialEditIndex, setInitialEditIndex] = useState(null);
  const [showOutletSuccess, setShowOutletSuccess] = useState(false);

  const { register } = useAuth();
  const navigate = useNavigate();

  const calculatePasswordStrength = (password) => {
    let strength = 0;
    if (password.length >= 8) strength++;
    if (password.length >= 12) strength++;
    if (/[a-z]/.test(password) && /[A-Z]/.test(password)) strength++;
    if (/[0-9]/.test(password)) strength++;
    if (/[^a-zA-Z0-9]/.test(password)) strength++;
    return strength;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value
    }));
    setError("");
    if (fieldErrors[name]) {
      setFieldErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }

    if (name === "password") {
      setPasswordStrength(calculatePasswordStrength(value));
    }
  };

  const handleSaveOutlets = (savedOutlets) => {
    setOutlets(savedOutlets);
    if (savedOutlets.length > 0) {
      setShowOutletSuccess(true);
      setTimeout(() => setShowOutletSuccess(false), 3000);
    }
    setFieldErrors(prev => {
      const newErrors = { ...prev };
      delete newErrors.outlets;
      return newErrors;
    });
    setInitialEditIndex(null);
  };

  const handleRemoveOutlet = (index) => {
    setOutlets(outlets.filter((_, i) => i !== index));
  };

  const validateForm = () => {
    const errors = {};

    if (!formData.name.trim()) {
      errors.name = "Name is required";
    }
    if (!formData.companyName.trim()) {
      errors.companyName = "Company Name is required";
    }
    if (!formData.phone.trim()) {
      errors.phone = "Phone number is required";
    } else if (!/^\+?[\d\s-()]+$/.test(formData.phone)) {
      errors.phone = "Please enter a valid phone number";
    }
    if (!formData.email.trim()) {
      errors.email = "Email is required";
    } else {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(formData.email.trim())) {
        errors.email = "Please enter a valid email address";
      }
    }
    if (!formData.password) {
      errors.password = "Password is required";
    } else if (formData.password.length < 8) {
      errors.password = "Password must be at least 8 characters long";
    }
    if (!formData.confirmPassword) {
      errors.confirmPassword = "Please confirm your password";
    } else if (formData.password !== formData.confirmPassword) {
      errors.confirmPassword = "Passwords do not match";
    }
    if (outlets.length === 0) {
      errors.outlets = "Please add at least one company outlet";
    }

    setFieldErrors(errors);
    return { isValid: Object.keys(errors).length === 0, errors };
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setFieldErrors({});

    const { isValid, errors } = validateForm();
    if (!isValid) {
      setTimeout(() => {
        const firstErrorKey = Object.keys(errors)[0];
        if (firstErrorKey) {
          const errorField = document.querySelector(`[name="${firstErrorKey}"]`);
          if (errorField) {
            errorField.scrollIntoView({ behavior: 'smooth', block: 'center' });
            errorField.focus();
          }
        }
      }, 100);
      return;
    }

    setLoading(true);

    try {
      const { confirmPassword, ...userData } = formData;
      // Add outlets to user data
      const registrationData = {
        ...userData,
        outlets: outlets
      };
      await register(registrationData);
      navigate('/');
    } catch (err) {
      const errorMessage = err?.response?.data?.message || "Registration failed. Please try again.";
      setError(errorMessage);

      const serverFieldErrors = {};
      const lowerMessage = errorMessage.toLowerCase();

      if (lowerMessage.includes("email") && (lowerMessage.includes("exists") || lowerMessage.includes("already"))) {
        serverFieldErrors.email = errorMessage;
      }
      if (lowerMessage.includes("phone") && (lowerMessage.includes("exists") || lowerMessage.includes("already"))) {
        serverFieldErrors.phone = errorMessage;
      }
      if (lowerMessage.includes("required fields")) {
        if (!formData.name.trim()) serverFieldErrors.name = "Name is required";
        if (!formData.phone.trim()) serverFieldErrors.phone = "Phone number is required";
        if (!formData.email.trim()) serverFieldErrors.email = "Email is required";
        if (!formData.password) serverFieldErrors.password = "Password is required";
        if (outlets.length === 0) serverFieldErrors.outlets = "At least one outlet is required";
      }

      if (Object.keys(serverFieldErrors).length > 0) {
        setFieldErrors(serverFieldErrors);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleLoginClick = () => {
    navigate('/login');
  };

  const getPasswordStrengthColor = () => {
    if (passwordStrength <= 1) return "bg-red-500";
    if (passwordStrength <= 2) return "bg-orange-500";
    if (passwordStrength <= 3) return "bg-yellow-500";
    if (passwordStrength <= 4) return "bg-lime-500";
    return "bg-emerald-500";
  };

  const getPasswordStrengthText = () => {
    if (passwordStrength === 0) return "";
    if (passwordStrength <= 1) return "Weak";
    if (passwordStrength <= 2) return "Fair";
    if (passwordStrength <= 3) return "Good";
    if (passwordStrength <= 4) return "Strong";
    return "Very Strong";
  };

  return (
    <div className="h-screen flex relative overflow-hidden bg-slate-950">
      {loading && <LoadingState message="Creating Security Profile" fullPage={true} />}

      {/* Background gradients */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0">
        <div className="absolute -top-[20%] -right-[10%] w-[60%] h-[60%] rounded-full bg-violet-600/10 blur-[120px]" />
        <div className="absolute bottom-[0%] left-[0%] w-[50%] h-[50%] rounded-full bg-blue-600/10 blur-[100px]" />
      </div>

      {/* LEFT SIDE - BRANDING */}
      <div className="hidden xl:flex xl:w-5/12 sticky top-0 h-screen relative z-10 flex-col justify-center p-12">
        <div className="mb-12">
          <div className="flex items-center space-x-3 mb-8">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-violet-600 to-blue-600 flex items-center justify-center shadow-lg shadow-violet-500/20">
              <Shield className="w-7 h-7 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-white tracking-tight">Aksecure</h1>
          </div>

          <h1 className="text-4xl lg:text-5xl font-bold text-white mb-6 tracking-tight leading-tight">
            Start your journey with <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-400 to-cyan-400">Enterprise Security</span>
          </h1>
          <p className="text-lg text-slate-400 leading-relaxed max-w-md">
            Create your organization account to access our comprehensive surveillance and safety management platform.
          </p>
        </div>

        <div className="space-y-6">
          <div className="glass p-5 rounded-2xl border-l-4 border-l-emerald-500">
            <div className="flex items-start gap-4">
              <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400 mt-1">
                <Shield className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-white font-semibold text-lg mb-1">Bank-Grade Security</h3>
                <p className="text-slate-400 text-sm leading-relaxed">Your data is protected with state-of-the-art encryption standards.</p>
              </div>
            </div>
          </div>

          <div className="glass p-5 rounded-2xl border-l-4 border-l-blue-500">
            <div className="flex items-start gap-4">
              <div className="p-2 rounded-lg bg-blue-500/10 text-blue-400 mt-1">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-white font-semibold text-lg mb-1">Instant Activation</h3>
                <p className="text-slate-400 text-sm leading-relaxed">Get access to your dashboard immediately after verifying your credentials.</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* RIGHT SIDE - REGISTRATION FORM */}
      <div className="flex-1 flex items-center justify-center p-4 sm:p-6 lg:p-8 relative z-10 h-full">
        <div className="w-full max-w-2xl px-4 sm:px-8">

          <div className="glass-card p-5 sm:p-8 w-full animate-fade-in-up max-h-screen">

            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-2xl font-bold text-white">Create Account</h2>
                <p className="text-slate-400 text-sm mt-1">Enter your organization details</p>
              </div>
              <div className="hidden sm:block text-right">
                <p className="text-xs text-slate-500 mb-1">Step 1 of 1</p>
                <div className="w-24 h-1 bg-slate-800 rounded-full overflow-hidden">
                  <div className="w-full h-full bg-gradient-to-r from-violet-500 to-blue-500"></div>
                </div>
              </div>
            </div>

            {error && Object.keys(fieldErrors).length === 0 && (
              <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 rounded-xl flex items-start gap-3">
                <div className="w-5 h-5 rounded-full bg-red-500/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-red-400 text-xs font-bold">!</span>
                </div>
                <p className="text-sm text-red-300 flex-1">{error}</p>
              </div>
            )}

            {/* Scrollable Container */}
            <div className="max-h-[75vh] overflow-y-auto custom-scrollbar pr-2 -mr-2">
              <form onSubmit={handleSubmit} className="space-y-6 pb-2">

                <div className="space-y-5">
                  {/* 1. Full Name */}
                  <div className="group">
                    <label className="block text-xs font-medium text-slate-400 mb-1.5">Full Name</label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 group-focus-within:text-violet-400 transition-colors" />
                      <input
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        className={`w-full pl-10 pr-4 py-2.5 rounded-xl glass-input outline-none text-sm ${fieldErrors.name ? 'border-red-500/50 focus:border-red-500' : ''}`}
                        placeholder="John Doe"
                      />
                    </div>
                    {fieldErrors.name && <p className="mt-1 text-xs text-red-400">{fieldErrors.name}</p>}
                  </div>

                  {/* 2. Phone Number */}
                  <div className="group">
                    <label className="block text-xs font-medium text-slate-400 mb-1.5">Phone Number</label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 group-focus-within:text-blue-400 transition-colors" />
                      <input
                        type="tel"
                        name="phone"
                        value={formData.phone}
                        onChange={handleChange}
                        className={`w-full pl-10 pr-4 py-2.5 rounded-xl glass-input outline-none text-sm ${fieldErrors.phone ? 'border-red-500/50 focus:border-red-500' : ''}`}
                        placeholder="+1 (555) 000-0000"
                      />
                    </div>
                    {fieldErrors.phone && <p className="mt-1 text-xs text-red-400">{fieldErrors.phone}</p>}
                  </div>

                  {/* 3. Mail (Email) */}
                  <div className="group">
                    <label className="block text-xs font-medium text-slate-400 mb-1.5">Mail Address</label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 group-focus-within:text-blue-400 transition-colors" />
                      <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        className={`w-full pl-10 pr-4 py-2.5 rounded-xl glass-input outline-none text-sm ${fieldErrors.email ? 'border-red-500/50 focus:border-red-500' : ''}`}
                        placeholder="admin@company.com"
                      />
                    </div>
                    {fieldErrors.email && <p className="mt-1 text-xs text-red-400">{fieldErrors.email}</p>}
                  </div>

                  {/* 4. Password and Confirm Password (Same Line) */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div className="group">
                      <label className="block text-xs font-medium text-slate-400 mb-1.5">Password</label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 group-focus-within:text-blue-400 transition-colors" />
                        <input
                          type={showPassword ? "text" : "password"}
                          name="password"
                          value={formData.password}
                          onChange={handleChange}
                          className={`w-full pl-10 pr-10 py-2.5 rounded-xl glass-input outline-none text-sm ${fieldErrors.password ? 'border-red-500/50 focus:border-red-500' : ''}`}
                          placeholder="Create password"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors"
                        >
                          {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                      {formData.password && !fieldErrors.password && (
                        <div className="mt-2 flex items-center gap-2">
                          <div className="flex-1 h-1 bg-slate-800 rounded-full overflow-hidden">
                            <div className={`h-full transition-all duration-300 ${getPasswordStrengthColor()}`} style={{ width: `${(passwordStrength / 5) * 100}%` }} />
                          </div>
                          <span className="text-[10px] text-slate-500 font-medium uppercase">{getPasswordStrengthText()}</span>
                        </div>
                      )}
                      {fieldErrors.password && <p className="mt-1 text-xs text-red-400">{fieldErrors.password}</p>}
                    </div>

                    <div className="group">
                      <label className="block text-xs font-medium text-slate-400 mb-1.5">Confirm Password</label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 group-focus-within:text-blue-400 transition-colors" />
                        <input
                          type={showConfirmPassword ? "text" : "password"}
                          name="confirmPassword"
                          value={formData.confirmPassword}
                          onChange={handleChange}
                          className={`w-full pl-10 pr-10 py-2.5 rounded-xl glass-input outline-none text-sm ${fieldErrors.confirmPassword ? 'border-red-500/50 focus:border-red-500' : ''}`}
                          placeholder="Confirm password"
                        />
                        <button
                          type="button"
                          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors"
                        >
                          {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                      {fieldErrors.confirmPassword && <p className="mt-1 text-xs text-red-400">{fieldErrors.confirmPassword}</p>}
                    </div>
                  </div>

                  {/* 5. Company Name */}
                  <div className="group">
                    <label className="block text-xs font-medium text-slate-400 mb-1.5">Company Name</label>
                    <div className="relative">
                      <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 group-focus-within:text-violet-400 transition-colors" />
                      <input
                        type="text"
                        name="companyName"
                        value={formData.companyName}
                        onChange={handleChange}
                        className={`w-full pl-10 pr-4 py-2.5 rounded-xl glass-input outline-none text-sm ${fieldErrors.companyName ? 'border-red-500/50 focus:border-red-500' : ''}`}
                        placeholder="Acme Corp"
                      />
                    </div>
                    {fieldErrors.companyName && <p className="mt-1 text-xs text-red-400">{fieldErrors.companyName}</p>}
                  </div>

                  {/* 6. Company Outlets */}
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <label className="block text-xs font-medium text-slate-400 uppercase tracking-wider font-semibold">Company Outlets</label>
                      <span className="px-2 py-0.5 rounded-md bg-slate-800 text-[10px] text-slate-400 font-bold border border-white/5">{outlets.length} added</span>
                    </div>

                    <button
                      type="button"
                      onClick={() => {
                        setInitialEditIndex(null);
                        setShowOutletModal(true);
                      }}
                      className="w-full py-3 rounded-xl font-bold text-white shadow-lg transition-all transform hover:scale-[1.01] active:scale-[0.99]
                                bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 flex items-center justify-center gap-2 border border-violet-500/20"
                    >
                      <Building2 className="w-4 h-4" />
                      Add Company Branch Location
                    </button>

                    {outlets.length > 0 && (
                      <div className="grid grid-cols-1 gap-3">
                        {outlets.map((outlet, index) => (
                          <div
                            key={outlet.id || index}
                            className="p-4 bg-slate-800/30 rounded-xl border border-white/5 hover:border-violet-500/30 transition-all group"
                          >
                            <div className="flex items-start justify-between">
                              <div className="flex-1 min-w-0">
                                <p className="font-bold text-white truncate text-sm">{outlet.outletName}</p>
                                <p className="text-xs text-slate-500 flex items-start gap-1.5 mt-1 leading-relaxed">
                                  <MapPin className="w-3.5 h-3.5 mt-0.5 flex-shrink-0 text-slate-600" />
                                  <span className="line-clamp-2">{outlet.address}</span>
                                </p>
                              </div>
                              <div className="flex items-center gap-2 ml-3 opacity-0 group-hover:opacity-100 transition-opacity">
                                <button
                                  type="button"
                                  onClick={() => {
                                    setInitialEditIndex(index);
                                    setShowOutletModal(true);
                                  }}
                                  className="p-2 rounded-lg bg-blue-500/10 text-blue-400 hover:bg-blue-500/20 transition-colors"
                                >
                                  <Edit2 className="w-3.5 h-3.5" />
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleRemoveOutlet(index)}
                                  className="p-2 rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500/20 transition-colors"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                    {fieldErrors.outlets && <p className="mt-1 text-xs text-red-400 font-medium">{fieldErrors.outlets}</p>}
                  </div>
                </div>

                {/* Submit Button */}
                <div className="pt-4">
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-3.5 rounded-xl font-semibold text-white shadow-lg shadow-blue-500/25 transition-all transform hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50 disabled:cursor-not-allowed
                                  bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 flex items-center justify-center gap-2"
                  >
                    {loading ? (
                      <span className="flex items-center gap-2">
                        <span className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                        Creating Account...
                      </span>
                    ) : (
                      <>
                        <span>Create Account</span>
                        <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>

          {/* Footer */}
          <div className="mt-4 pt-4 border-t border-white/5 text-center">
            <p className="text-sm text-slate-400">
              Already have an account?{" "}
              <button
                onClick={handleLoginClick}
                className="font-medium text-blue-400 hover:text-blue-300 hover:underline transition-all"
              >
                Sign in here
              </button>
            </p>
          </div>
        </div>
      </div>

      {/* Centered Success Overlay */}
      {showOutletSuccess && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-slate-950/80 backdrop-blur-md animate-fade-in">
          <div className="bg-slate-900 border border-emerald-500/30 p-10 rounded-[40px] shadow-2xl shadow-emerald-500/10 flex flex-col items-center gap-6 animate-scale-in">
            <div className="w-24 h-24 rounded-full bg-emerald-500/20 flex items-center justify-center shadow-inner shadow-emerald-500/20">
              <CheckCircle2 className="w-12 h-12 text-emerald-400 animate-check-pulse" />
            </div>
            <div className="text-center">
              <h3 className="text-3xl font-black text-white mb-2 tracking-tight">Success!</h3>
              <p className="text-emerald-400 font-bold uppercase tracking-[0.2em] text-xs">Outlets Registered Successfully</p>
            </div>
          </div>
        </div>
      )}

      <OutletModal
        isOpen={showOutletModal}
        onClose={() => {
          setShowOutletModal(false);
          setInitialEditIndex(null);
        }}
        onSave={handleSaveOutlets}
        existingOutlets={outlets}
        initialEditIndex={initialEditIndex}
      />
    </div>
  );
};

export default Register;
