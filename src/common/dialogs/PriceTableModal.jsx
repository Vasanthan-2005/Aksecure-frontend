import React from 'react';
import { createPortal } from 'react-dom';
import { X, IndianRupee } from 'lucide-react';
import PriceTableRenderer from '../components/PriceTableRenderer';

const PriceTableModal = ({ isOpen, onClose, items, totalPrice, title = "Estimated Bill" }) => {
    if (!isOpen) return null;

    return createPortal(
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
            <div className="bg-slate-900 w-full max-w-2xl max-h-[90dvh] flex flex-col shadow-2xl border border-white/10 ring-1 ring-white/10 rounded-2xl animate-scale-in">
                <div className="flex-shrink-0 bg-slate-900 border-b border-white/5 px-6 py-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center ring-1 ring-emerald-500/20">
                            <IndianRupee className="w-5 h-5 text-emerald-400" />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-white tracking-tight">{title}</h2>
                            <p className="text-sm text-slate-400">Detailed breakdown of the estimate</p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-white/5 rounded-lg text-slate-400 hover:text-white transition-colors"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto p-6 custom-scrollbar">
                    <PriceTableRenderer items={items} totalPrice={totalPrice} />
                </div>

                <div className="flex-shrink-0 bg-slate-900 border-t border-white/5 p-6 flex justify-end">
                    <button
                        type="button"
                        onClick={onClose}
                        className="px-6 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-bold font-sans shadow-lg shadow-blue-500/20 transition-all active:scale-95"
                    >
                        Close
                    </button>
                </div>
            </div>
        </div>,
        document.body
    );
};

export default PriceTableModal;
