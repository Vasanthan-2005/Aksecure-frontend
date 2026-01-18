import { Search, Users, User, Loader2, Home, AlertCircle, Trash2, MapPin } from 'lucide-react';
import SkeletonLoader from '../common/SkeletonLoader';

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
    <div className={`w-full lg:w-96 border-r border-white/5 bg-slate-900/50 backdrop-blur-sm flex flex-col relative z-20 ${selectedUser ? 'hidden lg:flex' : 'flex'}`}>
      <div className="p-3 lg:p-4 border-b border-white/5 bg-slate-900/50 backdrop-blur-md sticky top-0 z-10 w-full">
        {onBackToDashboard && (
          <div className="mb-4">
            <button
              onClick={onBackToDashboard}
              className="flex items-center gap-2 px-3 py-1.5 text-xs font-semibold text-slate-400 hover:text-white hover:bg-white/5 rounded-lg border border-transparent hover:border-white/10"
            >
              <Home className="w-3.5 h-3.5" />
              Dashboard
            </button>
          </div>
        )}
        <div className="flex items-center justify-between mb-4 lg:mb-6">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 lg:w-10 lg:h-10 rounded-xl bg-violet-500/10 border border-violet-500/20 flex items-center justify-center">
              <Users className="w-4 h-4 lg:w-5 lg:h-5 text-violet-400" />
            </div>
            <div>
              <h2 className="text-xl lg:text-2xl font-bold text-white tracking-tight">All Users</h2>
              <p className="text-[10px] lg:text-xs text-slate-400 mt-0.5 font-medium">Manage registered users</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {onRefresh && (
              <button
                onClick={onRefresh}
                className="flex items-center gap-2 p-2 bg-slate-800 text-slate-300 hover:text-white rounded-xl hover:bg-slate-700 border border-slate-700 hover:border-slate-600"
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
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-500 group-focus-within:text-violet-400 w-4 h-4" />
          <input
            type="text"
            placeholder="Search by name, email, company..."
            value={userSearchTerm}
            onChange={(e) => setUserSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 lg:py-3 bg-slate-800/50 border border-slate-700 rounded-xl focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500/50 text-sm text-slate-200 placeholder-slate-500 outline-none"
          />
        </div>

        <div className="text-xs text-slate-500 font-medium px-1">
          <span className="text-slate-300 font-bold">{filteredUsers.length}</span> user{filteredUsers.length !== 1 ? 's' : ''} found
        </div>
      </div>

      {/* Users List */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar">
        {loading ? (
          // Skeleton Loading State
          Array.from({ length: 5 }).map((_, index) => (
            <div
              key={index}
              className="w-full p-4 rounded-xl border border-white/5 bg-slate-900/40 relative overflow-hidden"
            >
              <div className="flex items-center gap-3 mb-3 pl-2">
                <SkeletonLoader variant="circular" width="40px" height="40px" className="flex-shrink-0" />
                <div className="flex-1">
                  <SkeletonLoader variant="text" width="50%" height="16px" className="mb-1" />
                  <SkeletonLoader variant="text" width="70%" height="12px" />
                </div>
              </div>
              <div className="flex items-center justify-between pt-3 border-t border-white/5 pl-2">
                <div className="grid grid-cols-2 gap-4 flex-1">
                  <div>
                    <SkeletonLoader variant="text" width="40px" height="10px" className="mb-1" />
                    <SkeletonLoader variant="text" width="80px" height="14px" />
                  </div>
                  <div>
                    <SkeletonLoader variant="text" width="40px" height="10px" className="mb-1" />
                    <SkeletonLoader variant="text" width="30px" height="14px" />
                  </div>
                </div>
              </div>
            </div>
          ))
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
              className={`w-full text-left p-2.5 lg:p-4 rounded-xl border group relative overflow-hidden ${selectedUser?._id === userItem._id
                ? 'bg-violet-500/10 border-violet-500/50 shadow-[0_0_20px_rgba(139,92,246,0.1)]'
                : 'bg-slate-800/30 border-white/5 hover:border-violet-500/30 hover:bg-slate-800/60'
                }`}
            >
              {selectedUser?._id === userItem._id && (
                <div className="absolute left-0 top-0 bottom-0 w-1 bg-violet-500" />
              )}
              {/* User Avatar and Name */}
              <div className="flex items-center gap-3 mb-3 pl-2">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center ring-2 flex-shrink-0 ${selectedUser?._id === userItem._id
                  ? 'bg-violet-500 ring-violet-500/30'
                  : 'bg-slate-700 ring-slate-600 group-hover:ring-violet-500/30 group-hover:bg-slate-600'
                  }`}>
                  <User className="w-5 h-5 text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className={`font-bold text-base mb-0.5 truncate flex items-center gap-2 ${selectedUser?._id === userItem._id ? 'text-white' : 'text-slate-300 group-hover:text-white'
                    }`}>
                    {userItem.name}
                    <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider ${userItem.role === 'admin'
                      ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                      : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                      }`}>
                      {userItem.role || 'user'}
                    </span>
                    {userItem.location && userItem.location.lat && userItem.location.lng && (
                      <MapPin className="w-3.5 h-3.5 text-amber-500 shrink-0" title="Location marked" />
                    )}
                  </h3>
                  <p className="text-sm text-slate-500 truncate group-hover:text-slate-400">{userItem.email}</p>
                </div>
              </div>

              {/* Company and Tickets Info */}
              <div className="flex items-center justify-between pt-3 border-t border-white/5 pl-2">
                <div className="grid grid-cols-3 gap-2 flex-1">
                  <div className="min-w-0">
                    <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block mb-1">Company</span>
                    <p className="text-sm font-semibold text-slate-300 truncate group-hover:text-white" title={userItem.companyName || 'N/A'}>
                      {userItem.companyName || 'N/A'}
                    </p>
                  </div>
                  <div className="min-w-0">
                    <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block mb-1 ml-13 ">Branches</span>
                    <p className={`text-sm px-19 font-bold ${selectedUser?._id === userItem._id ? 'text-emerald-400' : 'text-slate-400 group-hover:text-emerald-400'
                      }`}>{userItem.outlets?.length || 0}</p>
                  </div>

                </div>
                {onDelete && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onDelete(userItem);
                    }}
                    className="p-1.5 text-red-400 hover:text-red-300 bg-red-500/10 hover:bg-red-500/20 rounded-lg border border-red-500/20 hover:border-red-500/40 flex-shrink-0"
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