import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import TicketForm from './TicketForm';
import ServiceRequestForm from './ServiceRequestForm';
import ServiceSelectionDialog from './ServiceSelectionDialog';
import AdminReplies from './AdminReplies';
import UserNavigation from './UserNavigation';
import { Shield, Sparkles, ArrowRight, Video, Flame, Bell, Zap, Droplets, Wind, Activity, Clock } from 'lucide-react';

const categories = [
  { name: 'CCTV', icon: Video, color: 'blue' },
  { name: 'Fire Alarm', icon: Flame, color: 'red' },
  { name: 'Security Alarm', icon: Bell, color: 'orange' },
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
        <UserNavigation />
        <main className="flex-1 flex items-center justify-center p-4 sm:p-6 lg:p-8 relative overflow-y-auto">
          <TicketForm
            category={selectedCategory}
            onSuccess={handleTicketCreated}
            onCancel={handleCancel}
          />
        </main>
      </div>
    );
  }

  if (showServiceRequestForm) {
    return (
      <div className="h-screen bg-slate-950 flex flex-col overflow-hidden">
        <UserNavigation />
        <main className="flex-1 flex items-center justify-center p-4 sm:p-6 lg:p-8 relative overflow-y-auto">
          <ServiceRequestForm
            category={selectedCategory}
            onSuccess={handleServiceRequestCreated}
            onCancel={handleCancel}
          />
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 relative overflow-hidden">
      {/* Background gradients */}
      <div className="fixed top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0">
        <div className="absolute top-[10%] left-[20%] w-[30%] h-[30%] rounded-full bg-blue-600/5 blur-[100px]" />
        <div className="absolute bottom-[20%] right-[10%] w-[40%] h-[40%] rounded-full bg-violet-600/5 blur-[100px]" />
      </div>

      <UserNavigation />

      <div className="page-transition">
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 relative z-10">
          {/* Header Hero Section */}
          <header className="relative group p-0.5 rounded-[24px] overflow-hidden transition-all duration-500 hover:shadow-[0_0_50px_rgba(59,130,246,0.12)] accelerate-gpu">
            {/* Animated gradient border */}
            <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 via-violet-500/20 to-blue-500/20 animate-gradient-slow opacity-0 group-hover:opacity-100 transition-opacity duration-700"></div>

            {/* Glass background */}
            <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-xl border border-white/10 rounded-[24px]"></div>

            <div className="relative z-10 bg-slate-950/30 rounded-[20px] p-4 lg:p-6 overflow-hidden">
              {/* Background decor icons */}
              <div className="absolute -top-10 -right-10 opacity-[0.03] pointer-events-none group-hover:opacity-[0.05] transition-all duration-1000 group-hover:rotate-12 group-hover:scale-110">
                <Shield className="w-48 h-48 lg:w-64 lg:h-64 text-white stroke-[0.5px]" />
              </div>

              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                <div className="max-w-xl">
                  <div className="flex flex-wrap items-center gap-2 mb-4">
                    <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-[9px] font-bold uppercase tracking-[0.2em] animate-fade-in">
                      <Sparkles className="w-2.5 h-2.5" />
                      <span>Enterprise</span>
                    </div>
                    <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[9px] font-bold uppercase tracking-wider animate-pulse-slow">
                      <Activity className="w-2.5 h-2.5" />
                      <span>Normal</span>
                    </div>
                  </div>

                  <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold text-white mb-3 tracking-tight leading-tight flex items-center flex-wrap gap-x-2">
                    Welcome back,
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-violet-400 to-blue-400 bg-[length:200%_auto] animate-gradient whitespace-nowrap">
                      {user?.name || 'Partner'}
                    </span>
                    <span className="inline-block animate-bounce-slow text-xl lg:text-2xl">👋</span>
                  </h1>

                  <p className="text-slate-400 max-w-lg text-xs lg:text-sm leading-relaxed font-medium mb-4">
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

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {categories.map((category, index) => (
                <button
                  key={category.name}
                  type="button"
                  onClick={() => handleCategoryClick(category.name)}
                  className="group relative overflow-hidden rounded-[20px] border border-white/5 bg-slate-900/40 p-0.5 hover:bg-slate-900/60 transition-all duration-500 hover:-translate-y-1 shadow-2xl hover:shadow-blue-500/10"
                >
                  <div className="bg-slate-950/20 rounded-[18px] p-4 lg:p-5 h-full flex flex-col items-center text-center transition-all duration-500 group-hover:bg-slate-950/40 border border-transparent group-hover:border-white/5 relative z-10">
                    <div className="relative mb-3">
                      <div className={`h-10 w-10 rounded-xl bg-${category.color}-500/10 border border-${category.color}-500/20 flex items-center justify-center transition-all duration-500 group-hover:scale-110 group-hover:shadow-[0_0_20px_rgba(59,130,246,0.15)]`}>
                        <category.icon className={`w-4.5 h-4.5 text-${category.color}-400`} />
                      </div>
                      {(index === 0 || index === 3) && (
                        <div className="absolute -top-2 -right-6 px-2 py-0.5 rounded-full bg-blue-500 text-[8px] font-black text-white uppercase tracking-tighter animate-pulse shadow-[0_0_10px_rgba(59,130,246,0.5)]">
                          New
                        </div>
                      )}
                      <div className="absolute -right-8 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-all duration-500 transform translate-x-4 group-hover:translate-x-0">
                        <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center border border-white/10 group-hover:border-white/20">
                          <ArrowRight className="w-4 h-4 text-white" />
                        </div>
                      </div>
                    </div>

                    <div className="mt-auto w-full">
                      <h3 className="text-xl font-bold text-white mb-1 transition-colors tracking-tight">
                        {category.name}
                      </h3>
                      <p className="text-xs text-slate-500 group-hover:text-slate-400 leading-relaxed font-medium">
                        Manage or request installations for <span className={`text-${category.color}-400/80`}>{category.name}</span> systems.
                      </p>
                    </div>
                  </div>

                  {/* Decorative background element */}
                  <div className={`absolute -bottom-10 -right-10 w-32 h-32 bg-${category.color}-500/5 blur-[50px] rounded-full group-hover:bg-${category.color}-500/10 transition-all duration-500`} />
                </button>
              ))}
            </div>
          </section>

          {/* Admin Replies */}
          <section className="animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-bold text-slate-400 tracking-wider uppercase flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-violet-500"></span>
                Recent Updates
              </h2>
            </div>
            <div className="glass-card rounded-[32px] overflow-hidden p-1 border border-white/5">
              <div className="bg-slate-950/40 rounded-[28px] p-2 lg:p-4">
                <AdminReplies key={refreshKey} refreshKey={refreshKey} />
              </div>
            </div>
          </section>
        </main>
      </div>

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
