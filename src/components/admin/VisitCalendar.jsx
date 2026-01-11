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
  const getCalendarDays = () => {
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
  };

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

  const days = getCalendarDays();

  return (
    <div className="p-1 flex flex-col h-full">

      {/* HEADER */}
      <div className="flex items-center justify-between mb-0 h-5">
        <div className="flex items-center gap-1 ">
          <div className="mb-5 w-7 h-7 rounded-xl bg-blue-500 flex items-center justify-center ring-1 ring-blue-200">
            <CalendarIcon className="w-3 h-3 text-white" />
          </div>
          <h2 className="text-lg font-bold text-slate-900 ml-1 mb-5">Visit Calendar</h2>
        </div>
      </div>

      {/* MONTH NAVIGATION */}
      <div className="flex items-center justify-between mb-0 h-6">
        <button
          onClick={() =>
            setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1))
          }
          className="p-1 rounded-lg hover:bg-slate-100"
        >
          <ChevronLeft className="w-4 h-4 text-slate-600" />
        </button>

        <h3 className="text-sm font-semibold text-slate-900">
          {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
        </h3>

        <button
          onClick={() =>
            setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1))
          }
          className="p-1 rounded-lg hover:bg-slate-100"
        >
          <ChevronRight className="w-4 h-4 text-slate-600" />
        </button>
      </div>

      {/* WEEKDAY LABELS */}
      <div className="grid grid-cols-7 gap-[2px] mb-1">
        {dayNames.map(d => (
          <div
            key={d}
            className="text-center text-[11px] font-semibold h-6 flex items-center justify-center"
          >
            {d}
          </div>
        ))}
      </div>

      {/* CALENDAR GRID */}
      <div className="grid grid-cols-7 gap-[6px] flex-1 min-h-0 place-items-center">
        {days.map((date, i) => {
          // EMPTY CELLS
          if (!date)
            return <div key={i} className="w-10 h-10"></div>;

          const past = isPastDate(date);
          const selected = selectedDate && selectedDate.toDateString() === date.toDateString();
          const visitTypes = getVisitTypes(date);
          const visits = visitDates.get(date.toDateString()) || [];

          return (
            <button
              key={i}
              onClick={() => handleDateClick(date)}
              disabled={past}
              className={`
                w-9 h-9 rounded-md flex flex-col items-center justify-center text-[10px] transition-all
                ${past ? "opacity-40 cursor-not-allowed bg-slate-50" : "hover:bg-slate-100 cursor-pointer"}
                ${isToday(date) ? "bg-green-200 border border-green-500 font-bold" : ""}
                ${selected ? "bg-blue-300 text-white border border-blue-600" : ""}
                ${
                  !past && !selected && !isToday(date) && visits.length > 0
                    ? visitTypes.hasTickets && visitTypes.hasServices
                      ? "bg-gradient-to-br from-blue-50 to-purple-50 border border-purple-300"
                      : visitTypes.hasTickets
                      ? "bg-blue-50 border border-blue-300"
                      : "bg-purple-50 border border-purple-300"
                    : "border border-slate-200"
                }
              `}
            >
              {date.getDate()}

              {/* VISIT INDICATORS */}
              {!past && visits.length > 0 && (
                <div className="flex gap-[2px] mt-[2px]">
                  {visitTypes.hasTickets && (
                    <div className="w-1.5 h-1.5 rounded-full bg-blue-600"></div>
                  )}
                  {visitTypes.hasServices && (
                    <div className="w-1.5 h-1.5 rounded-full bg-fuchsia-500"></div>
                  )}
                  {visitTypes.allCompleted && (
                    <div className="absolute -top-[2px] -right-[2px] bg-green-500 rounded-full p-[1px]">
                      <Check className="w-2 h-2 text-white" />
                    </div>
                  )}
                </div>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default VisitCalendar;
