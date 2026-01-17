import { useState, useMemo } from 'react';
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight, Check } from 'lucide-react';

const VisitCalendar = ({ tickets, serviceRequests, onEventSelect }) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(null);

  const monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];
  const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // MAP VISITS - Only include non-completed tickets and service requests
  const visitDates = useMemo(() => {
    const dates = new Map();

    (Array.isArray(tickets) ? tickets : []).forEach(ticket => {
      if (ticket.assignedVisitAt && ticket.status !== 'Closed') {
        const d = new Date(ticket.assignedVisitAt);
        d.setHours(0, 0, 0, 0);
        const key = d.toDateString();
        if (!dates.has(key)) dates.set(key, []);
        dates.get(key).push({ type: "ticket", visitTime: ticket.assignedVisitAt, ...ticket });
      }
    });

    (Array.isArray(serviceRequests) ? serviceRequests : []).forEach(req => {
      if (req.assignedVisitAt && req.status !== 'Completed') {
        const d = new Date(req.assignedVisitAt);
        d.setHours(0, 0, 0, 0);
        const key = d.toDateString();
        if (!dates.has(key)) dates.set(key, []);
        dates.get(key).push({ type: "service-request", visitTime: req.assignedVisitAt, ...req });
      }
    });

    return dates;
  }, [tickets, serviceRequests]);

  // CALENDAR BUILD
  const days = useMemo(() => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();

    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);

    const startWeekday = firstDay.getDay();
    const daysInMonth = lastDay.getDate();

    const arr = [];
    for (let i = 0; i < startWeekday; i++) arr.push(null);
    for (let d = 1; d <= daysInMonth; d++) arr.push(new Date(year, month, d));

    return arr;
  }, [currentDate]);

  const isToday = date => date && date.toDateString() === today.toDateString();
  const isPastDate = date => date && date < today;

  const getVisitTypes = date => {
    if (!date) return { hasTickets: false, hasServices: false };
    const visits = visitDates.get(date.toDateString()) || [];
    return {
      hasTickets: visits.some(v => v.type === "ticket"),
      hasServices: visits.some(v => v.type === "service-request"),
      allCompleted: visits.length > 0 && visits.every(v =>
        (v.type === "ticket" && v.status === "Closed") ||
        (v.type === "service-request" && v.status === "Completed")
      )
    };
  };

  const handleDateClick = date => {
    if (!date || isPastDate(date)) return;
    const visits = visitDates.get(date.toDateString()) || [];
    setSelectedDate(date);

    if (onEventSelect) {
      onEventSelect({ date, visits });
    }
  };

  return (
    <div className="glass-card flex-1 flex flex-col bg-gradient-to-br from-slate-900/60 to-slate-950/60 backdrop-blur-md border border-white/5 rounded-2xl p-3 shadow-xl overflow-hidden h-full relative group">
      <div className="absolute inset-0 bg-grid-white-pattern opacity-10 pointer-events-none" />

      {/* HEADER */}
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-cyan-500/20 to-blue-500/20 flex items-center justify-center border border-cyan-500/30 shadow-lg shadow-cyan-500/10">
            <CalendarIcon className="w-4 h-4 text-cyan-400" />
          </div>
          <h2 className="text-base font-bold text-white tracking-tight">Visit Calendar</h2>
        </div>

        <div className="flex items-center gap-1 bg-slate-800/60 rounded-xl p-1 border border-white/10">
          <button
            onClick={() =>
              setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1))
            }
            className="p-1.5 rounded-lg hover:bg-white/10 text-slate-400 hover:text-cyan-400"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <h3 className="text-xs font-bold text-white px-3 min-w-[100px] text-center">
            {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
          </h3>
          <button
            onClick={() =>
              setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1))
            }
            className="p-1.5 rounded-lg hover:bg-white/10 text-slate-400 hover:text-cyan-400"
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
            className="text-center text-[9px] font-bold text-slate-500 h-5 flex items-center justify-center uppercase tracking-wider"
          >
            {d}
          </div>
        ))}
      </div>

      {/* CALENDAR GRID */}
      <div className="grid grid-cols-7 grid-rows-6 gap-x-2 gap-y-2.5 w-full flex-1 min-h-0 px-1 items-center">
        {days.map((date, i) => {
          // EMPTY CELLS
          if (!date)
            return <div key={i} className="w-full aspect-square"></div>;

          const past = isPastDate(date);
          const selected = selectedDate && selectedDate.toDateString() === date.toDateString();
          const visitTypes = getVisitTypes(date);
          const visits = visitDates.get(date.toDateString()) || [];
          const isTodayDate = isToday(date);
          const hasVisits = visits.length > 0;

          // Determine background styling based on visit types
          let visitBgClass = "";
          if (!past && !selected && !isTodayDate && hasVisits) {
            if (visitTypes.hasTickets && visitTypes.hasServices) {
              visitBgClass = "bg-gradient-to-br from-cyan-500/15 via-purple-500/10 to-fuchsia-500/15 border-purple-500/40 shadow-[0_0_15px_rgba(168,85,247,0.15)]";
            } else if (visitTypes.hasTickets) {
              visitBgClass = "bg-gradient-to-br from-cyan-500/15 to-blue-500/15 border-cyan-500/40 shadow-[0_0_12px_rgba(6,182,212,0.15)]";
            } else if (visitTypes.hasServices) {
              visitBgClass = "bg-gradient-to-br from-fuchsia-500/15 to-pink-500/15 border-fuchsia-500/40 shadow-[0_0_12px_rgba(217,70,239,0.15)]";
            }
          }

          return (
            <button
              key={i}
              onClick={() => handleDateClick(date)}
              disabled={past}
              className={`
                w-[80%] aspect-square rounded-md mx-auto my-auto flex flex-col items-center justify-center text-[11px] relative group
                ${past ? "opacity-40 cursor-not-allowed text-slate-500 bg-slate-800/10" : "cursor-pointer"}
                ${isTodayDate && !selected ? "bg-gradient-to-br from-green-500/30 to-green-500/30 text-cyan-200 border border-cyan-400/60 font-bold shadow-[0_0_15px_rgba(6,182,212,0.3)]" : ""}
                ${selected ? "bg-gradient-to-br from-cyan-500 to-blue-600 text-white border border-cyan-400 shadow-[0_0_20px_rgba(6,182,212,0.4)] z-10 font-bold" : ""}
                ${!past && !selected && !isTodayDate && !hasVisits ? "text-slate-400 hover:bg-slate-800/60 hover:border-slate-600 hover:text-white border border-transparent bg-slate-800/5" : ""}
                ${!past && !selected && !isTodayDate && hasVisits ? `border ${visitBgClass}` : ""}
              `}
            >
              <span className={`leading-none ${selected || isTodayDate ? 'font-bold' : 'font-medium'}`}>{date.getDate()}</span>

              {/* VISIT INDICATORS */}
              {!past && hasVisits && (
                <div className="flex gap-[4px] mt-1">
                  {visitTypes.hasTickets && (
                    <div className={`w-2 h-2 rounded-full ${selected ? 'bg-white shadow-lg' : 'bg-cyan-400 shadow-[0_0_8px_rgba(6,182,212,0.8)]'}`}></div>
                  )}
                  {visitTypes.hasServices && (
                    <div className={`w-2 h-2 rounded-full ${selected ? 'bg-white shadow-lg' : 'bg-fuchsia-400 shadow-[0_0_8px_rgba(217,70,239,0.8)]'}`}></div>
                  )}
                </div>
              )}

              {visitTypes.allCompleted && !past && (
                <div className="absolute -top-1 -right-1 bg-gradient-to-br from-emerald-400 to-green-500 rounded-full p-[3px] shadow-lg shadow-emerald-500/50 ring-2 ring-slate-900">
                  <Check className="w-2 h-2 text-white" />
                </div>
              )}
            </button>
          );
        })}
      </div>

      {/* LEGEND */}
      <div className="flex items-center justify-center gap-4 mt-2 pt-2 border-t border-white/5">
        <div className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-cyan-400 shadow-[0_0_8px_rgba(6,182,212,0.8)]"></span>
          <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Ticket</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-fuchsia-400 shadow-[0_0_8px_rgba(217,70,239,0.8)]"></span>
          <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Service</span>
        </div>
      </div>
    </div>
  );
};

export default VisitCalendar;
