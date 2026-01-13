import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import TicketForm from './TicketForm';
import ServiceRequestForm from './ServiceRequestForm';
import ServiceSelectionDialog from './ServiceSelectionDialog';
import AdminReplies from './AdminReplies';
import UserNavigation from './UserNavigation';
import { Shield, Sparkles, ArrowRight, Video, Flame, Bell, Zap, Droplets, Wind } from 'lucide-react';

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
      <div className="min-h-screen bg-slate-950">
        <UserNavigation />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <TicketForm
            category={selectedCategory}
            onSuccess={handleTicketCreated}
            onCancel={handleCancel}
          />
        </div>
      </div>
    );
  }

  if (showServiceRequestForm) {
    return (
      <div className="min-h-screen bg-slate-950">
        <UserNavigation />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <ServiceRequestForm
            category={selectedCategory}
            onSuccess={handleServiceRequestCreated}
            onCancel={handleCancel}
          />
        </div>
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

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 relative z-10">
        {/* Header Hero Section */}
        <header className="relative group p-0.5 rounded-[32px] overflow-hidden transition-all duration-500 hover:shadow-[0_0_40px_rgba(59,130,246,0.08)] accelerate-gpu">
          {/* Glass background */}
          <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-md border border-white/5 rounded-[32px]"></div>

          <div className="relative z-10 bg-slate-950/20 rounded-[28px] p-6 lg:p-8 overflow-hidden">
            {/* Background decor icons */}
            <div className="absolute top-1/2 right-12 -translate-y-1/2 opacity-[0.02] pointer-events-none group-hover:opacity-[0.04] transition-opacity duration-700 accelerate-gpu">
              <Shield className="w-48 h-48 lg:w-72 lg:h-72 text-white stroke-[0.5px]" />
            </div>

            <div className="max-w-2xl">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-[10px] font-bold uppercase tracking-[0.2em] mb-4 animate-fade-in accelerate-gpu">
                <Sparkles className="w-3 h-3" />
                <span>Enterprise Dashboard</span>
              </div>

              <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-3 tracking-tight leading-tight">
                Welcome back,<br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-violet-400 to-blue-400 bg-[length:200%_auto] animate-gradient accelerate-gpu">
                  {user?.name || 'Partner'}
                </span>
                <span className="inline-block ml-3 animate-bounce-slow text-2xl lg:text-4xl">👋</span>
              </h1>

              <p className="text-slate-400 max-w-lg text-base lg:text-lg leading-relaxed font-medium">
                Manage your installation and service requests for <span className="text-white font-bold italic">CCTV</span>, <span className="text-white font-bold italic">Fire Alarm</span>, and <span className="text-white font-bold italic">Security</span> systems.
              </p>
            </div>
          </div>

          {/* Bottom highlight effect */}
          <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-1/3 h-[1px] bg-gradient-to-r from-transparent via-blue-500/20 to-transparent"></div>
        </header>

        {/* Service Categories */}
        <section className="animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-sm font-bold text-slate-400 tracking-wider uppercase flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-blue-500"></span>
              Service Categories
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {categories.map((category, index) => (
              <button
                key={category.name}
                type="button"
                onClick={() => handleCategoryClick(category.name)}
                className="group relative overflow-hidden rounded-[32px] border border-white/5 bg-slate-900/40 p-1 hover:bg-slate-900/60 transition-all duration-500 hover:-translate-y-1 shadow-2xl hover:shadow-blue-500/10"
              >
                <div className="bg-slate-950/20 rounded-[28px] p-6 lg:p-8 h-full flex flex-col transition-all duration-500 group-hover:bg-slate-950/40 border border-transparent group-hover:border-white/5">
                  <div className="flex items-start justify-between gap-4 mb-6">
                    <div className={`h-14 w-14 rounded-2xl bg-${category.color}-500/10 border border-${category.color}-500/20 flex items-center justify-center transition-all duration-500 group-hover:scale-110 group-hover:shadow-[0_0_20px_rgba(59,130,246,0.15)]`}>
                      <category.icon className={`w-7 h-7 text-${category.color}-400`} />
                    </div>
                    <div className="opacity-0 group-hover:opacity-100 transition-all duration-500 transform translate-x-4 group-hover:translate-x-0">
                      <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center border border-white/10 group-hover:border-white/20">
                        <ArrowRight className="w-5 h-5 text-white" />
                      </div>
                    </div>
                  </div>

                  <div className="mt-auto">
                    <h3 className="text-xl font-bold text-white mb-2 transition-colors tracking-tight">
                      {category.name}
                    </h3>
                    <p className="text-sm text-slate-500 group-hover:text-slate-400 leading-relaxed font-medium">
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
          <div className="flex items-center justify-between mb-6">
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