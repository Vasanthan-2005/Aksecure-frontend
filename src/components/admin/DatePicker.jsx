import { useState, useMemo, useEffect } from 'react';
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight, Star } from 'lucide-react';

const DatePicker = ({ selectedDate, onChange, preferredDate, minDate }) => {
    const [currentDate, setCurrentDate] = useState(new Date());

    // Initialize calendar month to selectedDate or preferredDate or today
    useEffect(() => {
        if (selectedDate) {
            setCurrentDate(new Date(selectedDate));
        } else if (preferredDate) {
            setCurrentDate(new Date(preferredDate));
        }
    }, []); // Run once on mount if we want to sync initially, avoiding loops if props change often

    const monthNames = [
        "January", "February", "March", "April", "May", "June",
        "July", "August", "September", "October", "November", "December"
    ];
    const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

    const days = useMemo(() => {
        const year = currentDate.getFullYear();
        const month = currentDate.getMonth();

        const firstDay = new Date(year, month, 1);
        const lastDay = new Date(year, month + 1, 0);

        const startWeekday = firstDay.getDay();
        const daysInMonth = lastDay.getDate();

        const arr = [];
        for (let i = 0; i < startWeekday; i++) arr.push(null);
        for (let d = 1; d <= daysInMonth; d++) {
            const date = new Date(year, month, d);
            // Adjust for timezone offset to ensure consistent YYYY-MM-DD comparison
            const offset = date.getTimezoneOffset();
            const adjustedDate = new Date(date.getTime() - (offset * 60 * 1000));
            arr.push(date);
        }

        return arr;
    }, [currentDate]);

    const formatDate = (date) => {
        if (!date) return '';
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    };

    const isSelected = (date) => {
        if (!date || !selectedDate) return false;
        return formatDate(date) === selectedDate;
    };

    const isPreferred = (date) => {
        if (!date || !preferredDate) return false;
        // Check if preferredDate (string) matches this date
        // Note: preferredDate from prop is likely ISO string or YYYY-MM-DD
        const pDate = new Date(preferredDate);
        return date.getDate() === pDate.getDate() &&
            date.getMonth() === pDate.getMonth() &&
            date.getFullYear() === pDate.getFullYear();
    };

    const isDisabled = (date) => {
        if (!date || !minDate) return false;
        const mDate = new Date(minDate);
        mDate.setHours(0, 0, 0, 0);
        const d = new Date(date);
        d.setHours(0, 0, 0, 0);
        return d < mDate;
    };

    const handleDateClick = (date) => {
        if (!date || isDisabled(date)) return;
        onChange(formatDate(date));
    };

    return (
        <div className="bg-slate-900/50 border border-slate-700/50 rounded-xl p-4 select-none">
            {/* HEADER */}
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                    <h3 className="text-sm font-bold text-slate-200">
                        {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
                    </h3>
                </div>

                <div className="flex items-center gap-1 bg-slate-800/60 rounded-lg p-0.5 border border-white/10">
                    <button
                        type="button"
                        onClick={() =>
                            setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1))
                        }
                        className="p-1.5 rounded-md hover:bg-white/10 text-slate-400 hover:text-white transition-colors"
                    >
                        <ChevronLeft className="w-4 h-4" />
                    </button>
                    <button
                        type="button"
                        onClick={() =>
                            setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1))
                        }
                        className="p-1.5 rounded-md hover:bg-white/10 text-slate-400 hover:text-white transition-colors"
                    >
                        <ChevronRight className="w-4 h-4" />
                    </button>
                </div>
            </div>

            {/* WEEKDAY LABELS */}
            <div className="grid grid-cols-7 gap-1 mb-2">
                {dayNames.map(d => (
                    <div
                        key={d}
                        className="text-center text-[10px] font-bold text-slate-500 h-6 flex items-center justify-center uppercase tracking-wider"
                    >
                        {d}
                    </div>
                ))}
            </div>

            {/* CALENDAR GRID */}
            <div className="grid grid-cols-7 gap-1">
                {days.map((date, i) => {
                    if (!date) return <div key={i} className="aspect-square"></div>;

                    const selected = isSelected(date);
                    const preferred = isPreferred(date);
                    const disabled = isDisabled(date);

                    return (
                        <button
                            key={i}
                            type="button"
                            onClick={() => handleDateClick(date)}
                            disabled={disabled}
                            className={`
                aspect-square rounded-lg flex flex-col items-center justify-center relative group transition-all duration-200
                ${disabled ? "opacity-30 cursor-not-allowed text-slate-600" : "cursor-pointer hover:bg-white/5"}
                ${selected
                                    ? "bg-blue-600/90 text-white shadow-lg shadow-blue-500/20 font-bold border border-blue-500/50"
                                    : "text-slate-300"}
                ${preferred && !selected ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400 font-medium" : ""}
                ${preferred && selected ? "bg-gradient-to-br from-blue-600 to-emerald-600 border-white/20" : ""}
              `}
                            title={preferred ? "Preferred Date" : ""}
                        >
                            <span className="text-xs">{date.getDate()}</span>
                            {preferred && (
                                <div className="absolute -top-1 -right-1">
                                    <Star className={`w-2.5 h-2.5 ${selected ? 'text-yellow-300 fill-yellow-300' : 'text-emerald-500 fill-emerald-500'}`} />
                                </div>
                            )}
                        </button>
                    );
                })}
            </div>
            {preferredDate && (
                <div className="mt-3 flex items-center gap-2 text-[10px] text-slate-400 bg-slate-800/30 p-2 rounded-lg border border-white/5">
                    <Star className="w-3 h-3 text-emerald-500 fill-emerald-500" />
                    <span>Preferred Date: <span className="text-emerald-400 font-bold ml-1">{new Date(preferredDate).toLocaleDateString()}</span></span>
                </div>
            )}
        </div>
    );
};

export default DatePicker;
