import { LayoutDashboard, Ticket, FileText, Settings, Calendar } from 'lucide-react';

const AdminBottomNav = ({ activeTab, setActiveTab, viewMode, setViewMode, newTicketsCount, newServiceRequestsCount, onDashboardClick, onTicketsClick, onServiceRequestsClick, onUsersClick, onSettingsClick, onCalendarClick }) => {
    const navItems = [
        {
            id: 'dashboard',
            label: 'Dashboard',
            icon: LayoutDashboard,
            color: 'blue',
            onClick: onDashboardClick
        },
        {
            id: 'new-tickets',
            label: 'Tickets',
            icon: Ticket,
            color: 'emerald',
            badge: newTicketsCount,
            onClick: () => {
                setViewMode('new-tickets');
                setActiveTab('tickets');
            }
        },
        {
            id: 'new-service-requests',
            label: 'Services',
            icon: FileText,
            color: 'amber',
            badge: newServiceRequestsCount,
            onClick: () => {
                setViewMode('new-service-requests');
                setActiveTab('service-requests');
            }
        },
        {
            id: 'calendar',
            label: 'Calendar',
            icon: Calendar,
            color: 'cyan',
            onClick: onCalendarClick
        },
        {
            id: 'settings',
            label: 'Settings',
            icon: Settings,
            color: 'slate',
            onClick: onSettingsClick
        }
    ];

    const isActive = (itemId) => {
        if (itemId === 'dashboard') {
            return (activeTab === 'dashboard' || activeTab === 'tickets') && viewMode === 'dashboard';
        }
        if (itemId === 'new-tickets') {
            return viewMode === 'new-tickets' && activeTab === 'tickets';
        }
        if (itemId === 'new-service-requests') {
            return viewMode === 'new-service-requests' && activeTab === 'service-requests';
        }
        if (itemId === 'calendar') {
            return false; // Calendar is a scroll action, not a dedicated tab in this nav
        }
        if (itemId === 'settings') {
            return activeTab === 'settings';
        }
        return false;
    };

    return (
        <div className="md:hidden fixed bottom-0 left-0 right-0 z-50 w-full bg-slate-900/90 backdrop-blur-2xl border-t border-white/10 px-4 py-2 shrink-0">
            <div className="flex items-center justify-around max-w-2xl mx-auto">
                {navItems.map((item) => (
                    <button
                        key={item.id}
                        onClick={item.onClick}
                        className={`relative flex flex-col items-center justify-center gap-1 w-14 h-14 rounded-2xl transition-all group
              ${isActive(item.id)
                                ? 'text-white'
                                : 'text-slate-500 hover:text-slate-300'
                            }`}
                    >
                        <item.icon className={`w-5 h-5 transition-all duration-300 ${isActive(item.id) ? `text-${item.color}-400 scale-110` : 'group-hover:scale-110'}`} />
                        <span className="text-[9px] font-bold uppercase tracking-tighter opacity-80">{item.label}</span>

                        {/* Badge for new items */}
                        {item.badge > 0 && (
                            <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-[8px] font-bold text-white shadow-lg shadow-red-500/40 animate-pulse border border-slate-900">
                                {item.badge > 9 ? '9+' : item.badge}
                            </span>
                        )}

                        {/* Active Indicator Dot */}
                        {isActive(item.id) && (
                            <div className={`absolute -bottom-1 w-1 h-1 rounded-full bg-${item.color}-400 shadow-[0_0_10px_rgba(59,130,246,0.8)]`}></div>
                        )}
                    </button>
                ))}
            </div>
        </div>
    );
};

export default AdminBottomNav;
