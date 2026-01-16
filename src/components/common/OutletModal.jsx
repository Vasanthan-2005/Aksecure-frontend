import { useState, useEffect } from "react";
import { X, Plus, MapPin, Navigation, Trash2, Edit2, CheckCircle2, XCircle } from "lucide-react";
import LocationPicker from "./LocationPicker";

const OutletModal = ({ isOpen, onClose, onSave, existingOutlets = [], initialEditIndex = null }) => {
    const [outlets, setOutlets] = useState([]);
    const [editingIndex, setEditingIndex] = useState(null);
    const [currentOutlet, setCurrentOutlet] = useState({
        outletName: "",
        address: "",
        lat: null,
        lng: null
    });
    const [searchResults, setSearchResults] = useState([]);
    const [isGeocoding, setIsGeocoding] = useState(false);
    const [errors, setErrors] = useState({});
    const [isSelecting, setIsSelecting] = useState(false);
    const [lastAddedId, setLastAddedId] = useState(null);
    const [showIndividualSuccess, setShowIndividualSuccess] = useState(false);

    useEffect(() => {
        if (isOpen) {
            const normalized = existingOutlets.map(o => ({
                ...o,
                lat: o.lat ?? o.location?.lat,
                lng: o.lng ?? o.location?.lng
            }));
            setOutlets(normalized);

            if (initialEditIndex !== null && normalized[initialEditIndex]) {
                setCurrentOutlet(normalized[initialEditIndex]);
                setEditingIndex(initialEditIndex);
            } else {
                resetCurrentOutlet();
            }
        }
    }, [isOpen, existingOutlets, initialEditIndex]);

    const resetCurrentOutlet = () => {
        setCurrentOutlet({
            outletName: "",
            address: "",
            lat: null,
            lng: null
        });
        setSearchResults([]);
        setErrors({});
        setEditingIndex(null);
    };

    // Address search with debouncing
    useEffect(() => {
        if (isSelecting) {
            setIsSelecting(false);
            return;
        }

        const delayDebounceFn = setTimeout(() => {
            if (currentOutlet.address && currentOutlet.address.length >= 3) {
                handleAddressSearch();
            } else {
                setSearchResults([]);
            }
        }, 400);

        return () => clearTimeout(delayDebounceFn);
    }, [currentOutlet.address]);

    const handleAddressSearch = async () => {
        setIsGeocoding(true);
        try {
            const fetchResults = async (q) => {
                const response = await fetch(
                    `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(q)}&limit=10&addressdetails=1`,
                    {
                        headers: {
                            'Accept-Language': 'en-US,en;q=0.9',
                            'User-Agent': 'Aksecure-App-Search'
                        }
                    }
                );
                return await response.json();
            };

            let data = await fetchResults(currentOutlet.address);

            // Fallback: If no results for full address, try the first segment (usually the building/area)
            if ((!data || data.length === 0) && currentOutlet.address.includes(',')) {
                const simplified = currentOutlet.address.split(',')[0].trim();
                if (simplified.length >= 3) {
                    data = await fetchResults(simplified);
                }
            }

            if (data && data.length > 0) {
                setSearchResults(data);
            } else {
                setSearchResults([]);
            }
        } catch (err) {
            console.error("Geocoding error:", err);
        } finally {
            setIsGeocoding(false);
        }
    };

    const handleSelectResult = (result) => {
        const { lat, lon, display_name } = result;
        setIsSelecting(true);
        setCurrentOutlet(prev => ({
            ...prev,
            address: display_name,
            lat: parseFloat(lat),
            lng: parseFloat(lon)
        }));
        setSearchResults([]);
        setErrors(prev => ({ ...prev, address: "", location: "" }));
    };

    const handleLocationSelect = (location) => {
        setCurrentOutlet(prev => ({
            ...prev,
            lat: location.lat,
            lng: location.lng
        }));
        setErrors(prev => ({ ...prev, location: "" }));
    };

    const handleAddressFetched = (address) => {
        setIsSelecting(true);
        setCurrentOutlet(prev => ({
            ...prev,
            address: address
        }));
        setErrors(prev => ({ ...prev, address: "" }));
    };

    const handleUseCurrentLocation = () => {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    setCurrentOutlet(prev => ({
                        ...prev,
                        lat: position.coords.latitude,
                        lng: position.coords.longitude
                    }));
                    setErrors(prev => ({ ...prev, location: "" }));
                },
                (error) => {
                    console.error("Error getting location:", error);
                    setErrors(prev => ({ ...prev, location: "Unable to get current location" }));
                }
            );
        }
    };

    const validateOutlet = () => {
        const newErrors = {};
        if (!currentOutlet.outletName.trim()) {
            newErrors.outletName = "Outlet name is required";
        }
        if (!currentOutlet.address.trim()) {
            newErrors.address = "Address is required";
        }
        if (currentOutlet.lat === null || currentOutlet.lng === null) {
            newErrors.location = "Please select location on map";
        }
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleAddOutlet = () => {
        if (!validateOutlet()) return;

        if (editingIndex !== null) {
            // Update existing outlet
            const updatedOutlets = [...outlets];
            updatedOutlets[editingIndex] = { ...currentOutlet, id: outlets[editingIndex].id };
            setOutlets(updatedOutlets);
            setShowIndividualSuccess(true);
            setTimeout(() => setShowIndividualSuccess(false), 2000);
        } else {
            // Add new outlet
            const newId = Date.now();
            setOutlets([...outlets, { ...currentOutlet, id: newId }]);
            setLastAddedId(newId);
            setShowIndividualSuccess(true);
            setTimeout(() => {
                setShowIndividualSuccess(false);
                setLastAddedId(null);
            }, 2000);
        }
        resetCurrentOutlet();
    };

    const handleEditOutlet = (index) => {
        const outlet = outlets[index];
        setCurrentOutlet({
            ...outlet,
            lat: outlet.lat ?? outlet.location?.lat,
            lng: outlet.lng ?? outlet.location?.lng
        });
        setEditingIndex(index);
    };

    const handleRemoveOutlet = (index) => {
        setOutlets(outlets.filter((_, i) => i !== index));
        if (editingIndex === index) {
            resetCurrentOutlet();
        }
    };

    const handleSave = () => {
        if (outlets.length === 0) {
            setErrors({ general: "Please add at least one outlet" });
            return;
        }
        onSave(outlets);
        onClose();
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
            <div className="bg-slate-900 rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden border border-white/10 animate-fade-in-up">

                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-white/10">
                    <h2 className="text-2xl font-bold text-white">Add Outlets</h2>
                    <button
                        onClick={onClose}
                        className="p-2 rounded-lg hover:bg-slate-800 transition-colors text-slate-400 hover:text-white"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Content */}
                <div className="p-6 overflow-y-auto max-h-[calc(90vh-140px)] custom-scrollbar">

                    {/* Saved Outlets List */}
                    {outlets.length > 0 && (
                        <div className="mb-6">
                            <div className="flex items-center justify-between mb-3">
                                <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider">
                                    Added Outlets ({outlets.length})
                                </h3>
                            </div>
                            <div className="space-y-2">
                                {outlets.map((outlet, index) => (
                                    <div
                                        key={outlet.id}
                                        className={`p-4 bg-slate-800/50 rounded-xl border flex items-start justify-between group transition-all duration-300 ${lastAddedId === outlet.id
                                            ? 'border-emerald-500/50 bg-emerald-500/5 shadow-lg shadow-emerald-500/10'
                                            : 'border-white/5 hover:border-blue-500/30'
                                            }`}
                                    >
                                        <div className="flex-1">
                                            <div className="flex items-center gap-2 mb-1">
                                                <div className="w-5 h-5 rounded-full bg-emerald-500/20 flex items-center justify-center flex-shrink-0">
                                                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                                                </div>
                                                <p className="font-semibold text-white">{outlet.outletName}</p>
                                                {lastAddedId === outlet.id && (
                                                    <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-widest animate-pulse ml-1">Just Added</span>
                                                )}
                                            </div>
                                            <p className="text-sm text-slate-400 flex items-start gap-2">
                                                <MapPin className="w-4 h-4 mt-0.5 flex-shrink-0" />
                                                <span className="line-clamp-2">{outlet.address}</span>
                                            </p>
                                        </div>
                                        <div className="flex items-center gap-2 ml-4">
                                            <button
                                                onClick={() => handleEditOutlet(index)}
                                                className="p-2 rounded-lg bg-blue-500/10 text-blue-400 hover:bg-blue-500/20 transition-colors"
                                            >
                                                <Edit2 className="w-4 h-4" />
                                            </button>
                                            <button
                                                onClick={() => handleRemoveOutlet(index)}
                                                className="p-2 rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500/20 transition-colors"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Add/Edit Outlet Form */}
                    <div className="bg-slate-800/30 rounded-xl p-6 border border-white/5">
                        <h3 className="text-lg font-semibold text-white mb-4">
                            {editingIndex !== null ? "Edit Outlet" : "Add New Outlet"}
                        </h3>

                        <div className="space-y-4">
                            {/* Outlet Name */}
                            <div className="group">
                                <label className="block text-xs font-medium text-slate-400 mb-1.5">Outlet Name</label>
                                <input
                                    type="text"
                                    value={currentOutlet.outletName}
                                    onChange={(e) => {
                                        setCurrentOutlet(prev => ({ ...prev, outletName: e.target.value }));
                                        setErrors(prev => ({ ...prev, outletName: "" }));
                                    }}
                                    className={`w-full px-4 py-2.5 rounded-xl glass-input outline-none text-sm ${errors.outletName ? 'border-red-500/50 focus:border-red-500' : ''}`}
                                    placeholder="e.g., Downtown Branch"
                                />
                                {errors.outletName && <p className="mt-1 text-xs text-red-400">{errors.outletName}</p>}
                            </div>

                            {/* Address Search */}
                            <div className="group relative">
                                <label className="block text-xs font-medium text-slate-400 mb-1.5">Address</label>
                                <div className="relative">
                                    <MapPin className="absolute left-3 top-3 w-4 h-4 text-slate-500 group-focus-within:text-violet-400 transition-colors" />
                                    <textarea
                                        rows="2"
                                        value={currentOutlet.address}
                                        onChange={(e) => {
                                            setCurrentOutlet(prev => ({ ...prev, address: e.target.value }));
                                            setErrors(prev => ({ ...prev, address: "" }));
                                        }}
                                        onBlur={() => setTimeout(() => setSearchResults([]), 200)}
                                        className={`w-full pl-10 pr-10 py-2.5 rounded-xl glass-input outline-none text-sm resize-none ${errors.address ? 'border-red-500/50 focus:border-red-500' : ''}`}
                                        placeholder="Enter outlet address"
                                    />
                                    {isGeocoding && (
                                        <div className="absolute right-3 top-3 w-4 h-4 border-2 border-violet-400/20 border-t-violet-400 rounded-full animate-spin" />
                                    )}
                                </div>

                                {/* Search Results Dropdown */}
                                {searchResults.length > 0 && (
                                    <div className="absolute left-0 right-0 top-full mt-2 z-[100] animate-fade-in shadow-2xl">
                                        <div className="bg-slate-900/95 backdrop-blur-xl rounded-2xl border border-white/10 shadow-2xl shadow-black/50 overflow-hidden divide-y divide-white/5">
                                            <div className="px-3 py-2 bg-white/5 flex items-center justify-between">
                                                <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Suggestions</p>
                                            </div>
                                            <div className="max-h-60 overflow-y-auto custom-scrollbar">
                                                {searchResults.map((result, index) => (
                                                    <button
                                                        key={index}
                                                        type="button"
                                                        onMouseDown={(e) => {
                                                            e.preventDefault(); // Prevent blur before mousedown transitions to click
                                                            handleSelectResult(result);
                                                        }}
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
                                {errors.address && <p className="mt-1 text-xs text-red-400">{errors.address}</p>}
                            </div>

                            {/* Location Picker */}
                            <div>
                                <LocationPicker
                                    onLocationSelect={handleLocationSelect}
                                    onAddressFetched={handleAddressFetched}
                                    initialLocation={currentOutlet.lat ? { lat: currentOutlet.lat, lng: currentOutlet.lng } : null}
                                    title="Outlet Location"
                                    subTitle="Select the outlet location on the map"
                                />
                                {errors.location && <p className="mt-2 text-xs text-red-400">{errors.location}</p>}
                            </div>

                            {/* Add/Update Button */}
                            <button
                                type="button"
                                onClick={handleAddOutlet}
                                className="w-full py-3 rounded-xl font-semibold text-white shadow-lg transition-all transform hover:scale-[1.01] active:scale-[0.99]
                          bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 flex items-center justify-center gap-2"
                            >
                                {editingIndex !== null ? (
                                    <>
                                        <CheckCircle2 className="w-4 h-4" />
                                        Save Outlet Change
                                    </>
                                ) : (
                                    <>
                                        <Plus className="w-4 h-4" />
                                        Save Outlet
                                    </>
                                )}
                            </button>

                            {editingIndex !== null && (
                                <button
                                    type="button"
                                    onClick={resetCurrentOutlet}
                                    className="w-full py-2.5 rounded-xl font-medium text-slate-400 hover:text-white transition-colors flex items-center justify-center gap-2"
                                >
                                    <XCircle className="w-4 h-4" />
                                    Cancel Edit
                                </button>
                            )}
                        </div>
                    </div>

                    {errors.general && (
                        <div className="mt-4 p-3 bg-red-500/10 border border-red-500/20 rounded-xl flex items-start gap-3">
                            <div className="w-5 h-5 rounded-full bg-red-500/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                                <span className="text-red-400 text-xs font-bold">!</span>
                            </div>
                            <p className="text-sm text-red-300 flex-1">{errors.general}</p>
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="flex items-center justify-end gap-3 p-6 border-t border-white/10 bg-slate-900/50">
                    <button
                        onClick={onClose}
                        className="px-6 py-2.5 rounded-xl font-medium text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleSave}
                        className="px-6 py-2.5 rounded-xl font-semibold text-white bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 shadow-lg shadow-blue-500/25 transition-all"
                    >
                        Save Outlets
                    </button>
                </div>
            </div>

            {/* Centered Success Overlay for Individual Saves */}
            {showIndividualSuccess && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/60 backdrop-blur-sm animate-fade-in rounded-2xl overflow-hidden">
                    <div className="bg-slate-900 border border-emerald-500/30 p-8 rounded-[32px] shadow-2xl shadow-emerald-500/10 flex flex-col items-center gap-4 animate-scale-in">
                        <div className="w-20 h-20 rounded-full bg-emerald-500/20 flex items-center justify-center">
                            <CheckCircle2 className="w-10 h-10 text-emerald-400 animate-check-pulse" />
                        </div>
                        <div className="text-center">
                            <h3 className="text-2xl font-black text-white mb-1">Saved!</h3>
                            <p className="text-emerald-400 font-bold uppercase tracking-widest text-[10px]">Outlet Details Locked In</p>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default OutletModal;
