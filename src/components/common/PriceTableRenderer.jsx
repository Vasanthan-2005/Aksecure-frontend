import React from 'react';
import { IndianRupee, Tags } from 'lucide-react';

const PriceTableRenderer = ({ items, totalPrice }) => {
    if (!items || items.length === 0) return null;

    return (
        <div className="mt-4 space-y-3">
            <div className="flex items-center gap-2 mb-2">
                <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center">
                    <Tags className="w-4 h-4 text-emerald-400" />
                </div>
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-[0.1em]">Pricing Summary</h4>
            </div>

            <div className="overflow-hidden rounded-2xl border border-white/5 bg-slate-950/40">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="border-b border-white/5 bg-white/[0.02]">
                            <th className="px-4 py-2.5 text-[10px] font-black text-slate-500 uppercase tracking-wider w-12 text-center">S.No</th>
                            <th className="px-4 py-2.5 text-[10px] font-black text-slate-500 uppercase tracking-wider">Description</th>
                            <th className="px-4 py-2.5 text-[10px] font-black text-slate-500 uppercase tracking-wider w-32 text-right">Amount</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                        {items.map((item, index) => (
                            <tr key={index} className="hover:bg-white/[0.01] transition-colors">
                                <td className="px-4 py-3 text-xs text-center font-mono text-slate-500">{item.sNo}</td>
                                <td className="px-4 py-3 text-xs font-medium text-slate-300">{item.description}</td>
                                <td className="px-4 py-3 text-xs font-mono text-slate-200 text-right">
                                    ₹{parseFloat(item.price).toLocaleString('en-IN')}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                    <tfoot>
                        <tr className="bg-emerald-500/5 border-t border-emerald-500/20">
                            <td colSpan="2" className="px-4 py-4 text-right">
                                <span className="text-xs font-bold text-slate-400 uppercase tracking-widest mr-2">Grand Total</span>
                            </td>
                            <td className="px-4 py-4 text-right">
                                <div className="flex items-center justify-end gap-1.5 text-emerald-400">
                                    <IndianRupee className="w-4 h-4" />
                                    <span className="text-lg font-black font-mono">
                                        {totalPrice ? totalPrice.toLocaleString('en-IN') : items.reduce((sum, item) => sum + (parseFloat(item.price) || 0), 0).toLocaleString('en-IN')}
                                    </span>
                                </div>
                            </td>
                        </tr>
                    </tfoot>
                </table>
            </div>
        </div>
    );
};

export default PriceTableRenderer;
