import { AlertCircle, Loader2, CheckCircle2 } from 'lucide-react';

const StatItem = ({ label, count, color, Icon, total, showPercentage = true, delay = "0.1s" }) => {
    const percentage = total > 0 ? Math.round((count / total) * 100) : 0;

    return (
        <div
            className={`group relative overflow-hidden rounded-2xl border ${color.border} bg-slate-950/40 p-3.5 backdrop-blur-xl transition-all duration-500 hover:-translate-y-1 hover:bg-slate-900/60 hover:shadow-2xl ${color.glowShadow} animate-fade-in-up`}
            style={{ animationDelay: delay }}
        >
            {/* Dynamic Glow Aura */}
            <div className={`absolute inset-0 opacity-0 group-hover:opacity-20 transition-opacity duration-700 bg-[radial-gradient(circle_at_center,${color.glowColor}_0%,transparent_70%)]`} />

            {/* Shimmer Light Trail */}
            <div className="absolute inset-0 pointer-events-none overflow-hidden">
                <div className="absolute inset-0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000 bg-gradient-to-r from-transparent via-white/10 to-transparent" />
            </div>

            <div className="relative z-10">
                <div className="flex items-center gap-2.5 mb-3">
                    <div className={`flex h-9 w-9 items-center justify-center rounded-xl ${color.iconBg} border border-white/10 shadow-lg group-hover:scale-110 group-hover:rotate-12 transition-all duration-500`}>
                        <Icon className={`h-4.5 w-4.5 ${color.text} group-hover:animate-pulse`} />
                    </div>
                    <div className="flex flex-col">
                        <span className={`text-[10px] font-black uppercase tracking-[0.2em] ${color.text} opacity-80 group-hover:opacity-100 transition-opacity`}>
                            {label}
                        </span>
                    </div>
                    {showPercentage && (
                        <span className="ml-auto text-[9px] font-black bg-white/10 px-1.5 py-0.5 rounded-full text-white/50 group-hover:text-white group-hover:bg-white/20 transition-all border border-white/5">
                            {percentage}%
                        </span>
                    )}
                </div>

                <div className="flex items-end justify-between">
                    <div className="space-y-1">
                        <p className="text-3xl font-black tracking-tighter text-white group-hover:scale-105 transition-transform origin-left duration-500">
                            {count}
                        </p>
                    </div>
                    {/* Breathing Status Dot */}
                    <div className="relative flex h-2.5 w-2.5">
                        <span className={`animate-ping absolute inline-flex h-full w-full rounded-full ${color.dot} opacity-20`}></span>
                        <span className={`relative inline-flex rounded-full h-2.5 w-2.5 ${color.dot} shadow-[0_0_10px_rgba(0,0,0,0.5)]`}></span>
                    </div>
                </div>
            </div>

            {/* Center-Expanding Accent Line */}
            <div className={`absolute bottom-0 left-1/2 -translate-x-1/2 h-[2px] w-0 bg-gradient-to-r ${color.line} group-hover:w-full transition-all duration-700`} />
        </div>
    );
};

const ServiceRequestStats = ({ stats, showPercentage = true }) => {
    return (
        <div className="grid grid-cols-3 gap-2">
            <StatItem
                label="New"
                count={stats.new}
                total={stats.total}
                Icon={AlertCircle}
                delay="0s"
                showPercentage={showPercentage}
                color={{
                    border: "border-amber-500/20",
                    iconBg: "bg-amber-500/10",
                    text: "text-amber-400",
                    glowColor: "rgba(245, 158, 11, 0.4)",
                    glowShadow: "hover:shadow-amber-500/20",
                    dot: "bg-amber-500",
                    line: "from-amber-600 to-orange-400"
                }}
            />
            <StatItem
                label="Active"
                count={stats.inProgress}
                total={stats.total}
                Icon={Loader2}
                delay="0.1s"
                showPercentage={showPercentage}
                color={{
                    border: "border-blue-500/20",
                    iconBg: "bg-blue-500/10",
                    text: "text-blue-400",
                    glowColor: "rgba(59, 130, 246, 0.4)",
                    glowShadow: "hover:shadow-blue-500/20",
                    dot: "bg-blue-500",
                    line: "from-blue-600 to-indigo-400"
                }}
            />
            <StatItem
                label="Completed"
                count={stats.completed}
                total={stats.total}
                Icon={CheckCircle2}
                delay="0.15s"
                showPercentage={showPercentage}
                color={{
                    border: "border-green-500/20",
                    iconBg: "bg-green-500/10",
                    text: "text-green-400",
                    glowColor: "rgba(34, 197, 94, 0.4)",
                    glowShadow: "hover:shadow-green-500/20",
                    dot: "bg-green-500",
                    line: "from-green-600 to-emerald-400"
                }}
            />
        </div>
    );
};

export default ServiceRequestStats;
