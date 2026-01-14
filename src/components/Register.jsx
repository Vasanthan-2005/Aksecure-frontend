import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import LoadingState from "./common/LoadingState";
import { Eye, EyeOff, Shield, User, Mail, Lock, Building2, Phone, MapPin, CheckCircle2, ArrowRight, XCircle, Navigation } from "lucide-react";
import LocationPicker from "./common/LocationPicker";

const Register = () => {
  const [formData, setFormData] = useState({
    name: "",
    companyName: "",
    phone: "",
    email: "",
    password: "",
    confirmPassword: "",
    address: "",
    lat: null,
    lng: null
  });

  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState(0);
  const [isGeocoding, setIsGeocoding] = useState(false);
  const [searchResults, setSearchResults] = useState([]);
  const [matchedAddress, setMatchedAddress] = useState("");

  const { register } = useAuth();
  const navigate = useNavigate();

  // Debounced Address Search - Like Google Maps
  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      if (formData.address && formData.address.length >= 3 && !matchedAddress) {
        handleAddressSearch();
      } else if (!formData.address) {
        setSearchResults([]);
        setFieldErrors(prev => ({ ...prev, address: "" }));
      }
    }, 400);

    return () => clearTimeout(delayDebounceFn);
  }, [formData.address, matchedAddress]);

  // Manual Address Geocoding Logic
  const handleAddressSearch = async () => {
    setIsGeocoding(true);
    setFieldErrors(prev => ({ ...prev, address: "", location: "" }));

    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(formData.address)}&limit=5&addressdetails=1`,
        {
          headers: {
            'Accept-Language': 'en-US,en;q=0.9',
            'User-Agent': 'Aksecure-App-Search'
          }
        }
      );
      const data = await response.json();

      if (data && data.length > 0) {
        setSearchResults(data);

        // Intelligent Filtering: Look for "high precision" types
        const highPrecisionResult = data.find(r =>
          ['house', 'house_number', 'road', 'building', 'residential', 'service', 'office', 'commercial', 'industrial'].includes(r.type) ||
          ['building', 'highway', 'place', 'amenity', 'shop'].includes(r.class)
        );

        if (highPrecisionResult) {
          // Auto-mark only if high precision is found
          const { lat, lon, display_name } = highPrecisionResult;
          setFormData(prev => ({
            ...prev,
            lat: parseFloat(lat),
            lng: parseFloat(lon)
          }));
          setMatchedAddress(display_name);
          setFieldErrors(prev => {
            const newErrors = { ...prev };
            delete newErrors.address;
            delete newErrors.location;
            return newErrors;
          });
        }
        // NOTE: We don't set error here if broad, just show the suggestions dropdown
      } else {
        setFormData(prev => ({ ...prev, lat: null, lng: null }));
        setFieldErrors(prev => ({
          ...prev,
          address: "Exact location not found. Please enter full address manually."
        }));
      }
    } catch (err) {
      console.error("Geocoding error:", err);
    } finally {
      setIsGeocoding(false);
    }
  };

  const handleSelectResult = (result) => {
    const { lat, lon, display_name } = result;
    setFormData(prev => ({
      ...prev,
      lat: parseFloat(lat),
      lng: parseFloat(lon),
      address: display_name // Update address field with full name
    }));
    setMatchedAddress(display_name);
    setSearchResults([]); // Hide results after selection
    setFieldErrors(prev => {
      const newErrors = { ...prev };
      delete newErrors.address;
      delete newErrors.location;
      return newErrors;
    });
  };

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

    // Clear location data if address is being modified
    if (name === "address") {
      setMatchedAddress("");
      setSearchResults([]);
      setFormData(prev => ({
        ...prev,
        lat: null,
        lng: null
      }));
    }

    if (name === "password") {
      setPasswordStrength(calculatePasswordStrength(value));
    }
  };

  const handleLocationSelect = (location) => {
    setFormData(prev => ({
      ...prev,
      lat: location.lat,
      lng: location.lng
    }));
    if (fieldErrors.location) {
      setFieldErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors.location;
        return newErrors;
      });
    }
  };

  const validateForm = () => {
    const errors = {};

    if (!formData.name.trim()) {
      errors.name = "Name is required";
    }
    if (!formData.companyName.trim()) {
      errors.companyName = "Company name is required";
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
    if (!formData.address.trim()) {
      errors.address = "Company address is required";
    }
    if (formData.lat === null || formData.lng === null) {
      errors.location = "Please select your company location on the map";
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
          } else if (firstErrorKey === 'location') {
            const mapEl = document.getElementById('location-picker-section');
            if (mapEl) mapEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
          }
        }
      }, 100);
      return;
    }

    setLoading(true);

    try {
      const { confirmPassword, ...userData } = formData;
      await register(userData);
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
        if (!formData.companyName.trim()) serverFieldErrors.companyName = "Company name is required";
        if (!formData.phone.trim()) serverFieldErrors.phone = "Phone number is required";
        if (!formData.email.trim()) serverFieldErrors.email = "Email is required";
        if (!formData.password) serverFieldErrors.password = "Password is required";
        if (!formData.address.trim()) serverFieldErrors.address = "Company address is required";
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
    <div className="min-h-screen flex relative overflow-hidden bg-slate-950">
      {loading && <LoadingState message="Creating Security Profile" fullPage={true} />}

      {/* Background gradients */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0">
        <div className="absolute -top-[20%] -right-[10%] w-[60%] h-[60%] rounded-full bg-violet-600/10 blur-[120px]" />
        <div className="absolute bottom-[0%] left-[0%] w-[50%] h-[50%] rounded-full bg-blue-600/10 blur-[100px]" />
      </div>

      {/* LEFT SIDE - BRANDING */}
      <div className="hidden xl:flex xl:w-5/12 relative z-10 flex-col justify-center p-12">
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
      <div className="flex-1 flex items-center justify-center p-4 sm:p-6 lg:p-8 relative z-10">
        <div className="w-full max-w-2xl px-8 mt-20">

          <div className="glass-card p-6 sm:p-8 md:p-10 w-full animate-fade-in-up">

            <div className="flex items-center justify-between mb-8">
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
              <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-xl flex items-start gap-3">
                <div className="w-5 h-5 rounded-full bg-red-500/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-red-400 text-xs font-bold">!</span>
                </div>
                <p className="text-sm text-red-300 flex-1">{error}</p>
              </div>
            )}

            <form className="space-y-6">

              {/* Section 1: Organization Info */}
              <div className="space-y-4">
                <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">Organization Details</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
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
                </div>

                <div className="group relative">
                  <label className="block text-xs font-medium text-slate-400 mb-1.5">Company Address</label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-3 w-4 h-4 text-slate-500 group-focus-within:text-violet-400 transition-colors" />
                    <textarea
                      name="address"
                      rows="2"
                      value={formData.address}
                      onChange={handleChange}
                      onBlur={() => setTimeout(() => setSearchResults([]), 200)} // Delay to allow clicks
                      className={`w-full pl-10 pr-10 py-2.5 rounded-xl glass-input outline-none text-sm resize-none ${fieldErrors.address ? 'border-red-500/50 focus:border-red-500' : ''}`}
                      placeholder="Enter company address (e.g. 123 Business St, City)"
                    />

                    {/* Clear/Loading Indicators */}
                    <div className="absolute right-3 top-3 flex items-center gap-2">
                      {isGeocoding && (
                        <div className="w-4 h-4 border-2 border-violet-400/20 border-t-violet-400 rounded-full animate-spin" />
                      )}
                      {formData.address && (
                        <button
                          type="button"
                          onClick={() => {
                            setFormData(prev => ({ ...prev, address: "", lat: null, lng: null }));
                            setSearchResults([]);
                            setMatchedAddress("");
                          }}
                          className="text-slate-500 hover:text-white transition-colors"
                        >
                          <XCircle className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Google Maps Style Floating Dropdown */}
                  {searchResults.length > 0 && (
                    <div className="absolute left-0 right-0 top-full mt-2 z-[100] animate-fade-in shadow-2xl">
                      <div className="bg-slate-900/95 backdrop-blur-xl rounded-2xl border border-white/10 shadow-2xl shadow-black/50 overflow-hidden divide-y divide-white/5">
                        <div className="px-3 py-2 bg-white/5 flex items-center justify-between">
                          <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Suggestions</p>
                          <span className="text-[9px] text-slate-600">OpenStreetMap</span>
                        </div>
                        <div className="max-h-60 overflow-y-auto custom-scrollbar">
                          {searchResults.map((result, index) => (
                            <button
                              key={index}
                              type="button"
                              onClick={() => handleSelectResult(result)}
                              className="w-full text-left p-3 hover:bg-violet-600/10 transition-all group flex gap-3 items-start border-l-2 border-l-transparent hover:border-l-violet-500"
                            >
                              <div className="p-1.5 rounded-lg bg-slate-800 group-hover:bg-violet-500/20 transition-colors">
                                <Navigation className="w-3.5 h-3.5 text-slate-400 group-hover:text-violet-400" />
                              </div>
                              <div className="min-w-0">
                                <p className="text-xs text-slate-200 group-hover:text-white font-medium transition-colors truncate">
                                  {result.display_name.split(',')[0]}
                                </p>
                                <p className="text-[10px] text-slate-500 group-hover:text-slate-400 transition-colors truncate">
                                  {result.display_name.split(',').slice(1).join(',')}
                                </p>
                              </div>
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}

                  {matchedAddress && searchResults.length === 0 && (
                    <div className="mt-2 p-3 bg-emerald-500/5 border border-emerald-500/10 rounded-xl animate-fade-in flex gap-3 items-start relative z-10">
                      <div className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-400 shrink-0">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                      </div>
                      <div>
                        <p className="text-[10px] text-emerald-400 font-semibold uppercase tracking-wider mb-0.5">Location Verified</p>
                        <p className="text-xs text-slate-300 leading-tight">{matchedAddress}</p>
                      </div>
                    </div>
                  )}
                  {fieldErrors.address && <p className="mt-1 text-xs text-red-400">{fieldErrors.address}</p>}
                </div>

                {/* Location Picker Section */}
                <div id="location-picker-section" className="pt-2">
                  <LocationPicker
                    onLocationSelect={handleLocationSelect}
                    initialLocation={formData.lat ? { lat: formData.lat, lng: formData.lng } : null}
                  />
                  {fieldErrors.location && <p className="mt-2 text-xs text-red-400">{fieldErrors.location}</p>}
                </div>
              </div>

              {/* Section 2: Contact & Security */}
              <div className="space-y-4 pt-2">
                <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">Contact & Security</h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div className="group">
                    <label className="block text-xs font-medium text-slate-400 mb-1.5">Email Address</label>
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
                </div>

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
              </div>

              {/* Submit Button */}
              <div className="pt-4 pb-12">
                <button
                  type="submit"
                  onClick={handleSubmit}
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

            {/* Footer */}
            <div className="mt-6 pt-6 border-t border-white/5 text-center">
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

          <p className="text-center text-xs text-slate-600 mt-6 pb-8">
            By registering, you agree to our Terms of Service & Privacy Policy
          </p>

        </div>
      </div>
    </div>
  );
};

export default Register;
