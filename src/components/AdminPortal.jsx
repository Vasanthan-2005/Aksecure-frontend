import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import api from "../services/api";
import {
  Loader2,
  Ticket as TicketIcon,
  Users,
  List,
  AlertCircle,
  CheckCircle2,
  Calendar,
  ArrowRight,
  XCircle,
  Building2,
  User,
  FileText,
  Clock,
} from "lucide-react";

import AdminNavigation from "./admin/AdminNavigation";
import TicketListPanel from "./admin/TicketListPanel";
import TicketDetailsPanel from "./admin/TicketDetailsPanel";
import ServiceRequestListPanel from "./admin/ServiceRequestListPanel";
import ServiceRequestDetailsPanel from "./admin/ServiceRequestDetailsPanel";
import UserListPanel from "./admin/UserListPanel";
import UserDetailsPanel from "./admin/UserDetailsPanel";
import TicketStats from "./admin/TicketStats";
import VisitCalendar from "./admin/VisitCalendar";
import {
  getTicketStats,
  getServiceRequestStats,
  getStatusColor,
  getStatusIcon,
  getCategoryColor,
} from "./admin/utils.jsx";

const AdminPortal = () => {
  const getSlotLabel = (dateString) => {
    if (!dateString || isNaN(new Date(dateString).getTime())) return null;
    const hours = new Date(dateString).getHours();
    if (hours >= 9 && hours < 12) return "Morning (9 AM – 12 PM)";
    if (hours >= 12 && hours < 15) return "Afternoon (12 PM – 3 PM)";
    if (hours >= 15 && hours < 18) return "Evening (3 PM – 6 PM)";
    return null;
  };
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("tickets");
  const [viewMode, setViewMode] = useState("dashboard");
  const [tickets, setTickets] = useState([]);
  const [serviceRequests, setServiceRequests] = useState([]);
  const [users, setUsers] = useState([]);
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [selectedServiceRequest, setSelectedServiceRequest] = useState(null);
  const [selectedUser, setSelectedUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [serviceRequestsLoading, setServiceRequestsLoading] = useState(false);
  const [usersLoading, setUsersLoading] = useState(false);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [serviceRequestSearchTerm, setServiceRequestSearchTerm] = useState("");
  const [userSearchTerm, setUserSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [serviceRequestStatusFilter, setServiceRequestStatusFilter] =
    useState("All");
  const [updating, setUpdating] = useState(false);
  const [newComment, setNewComment] = useState("");
  const [updateStatus, setUpdateStatus] = useState("");
  const [serviceRequestUpdateStatus, setServiceRequestUpdateStatus] =
    useState("");
  const [visitDateTime, setVisitDateTime] = useState("");
  const [serviceRequestVisitDateTime, setServiceRequestVisitDateTime] =
    useState("");
  const [errors, setErrors] = useState({
    status: "",
    visitDateTime: "",
    comment: "",
    update: "",
    commentSubmit: "",
  });
  const [serviceRequestErrors, setServiceRequestErrors] = useState({
    status: "",
    visitDateTime: "",
    comment: "",
    update: "",
    commentSubmit: "",
  });
  const [deletingUserId, setDeletingUserId] = useState(null);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState(null);
  const [showReplyModal, setShowReplyModal] = useState(false);
  const [showServiceRequestReplyModal, setShowServiceRequestReplyModal] =
    useState(false);
  const [serviceRequestNewComment, setServiceRequestNewComment] = useState("");
  const [selectedVisit, setSelectedVisit] = useState(null);

  useEffect(() => {
    if (user && user.role !== "admin") {
      navigate("/");
    }
    fetchTickets();
    fetchServiceRequests();
  }, [user, navigate]);

  useEffect(() => {
    if (activeTab === "users") {
      fetchUsers();
      setSelectedTicket(null);
      setSelectedServiceRequest(null);
      setViewMode("dashboard");
    } else if (activeTab === "service-requests") {
      fetchServiceRequests();
      setSelectedTicket(null);
      if (
        viewMode !== "new-service-requests" &&
        viewMode !== "all-service-requests"
      ) {
        setViewMode("dashboard");
      }
    } else if (activeTab === "tickets") {
      if (viewMode !== "new-tickets" && viewMode !== "all") {
        setViewMode("dashboard");
      }
      setSelectedServiceRequest(null);
    }
  }, [activeTab]);

  useEffect(() => {
    if (selectedTicket) {
      setUpdateStatus(selectedTicket.status);
      setVisitDateTime(
        selectedTicket.assignedVisitAt
          ? new Date(selectedTicket.assignedVisitAt).toISOString().slice(0, 16)
          : ""
      );
      setErrors({
        status: "",
        visitDateTime: "",
        comment: "",
        update: "",
        commentSubmit: "",
      });
    }
  }, [selectedTicket]);

  useEffect(() => {
    if (selectedServiceRequest) {
      setServiceRequestUpdateStatus(selectedServiceRequest.status);
      setServiceRequestVisitDateTime(
        selectedServiceRequest.assignedVisitAt
          ? new Date(selectedServiceRequest.assignedVisitAt)
              .toISOString()
              .slice(0, 16)
          : ""
      );
      setServiceRequestErrors({
        status: "",
        visitDateTime: "",
        comment: "",
        update: "",
        commentSubmit: "",
      });
    }
  }, [selectedServiceRequest]);

  // Mark tickets as viewed by admin
  const markTicketsAsViewed = async (ticketIds) => {
    try {
      await api.post('/tickets/mark-viewed', { ticketIds });
    } catch (err) {
      console.error('Failed to mark tickets as viewed:', err);
      // Don't show error to user as it's not critical
    }
  };

  const fetchTickets = async (markAsViewed = false) => {
    try {
      setLoading(true);
      const response = await api.get("/tickets");
      const ticketsData = response.data;
      
      // Mark tickets as viewed if needed
      if (markAsViewed && ticketsData.length > 0) {
        const newTickets = ticketsData.filter(
          ticket => ticket.status === 'New' || ticket.status === 'Open'
        );
        if (newTickets.length > 0) {
          await markTicketsAsViewed(newTickets.map(t => t._id));
          // Update local state to reflect that tickets are now viewed
          const updatedTickets = ticketsData.map(ticket => ({
            ...ticket,
            viewedByAdmin: true
          }));
          setTickets(updatedTickets);
          return;
        }
      }
      
      setTickets(ticketsData);
      setError("");
    } catch (err) {
      setError("Failed to load tickets");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchUsers = async () => {
    try {
      setUsersLoading(true);
      const response = await api.get("/users");
      setUsers(response.data);
      setError("");
    } catch (err) {
      setError("Failed to load users");
      console.error(err);
    } finally {
      setUsersLoading(false);
    }
  };

  const fetchServiceRequests = async () => {
    try {
      setServiceRequestsLoading(true);
      const response = await api.get("/service-requests");
      // Handle the paginated response
      const serviceRequestsData = response.data.requests || [];
      setServiceRequests(serviceRequestsData);
      setError("");
    } catch (err) {
      setError("Failed to load service requests");
      console.error(err);
    } finally {
      setServiceRequestsLoading(false);
    }
  };

  const openDeleteUserModal = (user) => {
    setUserToDelete(user);
    setDeleteModalOpen(true);
  };

  const handleDeleteUser = async () => {
    if (!userToDelete) return;
    try {
      setDeletingUserId(userToDelete._id);
      await api.delete(`/users/${userToDelete._id}`);
      await fetchUsers();
      if (selectedUser?._id === userToDelete._id) {
        setSelectedUser(null);
      }
      await fetchTickets();
      await fetchServiceRequests();
      setDeleteModalOpen(false);
      setUserToDelete(null);
    } catch (err) {
      alert(
        "Failed to delete user: " +
          (err.response?.data?.message || "Unknown error")
      );
      console.error(err);
    } finally {
      setDeletingUserId(null);
    }
  };

  const handleUserClick = async (user) => {
    setSelectedUser(user);
    try {
      const response = await api.get(`/users/${user._id}`);
      setSelectedUser(response.data);
    } catch (err) {
      console.error("Failed to fetch user details:", err);
    }
  };

  const fetchTicketDetails = async (ticketId) => {
    try {
      const response = await api.get(`/tickets/${ticketId}`);
      setSelectedTicket(response.data);
      setTickets((prev) =>
        prev.map((t) => (t._id === ticketId ? response.data : t))
      );
    } catch (err) {
      console.error("Failed to fetch ticket details:", err);
    }
  };

  const handleTicketClick = async (ticket) => {
    if (viewMode === "dashboard" || viewMode === "new-tickets") {
      setSelectedTicket(ticket);
      setViewMode("all");
      setActiveTab("tickets");
      if (ticket.status === "New" || ticket.status === "Open") {
        try {
          await api.put(`/tickets/${ticket._id}`, { status: "In Progress" });
          await fetchTickets();
          await fetchTicketDetails(ticket._id);
        } catch (err) {
          console.error("Failed to update ticket status:", err);
          await fetchTicketDetails(ticket._id);
        }
      } else {
        await fetchTicketDetails(ticket._id);
      }
    } else {
      await fetchTicketDetails(ticket._id);
    }
  };

  const fetchServiceRequestDetails = async (requestId) => {
    try {
      const response = await api.get(`/service-requests/${requestId}`);
      setSelectedServiceRequest(response.data);
      setServiceRequests((prev) =>
        prev.map((r) => (r._id === requestId ? response.data : r))
      );
    } catch (err) {
      console.error("Failed to fetch service request details:", err);
    }
  };

  const handleServiceRequestClick = async (request) => {
    if (viewMode === "dashboard" || viewMode === "new-service-requests") {
      setSelectedServiceRequest(request);
      setViewMode("all-service-requests");
      setActiveTab("service-requests");
      if (request.status === "New") {
        try {
          await api.put(`/service-requests/${request._id}`, {
            status: "In Progress",
          });
          await fetchServiceRequests();
          await fetchServiceRequestDetails(request._id);
        } catch (err) {
          console.error("Failed to update service request status:", err);
          await fetchServiceRequestDetails(request._id);
        }
      } else {
        await fetchServiceRequestDetails(request._id);
      }
    } else {
      await fetchServiceRequestDetails(request._id);
    }
  };

  const handleUpdateTicket = async () => {
    if (!selectedTicket) return;

    setErrors((prev) => ({
      ...prev,
      update: "",
      status: "",
      visitDateTime: "",
    }));

    // Only validate visitDateTime if it's being updated
    if (visitDateTime) {
      const selectedDate = new Date(visitDateTime);
      const now = new Date();
      if (selectedDate < now) {
        setErrors((prev) => ({
          ...prev,
          visitDateTime: "Visit time cannot be in the past",
          update: "Please fix the errors before updating",
        }));
        return;
      }
    }

    try {
      setUpdating(true);
      const updateData = {};
      
      // Only update status if it's provided and different from current status
      if (updateStatus && updateStatus !== selectedTicket.status) {
        updateData.status = updateStatus;
      }
      
      // Only update assignedVisitAt if visitDateTime is explicitly set in the form
      // and different from current value
      if (visitDateTime) {
        const currentVisitTime = selectedTicket.assignedVisitAt 
          ? new Date(selectedTicket.assignedVisitAt).toISOString() 
          : null;
        const newVisitTime = new Date(visitDateTime).toISOString();
        
        // Only include in update if the time has actually changed
        if (currentVisitTime !== newVisitTime) {
          updateData.assignedVisitAt = newVisitTime;
        }
      } else if (selectedTicket.assignedVisitAt) {
        // If visitDateTime is not being updated, ensure we don't modify the existing assignedVisitAt
        updateData.assignedVisitAt = selectedTicket.assignedVisitAt;
      }

      if (Object.keys(updateData).length > 0) {
        const response = await api.put(
          `/tickets/${selectedTicket._id}`,
          updateData
        );
        setSelectedTicket(response.data);
        setTickets((prev) =>
          prev.map((t) => (t._id === selectedTicket._id ? response.data : t))
        );
        setErrors((prev) => ({
          ...prev,
          update: "",
          status: "",
          visitDateTime: "",
        }));
        setVisitDateTime(visitDateTime);
      } else {
        setErrors((prev) => ({
          ...prev,
          update: "No changes detected. Please update status or visit time.",
        }));
      }
    } catch (err) {
      console.error("Failed to update ticket:", err);
      const errorMessage =
        err.response?.data?.message ||
        "Failed to update ticket. Please try again.";
      setErrors((prev) => ({
        ...prev,
        update: errorMessage,
      }));
    } finally {
      setUpdating(false);
    }
  };

  const handleAddComment = async () => {
    if (!selectedTicket) return;

    setErrors((prev) => ({ ...prev, comment: "", commentSubmit: "" }));

    if (!newComment.trim()) {
      setErrors((prev) => ({
        ...prev,
        comment: "Comment cannot be empty",
      }));
      return;
    }

    if (newComment.trim().length < 3) {
      setErrors((prev) => ({
        ...prev,
        comment: "Comment must be at least 3 characters long",
      }));
      return;
    }

    try {
      setUpdating(true);
      const response = await api.post(
        `/tickets/${selectedTicket._id}/comments`,
        {
          note: newComment.trim(),
        }
      );
      setSelectedTicket(response.data);
      setNewComment("");
      setTickets((prev) =>
        prev.map((t) => (t._id === selectedTicket._id ? response.data : t))
      );
      setErrors((prev) => ({ ...prev, comment: "", commentSubmit: "" }));
    } catch (err) {
      console.error("Failed to add comment:", err);
      const errorMessage =
        err.response?.data?.message ||
        "Failed to add comment. Please try again.";
      setErrors((prev) => ({
        ...prev,
        commentSubmit: errorMessage,
      }));
    } finally {
      setUpdating(false);
    }
  };

  const handleReply = async (replyMessage, visitDateTime) => {
    if (!selectedTicket) return false;

    try {
      setUpdating(true);

      const updateData = {};
      if (visitDateTime) {
        updateData.assignedVisitAt = new Date(visitDateTime).toISOString();
      }

      const promises = [];

      if (Object.keys(updateData).length > 0) {
        promises.push(api.put(`/tickets/${selectedTicket._id}`, updateData));
      }

      promises.push(
        api.post(`/tickets/${selectedTicket._id}/comments`, {
          note: replyMessage,
        })
      );

      const results = await Promise.all([
        Promise.all(promises),
        new Promise((resolve) => setTimeout(resolve, 2000)),
      ]);

      const response = results[0][promises.length - 1];
      setSelectedTicket(response.data);
      setTickets((prev) =>
        prev.map((t) => (t._id === selectedTicket._id ? response.data : t))
      );

      return true;
    } catch (err) {
      console.error("Failed to send reply:", err);
      alert(
        "Failed to send reply: " +
          (err.response?.data?.message || "Unknown error")
      );
      return false;
    } finally {
      setUpdating(false);
    }
  };

  const handleUpdateServiceRequest = async () => {
    if (!selectedServiceRequest) return;

    setServiceRequestErrors((prev) => ({
      ...prev,
      update: "",
      status: "",
      visitDateTime: "",
    }));

    try {
      setUpdating(true);
      const updateData = {};
      
      // Only update status if it's provided and different from current status
      if (serviceRequestUpdateStatus && serviceRequestUpdateStatus !== selectedServiceRequest.status) {
        updateData.status = serviceRequestUpdateStatus;
      }
      
      // Only update assignedVisitAt if serviceRequestVisitDateTime is explicitly set and different from current value
      if (serviceRequestVisitDateTime) {
        const currentVisitTime = selectedServiceRequest.assignedVisitAt 
          ? new Date(selectedServiceRequest.assignedVisitAt).toISOString() 
          : null;
        const newVisitTime = new Date(serviceRequestVisitDateTime).toISOString();
        
        // Only include in update if the time has actually changed
        if (currentVisitTime !== newVisitTime) {
          updateData.assignedVisitAt = newVisitTime;
        }
      }

      if (Object.keys(updateData).length > 0) {
        const response = await api.put(
          `/service-requests/${selectedServiceRequest._id}`,
          updateData
        );
        setSelectedServiceRequest(response.data);
        setServiceRequests((prev) =>
          prev.map((r) =>
            r._id === selectedServiceRequest._id ? response.data : r
          )
        );
        setServiceRequestErrors((prev) => ({
          ...prev,
          update: "",
          status: "",
          visitDateTime: "",
        }));
        setServiceRequestVisitDateTime(serviceRequestVisitDateTime);
      } else {
        setServiceRequestErrors((prev) => ({
          ...prev,
          update: "No changes detected. Please update status or visit time.",
        }));
      }
    } catch (err) {
      console.error("Failed to update service request:", err);
      const errorMessage =
        err.response?.data?.message ||
        "Failed to update service request. Please try again.";
      setServiceRequestErrors((prev) => ({
        ...prev,
        update: errorMessage,
      }));
    } finally {
      setUpdating(false);
    }
  };

  const handleAddServiceRequestComment = async () => {
    if (!selectedServiceRequest) return;

    setServiceRequestErrors((prev) => ({
      ...prev,
      comment: "",
      commentSubmit: "",
    }));

    if (!serviceRequestNewComment.trim()) {
      setServiceRequestErrors((prev) => ({
        ...prev,
        comment: "Comment cannot be empty",
      }));
      return;
    }

    if (serviceRequestNewComment.trim().length < 3) {
      setServiceRequestErrors((prev) => ({
        ...prev,
        comment: "Comment must be at least 3 characters long",
      }));
      return;
    }

    try {
      setUpdating(true);
      const response = await api.post(
        `/service-requests/${selectedServiceRequest._id}/comments`,
        {
          note: serviceRequestNewComment.trim(),
        }
      );
      setSelectedServiceRequest(response.data);
      setServiceRequestNewComment("");
      setServiceRequests((prev) =>
        prev.map((r) =>
          r._id === selectedServiceRequest._id ? response.data : r
        )
      );
      setServiceRequestErrors((prev) => ({
        ...prev,
        comment: "",
        commentSubmit: "",
      }));
    } catch (err) {
      console.error("Failed to add comment:", err);
      const errorMessage =
        err.response?.data?.message ||
        "Failed to add comment. Please try again.";
      setServiceRequestErrors((prev) => ({
        ...prev,
        commentSubmit: errorMessage,
      }));
    } finally {
      setUpdating(false);
    }
  };

  const handleServiceRequestReply = async (replyMessage, visitDateTime) => {
    if (!selectedServiceRequest) return false;

    try {
      setUpdating(true);

      const updateData = {};
      if (visitDateTime) {
        updateData.assignedVisitAt = new Date(visitDateTime).toISOString();
      }

      const promises = [];

      if (Object.keys(updateData).length > 0) {
        promises.push(
          api.put(`/service-requests/${selectedServiceRequest._id}`, updateData)
        );
      }

      promises.push(
        api.post(`/service-requests/${selectedServiceRequest._id}/comments`, {
          note: replyMessage,
        })
      );

      const results = await Promise.all([
        Promise.all(promises),
        new Promise((resolve) => setTimeout(resolve, 2000)),
      ]);

      const response = results[0][promises.length - 1];
      setSelectedServiceRequest(response.data);
      setServiceRequests((prev) =>
        prev.map((r) =>
          r._id === selectedServiceRequest._id ? response.data : r
        )
      );

      return true;
    } catch (err) {
      console.error("Failed to send reply:", err);
      alert(
        "Failed to send reply: " +
          (err.response?.data?.message || "Unknown error")
      );
      return false;
    } finally {
      setUpdating(false);
    }
  };

  const stats = getTicketStats(tickets);
  const serviceRequestStats = getServiceRequestStats(Array.isArray(serviceRequests) ? serviceRequests : []);

  const newTickets = tickets
    .filter((ticket) => ticket.status === "New" || ticket.status === "Open")
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

  const newServiceRequests = Array.isArray(serviceRequests) 
    ? serviceRequests
        .filter((sr) => sr.status === "New")
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    : [];

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-500 to-slate-100">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-white animate-spin mx-auto mb-4" />
          <div className="text-white text-lg font-medium">
            Loading your field...
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-500 to-slate-100">
      <AdminNavigation
        user={user}
        logout={logout}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onTicketsClick={fetchTickets}
        onUsersClick={fetchUsers}
      />

      {/* Tab Selector - Hidden when viewing all tickets, all service requests, or users */}
      {viewMode !== "all" &&
        viewMode !== "all-service-requests" &&
        activeTab !== "users" && (
          <div className="bg-white border-b border-slate-200 px-6">
            <div className="flex gap-2 items-center">
              <button
                onClick={() => {
                  setActiveTab("tickets");
                  setViewMode("dashboard");
                  fetchTickets();
                }}
                className={`px-4 py-2 font-semibold rounded-t-lg transition-colors relative ${
                  activeTab === "tickets" && viewMode === "dashboard"
                    ? "bg-slate-50 text-slate-900 border-b-2 border-slate-900"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                Dashboard
              </button>
              <button
                onClick={() => {
                  setViewMode("new-tickets");
                  setActiveTab("tickets");
                }}
                className={`px-4 py-2 font-semibold rounded-t-lg transition-colors relative ${
                  viewMode === "new-tickets" && activeTab === "tickets"
                    ? "bg-slate-50 text-slate-900 border-b-2 border-slate-900"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                New Tickets
                {newTickets.length > 0 && (
                  <span className="absolute top-4 right-1 bg-red-500 text-white text-[10px] font-bold rounded-full w-4 h-4 flex items-center justify-center transform translate-x-1/2 -translate-y-1/2">
                    {newTickets.length > 9 ? "9+" : newTickets.length}
                  </span>
                )}
              </button>
              <button
                onClick={() => {
                  setViewMode("new-service-requests");
                  setActiveTab("service-requests");
                }}
                className={`px-4 py-2 font-semibold rounded-t-lg transition-colors relative ${
                  viewMode === "new-service-requests" &&
                  activeTab === "service-requests"
                    ? "bg-slate-50 text-slate-900 border-b-2 border-slate-900"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                New Service Requests
                {newServiceRequests.length > 0 && (
                  <span className="absolute top-4 right-1 bg-red-500 text-white text-[10px] font-bold rounded-full w-4 h-4 flex items-center justify-center transform translate-x-1/2 -translate-y-1/2">
                    {newServiceRequests.length > 9
                      ? "9+"
                      : newServiceRequests.length}
                  </span>
                )}
              </button>
            </div>
          </div>
        )}

      {activeTab === "tickets" && (
        <div>
          {viewMode === "new-tickets" && (
            <div className="p-6">
              <div className="bg-white rounded-2xl border border-slate-200 h-135 shadow-lg p-6 ring-1 ring-slate-100">
                <div className="flex items-center justify-between mb-5">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-500 to-emerald-600 flex items-center justify-center ring-2 ring-emerald-100">
                      <AlertCircle className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold text-slate-900">
                        New Tickets
                      </h2>
                      <p className="text-sm text-slate-600">
                        New tickets requiring attention
                      </p>
                    </div>
                  </div>
                  <span className="px-4 py-2 bg-emerald-100 text-emerald-700 rounded-full text-sm font-semibold">
                    {newTickets.length}{" "}
                    {newTickets.length === 1 ? "Ticket" : "Tickets"}
                  </span>
                </div>

                {newTickets.length === 0 ? (
                  <div className="text-center py-12">
                    <CheckCircle2 className="w-16 h-16 text-slate-300 mx-auto mt-20" />
                    <p className="text-lg font-semibold text-slate-600 ">
                      No new tickets
                    </p>
                    <p className="text-sm text-slate-500 mt-1">
                      All tickets have been processed
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {newTickets.map((ticket) => (
                      <button
                        key={ticket._id}
                        onClick={() => handleTicketClick(ticket)}
                        className="w-full text-left p-5 rounded-xl border-2 border-slate-200 bg-gradient-to-br from-slate-50 to-white hover:border-emerald-400 hover:shadow-lg transition-all group"
                      >
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-3 mb-2 flex-wrap">
                              <h3 className="font-bold text-lg text-slate-900 group-hover:text-emerald-700 transition-colors">
                                {ticket.title}
                                {ticket.userId?.companyName && (
                                  <span className="text-sm font-normal text-slate-600 ml-2">
                                    ({ticket.userId.companyName})
                                  </span>
                                )}
                              </h3>
                              <span
                                className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold border flex-shrink-0 ${getStatusColor(
                                  ticket.status
                                )}`}
                              >
                                {getStatusIcon(ticket.status)}
                                {ticket.status === "Open"
                                  ? "New"
                                  : ticket.status}
                              </span>
                            </div>
                            <p className="text-xs font-mono text-slate-600 mb-2">
                              {ticket.ticketId}
                            </p>
                            <p className="text-sm text-slate-600 line-clamp-2">
                              {ticket.description}
                            </p>
                          </div>
                          <ArrowRight className="w-5 h-5 text-slate-400 group-hover:text-emerald-600 transition-colors flex-shrink-0 ml-4" />
                        </div>
                        <div className="flex items-center justify-between gap-4 pt-3 border-t border-slate-200">
                          <span
                            className={`px-3 py-1 rounded-md text-xs font-medium border ${getCategoryColor(
                              ticket.category
                            )}`}
                          >
                            {ticket.category}
                          </span>
                          <div className="flex items-center gap-2 text-xs text-slate-500">
                            <Calendar className="w-4 h-4" />
                            <span>
                              {new Date(ticket.createdAt).toLocaleDateString(
                                "en-US",
                                {
                                  year: "numeric",
                                  month: "short",
                                  day: "numeric",
                                  hour: "2-digit",
                                  minute: "2-digit",
                                }
                              )}
                            </span>
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {viewMode === "dashboard" && (
            <div className="p-6 overflow-x-hidden">
              <div className="mb-6 grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-white rounded-2xl border border-slate-200 shadow-lg p-6 h-52 ring-1 ring-slate-100">
                  <h2 className="text-2xl font-bold text-slate-900 mb-4">
                    Ticket Statistics
                  </h2>
                  <TicketStats stats={stats} />
                  <div className="mt-4 pt-4 border-t border-slate-200">
                    <div className="flex items-center gap-2">
                      <TicketIcon className="w-5 h-5 text-slate-600" />
                      <span className="text-sm font-semibold text-slate-700">
                        Total Tickets:
                      </span>
                      <span className="text-lg font-bold text-slate-900">
                        {stats.total}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-2xl border border-slate-200 shadow-lg p-6 ring-1 h-52 ring-slate-100">
                  <h2 className="text-2xl font-bold text-slate-900 mb-4">
                    Service Request Statistics
                  </h2>
                  <div className="grid grid-cols-3 gap-2">
                    <div className="bg-gradient-to-br from-emerald-50 to-emerald-100/50 border border-emerald-200 rounded-lg p-2.5">
                      <div className="flex items-center gap-1.5 mb-1.5">
                        <AlertCircle className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0" />
                        <span className="text-xs text-emerald-700 font-medium">
                          New
                        </span>
                      </div>
                      <p className="text-lg font-bold text-emerald-900">
                        {serviceRequestStats.new}
                      </p>
                    </div>
                    <div className="bg-gradient-to-br from-blue-50 to-blue-100/50 border border-blue-200 rounded-lg p-2.5">
                      <div className="flex items-center gap-1.5 mb-1.5">
                        <Loader2 className="w-3.5 h-3.5 text-blue-600 flex-shrink-0" />
                        <span className="text-xs text-blue-700 font-medium">
                          In Progress
                        </span>
                      </div>
                      <p className="text-lg font-bold text-blue-900">
                        {serviceRequestStats.inProgress}
                      </p>
                    </div>
                    <div className="bg-gradient-to-br from-green-50 to-green-100/50 border border-green-200 rounded-lg p-2.5">
                      <div className="flex items-center gap-1.5 mb-1.5">
                        <CheckCircle2 className="w-3.5 h-3.5 text-green-600 flex-shrink-0" />
                        <span className="text-xs text-green-700 font-medium">
                          Completed
                        </span>
                      </div>
                      <p className="text-lg font-bold text-green-900">
                        {serviceRequestStats.completed}
                      </p>
                    </div>
                  </div>
                  <div className="mt-4 pt-4 border-t border-slate-200">
                    <div className="flex items-center gap-2">
                      <TicketIcon className="w-5 h-5 text-slate-600" />
                      <span className="text-sm font-semibold text-slate-700">
                        Total Service Requests:
                      </span>
                      <span className="text-lg font-bold text-slate-900">
                        {serviceRequestStats.total}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-1">
                  <div className="bg-white rounded-2xl border border-slate-200 shadow-lg p-6 ring-1 ring-slate-100">
                    <h2 className="text-xl font-bold text-slate-900 mb-4">
                      Quick Actions
                    </h2>
                    <div className="flex flex-col gap-3">
                      <button
                        onClick={() => {
                          setViewMode("all");
                          setActiveTab("tickets");
                        }}
                        className="flex items-center gap-2 px-6 py-3 bg-gradient-to-br from-slate-600 to-slate-700 text-white rounded-xl font-semibold hover:from-slate-700 hover:to-slate-800 transition-all shadow-lg hover:shadow-xl"
                      >
                        <List className="w-5 h-5" />
                        All Tickets
                      </button>
                      <button
                        onClick={() => {
                          setActiveTab("service-requests");
                          setViewMode("all-service-requests");
                          fetchServiceRequests();
                        }}
                        className="flex items-center gap-2 px-6 py-3 bg-gradient-to-br from-purple-600 to-purple-700 text-white rounded-xl font-semibold hover:from-purple-700 hover:to-purple-800 transition-all shadow-lg hover:shadow-xl"
                      >
                        <List className="w-5 h-5" />
                        All Service Requests
                      </button>
                      <button
                        onClick={() => {
                          setActiveTab("users");
                          fetchUsers();
                        }}
                        className="flex items-center gap-2 px-6 py-3 bg-gradient-to-br from-blue-600 to-blue-700 text-white rounded-xl font-semibold hover:from-blue-700 hover:to-blue-800 transition-all shadow-lg hover:shadow-xl"
                      >
                        <Users className="w-5 h-5" />
                        Users
                      </button>
                      <button
                        onClick={() => {
                          fetchTickets();
                          fetchServiceRequests();
                        }}
                        className="flex items-center gap-2 px-6 py-3 bg-gradient-to-br from-indigo-600 to-indigo-700 text-white rounded-xl font-semibold hover:from-indigo-700 hover:to-indigo-800 transition-all shadow-lg hover:shadow-xl"
                      >
                        <AlertCircle className="w-5 h-5" />
                        Refresh Data
                      </button>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-2xl border border-slate-200 shadow-lg p-6 ring-1 ring-slate-100 h-80 flex flex-col">
                  <VisitCalendar
                    tickets={tickets}
                    serviceRequests={serviceRequests}
                    onEventSelect={setSelectedVisit}
                  />
                </div>

                {/* Event Details Panel */}
                <div className="lg:col-span-1">
                  <div className="bg-white rounded-2xl border border-slate-200 shadow-lg p-6 ring-1 ring-slate-100 h-80 flex flex-col">
                    <div className="flex items-start justify-between mb-4">
                      <h2 className="text-xl font-bold text-slate-900">
                        Visit Details
                      </h2>
                      {selectedVisit && selectedVisit.visits && selectedVisit.visits.length > 0 && (
                        <button
                          type="button"
                          onClick={() => setSelectedVisit(null)}
                          className="inline-flex items-center gap-1 text-sm text-slate-600 hover:text-slate-800 hover:bg-slate-100 px-3 py-1.5 rounded-lg transition-colors"
                          aria-label="Close visit details"
                        >
                          <XCircle className="w-4 h-4" />
                          Close
                        </button>
                      )}
                    </div>
                    {selectedVisit ? (
                      <div className="flex-1 flex flex-col min-h-0">
                        {/* Color Legend */}
                        <div className="flex items-center gap-4 text-xs text-slate-700 pb-2 flex-shrink-0">
                          <div className="flex items-center gap-1.5">
                            <span className="w-3 h-3 rounded-full bg-blue-600 inline-block"></span>
                            <span className="font-medium">Ticket</span>
                          </div>
                          <div className="flex items-center gap-1.5">
                            <span className="w-3 h-3 rounded-full bg-fuchsia-600 inline-block"></span>
                            <span className="font-medium">Service Request</span>
                          </div>
                        </div>
                        {selectedVisit.visits &&
                        selectedVisit.visits.length > 0 ? (
                          <div className="flex-1 overflow-y-auto space-y-3 pr-1 min-h-0">
                            {selectedVisit.visits.map((visit, index) => (
                              <div
                                key={index}
                                onClick={() => {
                                  if (visit.type === 'ticket') {
                                    handleTicketClick({ _id: visit._id, ...visit });
                                  } else {
                                    handleServiceRequestClick({ _id: visit._id, ...visit });
                                  }
                                }}
                                className={`p-4 rounded-lg border cursor-pointer hover:shadow-md transition-all ${
                                  visit.type === "ticket"
                                    ? "bg-blue-100 border-blue-300/80 hover:bg-blue-200"
                                    : "bg-fuchsia-100 border-fuchsia-300/80 hover:bg-fuchsia-200"
                                }`}
                              >
                                <div className="flex justify-between items-start mb-2">
                                  <h3 className="font-semibold text-slate-900">
                                    {visit.category} Category
                                  </h3>
                                  <span
                                    className={`px-2 py-1 rounded text-xs font-medium ${
                                      visit.type === "ticket"
                                        ? "bg-blue-600 text-white"
                                        : "bg-fuchsia-600 text-white"
                                    }`}
                                  >
                                    {visit.type === "ticket"
                                      ? "Ticket"
                                      : "Service Request"}
                                  </span>
                                </div>
                                <p className="text-xs text-slate-600 mt-1 font-mono mb-2">
                                  {visit.type === "ticket"
                                    ? `Ticket ID: ${visit.ticketId}`
                                    : `Service ID: ${visit.requestId}`}
                                </p>
                                <div className="mt-2 space-y-2">
                                  <div className="flex items-center gap-2 text-sm">
                                    <Building2 className="w-4 h-4 text-slate-600 flex-shrink-0" />
                                    <span className="font-semibold text-slate-800">
                                      {visit.userId?.companyName ||
                                        visit.companyName ||
                                        "Company N/A"}
                                    </span>
                                  </div>
                                  <div className="flex items-center gap-2 text-xs text-slate-700 ml-0">
                                    <User className="w-3.5 h-3.5 text-slate-600 flex-shrink-0" />
                                    <span>
                                      {visit.userId?.name ||
                                        visit.userName ||
                                        "User N/A"}
                                    </span>
                                  </div>
                                  <div className="flex items-start gap-2 text-xs text-slate-700 ml-0">
                                    <FileText className="w-3.5 h-3.5 text-slate-600 flex-shrink-0 mt-0.5" />
                                    <span>Issue: {visit.title || "N/A"}</span>
                                  </div>
                                  <div className="flex items-center gap-2 text-xs text-slate-600 ml-0">
                                    <Clock className="w-3.5 h-3.5 text-slate-600 flex-shrink-0" />
                                    <span>Scheduled for this visit</span>
                                  </div>
                                  <div className="flex items-center gap-2 text-xs font-bold text-slate-600 ml-0">
                                    <Calendar className="w-3.5 h-3.5 text-slate-600 font-bold flex-shrink-0" />
                                    {visit.visitTime &&
                                    !isNaN(
                                      new Date(visit.visitTime).getTime()
                                    ) ? (
                                      <span>
                                        {new Date(
                                          visit.visitTime
                                        ).toLocaleDateString("en-US", {
                                          year: "numeric",
                                          month: "short",
                                          day: "numeric",
                                        })}{" "}
                                        •{" "}
                                        {new Date(
                                          visit.visitTime
                                        ).toLocaleTimeString([], {
                                          hour: "2-digit",
                                          minute: "2-digit",
                                        })}
                                        {getSlotLabel(visit.visitTime)
                                          ? ` • ${getSlotLabel(
                                              visit.visitTime
                                            )}`
                                          : ""}
                                      </span>
                                    ) : (
                                      <span>No scheduled time</span>
                                    )}
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <div className="text-center py-8">
                            <Calendar className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                            <p className="text-sm text-slate-600">
                              No visits scheduled for this date
                            </p>
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="text-center py-12">
                        <Calendar className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                        <p className="text-lg font-semibold text-slate-600">
                          No visit selected
                        </p>
                        <p className="text-sm text-slate-500 mt-1">
                          Click on a date with visits to see details
                        </p>
                        <div className="mt-auto pt-3 pb-2 flex items-center gap-6 text-xs text-slate-800 mt-2">
                          <div className="flex items-center gap-2 mt-6">
                            <span className="w-3 h-3 rounded-full bg-blue-600 inline-block"></span>
                            <span className="font-medium">Ticket</span>
                          </div>
                          <div className="flex items-center gap-2 mt-6">
                            <span className="w-3 h-3 rounded-full bg-fuchsia-600 inline-block"></span>
                            <span className="font-medium">Service Request</span>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {viewMode === "all" && (
            <div className="flex h-[calc(100vh-4rem)] gap-0 w-full">
              <div className="w-[32rem] flex-shrink-0 flex flex-col border-r border-slate-200 bg-slate-50">
                <div className="flex-1 overflow-hidden">
                  <TicketListPanel
                    tickets={tickets}
                    searchTerm={searchTerm}
                    setSearchTerm={setSearchTerm}
                    statusFilter={statusFilter}
                    setStatusFilter={setStatusFilter}
                    selectedTicket={selectedTicket}
                    onTicketClick={handleTicketClick}
                    error={error}
                    onBackToDashboard={() => {
                      setViewMode("dashboard");
                      setActiveTab("tickets");
                    }}
                  />
                </div>
              </div>
              <div className="flex-1 overflow-y-auto bg-slate-50 h-[calc(100vh-4rem)]">
                {selectedTicket ? (
                  <TicketDetailsPanel
                    ticket={selectedTicket}
                    user={user}
                    updateStatus={updateStatus}
                    setUpdateStatus={setUpdateStatus}
                    visitDateTime={visitDateTime}
                    setVisitDateTime={setVisitDateTime}
                    newComment={newComment}
                    setNewComment={setNewComment}
                    errors={errors}
                    setErrors={setErrors}
                    updating={updating}
                    onUpdateTicket={handleUpdateTicket}
                    onAddComment={handleAddComment}
                    showReplyModal={showReplyModal}
                    setShowReplyModal={setShowReplyModal}
                    onReply={handleReply}
                  />
                ) : (
                  <div className="bg-white rounded-2xl border border-slate-200 shadow-lg p-8 m-6 flex items-center justify-center h-full">
                    <div className="text-center">
                      <TicketIcon className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                      <p className="text-lg font-semibold text-slate-600">
                        Select a ticket to view details
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

        </div>
      )}

      {activeTab === "users" && (
        <div className="flex h-[calc(100vh-4rem)] gap-0">
          <UserListPanel
            users={users}
            userSearchTerm={userSearchTerm}
            setUserSearchTerm={setUserSearchTerm}
            selectedUser={selectedUser}
            onUserClick={handleUserClick}
            loading={usersLoading}
            onBackToDashboard={() => {
              setActiveTab("tickets");
              setViewMode("dashboard");
            }}
            onRefresh={fetchUsers}
          />
          <div className="flex-1 flex flex-col overflow-hidden bg-gradient-to-br from-slate-50 to-slate-100 h-[calc(100vh-4rem)]">
            <div className="flex-1 overflow-y-auto">
              <UserDetailsPanel
                user={selectedUser}
                onDelete={openDeleteUserModal}
                deleting={deletingUserId}
              />
            </div>
          </div>
        </div>
      )}

      {activeTab === "service-requests" && (
        <div>
          {viewMode === "new-service-requests" && (
            <div className="p-6">
              <div className="bg-white rounded-2xl border border-slate-200 shadow-lg p-6 ring-1 ring-slate-100 h-135">
                <div className="flex items-center justify-between mb-5">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-500 to-amber-600 flex items-center justify-center ring-2 ring-amber-100">
                      <AlertCircle className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold text-slate-900">
                        New Service Requests
                      </h2>
                      <p className="text-sm text-slate-600">
                        New service requests requiring attention
                      </p>
                    </div>
                  </div>
                  <span className="px-4 py-2 bg-amber-100 text-amber-700 rounded-full text-sm font-semibold">
                    {newServiceRequests.length}{" "}
                    {newServiceRequests.length === 1 ? "Request" : "Requests"}
                  </span>
                </div>

                {newServiceRequests.length === 0 ? (
                  <div className="text-center py-12">
                    <CheckCircle2 className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                    <p className="text-lg font-semibold text-slate-600">
                      No new service requests
                    </p>
                    <p className="text-sm text-slate-500 mt-1">
                      All service requests have been processed
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {newServiceRequests.map((request) => (
                      <button
                        key={request._id}
                        onClick={() => handleServiceRequestClick(request)}
                        className="w-full text-left p-5 rounded-xl border-2 border-slate-200 bg-gradient-to-br from-slate-50 to-white hover:border-amber-400 hover:shadow-lg transition-all group"
                      >
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-3 mb-2 flex-wrap">
                              <h3 className="font-bold text-lg text-slate-900 group-hover:text-amber-700 transition-colors">
                                {request.title}
                                {request.userId?.companyName && (
                                  <span className="text-sm font-normal text-slate-600 ml-2">
                                    ({request.userId.companyName})
                                  </span>
                                )}
                              </h3>
                              <span
                                className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold border flex-shrink-0 ${
                                  request.status === "New"
                                    ? "bg-emerald-100 text-emerald-700 border-emerald-300"
                                    : "bg-slate-100 text-slate-700 border-slate-300"
                                }`}
                              >
                                {request.status}
                              </span>
                            </div>
                            <p className="text-xs font-mono text-slate-600 mb-2">
                              {request.requestId}
                            </p>
                            <p className="text-sm text-slate-600 line-clamp-2">
                              {request.description}
                            </p>
                          </div>
                          <ArrowRight className="w-5 h-5 text-slate-400 group-hover:text-amber-600 transition-colors flex-shrink-0 ml-4" />
                        </div>
                        <div className="flex items-center justify-between gap-4 pt-3 border-t border-slate-200">
                          <span
                            className={`px-3 py-1 rounded-md text-xs font-medium border ${getCategoryColor(
                              request.category
                            )}`}
                          >
                            {request.category}
                          </span>
                          <div className="flex items-center gap-2 text-xs text-slate-500">
                            <Calendar className="w-4 h-4" />
                            <span>
                              {new Date(request.createdAt).toLocaleDateString(
                                "en-US",
                                {
                                  year: "numeric",
                                  month: "short",
                                  day: "numeric",
                                  hour: "2-digit",
                                  minute: "2-digit",
                                }
                              )}
                            </span>
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {viewMode === "dashboard" && (
            <div className="p-6">
              <div className="bg-white rounded-2xl border border-slate-200 shadow-lg p-6">
                <h2 className="text-2xl font-bold text-slate-900 mb-4">
                  Service Requests
                </h2>

                {serviceRequestsLoading ? (
                  <div className="text-center py-8">
                    <Loader2 className="w-8 h-8 text-slate-400 animate-spin mx-auto mb-2" />
                    <p className="text-slate-600">
                      Loading service requests...
                    </p>
                  </div>
                ) : serviceRequests.length === 0 ? (
                  <div className="text-center py-12">
                    <p className="text-lg font-semibold text-slate-600">
                      No service requests found
                    </p>
                    <p className="text-sm text-slate-500 mt-1">
                      Service requests will appear here once created
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {serviceRequests.map((request) => (
                      <div
                        key={request._id}
                        className="p-4 rounded-lg border border-slate-200 bg-slate-50 hover:border-slate-400 hover:shadow-sm transition-all"
                      >
                        <div className="flex items-start justify-between gap-2 mb-2">
                          <div className="flex-1 min-w-0">
                            <h3 className="font-semibold text-slate-900 text-sm mb-1">
                              {request.title}
                              {request.userId?.companyName && (
                                <span className="text-sm font-normal text-slate-600 ml-2">
                                  ({request.userId.companyName})
                                </span>
                              )}
                            </h3>
                            <p className="text-xs font-mono text-slate-600">
                              {request.requestId}
                            </p>
                          </div>
                          <span
                            className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold border ${
                              request.status === "New"
                                ? "bg-emerald-100 text-emerald-700 border-emerald-300"
                                : request.status === "In Progress"
                                ? "bg-blue-100 text-blue-700 border-blue-300"
                                : request.status === "Completed"
                                ? "bg-green-100 text-green-700 border-green-300"
                                : "bg-red-100 text-red-700 border-red-300"
                            }`}
                          >
                            {request.status}
                          </span>
                        </div>
                        <p className="text-xs text-slate-600 line-clamp-2 mb-2">
                          {request.description}
                        </p>
                        <div className="flex items-center justify-between gap-2 pt-2 border-t border-slate-100">
                          <span className="px-2 py-0.5 rounded text-xs font-medium border bg-slate-100 text-slate-700">
                            {request.category}
                          </span>
                          <div className="flex items-center gap-1 text-xs text-slate-500">
                            <Calendar className="w-3 h-3" />
                            <span>
                              {new Date(request.createdAt).toLocaleDateString()}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {viewMode === "all-service-requests" && (
            <div className="flex h-[calc(100vh-4rem)] gap-0 w-full">
              <div className="w-[32rem] flex-shrink-0 flex flex-col border-r border-slate-200 bg-slate-50">
                <div className="flex-1 overflow-hidden">
                  <ServiceRequestListPanel
                    serviceRequests={serviceRequests}
                    searchTerm={serviceRequestSearchTerm}
                    setSearchTerm={setServiceRequestSearchTerm}
                    statusFilter={serviceRequestStatusFilter}
                    setStatusFilter={setServiceRequestStatusFilter}
                    selectedServiceRequest={selectedServiceRequest}
                    onServiceRequestClick={handleServiceRequestClick}
                    error={error}
                    onBackToDashboard={() => {
                      setViewMode("dashboard");
                      setActiveTab("tickets");
                    }}
                  />
                </div>
              </div>
              <div className="flex-1 overflow-y-auto bg-slate-50 h-[calc(100vh-4rem)]">
                {selectedServiceRequest ? (
                  <ServiceRequestDetailsPanel
                    serviceRequest={selectedServiceRequest}
                    user={user}
                    updateStatus={serviceRequestUpdateStatus}
                    setUpdateStatus={setServiceRequestUpdateStatus}
                    visitDateTime={serviceRequestVisitDateTime}
                    setVisitDateTime={setServiceRequestVisitDateTime}
                    newComment={serviceRequestNewComment}
                    setNewComment={setServiceRequestNewComment}
                    errors={serviceRequestErrors}
                    setErrors={setServiceRequestErrors}
                    updating={updating}
                    onUpdateServiceRequest={handleUpdateServiceRequest}
                    onAddComment={handleAddServiceRequestComment}
                    showReplyModal={showServiceRequestReplyModal}
                    setShowReplyModal={setShowServiceRequestReplyModal}
                    onReply={handleServiceRequestReply}
                  />
                ) : (
                  <div className="bg-white rounded-2xl border border-slate-200 shadow-lg p-8 m-6 flex items-center justify-center h-full">
                    <div className="text-center">
                      <TicketIcon className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                      <p className="text-lg font-semibold text-slate-600">
                        Select a service request to view details
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {deleteModalOpen && userToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full border border-slate-200 p-6 space-y-4">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="text-xl font-bold text-slate-900">
                  Delete User
                </h3>
                <p className="text-sm text-slate-600 mt-1">
                  This will delete{" "}
                  <span className="font-semibold">{userToDelete.name}</span> and
                  all their tickets and service requests permanently.
                </p>
              </div>
              <button
                onClick={() => {
                  setDeleteModalOpen(false);
                  setUserToDelete(null);
                }}
                className="text-slate-500 hover:text-slate-700"
              >
                <XCircle className="w-5 h-5" />
              </button>
            </div>
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 text-sm text-amber-800">
              This action cannot be undone. All associated tickets, service
              requests, and visit data for this user will be removed.
            </div>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => {
                  setDeleteModalOpen(false);
                  setUserToDelete(null);
                }}
                className="px-4 py-2 rounded-lg border border-slate-200 text-slate-700 hover:bg-slate-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteUser}
                disabled={deletingUserId === userToDelete._id}
                className="px-4 py-2 rounded-lg bg-red-600 text-white hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed inline-flex items-center gap-2"
              >
                {deletingUserId === userToDelete._id ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Deleting...
                  </>
                ) : (
                  <>Delete</>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminPortal;
