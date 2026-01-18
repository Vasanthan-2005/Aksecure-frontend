import React from 'react';
import { Plus, Trash2, IndianRupee } from 'lucide-react';

const PriceTableEditor = ({ items, setItems }) => {
    const addItem = () => {
        const newItem = {
            sNo: items.length + 1,
            description: '',
            price: 0
        };
        setItems([...items, newItem]);
    };

    const removeItem = (index) => {
        const newItems = items.filter((_, i) => i !== index).map((item, i) => ({
            ...item,
            sNo: i + 1
        }));
        setItems(newItems);
    };

    const updateItem = (index, field, value) => {
        const newItems = [...items];
        newItems[index] = { ...newItems[index], [field]: value };
        setItems(newItems);
    };

    const totalPrice = items.reduce((sum, item) => sum + (parseFloat(item.price) || 0), 0);

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between mb-2">
                <h3 className="text-xs md:text-sm font-bold text-slate-300 flex items-center gap-2">
                    <IndianRupee className="w-4 h-4 text-emerald-400" />
                    Estimate / Price Items
                </h3>
                <button
                    type="button"
                    onClick={addItem}
                    className="inline-flex items-center gap-1 px-3 py-1.5 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/20 rounded-lg text-xs font-bold transition-all"
                >
                    <Plus className="w-3.5 h-3.5" />
                    Add Item
                </button>
            </div>

            <div className="overflow-x-auto rounded-xl border border-white/5 bg-slate-950/30">
                <table className="w-full text-left text-xs md:text-sm">
                    <thead>
                        <tr className="bg-slate-900/50 border-b border-white/5">
                            <th className="px-3 py-2.5 font-bold text-slate-500 uppercase tracking-wider w-12 text-center">S.No</th>
                            <th className="px-3 py-2.5 font-bold text-slate-500 uppercase tracking-wider">Description</th>
                            <th className="px-3 py-2.5 font-bold text-slate-500 uppercase tracking-wider w-24 md:w-32">Price (₹)</th>
                            <th className="px-3 py-2.5 w-10"></th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                        {items.map((item, index) => (
                            <tr key={index} className="group hover:bg-white/[0.02] transition-colors">
                                <td className="px-3 py-2 text-center font-mono text-slate-400">{item.sNo}</td>
                                <td className="px-3 py-2">
                                    <input
                                        type="text"
                                        value={item.description}
                                        onChange={(e) => updateItem(index, 'description', e.target.value)}
                                        placeholder="Item description..."
                                        className="w-full bg-transparent border-none focus:ring-0 text-slate-200 placeholder:text-slate-700 py-1"
                                    />
                                </td>
                                <td className="px-3 py-2">
                                    <input
                                        type="number"
                                        value={item.price}
                                        onChange={(e) => updateItem(index, 'price', e.target.value)}
                                        placeholder="0"
                                        className="w-full bg-transparent border-none focus:ring-0 text-slate-200 placeholder:text-slate-700 py-1 font-mono text-right md:text-left"
                                    />
                                </td>
                                <td className="px-3 py-2">
                                    <button
                                        type="button"
                                        onClick={() => removeItem(index)}
                                        className="p-1.5 text-slate-600 hover:text-red-400 transition-colors"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </td>
                            </tr>
                        ))}
                        {items.length === 0 && (
                            <tr>
                                <td colSpan="4" className="px-3 py-8 text-center text-slate-600 italic">
                                    No items added. Click "Add Item" to start pricing.
                                </td>
                            </tr>
                        )}
                    </tbody>
                    {items.length > 0 && (
                        <tfoot>
                            <tr className="bg-slate-900/40 border-t border-white/10">
                                <td colSpan="2" className="px-4 py-3 text-right font-bold text-slate-400">Total Amount</td>
                                <td className="px-3 py-3 font-bold text-emerald-400 font-mono text-lg">
                                    ₹{totalPrice.toLocaleString('en-IN')}
                                </td>
                                <td></td>
                            </tr>
                        </tfoot>
                    )}
                </table>
            </div>
        </div>
    );
};

export default PriceTableEditor;
