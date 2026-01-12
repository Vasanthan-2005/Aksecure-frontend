import { Search, Users, User, Loader2, Home, AlertCircle, Trash2 } from 'lucide-react';

const UserListPanel = ({
  users,
  userSearchTerm,
  setUserSearchTerm,
  selectedUser,
  onUserClick,
  loading,
  onBackToDashboard,
  onRefresh,
  onDelete
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
    <div className="w-96 border-r border-white/5 bg-slate-900/50 backdrop-blur-sm overflow-hidden flex flex-col relative z-20">
      <div className="p-6 border-b border-white/5 bg-slate-900/50 backdrop-blur-md sticky top-0 z-10 w-full">
        {onBackToDashboard && (
          <div className="mb-4">
            <button
              onClick={onBackToDashboard}
              className="flex items-center gap-2 px-3 py-1.5 text-xs font-semibold text-slate-400 hover:text-white hover:bg-white/5 rounded-lg transition-colors border border-transparent hover:border-white/10"
            >
              <Home className="w-3.5 h-3.5" />
              Dashboard
            </button>
          </div>
        )}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-violet-500/10 border border-violet-500/20 flex items-center justify-center">
              <Users className="w-5 h-5 text-violet-400" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white tracking-tight">All Users</h2>
              <p className="text-xs text-slate-400 mt-0.5 font-medium">Manage registered users</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {onRefresh && (
              <button
                onClick={onRefresh}
                className="flex items-center gap-2 p-2 bg-slate-800 text-slate-300 hover:text-white rounded-xl hover:bg-slate-700 transition-all border border-slate-700 hover:border-slate-600"
                title="Refresh Data"
              >
                <AlertCircle className="w-4 h-4" />
              </button>
            )}
            <span className="px-3 py-1 bg-violet-500/10 text-violet-300 border border-violet-500/20 rounded-lg text-xs font-bold">
              {users.length}
            </span>
          </div>
        </div>

        {/* Search */}
        <div className="relative mb-4 group">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-500 group-focus-within:text-violet-400 transition-colors w-4 h-4" />
          <input
            type="text"
            placeholder="Search by name, email, company..."
            value={userSearchTerm}
            onChange={(e) => setUserSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-3 bg-slate-800/50 border border-slate-700 rounded-xl focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500/50 text-sm text-slate-200 placeholder-slate-500 transition-all outline-none"
          />
        </div>

        <div className="text-xs text-slate-500 font-medium px-1">
          <span className="text-slate-300 font-bold">{filteredUsers.length}</span> user{filteredUsers.length !== 1 ? 's' : ''} found
        </div>
      </div>

      {/* Users List */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 text-violet-500 animate-spin" />
          </div>
        ) : filteredUsers.length === 0 ? (
          <div className="text-center py-12 px-4">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-slate-800/50 flex items-center justify-center border border-white/5">
              <Users className="w-8 h-8 text-slate-600" />
            </div>
            <p className="text-slate-400 font-medium mb-1">No users found</p>
            <p className="text-xs text-slate-600 mt-1">
              {userSearchTerm ? 'Try adjusting your search' : 'Users will appear here once registered'}
            </p>
          </div>
        ) : (
          filteredUsers.map((userItem) => (
            <button
              key={userItem._id}
              onClick={() => onUserClick(userItem)}
              className={`w-full text-left p-4 rounded-xl border transition-all group relative overflow-hidden ${selectedUser?._id === userItem._id
                ? 'bg-violet-500/10 border-violet-500/50 shadow-[0_0_20px_rgba(139,92,246,0.1)]'
                : 'bg-slate-800/30 border-white/5 hover:border-violet-500/30 hover:bg-slate-800/60'
                }`}
            >
              {selectedUser?._id === userItem._id && (
                <div className="absolute left-0 top-0 bottom-0 w-1 bg-violet-500" />
              )}
              {/* User Avatar and Name */}
              <div className="flex items-center gap-3 mb-3 pl-2">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center ring-2 flex-shrink-0 transition-all ${selectedUser?._id === userItem._id
                  ? 'bg-violet-500 ring-violet-500/30'
                  : 'bg-slate-700 ring-slate-600 group-hover:ring-violet-500/30 group-hover:bg-slate-600'
                  }`}>
                  <User className="w-5 h-5 text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className={`font-bold text-sm mb-0.5 truncate transition-colors ${selectedUser?._id === userItem._id ? 'text-white' : 'text-slate-300 group-hover:text-white'
                    }`}>
                    {userItem.name}
                  </h3>
                  <p className="text-xs text-slate-500 truncate group-hover:text-slate-400 transition-colors">{userItem.email}</p>
                </div>
              </div>

              {/* Company and Tickets Info */}
              <div className="flex items-center justify-between pt-3 border-t border-white/5 pl-2">
                <div className="grid grid-cols-2 gap-4 flex-1">
                  <div className="min-w-0">
                    <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block mb-1">Company</span>
                    <p className="text-xs font-semibold text-slate-300 truncate group-hover:text-white transition-colors" title={userItem.companyName || 'N/A'}>
                      {userItem.companyName || 'N/A'}
                    </p>
                  </div>
                  <div className="min-w-0">
                    <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block mb-1">Tickets</span>
                    <p className={`text-sm font-bold ${selectedUser?._id === userItem._id ? 'text-violet-400' : 'text-slate-400 group-hover:text-violet-400'
                      }`}>{userItem.ticketCount || 0}</p>
                  </div>
                </div>
                {onDelete && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onDelete(userItem);
                    }}
                    className="p-1.5 text-red-400 hover:text-red-300 bg-red-500/10 hover:bg-red-500/20 rounded-lg transition-colors border border-red-500/20 hover:border-red-500/40 flex-shrink-0"
                    title="Delete user"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </button>
          ))
        )}
      </div>
    </div>
  );
};

export default UserListPanel;
