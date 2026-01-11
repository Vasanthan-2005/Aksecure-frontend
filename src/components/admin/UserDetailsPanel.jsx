import { User, Building, Phone, MapPin, Ticket as TicketIcon, Trash2, Loader2, Users, Mail, Calendar, Clock } from 'lucide-react';

const UserDetailsPanel = ({ user, onDelete, deleting }) => {
  if (!user) {
    return (
      <div className="flex-1 overflow-y-auto bg-gradient-to-br from-slate-50 to-slate-100">
        <div className="flex items-center justify-center h-full min-h-[calc(100vh-4rem)] text-slate-500">
          <div className="text-center px-6">
            <div className="w-24 h-24 mx-auto mb-6 rounded-2xl bg-gradient-to-br from-blue-100 to-blue-200 flex items-center justify-center ring-4 ring-blue-50 shadow-lg">
              <Users className="w-12 h-12 text-blue-600" />
            </div>
            <p className="text-2xl font-bold text-slate-700 mb-3">Select a user to view details</p>
            <p className="text-sm text-slate-500 max-w-md">Click on any user from the left panel to see their complete profile information, ticket history, and location details</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto bg-gradient-to-br from-slate-50 to-slate-100">
      <div className="p-8 max-w-5xl mx-auto space-y-6">
        {/* User Header */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xl p-8 ring-1 ring-slate-100">
          <div className="flex items-start justify-between mb-6">
            <div className="flex items-center gap-5">
              <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center ring-4 ring-blue-100 shadow-lg">
                <User className="w-10 h-10 text-white" />
              </div>
              <div>
                <h2 className="text-3xl font-bold text-slate-900 tracking-tight mb-2">
                  {user.name}
                </h2>
                <p className="text-base text-slate-600 mb-1">{user.email}</p>
                {user.companyName && (
                  <p className="text-sm text-slate-500 font-medium">{user.companyName}</p>
                )}
              </div>
            </div>
            <button
              onClick={() => onDelete(user)}
              disabled={deleting === user._id}
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-red-600 text-white rounded-xl hover:bg-red-700 transition-all font-semibold shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {deleting === user._id ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Deleting...
                </>
              ) : (
                <>
                  <Trash2 className="w-4 h-4" />
                  Delete User
                </>
              )}
            </button>
          </div>
        </div>

        {/* User Information */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xl p-8 ring-1 ring-slate-100">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-slate-600 to-slate-700 flex items-center justify-center ring-2 ring-slate-100">
              <User className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="text-2xl font-bold text-slate-900">User Information</h3>
              <p className="text-sm text-slate-500 mt-0.5">Account and contact details</p>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Email */}
            <div className="bg-gradient-to-br from-slate-50 to-slate-100/50 rounded-xl p-5 border border-slate-200 hover:shadow-md transition-shadow">
              <div className="flex items-center gap-2 mb-3">
                <Mail className="w-5 h-5 text-slate-500" />
                <span className="text-xs text-slate-500 font-semibold uppercase tracking-wide">Email</span>
              </div>
              <p className="text-base font-bold text-slate-900 break-all">
                {user.email || 'N/A'}
              </p>
            </div>

            {/* Phone */}
            <div className="bg-gradient-to-br from-slate-50 to-slate-100/50 rounded-xl p-5 border border-slate-200 hover:shadow-md transition-shadow">
              <div className="flex items-center gap-2 mb-3">
                <Phone className="w-5 h-5 text-slate-500" />
                <span className="text-xs text-slate-500 font-semibold uppercase tracking-wide">Phone</span>
              </div>
              <p className="text-lg font-bold text-slate-900">
                {user.phone || 'N/A'}
              </p>
            </div>

            {/* Company */}
            <div className="bg-gradient-to-br from-slate-50 to-slate-100/50 rounded-xl p-5 border border-slate-200 hover:shadow-md transition-shadow">
              <div className="flex items-center gap-2 mb-3">
                <Building className="w-5 h-5 text-slate-500" />
                <span className="text-xs text-slate-500 font-semibold uppercase tracking-wide">Company</span>
              </div>
              <p className="text-lg font-bold text-slate-900">
                {user.companyName || 'N/A'}
              </p>
            </div>

            {/* Role */}
            <div className="bg-gradient-to-br from-slate-50 to-slate-100/50 rounded-xl p-5 border border-slate-200 hover:shadow-md transition-shadow">
              <div className="flex items-center gap-2 mb-3">
                <User className="w-5 h-5 text-slate-500" />
                <span className="text-xs text-slate-500 font-semibold uppercase tracking-wide">Role</span>
              </div>
              <p className="text-lg font-bold text-slate-900 capitalize">
                {user.role || 'user'}
              </p>
            </div>

            {/* Address */}
            {user.address && (
              <div className="md:col-span-2 bg-gradient-to-br from-slate-50 to-slate-100/50 rounded-xl p-5 border border-slate-200 hover:shadow-md transition-shadow">
                <div className="flex items-center gap-2 mb-3">
                  <MapPin className="w-5 h-5 text-slate-500" />
                  <span className="text-xs text-slate-500 font-semibold uppercase tracking-wide">Address</span>
                </div>
                <p className="text-base font-semibold text-slate-900 leading-relaxed">{user.address}</p>
              </div>
            )}

            {/* Location Coordinates */}
            {user.location && (
              <div className="md:col-span-2 bg-gradient-to-br from-amber-50 to-amber-100/50 rounded-xl p-5 border border-amber-200 hover:shadow-md transition-shadow">
                <div className="flex items-center gap-2 mb-3">
                  <MapPin className="w-5 h-5 text-amber-600" />
                  <span className="text-xs text-amber-600 font-semibold uppercase tracking-wide">Location Coordinates</span>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <span className="text-xs text-amber-700 font-medium block mb-1">Latitude</span>
                    <p className="text-base font-bold text-amber-900">{user.location.lat}</p>
                  </div>
                  <div>
                    <span className="text-xs text-amber-700 font-medium block mb-1">Longitude</span>
                    <p className="text-base font-bold text-amber-900">{user.location.lng}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Registration Date */}
            {user.createdAt && (
              <div className="bg-gradient-to-br from-emerald-50 to-emerald-100/50 rounded-xl p-5 border border-emerald-200 hover:shadow-md transition-shadow">
                <div className="flex items-center gap-2 mb-3">
                  <Calendar className="w-5 h-5 text-emerald-600" />
                  <span className="text-xs text-emerald-600 font-semibold uppercase tracking-wide">Registered</span>
                </div>
                <p className="text-base font-bold text-emerald-900">
                  {new Date(user.createdAt).toLocaleDateString('en-US', { 
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric' 
                  })}
                </p>
                <p className="text-xs text-emerald-700 mt-1">
                  {new Date(user.createdAt).toLocaleTimeString('en-US', { 
                    hour: '2-digit', 
                    minute: '2-digit' 
                  })}
                </p>
              </div>
            )}

            {/* Last Updated */}
            {user.updatedAt && (
              <div className="bg-gradient-to-br from-slate-50 to-slate-100/50 rounded-xl p-5 border border-slate-200 hover:shadow-md transition-shadow">
                <div className="flex items-center gap-2 mb-3">
                  <Clock className="w-5 h-5 text-slate-600" />
                  <span className="text-xs text-slate-600 font-semibold uppercase tracking-wide">Last Updated</span>
                </div>
                <p className="text-base font-bold text-slate-900">
                  {new Date(user.updatedAt).toLocaleDateString('en-US', { 
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric' 
                  })}
                </p>
                <p className="text-xs text-slate-700 mt-1">
                  {new Date(user.updatedAt).toLocaleTimeString('en-US', { 
                    hour: '2-digit', 
                    minute: '2-digit' 
                  })}
                </p>
              </div>
            )}

            {/* Total Tickets */}
            <div className="md:col-span-2 bg-gradient-to-br from-blue-50 to-blue-100/50 rounded-xl p-6 border-2 border-blue-200 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <TicketIcon className="w-5 h-5 text-blue-600" />
                    <span className="text-sm text-blue-600 font-semibold uppercase tracking-wide">Total Tickets</span>
                  </div>
                  <p className="text-4xl font-bold text-blue-900">{user.ticketCount || 0}</p>
                </div>
                <div className="w-16 h-16 rounded-xl bg-blue-600/10 flex items-center justify-center">
                  <TicketIcon className="w-8 h-8 text-blue-600" />
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
};

export default UserDetailsPanel;

