import React from 'react';
import { Loader2 } from 'lucide-react';

const LoadingState = ({ message = "Loading...", fullPage = false }) => {
    const content = (
        <div className="flex flex-col items-center justify-center p-8 text-center animate-fade-in">
            <div className="relative mb-4">
                {/* Outer glowing ring */}
                <div className="absolute inset-0 rounded-full bg-blue-500/20 blur-xl animate-pulse" />
                {/* Spinner */}
                <Loader2 className="w-10 h-10 text-blue-500 animate-spin relative z-10" />
            </div>
            <p className="text-sm font-bold text-slate-500 uppercase tracking-[0.2em] ml-1">
                {message}
            </p>
        </div>
    );

    if (fullPage) {
        return (
            <div className="fixed inset-0 z-[150] flex items-center justify-center bg-slate-950/80 backdrop-blur-md">
                {content}
            </div>
        );
    }

    return content;
};

export default LoadingState;
