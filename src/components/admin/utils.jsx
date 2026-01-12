import { AlertCircle, Loader2, CheckCircle2, XCircle, CircleDot } from 'lucide-react';

const normalizeStatus = (status) => {
  if (status === 'Open') return 'New';
  return status;
};

export const getStatusColor = (status) => {
  const normalizedStatus = normalizeStatus(status);
  const colors = {
    'New': 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20 ring-1 ring-emerald-500/20',
    'In Progress': 'bg-blue-500/10 text-blue-400 border-blue-500/20 ring-1 ring-blue-500/20',
    'Closed': 'bg-slate-500/10 text-slate-400 border-slate-500/20 ring-1 ring-slate-500/20',
    'Completed': 'bg-blue-500/10 text-blue-400 border-blue-500/20 ring-1 ring-blue-500/20'
  };
  return colors[normalizedStatus] || 'bg-slate-500/10 text-slate-400 border-slate-500/20 ring-1 ring-slate-500/20';
};

export const getStatusIcon = (status) => {
  const normalizedStatus = normalizeStatus(status);
  switch (normalizedStatus) {
    case 'New':
      return <AlertCircle className="w-3.5 h-3.5" />;
    case 'In Progress':
      return <Loader2 className="w-3.5 h-3.5 animate-spin" />;
    case 'Closed':
    case 'Completed':
      return <XCircle className="w-3.5 h-3.5" />;
    default:
      return <CircleDot className="w-3.5 h-3.5" />;
  }
};

export const getCategoryColor = (category) => {
  const colors = {
    'CCTV': 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20',
    'Fire Alarm': 'bg-red-500/10 text-red-400 border-red-500/20',
    'Security Alarm': 'bg-orange-500/10 text-orange-400 border-orange-500/20',
    'Electrical': 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20',
    'Plumbing': 'bg-blue-500/10 text-blue-400 border-blue-500/20',
    'Air Conditioning': 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
  };
  return colors[category] || 'bg-slate-500/10 text-slate-400 border-slate-500/20';
};

export const getTicketStats = (tickets) => {
  return {
    total: tickets.length,
    new: tickets.filter(t => normalizeStatus(t.status) === 'New').length,
    inProgress: tickets.filter(t => t.status === 'In Progress').length,
    closed: tickets.filter(t => t.status === 'Closed').length
  };
};

export const getServiceRequestStats = (serviceRequests) => {
  return {
    total: serviceRequests.length,
    new: serviceRequests.filter(sr => sr.status === 'New').length,
    inProgress: serviceRequests.filter(sr => sr.status === 'In Progress').length,
    completed: serviceRequests.filter(sr => sr.status === 'Completed').length
  };
};

export const getGoogleMapsUrl = (ticket) => {
  if (!ticket.location || !ticket.userId?.location) return null;
  const location = ticket.userId.location;
  return `https://www.google.com/maps?q=${location.lat},${location.lng}`;
};

export const statusOptions = ['New', 'In Progress', 'Closed'];

