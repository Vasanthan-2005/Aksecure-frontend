import { AlertCircle, Loader2, CheckCircle2 } from 'lucide-react';

const StatItem = ({ label, count, color, Icon, total, showPercentage = true, showIcon = true, delay = "0.1s" }) => {
    const percentage = total > 0 ? Math.round((count / total) * 100) : 0;

    return (
        <div
            className={`group relative overflow-hidden rounded-xl md:rounded-2xl border ${color.border} bg-slate-950/40 p-2 md:p-4 backdrop-blur-xl h-14 md:h-18 ${color.glowShadow}`}
        >
            {/* Dynamic Glow Aura */}
            <div className={`absolute inset-0 opacity-0 bg-[radial-gradient(circle_at_center,${color.glowColor}_0%,transparent_70%)]`} />

            <div className="relative z-10">
                <div className="flex items-center justify-between gap-1 md:gap-3 h-full">
                    <div className="flex items-center gap-1.5 md:gap-2">
                        {showIcon && (
                            <div className={`hidden md:flex h-7 w-7 items-center justify-center rounded-lg ${color.iconBg} border border-white/10 shadow-lg`}>
                                <Icon className={`h-3.5 w-3.5 ${color.text}`} />
                            </div>
                        )}
                        <span className={`text-[8px] font-black uppercase tracking-wider ${color.text} opacity-80 group-hover:opacity-100`}>
                            {label}
                        </span>
                    </div>

                    <div className="flex items-center">
                        <p className="text-lg md:text-2xl font-black tracking-tighter text-white">
                            {count}
                        </p>
                    </div>
                </div>
            </div>

            {/* Center-Expanding Accent Line */}
            <div className={`absolute bottom-0 left-1/2 -translate-x-1/2 h-[2px] w-0 bg-gradient-to-r ${color.line}`} />
        </div>
    );
};

const ServiceRequestStats = ({ stats, showPercentage = true, showIcon = true }) => {
    return (
        <div className="grid grid-cols-3 gap-2">
            <StatItem
                label="New"
                count={stats.new}
                total={stats.total}
                Icon={AlertCircle}
                delay="0s"
                showPercentage={showPercentage}
                showIcon={showIcon}
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
                showIcon={showIcon}
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
                showIcon={showIcon}
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
