import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import LoadingState from "./common/LoadingState";
import { Eye, EyeOff, Shield, User, Mail, Lock, Building2, Phone, CheckCircle2, ArrowRight, ArrowLeft } from "lucide-react";
import OutletModal from "./common/OutletModal";
import api from "../services/api";

const Register = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    name: "",
    companyName: "",
    countryCode: "+91",
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
  const [showMobileForm, setShowMobileForm] = useState(false);

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

  const validateStep1 = () => {
    const errors = {};

    if (!formData.name.trim()) {
      errors.name = "Required";
    }
    if (!formData.phone.trim()) {
      errors.phone = "Required";
    } else if (!/^\+?[\d\s-()]+$/.test(formData.phone)) {
      errors.phone = "Invalid phone";
    }
    if (!formData.email.trim()) {
      errors.email = "Required";
    } else {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(formData.email.trim())) {
        errors.email = "Invalid email";
      }
    }
    if (!formData.password) {
      errors.password = "Required";
    } else if (formData.password.length < 8) {
      errors.password = "Min 8 chars";
    }
    if (!formData.confirmPassword) {
      errors.confirmPassword = "Required";
    } else if (formData.password !== formData.confirmPassword) {
      errors.confirmPassword = "Mismatch";
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleNextStep = async () => {
    if (!validateStep1()) return;

    setLoading(true);
    setError("");
    setFieldErrors({});

    try {
      await api.post('/auth/check-availability', {
        email: formData.email,
        phone: `${formData.countryCode}${formData.phone}`
      });
      setCurrentStep(2);
    } catch (err) {
      const errorMessage = err?.response?.data?.message || "Unable to verify availability.";
      setError(errorMessage);
      const serverFieldErrors = {};
      const lowerMessage = errorMessage.toLowerCase();
      if (lowerMessage.includes("email")) serverFieldErrors.email = errorMessage;
      if (lowerMessage.includes("phone")) serverFieldErrors.phone = errorMessage;
      if (Object.keys(serverFieldErrors).length > 0) setFieldErrors(serverFieldErrors);
    } finally {
      setLoading(false);
    }
  };

  const handlePreviousStep = () => {
    setCurrentStep(1);
    setError("");
    setFieldErrors({});
  };

  const handleSubmit = async (e) => {
    if (e) e.preventDefault();
    
    if (!formData.companyName.trim()) {
      setFieldErrors({ companyName: "Required" });
      return;
    }
    if (outlets.length === 0) {
      setFieldErrors({ outlets: "Add at least one branch" });
      return;
    }

    setLoading(true);
    setError("");

    try {
      const { confirmPassword, ...userData } = formData;
      const registrationData = {
        ...userData,
        phone: `${formData.countryCode}${formData.phone}`,
        outlets: outlets
      };
      await register(registrationData);
      navigate('/');
    } catch (err) {
      const errorMessage = err?.response?.data?.message || "Registration failed. Please try again.";
      setError(errorMessage);
      const serverFieldErrors = {};
      const lowerMessage = errorMessage.toLowerCase();
      if ((lowerMessage.includes("email") || lowerMessage.includes("phone")) && (lowerMessage.includes("exists") || lowerMessage.includes("already"))) {
        if (lowerMessage.includes("email")) serverFieldErrors.email = errorMessage;
        if (lowerMessage.includes("phone")) serverFieldErrors.phone = errorMessage;
        setCurrentStep(1);
      }
      if (Object.keys(serverFieldErrors).length > 0) setFieldErrors(serverFieldErrors);
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
    <div className="h-screen w-screen flex flex-col lg:flex-row relative overflow-hidden bg-[#020617] text-white">
      {loading && <LoadingState message="Creating Security Profile" fullPage={true} />}

      {/* LEFT PANEL - BRAND SECTION (Landing Page on Mobile) */}
      <div className={`absolute inset-0 lg:relative lg:w-1/2 flex flex-col justify-between p-8 sm:p-12 lg:p-20 overflow-hidden bg-gradient-to-b from-[#0A192F] to-[#020617] transition-all duration-700 ease-in-out z-20 ${
        showMobileForm ? '-translate-x-full lg:translate-x-0 opacity-0 lg:opacity-100' : 'translate-x-0 opacity-100'
      }`}>
        {/* Subtle Vignette & Glow */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-violet-500/10 blur-[120px] rounded-full"></div>
          <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-500/10 blur-[120px] rounded-full"></div>
          <div className="absolute inset-0 shadow-[inner_0_0_100px_rgba(0,0,0,0.5)]"></div>
        </div>

        {/* Top Section: Logo */}
        <div className="relative z-10 flex-none flex items-center gap-3">
          <div className="w-12 h-12 lg:w-14 lg:h-14 rounded-2xl bg-gradient-to-br from-violet-600 to-indigo-700 flex items-center justify-center shadow-[0_0_20px_rgba(139,92,246,0.4)]">
            <Shield className="w-7 h-7 lg:w-8 lg:h-8 text-white" />
          </div>
          <span className="text-2xl font-black tracking-tighter text-white">
            AK<span className="text-violet-500">SECURE</span>
          </span>
        </div>

        {/* Middle Section: Headline, Description & Features */}
        <div className="relative z-10 flex-1 flex flex-col justify-center pt-6 lg:py-10">
          <div className="max-w-xl">
            <h1 className="text-4xl sm:text-5xl lg:text-[42px] font-extrabold tracking-tight leading-[1.2] mb-6 lg:mb-8">
              <span className="block text-white">Join the future of</span>
              <span className="block text-transparent bg-clip-text bg-gradient-to-r from-violet-400 via-purple-400 to-blue-500 pb-1">
                enterprise security
              </span>
            </h1>
            <p className="text-sm sm:text-base lg:text-lg text-slate-400/80 max-w-sm leading-relaxed font-medium mb-8 lg:mb-0">
              Create your organization account to access our comprehensive surveillance and safety management platform.
            </p>

            {/* Feature Points (Moved up for mobile interaction) */}
            <div className="space-y-4 lg:space-y-5 lg:hidden mt-2">
              {[
                { icon: <Shield className="w-4 h-4 sm:w-5 h-5" />, title: "Bank-Grade Security", sub: "Data protection standards", color: "text-emerald-400" },
                { icon: <CheckCircle2 className="w-4 h-4 sm:w-5 h-5" />, title: "Instant Activation", sub: "Immediate dashboard access", color: "text-blue-400" },
                { icon: <Shield className="w-4 h-4 sm:w-5 h-5" />, title: "Global Compliance", sub: "International safety regulations", color: "text-purple-400" }
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

        {/* Bottom Section: Features (Desktop Only) & Swipe button */}
        <div className="relative z-10 flex-none bottom-0">
          {/* Feature Points (Desktop Only) */}
          <div className="hidden lg:block space-y-5 mb-16">
            {[
              { icon: <Shield className="w-5 h-5" />, title: "Bank-Grade Security", sub: "Data protection standards", color: "text-emerald-400" },
              { icon: <CheckCircle2 className="w-5 h-5" />, title: "Instant Activation", sub: "Immediate dashboard access", color: "text-blue-400" },
              { icon: <Shield className="w-5 h-5" />, title: "Global Compliance", sub: "International safety regulations", color: "text-purple-400" }
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

          {/* Swipe Indicator (Mobile Only) */}
          <div className="lg:hidden mt-10">
            <button 
              onClick={() => setShowMobileForm(true)}
              className="w-full px-4 py-2 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-white/5 border border-white/20 text-slate-300 hover:text-white hover:bg-white/10 transition-all flex justify-center items-center gap-2"
            >
              Swipe to Register
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
        </div>
      </div>

      {/* RIGHT PANEL - REGISTRATION SECTION */}
      <div className={`absolute inset-0 lg:relative lg:flex-1 flex items-center justify-center p-4 sm:p-8 bg-[#020617] transition-all duration-700 ease-in-out z-10 ${
        showMobileForm ? 'translate-x-0 opacity-100' : 'translate-x-full lg:translate-x-0 opacity-0 lg:opacity-100'
      }`}>
        {/* Mobile Back Button */}
        <div className="lg:hidden absolute top-6 left-6 z-30">
          <button 
            onClick={() => setShowMobileForm(false)}
            className="p-3 rounded-xl bg-white/5 border border-white/10 text-slate-400 active:scale-90 transition-all flex items-center gap-2 font-bold text-xs uppercase tracking-widest"
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </button>
        </div>
        {/* Dark Background with subtle shading */}
        <div className="absolute inset-0 bg-[#020617]">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[60%] h-[60%] bg-violet-500/5 blur-[150px] rounded-full"></div>
        </div>

        <div className="w-full max-w-[620px] relative z-10 flex flex-col items-center">
          {/* Glass Registration Card */}
          <div className="w-full bg-slate-900/30 backdrop-blur-3xl border border-white/10 rounded-[32px] sm:rounded-[40px] p-5 sm:p-8 shadow-2xl relative flex flex-col">
            
            {/* Header */}
            <div className="flex-shrink-0 pb-6 border-b border-white/5 flex items-center justify-between">
              <div>
                <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">Create Account</h2>
                <p className="text-slate-500 text-xs sm:text-sm font-medium mt-1">
                  {currentStep === 1 ? "Enter organization details" : "Add company branch locations"}
                </p>
              </div>
              <div className="text-right">
                <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mb-1.5">Step {currentStep}/2</p>
                <div className="w-16 h-1 bg-slate-800 rounded-full overflow-hidden">
                  <div className={`h-full bg-gradient-to-r from-blue-600 to-cyan-600 transition-all duration-300 ${currentStep === 1 ? 'w-1/2' : 'w-full'}`} />
                </div>
              </div>
            </div>

            {/* Error Display */}
            {error && Object.keys(fieldErrors).length === 0 && (
              <div className="flex-shrink-0 mx-5 sm:mx-6 mt-4 p-2 bg-red-500/10 border border-red-500/20 rounded-xl flex items-start gap-3">
                <p className="text-xs text-red-300 flex-1">{error}</p>
              </div>
            )}

            {/* Form Content */}
            <div className="flex-1 mt-4 sm:mt-6">
              {currentStep === 1 && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-3 sm:gap-y-4">
                  {/* Full Name */}
                  <div className="group md:col-span-2">
                    <label className="block text-[10px] font-bold text-slate-500 mb-2 uppercase tracking-[0.15em] ml-1">Full Name *</label>
                    <div className="relative">
                      <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500 group-focus-within:text-blue-400 transition-colors" />
                      <input
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        className={`w-full pl-12 pr-4 py-4 rounded-2xl glass-input outline-none text-sm ${fieldErrors.name ? 'border-red-500/50 focus:border-red-500' : ''}`}
                        placeholder="John Doe"
                      />
                    </div>
                    {fieldErrors.name && <p className="mt-1.5 text-[10px] text-red-400 font-bold ml-1 uppercase tracking-wider">{fieldErrors.name}</p>}
                  </div>

                  {/* Phone Number */}
                  <div className="group">
                    <label className="block text-[10px] font-bold text-slate-500 mb-2 uppercase tracking-[0.15em] ml-1">Phone Number *</label>
                    <div className="flex gap-2">
                      <div className="relative w-[100px] flex-shrink-0">
                        <select
                          name="countryCode"
                          value={formData.countryCode}
                          onChange={handleChange}
                          className="w-full pl-3 pr-8 py-4 rounded-2xl glass-input outline-none text-xs appearance-none cursor-pointer"
                        >
                          <option value="+44">UK (+44)</option>
                          <option value="+91">IN (+91)</option>
                          <option value="+1">US (+1)</option>
                          <option value="+971">AE (+971)</option>
                        </select>
                        <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate-500">
                          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" /></svg>
                        </div>
                      </div>
                      <div className="relative flex-1">
                        <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500 group-focus-within:text-blue-400 transition-colors" />
                        <input
                          type="tel"
                          name="phone"
                          value={formData.phone}
                          onChange={handleChange}
                          className={`w-full pl-12 pr-4 py-4 rounded-2xl glass-input outline-none text-sm ${fieldErrors.phone ? 'border-red-500/50 focus:border-red-500' : ''}`}
                          placeholder="xxxxxxxxxx"
                        />
                      </div>
                    </div>
                    {fieldErrors.phone && <p className="mt-1.5 text-[10px] text-red-400 font-bold ml-1 uppercase tracking-wider">{fieldErrors.phone}</p>}
                  </div>

                  {/* Email */}
                  <div className="group">
                    <label className="block text-[10px] font-bold text-slate-500 mb-2 uppercase tracking-[0.15em] ml-1">Mail Address *</label>
                    <div className="relative">
                      <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500 group-focus-within:text-blue-400 transition-colors" />
                      <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        className={`w-full pl-12 pr-4 py-4 rounded-2xl glass-input outline-none text-sm ${fieldErrors.email ? 'border-red-500/50 focus:border-red-500' : ''}`}
                        placeholder="admin@company.com"
                      />
                    </div>
                    {fieldErrors.email && <p className="mt-1.5 text-[10px] text-red-400 font-bold ml-1 uppercase tracking-wider">{fieldErrors.email}</p>}
                  </div>

                  {/* Password */}
                  <div className="group">
                    <label className="block text-[10px] font-bold text-slate-500 mb-2 uppercase tracking-[0.15em] ml-1">Password *</label>
                    <div className="relative">
                      <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500 group-focus-within:text-blue-400 transition-colors" />
                      <input
                        type={showPassword ? "text" : "password"}
                        name="password"
                        value={formData.password}
                        onChange={handleChange}
                        className={`w-full bg-black/40 border border-white/5 pl-12 pr-12 py-4 rounded-2xl outline-none text-sm text-white placeholder:text-slate-700 focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/20 transition-all ${fieldErrors.password ? 'border-red-500/50' : ''}`}
                        placeholder="••••••••"
                      />
                      <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors">
                        {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                      </button>
                    </div>
                    {fieldErrors.password && <p className="mt-1.5 text-[10px] text-red-400 font-bold ml-1 uppercase tracking-wider">{fieldErrors.password}</p>}
                  </div>

                  {/* Confirm Password */}
                  <div className="group">
                    <label className="block text-[10px] font-bold text-slate-500 mb-2 uppercase tracking-[0.15em] ml-1">Confirm *</label>
                    <div className="relative">
                      <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500 group-focus-within:text-blue-400 transition-colors" />
                      <input
                        type={showConfirmPassword ? "text" : "password"}
                        name="confirmPassword"
                        value={formData.confirmPassword}
                        onChange={handleChange}
                        className={`w-full bg-black/40 border border-white/5 pl-12 pr-12 py-4 rounded-2xl outline-none text-sm text-white placeholder:text-slate-700 focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/20 transition-all ${fieldErrors.confirmPassword ? 'border-red-500/50' : ''}`}
                        placeholder="••••••••"
                      />
                      <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors">
                        {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                      </button>
                    </div>
                    {fieldErrors.confirmPassword && <p className="mt-1.5 text-[10px] text-red-400 font-bold ml-1 uppercase tracking-wider">{fieldErrors.confirmPassword}</p>}
                  </div>
                </div>
              )}

              {currentStep === 2 && (
                <div className="space-y-6">
                  {/* Company Name */}
                  <div className="group">
                    <label className="block text-[10px] font-bold text-slate-500 mb-2 uppercase tracking-[0.15em] ml-1">Company Name *</label>
                    <div className="relative">
                      <Building2 className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500 group-focus-within:text-blue-400 transition-colors" />
                      <input
                        type="text"
                        name="companyName"
                        value={formData.companyName}
                        onChange={handleChange}
                        className={`w-full bg-black/40 border border-white/5 pl-11 pr-4 py-3.5 sm:py-4 rounded-2xl outline-none text-sm sm:text-base font-medium text-white placeholder:text-slate-700 focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/20 transition-all ${fieldErrors.companyName ? 'border-red-500/50' : ''}`}
                        placeholder="Enter organization name"
                      />
                    </div>
                    {fieldErrors.companyName && <p className="mt-1.5 text-[10px] text-red-400 font-bold ml-1 uppercase tracking-wider">{fieldErrors.companyName}</p>}
                  </div>

                  {/* Outlets Section - Compact */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-2xl bg-slate-800/20 border border-white/5">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-2xl bg-violet-600/10 flex items-center justify-center border border-violet-500/20 shadow-lg">
                        <Building2 className="w-6 h-6 text-violet-400" />
                      </div>
                      <div>
                        <p className="text-sm font-bold text-white uppercase tracking-wider">Company Outlets</p>
                        <p className="text-[11px] text-slate-500 font-bold uppercase tracking-widest">{outlets.length} Added Successfully</p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => { setInitialEditIndex(null); setShowOutletModal(true); }}
                      className="px-6 py-3 rounded-xl font-bold text-white text-[11px] uppercase tracking-widest bg-gradient-to-r from-blue-600 to-cyan-600 hover:scale-[1.02] active:scale-[0.98] transition-all shadow-lg shadow-blue-500/10"
                    >
                      Add/Manage Branches
                    </button>
                  </div>
                  {fieldErrors.outlets && <p className="mt-1 text-[10px] text-red-400 font-bold ml-1 uppercase text-center">{fieldErrors.outlets}</p>}
                </div>
              )}

              {/* Action Buttons */}
              <div className="mt-8 flex flex-col gap-3">
                {currentStep === 1 ? (
                  <button
                    type="button"
                    onClick={handleNextStep}
                    disabled={loading}
                    className="w-full py-4 rounded-2xl font-black text-white text-[13px] uppercase tracking-[0.2em] shadow-lg shadow-blue-500/20
                              bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 transition-all transform active:scale-[0.98] disabled:opacity-50"
                  >
                    {loading ? "Verifying..." : "Next: Company Details"}
                  </button>
                ) : (
                  <>
                    <button
                      type="button"
                      onClick={handleSubmit}
                      disabled={loading}
                      className="w-full py-4 rounded-2xl font-black text-white text-[13px] uppercase tracking-[0.2em] shadow-lg shadow-blue-500/20
                                bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 transition-all transform active:scale-[0.98] disabled:opacity-50"
                    >
                      {loading ? "Creating Account..." : "Create Organization Account"}
                    </button>
                    <button
                      type="button"
                      onClick={handlePreviousStep}
                      className="w-full py-2.5 rounded-xl font-bold text-slate-500 hover:text-white text-[11px] uppercase tracking-widest transition-all flex items-center justify-center gap-2 group"
                    >
                      <ArrowLeft className="w-3.5 h-3.5 group-hover:-translate-x-1 transition-transform" />
                      Back to personal details
                    </button>
                  </>
                )}
              </div>
            </div>

            {/* Login Link */}
            <div className="flex-shrink-0 px-5 sm:px-6 pb-2 text-center pt-4">
              <p className="mt-2 text-slate-500 text-[11px] font-bold uppercase tracking-wider">
                Already have an account?{" "}
                <button
                  onClick={handleLoginClick}
                  className="text-blue-400 hover:text-blue-300 uppercase transition-all"
                >
                  Sign in here
                </button>
              </p>
            </div>
          </div>

          {/* Encryption & Copyright Notice */}
          <div className="mt-8 text-center w-full">
            <p className="text-[9px] text-slate-500/60 font-medium uppercase tracking-[0.15em]">
              © {new Date().getFullYear()} AKSECURE. ALL RIGHTS RESERVED.
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
