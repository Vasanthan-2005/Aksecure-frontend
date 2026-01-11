import { Search, Users, User, Loader2, Home, AlertCircle } from 'lucide-react';

const UserListPanel = ({
  users,
  userSearchTerm,
  setUserSearchTerm,
  selectedUser,
  onUserClick,
  loading,
  onBackToDashboard,
  onRefresh
}) => {
  const filteredUsers = users.filter((user) => {
    const searchLower = userSearchTerm.toLowerCase();
    return (
      user.name.toLowerCase().includes(searchLower) ||
      user.email.toLowerCase().includes(searchLower) ||
      user.companyName?.toLowerCase().includes(searchLower) ||
      user.phone?.toLowerCase().includes(searchLower)
    );
  });

  return (
    <div className="w-96 border-r border-slate-200 bg-white overflow-hidden flex flex-col shadow-inner">
      <div className="p-6 border-b border-slate-200 bg-white sticky top-0 z-10 shadow-sm">
        {onBackToDashboard && (
          <div className="mb-3">
            <button
              onClick={onBackToDashboard}
              className="flex items-center gap-2 px-3 py-1.5 text-sm font-semibold text-slate-700 hover:bg-slate-50 rounded-lg transition-colors bg-slate-100 border border-slate-200"
            >
              <Home className="w-4 h-4" />
              Dashboard
            </button>
          </div>
        )}
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-slate-600 to-slate-700 flex items-center justify-center">
              <Users className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-900 tracking-tight">All Users</h2>
              <p className="text-xs text-slate-500 mt-0.5">Manage registered users</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {onRefresh && (
              <button
                onClick={onRefresh}
                className="flex items-center gap-2 px-4 py-2 bg-gradient-to-br from-blue-600 to-blue-700 text-white rounded-xl font-semibold hover:from-blue-700 hover:to-blue-800 transition-all shadow-md hover:shadow-lg text-sm"
              >
                <AlertCircle className="w-4 h-4" />
                Refresh Data
              </button>
            )}
            <span className="px-3 py-1.5 bg-blue-100 text-blue-700 rounded-lg text-sm font-semibold">
              {users.length}
            </span>
          </div>
        </div>
        
        {/* Search */}
        <div className="relative mb-4">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
          <input
            type="text"
            placeholder="Search by name, email, company..."
            value={userSearchTerm}
            onChange={(e) => setUserSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-slate-500 focus:border-slate-500 text-sm bg-white shadow-sm transition-all"
          />
        </div>
        
        <div className="text-xs text-slate-500 font-medium">
          <span className="text-slate-700 font-semibold">{filteredUsers.length}</span> user{filteredUsers.length !== 1 ? 's' : ''} found
        </div>
      </div>

      {/* Users List */}
      <div className="flex-1 overflow-y-auto p-5 space-y-4">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 text-slate-600 animate-spin" />
          </div>
        ) : filteredUsers.length === 0 ? (
          <div className="text-center py-12 px-4">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-slate-100 flex items-center justify-center">
              <Users className="w-8 h-8 text-slate-400" />
            </div>
            <p className="text-slate-500 font-medium mb-1">No users found</p>
            <p className="text-xs text-slate-400 mt-1">
              {userSearchTerm ? 'Try adjusting your search' : 'Users will appear here once registered'}
            </p>
          </div>
        ) : (
          filteredUsers.map((userItem) => (
            <button
              key={userItem._id}
              onClick={() => onUserClick(userItem)}
              className={`w-full text-left p-5 rounded-xl border-2 transition-all group ${
                selectedUser?._id === userItem._id
                  ? 'border-blue-500 bg-gradient-to-br from-blue-50 to-blue-100/50 shadow-lg ring-2 ring-blue-100'
                  : 'border-slate-200 bg-white hover:border-blue-300 hover:shadow-md hover:bg-slate-50'
              }`}
            >
              {/* User Avatar and Name */}
              <div className="flex items-center gap-3 mb-4">
                <div className="w-14 h-14 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center ring-2 ring-blue-100 flex-shrink-0">
                  <User className="w-7 h-7 text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-bold text-slate-900 text-base mb-1 truncate group-hover:text-blue-700 transition-colors">
                    {userItem.name}
                  </h3>
                  <p className="text-xs text-slate-500 truncate">{userItem.email}</p>
                </div>
              </div>

              {/* Company and Tickets Info */}
              <div className="grid grid-cols-2 gap-4 pt-4 border-t border-slate-200/80">
                <div className="min-w-0">
                  <span className="text-xs text-slate-500 font-medium uppercase tracking-wide block mb-1.5">Company</span>
                  <p className="text-sm font-semibold text-slate-900 truncate" title={userItem.companyName || 'N/A'}>
                    {userItem.companyName || 'N/A'}
                  </p>
                </div>
                <div className="min-w-0">
                  <span className="text-xs text-slate-500 font-medium uppercase tracking-wide block mb-1.5">Tickets</span>
                  <p className="text-xl font-bold text-blue-600">{userItem.ticketCount || 0}</p>
                </div>
              </div>
            </button>
          ))
        )}
      </div>
    </div>
  );
};

export default UserListPanel;
