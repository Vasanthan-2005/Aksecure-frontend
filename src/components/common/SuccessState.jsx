import React, { useEffect } from 'react';
import { CheckCircle2 } from 'lucide-react';

const SuccessState = ({
    title = "Submission Successful!",
    message = "Your request has been received by our engineering team. We'll get back to you shortly.",
    onComplete
}) => {
    useEffect(() => {
        const timer = setTimeout(() => {
            if (onComplete) onComplete();
        }, 800);
        return () => clearTimeout(timer);
    }, [onComplete]);

    return (
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-slate-950/90 backdrop-blur-xl animate-fade-in">
            <div className="max-w-md w-full mx-4">
                <div className="glass-card rounded-[40px] border border-emerald-500/20 p-8 text-center relative overflow-hidden">
                    {/* Decorative background glow */}
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-emerald-500/10 blur-[80px] rounded-full pointer-events-none" />

                    <div className="relative z-10 flex flex-col items-center">
                        {/* Animated Check Icon */}
                        <div className="w-24 h-24 rounded-3xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mb-8 animate-bounce-slow shadow-[0_0_50px_rgba(16,185,129,0.15)]">
                            <CheckCircle2 className="w-12 h-12 text-emerald-400" />
                        </div>

                        <h2 className="text-3xl font-bold text-white mb-4 tracking-tight">
                            {title}
                        </h2>

                        <p className="text-slate-400 font-medium leading-relaxed">
                            {message}
                        </p>

                        {/* Progress bar indication */}
                        <div className="w-full h-1 bg-slate-800 rounded-full mt-10 overflow-hidden">
                            <div className="h-full bg-emerald-500 animate-[progress_0.8s_linear] w-full origin-left" />
                        </div>
                        <p className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em] mt-3">
                            Redirecting to Dashboard
                        </p>
                    </div>
                </div>
            </div>

            <style dangerouslySetInnerHTML={{
                __html: `
        @keyframes progress {
          from { transform: scaleX(0); }
          to { transform: scaleX(1); }
        }
      `}} />
        </div>
    );
};

export default SuccessState;
