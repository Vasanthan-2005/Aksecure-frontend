import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import TicketForm from '../tickets/TicketForm';
import ServiceRequestForm from '../services/ServiceRequestForm';
import ServiceSelectionDialog from '../services/ServiceSelectionDialog';
import AdminReplies from './AdminReplies';
import { UserTopNav, UserBottomNav } from '../navigation/UserNavigation';
import { Shield, Sparkles, ArrowRight, Video, Flame, Bell, Zap, Droplets, Wind, Activity, Clock } from 'lucide-react';

const categories = [
  { name: 'CCTV', icon: Video, color: 'blue' },
  { name: 'Fire Alarm', icon: Flame, color: 'red' },
  { name: 'Intruder Alarm', icon: Bell, color: 'orange' },
  { name: 'Electrical', icon: Zap, color: 'yellow' },
  { name: 'Plumbing', icon: Droplets, color: 'blue' },
  { name: 'Air Conditioning', icon: Wind, color: 'emerald' }
];

const UserDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [showTicketForm, setShowTicketForm] = useState(false);
  const [showServiceRequestForm, setShowServiceRequestForm] = useState(false);
  const [showServiceDialog, setShowServiceDialog] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  // Redirect admins to admin portal
  useEffect(() => {
    if (user && user.role === 'admin') {
      navigate('/admin');
    }
  }, [user, navigate]);

  // Disable background scroll when modal or form is open
  useEffect(() => {
    if (showServiceDialog || showTicketForm || showServiceRequestForm) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [showServiceDialog, showTicketForm, showServiceRequestForm]);

  const handleCategoryClick = (categoryName) => {
    setSelectedCategory(categoryName);
    setShowServiceDialog(true);
  };

  const handleNewService = () => {
    setShowServiceRequestForm(true);
    setShowServiceDialog(false);
  };

  const handleQueryRaising = () => {
    setShowTicketForm(true);
    setShowServiceDialog(false);
  };

  const handleTicketCreated = () => {
    setShowTicketForm(false);
    setSelectedCategory(null);
    setRefreshKey((prev) => prev + 1);
  };

  const handleServiceRequestCreated = () => {
    setShowServiceRequestForm(false);
    setSelectedCategory(null);
    setRefreshKey((prev) => prev + 1);
  };

  const handleCancel = () => {
    setShowTicketForm(false);
    setShowServiceRequestForm(false);
    setSelectedCategory(null);
  };

  const handleCloseDialog = () => {
    setShowServiceDialog(false);
    setSelectedCategory(null);
  };

  if (showTicketForm) {
    return (
      <div className="h-screen bg-slate-950 flex flex-col overflow-hidden">
        <UserTopNav />
        <main className="flex-1 relative overflow-y-auto scrollbar-hide">
          <div className="flex items-start sm:items-center justify-center p-4 sm:p-6 lg:p-8 pt-4 pb-24 sm:pb-8 sm:pt-6 min-h-full">
            <TicketForm
              category={selectedCategory}
              onSuccess={handleTicketCreated}
              onCancel={handleCancel}
            />
          </div>
        </main>
        <UserBottomNav />
      </div>
    );
  }

  if (showServiceRequestForm) {
    return (
      <div className="h-screen bg-slate-950 flex flex-col overflow-hidden">
        <UserTopNav />
        <main className="flex-1 relative overflow-y-auto scrollbar-hide">
          <div className="flex items-start sm:items-center justify-center p-4 sm:p-6 lg:p-8 pt-4 pb-24 sm:pb-8 sm:pt-6 min-h-full">
            <ServiceRequestForm
              category={selectedCategory}
              onSuccess={handleServiceRequestCreated}
              onCancel={handleCancel}
            />
          </div>
        </main>
        <UserBottomNav />
      </div>
    );
  }

  return (
    <div className="h-screen bg-slate-950 flex flex-col overflow-hidden relative">
      {/* Background gradients - moved to fixed to stay behind everything */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute top-[10%] left-[20%] w-[30%] h-[30%] rounded-full bg-blue-600/5 blur-[100px]" />
        <div className="absolute bottom-[20%] right-[10%] w-[40%] h-[40%] rounded-full bg-violet-600/5 blur-[100px]" />
      </div>

      <UserTopNav />

      <main className="flex-1 overflow-y-auto relative z-10 page-transition scrollbar-hide">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4 pb-24 sm:pb-8 space-y-6 sm:space-y-8">
          {/* Header Hero Section */}
          <header className="relative group p-0.5 rounded-[24px] overflow-hidden transition-all duration-500 hover:shadow-[0_0_50px_rgba(59,130,246,0.12)] accelerate-gpu">
            {/* Animated gradient border */}
            <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 via-violet-500/20 to-blue-500/20 animate-gradient-slow opacity-0 group-hover:opacity-100 transition-opacity duration-700"></div>

            {/* Glass background */}
            <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-xl border border-white/10 rounded-[24px]"></div>

            <div className="relative z-10 bg-slate-950/30 rounded-[20px] p-4 lg:p-6 overflow-hidden">
              {/* Background decor icons */}
              <div className="absolute -top-6 sm:-top-10 -right-6 sm:-right-10 opacity-[0.03] pointer-events-none group-hover:opacity-[0.05] transition-all duration-1000 group-hover:rotate-12 group-hover:scale-110">
                <Shield className="w-40 h-40 lg:w-64 lg:h-64 text-white stroke-[0.5px]" />
              </div>

              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 ">
                <div className="max-w-xl">


                  <h1 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold text-white mb-2 sm:mb-3 tracking-tight leading-tight flex items-center flex-wrap gap-x-2">
                    Welcome back,
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-violet-400 to-blue-400 bg-[length:200%_auto] animate-gradient whitespace-nowrap">
                      {user?.name || 'Partner'}
                    </span>
                    <span className="inline-block animate-bounce-slow text-lg sm:text-xl lg:text-2xl">👋</span>
                  </h1>

                  <p className="text-slate-400 max-w-lg text-[10px] sm:text-xs lg:text-sm leading-relaxed font-medium mb-4">
                    Ready to manage your <span className="text-white font-bold italic">CCTV</span>, <span className="text-white font-bold italic">Fire Alarm</span>, and <span className="text-white font-bold italic">Security</span> systems?
                  </p>

                  <div className="flex items-center gap-2 text-xs text-slate-500 font-medium">
                    <Clock className="w-3.5 h-3.5 text-blue-500/50" />
                    <span>{new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}</span>
                  </div>
                </div>

                {/* Hero Illustration */}
                <div className="hidden md:block relative mr-4">
                  <div className="absolute inset-0 bg-blue-500/20 blur-3xl rounded-full animate-pulse-slow"></div>
                  <img
                    src="/security_hero_illustration_1768310383677.png"
                    alt="Security Shield"
                    className="w-32 h-32 lg:w-48 lg:h-48 object-contain relative z-10 animate-float-slow drop-shadow-[0_20px_50px_rgba(59,130,246,0.3)]"
                  />
                  {/* Floating micro-elements */}
                  <div className="absolute -top-4 -right-4 w-12 h-12 bg-white/5 backdrop-blur-md rounded-xl border border-white/10 flex items-center justify-center animate-bounce-slow delay-100 z-20">
                    <Shield className="w-6 h-6 text-blue-400" />
                  </div>
                  <div className="absolute -bottom-2 -left-2 w-10 h-10 bg-white/5 backdrop-blur-md rounded-lg border border-white/10 flex items-center justify-center animate-bounce-slow delay-300 z-20">
                    <Activity className="w-5 h-5 text-emerald-400" />
                  </div>
                </div>
              </div>
            </div>

            {/* Bottom highlight effect */}
            <div className="absolute bottom-0 left-1/4 right-1/4 h-[1px] bg-gradient-to-r from-transparent via-blue-500/30 to-transparent"></div>
          </header>

          {/* Service Categories */}
          <section className="animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-bold text-slate-400 tracking-wider uppercase flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-blue-500"></span>
                Service Categories
              </h2>
            </div>

            <div className="grid grid-cols-3 gap-2 sm:gap-4">
              {categories.map((category, index) => (
                <button
                  key={category.name}
                  type="button"
                  onClick={() => handleCategoryClick(category.name)}
                  className="group relative overflow-hidden rounded-[20px] border border-white/5 bg-slate-900/40 p-0.5 hover:bg-slate-900/60 transition-all duration-500 hover:-translate-y-1 shadow-2xl hover:shadow-blue-500/10"
                >
                  <div className="bg-slate-950/20 rounded-[12px] sm:rounded-[18px] p-2 sm:p-4 lg:p-5 h-full flex flex-col items-center justify-center text-center transition-all duration-500 group-hover:bg-slate-950/40 border border-transparent group-hover:border-white/5 relative z-10 min-h-[100px] sm:min-h-0">
                    <div className="relative mb-2 sm:mb-3 flex items-center justify-center">
                      <div className={`h-8 w-8 sm:h-10 sm:w-10 rounded-lg sm:rounded-xl bg-${category.color}-500/10 border border-${category.color}-500/20 flex items-center justify-center transition-all duration-500 group-hover:scale-110 group-hover:shadow-[0_0_20px_rgba(59,130,246,0.15)]`}>
                        <category.icon className={`w-3.5 h-3.5 sm:w-4.5 sm:h-4.5 text-${category.color}-400`} />
                      </div>

                    </div>

                    <div className="w-full">
                      <h3 className="text-[10px] sm:text-lg md:text-xl font-bold text-white mb-0.5 sm:mb-1 transition-colors tracking-tight leading-tight">
                        {category.name}
                      </h3>
                      <p className="hidden sm:block text-[9px] sm:text-xs text-slate-500 group-hover:text-slate-400 leading-tight sm:leading-relaxed font-medium line-clamp-2 md:line-clamp-none">
                        Manage or request installations for <span className={`text-${category.color}-400/80`}>{category.name}</span> systems.
                      </p>
                    </div>
                  </div>

                  {/* Decorative background element scaled for mobile */}
                  <div className={`absolute -bottom-6 -right-6 sm:-bottom-10 sm:-right-10 w-24 h-24 sm:w-32 sm:h-32 bg-${category.color}-500/5 blur-[100px] rounded-full group-hover:bg-${category.color}-500/10 transition-all duration-500`} />
                </button>
              ))}
            </div>
          </section>

          {/* Admin Replies */}
          <section id="admin-replies-section" className="animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-bold text-slate-400 tracking-wider uppercase flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-violet-500"></span>
                Recent Updates
              </h2>
            </div>
            <div className="glass-card rounded-[32px] overflow-hidden p-1 border border-white/5">
              <div className="bg-slate-950/40 rounded-[28px] p-2 lg:p-4">
                <AdminReplies key={refreshKey} refreshKey={refreshKey} onRepliesFetched={(count) => {
                  // This is a placeholder for the count sync if needed
                }} />
              </div>
            </div>
          </section>
        </div>
      </main>

      <UserBottomNav />

      {/* Service Selection Dialog */}
      <ServiceSelectionDialog
        isOpen={showServiceDialog}
        onClose={handleCloseDialog}
        onNewService={handleNewService}
        onQueryRaising={handleQueryRaising}
        category={selectedCategory}
      />
    </div>
  );
};

export default UserDashboard;
