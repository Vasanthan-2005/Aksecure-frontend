import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import TicketForm from './TicketForm';
import ServiceRequestForm from './ServiceRequestForm';
import ServiceSelectionDialog from './ServiceSelectionDialog';
import AdminReplies from './AdminReplies';
import UserNavigation from './UserNavigation';
import { Shield, Sparkles, ArrowRight } from 'lucide-react';

const categories = ['CCTV', 'Fire Alarm', 'Security Alarm', 'Electrical', 'Plumbing', 'Air Conditioning'];

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

  const handleCategoryClick = (category) => {
    setSelectedCategory(category);
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
        {/* Header */}
        <header className="glass-card p-8 rounded-3xl animate-fade-in-up relative overflow-hidden">
          <div className="absolute top-0 right-0 p-12 opacity-5 pointer-events-none">
            <Shield className="w-64 h-64 text-white" />
          </div>
          <div className="relative z-10">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-medium mb-4">
              <Sparkles className="w-3 h-3" />
              <span>Enterprise Dashboard</span>
            </div>
            <h1 className="text-3xl md:text-4xl font-bold text-white mb-4 tracking-tight">
              Welcome back, <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-violet-400">{user?.name?.split(' ')[0] || 'there'}</span> 👋
            </h1>
            <p className="text-slate-400 max-w-2xl text-lg leading-relaxed">
              Manage your installation and service requests for CCTV, Fire Alarm, Security Systems, and more directly from your dashboard.
            </p>
          </div>
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
                key={category}
                type="button"
                onClick={() => handleCategoryClick(category)}
                className="group relative overflow-hidden rounded-2xl border border-white/5 bg-slate-900/40 p-6 text-left hover:bg-slate-800/60 hover:border-blue-500/30 transition-all duration-300 hover:-translate-y-1 shadow-lg hover:shadow-blue-500/10"
              >
                <div className="flex items-start justify-between gap-4 mb-4">
                  <div className="h-12 w-12 rounded-2xl bg-gradient-to-br from-slate-800 to-slate-900 border border-white/5 flex items-center justify-center group-hover:from-blue-600/20 group-hover:to-violet-600/20 group-hover:border-blue-500/30 transition-all">
                    <span className="text-xl group-hover:scale-110 transition-transform duration-300">
                      {index === 0 ? '📹' : index === 1 ? '🔥' : index === 2 ? '🚨' : index === 3 ? '⚡' : index === 4 ? '💧' : '❄️'}
                    </span>
                  </div>
                  <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 transform translate-x-2 group-hover:translate-x-0">
                    <ArrowRight className="w-5 h-5 text-blue-400" />
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-bold text-slate-200 group-hover:text-white mb-2 transition-colors">{category}</h3>
                  <p className="text-sm text-slate-500 group-hover:text-slate-400 leading-relaxed">
                    Raise a ticket or request new service for {category.toLowerCase()} systems.
                  </p>
                </div>
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
          <div className="glass-card rounded-2xl overflow-hidden p-1">
            <div className="bg-slate-950/30 rounded-xl p-4 sm:p-6">
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