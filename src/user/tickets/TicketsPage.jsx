import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import TicketList from './TicketList';
import { UserTopNav, UserBottomNav } from '../navigation/UserNavigation';
import { Shield, ArrowLeft } from 'lucide-react';

const TicketsPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    if (user && user.role === 'admin') {
      navigate('/admin');
    }
  }, [user, navigate]);

  return (
    <div className="h-screen bg-slate-950 flex flex-col overflow-hidden relative">
      {/* Background gradients */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute top-[10%] left-[20%] w-[30%] h-[30%] rounded-full bg-blue-600/5 blur-[100px]" />
        <div className="absolute bottom-[20%] right-[10%] w-[40%] h-[40%] rounded-full bg-violet-600/5 blur-[100px]" />
      </div>

      <UserTopNav />

      <main className="flex-1 overflow-y-auto relative z-10 page-transition scrollbar-hide">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-4 pb-24 sm:pb-8">
          <section className="pb-10">
            <div className="flex items-center justify-between mb-6 sm:mb-8">
              <div className="flex items-center gap-4">
                <button
                  onClick={() => navigate('/')}
                  className="group p-3 rounded-2xl bg-slate-900/50 border border-white/5 text-slate-400 hover:text-white hover:bg-slate-800/80 transition-all active:scale-95"
                >
                  <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
                </button>
                <div className="flex items-center gap-3">
                  <div className="w-2 h-8 bg-blue-500 rounded-full shadow-[0_0_15px_rgba(59,130,246,0.5)]"></div>
                  <h2 className="text-3xl font-bold text-white tracking-tight">
                    My Tickets
                  </h2>
                </div>
              </div>
            </div>
            <div className="glass-card rounded-3xl border border-white/5 p-1 relative overflow-hidden">
              <div className="bg-slate-950/20 rounded-[22px] p-6 lg:p-8">
                <TicketList key={refreshKey} onRefresh={() => setRefreshKey(prev => prev + 1)} />
              </div>
            </div>
          </section>
        </div>
      </main>
      <UserBottomNav />
    </div>
  );
};

export default TicketsPage;





