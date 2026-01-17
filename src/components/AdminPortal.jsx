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
  LayoutDashboard,
  Settings as SettingsIcon,
  Navigation,
  Zap,
  Info,
} from "lucide-react";
import LoadingState from "./common/LoadingState";
import SuccessState from "./common/SuccessState";

import AdminNavigation from "./admin/AdminNavigation";
import SettingsPanel from "./admin/SettingsPanel";
import TicketListPanel from "./admin/TicketListPanel";
import TicketDetailsPanel from "./admin/TicketDetailsPanel";
import ServiceRequestListPanel from "./admin/ServiceRequestListPanel";
import ServiceRequestDetailsPanel from "./admin/ServiceRequestDetailsPanel";
import UserListPanel from "./admin/UserListPanel";
import UserDetailsPanel from "./admin/UserDetailsPanel";
import TicketStats from "./admin/TicketStats";
import ServiceRequestStats from "./admin/ServiceRequestStats";
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
  const [activeTab, setActiveTab] = useState("dashboard");
  const [viewMode, setViewMode] = useState("dashboard");
  const [tickets, setTickets] = useState([]);
  const [serviceRequests, setServiceRequests] = useState([]);
  const [users, setUsers] = useState([]);
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [selectedServiceRequest, setSelectedServiceRequest] = useState(null);
  const [selectedUser, setSelectedUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showSuccess, setShowSuccess] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
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
  const [ticketToDelete, setTicketToDelete] = useState(null);
  const [serviceRequestToDelete, setServiceRequestToDelete] = useState(null);
  const [deleteTicketModalOpen, setDeleteTicketModalOpen] = useState(false);
  const [deleteServiceRequestModalOpen, setDeleteServiceRequestModalOpen] = useState(false);
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

    // Start polling for real-time updates every 2 seconds
    const pollInterval = setInterval(() => {
      fetchTickets(false, true);
      fetchServiceRequests(true);
    }, 2000);

    return () => clearInterval(pollInterval);
  }, [user, navigate]);

  useEffect(() => {
    if (activeTab === "users") {
      fetchUsers();
      setSelectedTicket(null);
      setSelectedServiceRequest(null);
    } else if (activeTab === "service-requests") {
      fetchServiceRequests();
      setSelectedTicket(null);
    } else if (activeTab === "tickets") {
      fetchTickets();
      setSelectedServiceRequest(null);
    } else if (activeTab === "dashboard") {
      fetchTickets();
      fetchServiceRequests();
    } else if (activeTab === "settings") {
      setSelectedTicket(null);
      setSelectedServiceRequest(null);
      setSelectedUser(null);
    }
  }, [activeTab]);

  useEffect(() => {
    if (selectedTicket) {
      setUpdateStatus(selectedTicket.status);
      setVisitDateTime(
        selectedTicket.assignedVisitAt
          ? (() => {
            const d = new Date(selectedTicket.assignedVisitAt);
            d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
            return d.toISOString().slice(0, 16);
          })()
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
          ? (() => {
            const d = new Date(selectedServiceRequest.assignedVisitAt);
            d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
            return d.toISOString().slice(0, 16);
          })()
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

  const fetchTickets = async (markAsViewed = false, silent = false) => {
    try {
      if (!silent) setLoading(true);
      const response = await api.get("/tickets?showAll=true");
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
      if (!silent) setError("Failed to load tickets");
      console.error(err);
    } finally {
      if (!silent) setLoading(false);
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

  const fetchServiceRequests = async (silent = false) => {
    try {
      if (!silent) setServiceRequestsLoading(true);
      const response = await api.get("/service-requests");
      // Handle the paginated response
      const serviceRequestsData = response.data.requests || [];
      setServiceRequests(serviceRequestsData);
      setError("");
    } catch (err) {
      if (!silent) setError("Failed to load service requests");
      console.error(err);
    } finally {
      if (!silent) setServiceRequestsLoading(false);
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

  const handleDeleteTicket = async () => {
    if (!ticketToDelete) return;
    try {
      await api.delete(`/tickets/${ticketToDelete._id}`);
      await fetchTickets();
      if (selectedTicket?._id === ticketToDelete._id) {
        setSelectedTicket(null);
      }
      setDeleteTicketModalOpen(false);
      setTicketToDelete(null);
    } catch (err) {
      alert(
        "Failed to delete ticket: " +
        (err.response?.data?.message || "Unknown error")
      );
      console.error(err);
    }
  };

  const handleDeleteServiceRequest = async () => {
    if (!serviceRequestToDelete) return;
    try {
      await api.delete(`/service-requests/${serviceRequestToDelete._id}`);
      await fetchServiceRequests();
      if (selectedServiceRequest?._id === serviceRequestToDelete._id) {
        setSelectedServiceRequest(null);
      }
      setDeleteServiceRequestModalOpen(false);
      setServiceRequestToDelete(null);
    } catch (err) {
      alert(
        "Failed to delete service request: " +
        (err.response?.data?.message || "Unknown error")
      );
      console.error(err);
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

        if (updateData.assignedVisitAt) {
          setSuccessMessage("Visit timing has been assigned successfully!");
        } else {
          setSuccessMessage("Ticket updated successfully!");
        }
        setShowSuccess(true);
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

  const handleReply = async (replyMessage, visitDateTime, images = []) => {
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

      // Create FormData for comment with images
      const formData = new FormData();
      formData.append('note', replyMessage);
      if (images && images.length > 0) {
        images.forEach((image) => {
          formData.append('images', image);
        });
      }

      promises.push(
        api.post(`/tickets/${selectedTicket._id}/comments`, formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
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

      setSuccessMessage(visitDateTime ? "Reply sent & visit timing assigned!" : "Reply sent successfully!");
      setShowSuccess(true);

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

        if (updateData.assignedVisitAt) {
          setSuccessMessage("Service visit timing has been assigned!");
        } else {
          setSuccessMessage("Service request updated successfully!");
        }
        setShowSuccess(true);
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

  const handleServiceRequestReply = async (replyMessage, visitDateTime, images = []) => {
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

      // Create FormData for comment with images
      const formData = new FormData();
      formData.append('note', replyMessage);
      if (images && images.length > 0) {
        images.forEach((image) => {
          formData.append('images', image);
        });
      }

      promises.push(
        api.post(`/service-requests/${selectedServiceRequest._id}/comments`, formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
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

      setSuccessMessage(visitDateTime ? "Service reply sent & timing assigned!" : "Service reply sent successfully!");
      setShowSuccess(true);

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

  // if (loading) block removed to allow skeleton loading states


  return (
    <div className="fixed inset-0 h-screen w-screen flex flex-col bg-slate-950 overflow-hidden lg:overflow-hidden">
      {showSuccess && (
        <SuccessState
          title="Update Successful"
          message={successMessage}
          onComplete={() => setShowSuccess(false)}
        />
      )}
      {/* Background gradients */}
      <div className="fixed top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0">
        <div className="absolute inset-0 bg-grid-white-pattern opacity-30" />
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-blue-600/5 blur-[80px]" />
        <div className="absolute top-[20%] right-[-5%] w-[30%] h-[30%] rounded-full bg-violet-600/5 blur-[80px]" />
        <div className="absolute bottom-[-10%] left-[20%] w-[30%] h-[30%] rounded-full bg-cyan-600/5 blur-[80px]" />
      </div>
      <AdminNavigation
        user={user}
        logout={logout}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onDashboardClick={() => {
          setViewMode("dashboard");
          setActiveTab("dashboard");
        }}
        onTicketsClick={() => {
          setViewMode("all");
          setActiveTab("tickets");
          fetchTickets();
        }}
        onUsersClick={() => {
          setActiveTab("users");
          fetchUsers();
        }}
        onSettingsClick={() => {
          setActiveTab("settings");
        }}
      />

      {/* Main Content Area - Scrollable */}
      <div className="flex-1 overflow-y-auto lg:overflow-hidden flex flex-col relative z-10">

        {/* Tab Selector - Hidden when viewing all tickets, all service requests, or users */}
        {viewMode !== "all" &&
          viewMode !== "all-service-requests" &&
          activeTab !== "users" &&
          activeTab !== "settings" && (
            <div className="px-6 pt-4 relative z-10 flex justify-center">
              <div className="inline-flex bg-slate-900/60 p-1.5 rounded-2xl border border-white/10 backdrop-blur-2xl shadow-2xl items-center">
                <button
                  onClick={() => {
                    setViewMode("dashboard");
                    setActiveTab("dashboard");
                    fetchTickets();
                  }}
                  className={`px-6 py-2 text-xs font-bold tracking-tight rounded-xl relative flex items-center gap-2.5 ${(activeTab === "tickets" || activeTab === "dashboard") && viewMode === "dashboard"
                    ? "bg-blue-600 text-white shadow-[0_0_20px_rgba(37,99,235,0.4)] scale-105"
                    : "text-slate-400 hover:text-white hover:bg-white/5"
                    }`}
                >
                  <LayoutDashboard className={`w-4 h-4 ${((activeTab === "tickets" || activeTab === "dashboard") && viewMode === "dashboard") ? "scale-110" : "group-hover:scale-110"}`} />
                  <span>Dashboard</span>
                </button>

                <div className="w-px h-4 bg-white/10 mx-1" />

                <button
                  onClick={() => {
                    setViewMode("new-tickets");
                    setActiveTab("tickets");
                  }}
                  className={`px-6 py-2 text-xs font-bold tracking-tight rounded-xl relative flex items-center gap-2.5 ${viewMode === "new-tickets" && activeTab === "tickets"
                    ? "bg-blue-600 text-white shadow-[0_0_20px_rgba(37,99,235,0.4)] scale-105"
                    : "text-slate-400 hover:text-white hover:bg-white/5"
                    }`}
                >
                  <TicketIcon className={`w-4 h-4 ${(viewMode === "new-tickets" && activeTab === "tickets") ? "scale-110" : "group-hover:scale-110"}`} />
                  <span>New Tickets</span>
                  {newTickets.length > 0 && (
                    <span className={`text-[10px] font-black rounded-full px-2 py-0.5 min-w-[20px] text-center ${viewMode === "new-tickets" && activeTab === "tickets"
                      ? "bg-white text-blue-600 shadow-sm"
                      : "bg-red-500 text-white"
                      }`}>
                      {newTickets.length > 9 ? "9+" : newTickets.length}
                    </span>
                  )}
                </button>

                <div className="w-px h-4 bg-white/10 mx-1" />

                <button
                  onClick={() => {
                    setViewMode("new-service-requests");
                    setActiveTab("service-requests");
                  }}
                  className={`px-6 py-2 text-xs font-bold tracking-tight rounded-xl relative flex items-center gap-2.5 ${viewMode === "new-service-requests" &&
                    activeTab === "service-requests"
                    ? "bg-blue-600 text-white shadow-[0_0_20px_rgba(37,99,235,0.4)] scale-105"
                    : "text-slate-400 hover:text-white hover:bg-white/5"
                    }`}
                >
                  <FileText className={`w-4 h-4 ${(viewMode === "new-service-requests" && activeTab === "service-requests") ? "scale-110" : "group-hover:scale-110"}`} />
                  <span>New Service Requests</span>
                  {newServiceRequests.length > 0 && (
                    <span className={`text-[10px] font-black rounded-full px-2 py-0.5 min-w-[20px] text-center ${viewMode === "new-service-requests" && activeTab === "service-requests"
                      ? "bg-white text-blue-600 shadow-sm"
                      : "bg-red-500 text-white"
                      }`}>
                      {newServiceRequests.length > 9
                        ? "9+"
                        : newServiceRequests.length}
                    </span>
                  )}
                </button>

                <div className="w-px h-4 bg-white/10 mx-1" />

                <button
                  onClick={() => {
                    setActiveTab("settings");
                  }}
                  className={`px-6 py-2 text-xs font-bold tracking-tight rounded-xl relative flex items-center gap-2.5 ${activeTab === "settings"
                    ? "bg-blue-600 text-white shadow-[0_0_20px_rgba(37,99,235,0.4)] scale-105"
                    : "text-slate-400 hover:text-white hover:bg-white/5"
                    }`}
                >
                  <SettingsIcon className={`w-4 h-4 ${activeTab === "settings" ? "scale-110" : "group-hover:scale-110"}`} />
                  <span>Settings</span>
                </button>
              </div>
            </div>
          )}

        {activeTab === "settings" && (
          <div className="flex-1 flex items-center justify-center p-6 overflow-hidden">
            <SettingsPanel onClose={() => {
              setActiveTab("dashboard");
              setViewMode("dashboard");
            }} />
          </div>
        )}

        {(activeTab === "tickets" || activeTab === "dashboard") && (
          <div className="flex-1 flex flex-col min-h-0">
            {viewMode === "new-tickets" && (
              <div className="p-6">
                <div className="glass-card rounded-2xl border border-slate-700/50 shadow-xl p-6 bg-slate-900/60 backdrop-blur-xl min-h-[500px]">
                  <div className="flex items-center justify-between mb-5">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-500 to-emerald-600 flex items-center justify-center shadow-lg shadow-emerald-500/20">
                        <AlertCircle className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <h2 className="text-2xl font-bold text-white tracking-tight">
                          New Tickets
                        </h2>
                        <p className="text-sm text-slate-400">
                          New tickets requiring attention
                        </p>
                      </div>
                    </div>
                    <span className="px-4 py-2 bg-emerald-500/10 text-emerald-400 rounded-full text-sm font-bold border border-emerald-500/20">
                      {newTickets.length}{" "}
                      {newTickets.length === 1 ? "Ticket" : "Tickets"}
                    </span>
                  </div>

                  {newTickets.length === 0 ? (
                    <div className="text-center py-12">
                      <CheckCircle2 className="w-16 h-16 text-slate-600 mx-auto mb-4" />
                      <p className="text-lg font-bold text-slate-400">
                        No new tickets
                      </p>
                      <p className="text-sm text-slate-500 mt-1">
                        All tickets have been processed
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-3 max-h-[400px] overflow-y-auto custom-scrollbar pr-2">
                      {newTickets.map((ticket) => (
                        <button
                          key={ticket._id}
                          onClick={() => handleTicketClick(ticket)}
                          className="w-full text-left p-4 rounded-xl border border-white/5 bg-slate-800/40 hover:border-emerald-500/30 hover:bg-slate-800/70 group"
                        >
                          <div className="flex items-start justify-between mb-3">
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-3 mb-2 flex-wrap">
                                <h3 className="font-bold text-base text-white group-hover:text-emerald-400">
                                  {ticket.title}
                                  {ticket.userId?.companyName && (
                                    <span className="text-sm font-normal text-slate-500 ml-2">
                                      ({ticket.userId.companyName})
                                    </span>
                                  )}
                                </h3>
                                <span
                                  className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[10px] font-bold border uppercase tracking-wider ${getStatusColor(
                                    ticket.status
                                  )}`}
                                >
                                  {getStatusIcon(ticket.status)}
                                  {ticket.status === "Open"
                                    ? "New"
                                    : ticket.status}
                                </span>
                              </div>
                              <p className="text-[10px] font-mono text-slate-500 mb-2">
                                {ticket.ticketId}
                              </p>
                              <p className="text-sm text-slate-400 line-clamp-2 group-hover:text-slate-300">
                                {ticket.description}
                              </p>
                            </div>
                            <ArrowRight className="w-5 h-5 text-slate-600 group-hover:text-emerald-400 flex-shrink-0 ml-4" />
                          </div>
                          <div className="flex items-center justify-between gap-4 pt-3 border-t border-white/5">
                            <span
                              className={`px-2.5 py-1 rounded-lg text-[10px] font-bold border uppercase tracking-wider ${getCategoryColor(
                                ticket.category
                              )}`}
                            >
                              {ticket.category}
                            </span>
                            <div className="flex items-center gap-2 text-xs text-slate-500">
                              <Calendar className="w-3.5 h-3.5" />
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
              <div className="flex-1 overflow-y-auto p-6 space-y-3 relative z-10">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div className="glass-card p-4 h-45 rounded-3xl border border-white/5 shadow-2xl bg-slate-900/40 backdrop-blur-2xl flex flex-col group hover:border-blue-500/20">
                    <h2 className="flex items-center gap-3 mb-3">
                      <div className="p-2 rounded-xl bg-blue-500/10 border border-blue-500/20 group-hover:bg-blue-500/20">
                        <TicketIcon className="w-4.5 h-4.5 text-blue-400" />
                      </div>
                      <span className="text-sm font-bold text-white tracking-tight">Ticket Statistics</span>
                    </h2>
                    <TicketStats stats={stats} />
                    <div className="mt-auto">
                      <div className="flex items-baseline gap-3 px-1 mt-3 ">
                        <span className="text-sm font-bold tracking-tight text-white/50">
                          Total Tickets
                        </span>
                        <span className="text-sm font-bold tracking-tight text-white">
                          {stats.total}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="glass-card p-4 h-45 rounded-3xl border border-white/5 shadow-2xl bg-slate-900/40 backdrop-blur-2xl flex flex-col group hover:border-emerald-500/20">
                    <h2 className="flex items-center gap-3 mb-3">
                      <div className="p-2 rounded-xl bg-emerald-500/10 border border-emerald-500/20 group-hover:bg-emerald-500/20">
                        <FileText className="w-4.5 h-4.5 text-emerald-400" />
                      </div>
                      <span className="text-sm font-bold text-white tracking-tight">Service Request Statistics</span>
                    </h2>
                    <ServiceRequestStats stats={serviceRequestStats} />
                    <div className="mt-auto">
                      <div className="flex items-baseline gap-3 px-1 mt-3">
                        <span className="text-sm font-bold tracking-tight text-white/50">
                          Total Services
                        </span>
                        <span className="text-sm font-bold tracking-tight text-white">
                          {serviceRequestStats.total}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  <div className="lg:col-span-1">
                    <div className="glass-card p-5 rounded-3xl h-[400px] flex flex-col border border-white/5 shadow-2xl bg-slate-900/40 backdrop-blur-2xl group hover:border-blue-500/10">
                      <h2 className="text-base font-bold text-white tracking-tight mb-4 flex-shrink-0 flex items-center gap-2">
                        <Zap className="w-5 h-5 text-blue-400" />
                        Quick Actions
                      </h2>
                      <div className="flex flex-col gap-2 flex-1 min-h-0">
                        <button
                          onClick={() => {
                            setViewMode("all");
                            setActiveTab("tickets");
                          }}
                          className="flex-1 flex items-center gap-4 px-5 bg-slate-800/40 hover:bg-blue-600/10 text-white rounded-2xl border border-white/5 hover:border-blue-500/30 group shadow-lg hover:shadow-blue-500/5"
                        >
                          <div className="w-12 h-12 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center group-hover:bg-blue-500/20">
                            <List className="w-6 h-6 text-blue-400" />
                          </div>
                          <div className="text-left">
                            <p className="font-bold text-sm tracking-tight text-slate-300 group-hover:text-white">All Tickets</p>
                            <p className="text-[11px] text-slate-500 group-hover:text-blue-400">Manage all issues</p>
                          </div>
                        </button>

                        <button
                          onClick={() => {
                            setActiveTab("service-requests");
                            setViewMode("all-service-requests");
                            fetchServiceRequests();
                          }}
                          className="flex-1 flex items-center gap-4 px-5 bg-slate-800/40 hover:bg-emerald-600/10 text-white rounded-2xl border border-white/5 hover:border-emerald-500/30 group shadow-lg hover:shadow-emerald-500/5"
                        >
                          <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center group-hover:bg-emerald-500/20">
                            <FileText className="w-6 h-6 text-emerald-400" />
                          </div>
                          <div className="text-left">
                            <p className="font-bold text-sm tracking-tight text-slate-300 group-hover:text-white">Service Requests</p>
                            <p className="text-[11px] text-slate-500 group-hover:text-emerald-400">Track status</p>
                          </div>
                        </button>

                        <button
                          onClick={() => {
                            setActiveTab("users");
                            fetchUsers();
                          }}
                          className="flex-1 flex items-center gap-4 px-5 bg-slate-800/40 hover:bg-violet-600/10 text-white rounded-2xl border border-white/5 hover:border-violet-500/30 group shadow-lg hover:shadow-violet-500/5"
                        >
                          <div className="w-12 h-12 rounded-xl bg-violet-500/10 border border-violet-500/20 flex items-center justify-center group-hover:bg-violet-500/20">
                            <Users className="w-6 h-6 text-violet-400" />
                          </div>
                          <div className="text-left">
                            <p className="font-bold text-sm tracking-tight text-slate-300 group-hover:text-white">Manage Users</p>
                            <p className="text-[11px] text-slate-500 group-hover:text-violet-400">Access control</p>
                          </div>
                        </button>

                        <button
                          onClick={() => {
                            fetchTickets();
                            fetchServiceRequests();
                          }}
                          className="flex-1 flex items-center gap-4 px-5 bg-slate-800/40 hover:bg-amber-600/10 text-white rounded-2xl border border-white/5 hover:border-amber-500/30 group shadow-lg hover:shadow-amber-500/5"
                        >
                          <div className="w-12 h-12 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center group-hover:bg-amber-500/20">
                            <AlertCircle className="w-6 h-6 text-amber-400" />
                          </div>
                          <div className="text-left">
                            <p className="font-bold text-sm tracking-tight text-slate-300 group-hover:text-white">Refresh Data</p>
                            <p className="text-[11px] text-slate-500 group-hover:text-amber-400">Sync dashboard</p>
                          </div>
                        </button>
                      </div>
                    </div>
                  </div>

                  <div className="h-[400px] flex flex-col">
                    <VisitCalendar
                      tickets={tickets}
                      serviceRequests={serviceRequests}
                      onEventSelect={setSelectedVisit}
                    />
                  </div>

                  {/* Event Details Panel */}
                  <div className="lg:col-span-1">
                    <div className="glass-card p-5 rounded-3xl h-[400px] flex flex-col border border-white/5 shadow-2xl bg-slate-900/40 backdrop-blur-2xl group hover:border-cyan-500/10">
                      <div className="flex items-start justify-between mb-4">
                        <h2 className="text-base font-bold text-white tracking-tight flex items-center gap-2">
                          <Info className="w-5 h-5 text-cyan-400" />
                          Visit Details
                        </h2>
                        {selectedVisit && selectedVisit.visits && selectedVisit.visits.length > 0 && (
                          <button
                            type="button"
                            onClick={() => setSelectedVisit(null)}
                            className="inline-flex items-center gap-1 text-xs text-slate-400 hover:text-white hover:bg-white/10 px-2.5 py-1 rounded-lg border border-transparent hover:border-white/10"
                            aria-label="Close visit details"
                          >
                            <XCircle className="w-4 h-4" />
                            Close
                          </button>
                        )}
                      </div>
                      {selectedVisit ? (
                        <div className="flex-1 flex flex-col min-h-0">

                          {selectedVisit.visits &&
                            selectedVisit.visits.length > 0 ? (
                            <div className="flex-1 overflow-y-auto space-y-3 pr-1 min-h-0 custom-scrollbar">
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
                                  className={`p-4 rounded-xl border cursor-pointer group ${visit.type === "ticket"
                                    ? "bg-blue-500/5 border-blue-500/20 hover:border-blue-500/40 hover:bg-blue-500/10"
                                    : "bg-fuchsia-500/5 border-fuchsia-500/20 hover:border-fuchsia-500/40 hover:bg-fuchsia-500/10"
                                    }`}
                                >
                                  <div className="flex justify-between items-start mb-2">
                                    <h3 className="font-bold text-slate-200 group-hover:text-white tracking-tight">
                                      {visit.category}
                                    </h3>
                                    <span
                                      className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${visit.type === "ticket"
                                        ? "bg-blue-500/20 text-blue-300"
                                        : "bg-fuchsia-500/20 text-fuchsia-300"
                                        }`}
                                    >
                                      {visit.type === "ticket"
                                        ? "Ticket"
                                        : "Request"}
                                    </span>
                                  </div>
                                  <p className="text-[10px] text-slate-500 mt-0.5 font-mono mb-3">
                                    {visit.type === "ticket"
                                      ? `ID: ${visit.ticketId}`
                                      : `ID: ${visit.requestId}`}
                                  </p>
                                  <div className="space-y-2">
                                    <div className="flex items-center gap-2 text-sm">
                                      <Building2 className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                                      <span className="font-bold text-slate-300 tracking-tight">
                                        {visit.userId?.companyName ||
                                          visit.companyName ||
                                          "Company N/A"}
                                      </span>
                                    </div>
                                    <div className="flex items-center justify-between ml-0">
                                      <div className="flex items-center gap-2 text-xs text-slate-400">
                                        <User className="w-3 h-3 text-slate-500 flex-shrink-0" />
                                        <span className="font-bold">
                                          {visit.userId?.name ||
                                            visit.userName ||
                                            "User N/A"}
                                        </span>
                                      </div>
                                      {(visit.userId?.address || visit.address) && (
                                        <a
                                          href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(visit.userId?.address || visit.address)}`}
                                          target="_blank"
                                          rel="noopener noreferrer"
                                          onClick={(e) => e.stopPropagation()}
                                          className="p-1 px-2 rounded-lg bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 hover:text-blue-300 border border-blue-500/20 hover:border-blue-500/30 transition-colors group/nav flex items-center gap-1.5"
                                          title="View Location"
                                        >
                                          <Navigation className="w-3.5 h-3.5" />
                                          <span className="text-[10px] font-bold uppercase tracking-wider">Map</span>
                                        </a>
                                      )}
                                    </div>
                                    <div className="flex items-start gap-2 text-xs text-slate-400 ml-0">
                                      <FileText className="w-3 h-3 text-slate-500 flex-shrink-0 mt-0.5" />
                                      <span className="line-clamp-1">{visit.title || "No Title"}</span>
                                    </div>
                                    <div className="flex items-center gap-2 text-xs font-bold text-slate-300 ml-0 pt-2 border-t border-white/5 mt-2 tracking-tight">
                                      <Clock className="w-3 h-3 text-emerald-400 flex-shrink-0" />
                                      {visit.visitTime &&
                                        !isNaN(
                                          new Date(visit.visitTime).getTime()
                                        ) ? (
                                        <span>
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
                                        <span>Time TBD</span>
                                      )}
                                    </div>
                                  </div>
                                </div>
                              ))}
                            </div>
                          ) : (
                            <div className="text-center py-30">
                              <Calendar className="w-10 h-10 text-slate-700 mx-auto mb-3" />
                              <p className="text-sm text-slate-500">
                                No visits scheduled
                              </p>
                            </div>
                          )}
                        </div>
                      ) : (
                        <div className="text-center py-10 flex flex-col items-center justify-center h-full">
                          <div className="w-16 h-16 rounded-full bg-slate-800/50 flex items-center justify-center mb-4 border border-white/5">
                            <Calendar className="w-8 h-8 text-slate-600" />
                          </div>
                          <p className="text-lg font-semibold text-slate-400">
                            Select a Date
                          </p>
                          <p className="text-xs text-slate-500 mt-1 max-w-[200px]">
                            Click on a date in the calendar to view scheduled visits
                          </p>

                          <div className="mt-8 flex items-center gap-4 text-xs text-slate-500">
                            <div className="flex items-center gap-1.5">
                              <span className="w-2 h-2 rounded-full bg-blue-500 inline-block shadow-sm"></span>
                              <span>Ticket</span>
                            </div>
                            <div className="flex items-center gap-1.5">
                              <span className="w-2 h-2 rounded-full bg-fuchsia-500 inline-block shadow-sm"></span>
                              <span>Request</span>
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
              <div className="flex h-full gap-0 w-full relative z-10 overflow-hidden">
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
                    setActiveTab("dashboard");
                  }}
                  onDelete={(ticket) => {
                    setTicketToDelete(ticket);
                    setDeleteTicketModalOpen(true);
                  }}
                  loading={loading}
                />
                <div className="flex-1 overflow-y-auto bg-slate-950 h-full">
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
                    <div className="glass-card rounded-2xl border border-slate-700/50 shadow-xl p-8 m-6 flex items-center justify-center h-full bg-slate-900/60 backdrop-blur-xl">
                      <div className="text-center">
                        <TicketIcon className="w-16 h-16 text-slate-600 mx-auto mb-4" />
                        <p className="text-lg font-bold text-slate-400">
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
          <div className="flex-1 flex flex-col min-h-0 h-full">
            <div className="flex h-full gap-0 w-full relative z-10">
              <UserListPanel
                users={users}
                userSearchTerm={userSearchTerm}
                setUserSearchTerm={setUserSearchTerm}
                selectedUser={selectedUser}
                onUserClick={handleUserClick}
                loading={usersLoading}
                onBackToDashboard={() => {
                  setActiveTab("dashboard");
                  setViewMode("dashboard");
                }}
                onRefresh={fetchUsers}
                onDelete={openDeleteUserModal}
              />
              <div className="flex-1 flex flex-col overflow-hidden bg-slate-950/50 backdrop-blur-2xl h-full">
                <div className="flex-1 overflow-y-auto">
                  <UserDetailsPanel
                    user={selectedUser}
                    onDelete={openDeleteUserModal}
                    deleting={deletingUserId}
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === "service-requests" && (
          <div className="flex-1 flex flex-col min-h-0 h-full">
            {viewMode === "new-service-requests" && (
              <div className="p-6">
                <div className="glass-card rounded-2xl border border-slate-700/50 shadow-xl p-6 bg-slate-900/60 backdrop-blur-xl min-h-[500px]">
                  <div className="flex items-center justify-between mb-5">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-500 to-amber-600 flex items-center justify-center shadow-lg shadow-amber-500/20">
                        <AlertCircle className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <h2 className="text-2xl font-bold text-white tracking-tight">
                          New Service Requests
                        </h2>
                        <p className="text-sm text-slate-400">
                          New service requests requiring attention
                        </p>
                      </div>
                    </div>
                    <span className="px-4 py-2 bg-amber-500/10 text-amber-400 rounded-full text-sm font-bold border border-amber-500/20">
                      {newServiceRequests.length}{" "}
                      {newServiceRequests.length === 1 ? "Request" : "Requests"}
                    </span>
                  </div>

                  {newServiceRequests.length === 0 ? (
                    <div className="text-center py-12">
                      <CheckCircle2 className="w-16 h-16 text-slate-600 mx-auto mb-4" />
                      <p className="text-lg font-bold text-slate-400">
                        No new service requests
                      </p>
                      <p className="text-sm text-slate-500 mt-1">
                        All service requests have been processed
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-3 max-h-[400px] overflow-y-auto custom-scrollbar pr-2">
                      {newServiceRequests.map((request) => (
                        <button
                          key={request._id}
                          onClick={() => handleServiceRequestClick(request)}
                          className="w-full text-left p-4 rounded-xl border border-white/5 bg-slate-800/40 hover:border-amber-500/30 hover:bg-slate-800/70 group"
                        >
                          <div className="flex items-start justify-between mb-3">
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-3 mb-2 flex-wrap">
                                <h3 className="font-bold text-base text-white group-hover:text-amber-400">
                                  {request.title}
                                  {request.userId?.companyName && (
                                    <span className="text-sm font-normal text-slate-500 ml-2">
                                      ({request.userId.companyName})
                                    </span>
                                  )}
                                </h3>
                                <span
                                  className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[10px] font-bold border uppercase tracking-wider ${request.status === "New"
                                    ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                                    : "bg-slate-500/10 text-slate-400 border-slate-500/20"
                                    }`}
                                >
                                  {request.status}
                                </span>
                              </div>
                              <p className="text-[10px] font-mono text-slate-500 mb-2">
                                {request.requestId}
                              </p>
                              <p className="text-sm text-slate-400 line-clamp-2 group-hover:text-slate-300">
                                {request.description}
                              </p>
                            </div>
                            <ArrowRight className="w-5 h-5 text-slate-600 group-hover:text-amber-400 flex-shrink-0 ml-4" />
                          </div>
                          <div className="flex items-center justify-between gap-4 pt-3 border-t border-white/5">
                            <span
                              className={`px-2.5 py-1 rounded-lg text-[10px] font-bold border uppercase tracking-wider ${getCategoryColor(
                                request.category
                              )}`}
                            >
                              {request.category}
                            </span>
                            <div className="flex items-center gap-2 text-xs text-slate-500">
                              <Calendar className="w-3.5 h-3.5" />
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
                <div className="glass-card rounded-2xl border border-slate-700/50 shadow-xl p-6 bg-slate-900/60 backdrop-blur-xl min-h-[500px]">
                  <div className="flex items-center justify-between mb-5">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-indigo-500/20">
                        <FileText className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <h2 className="text-2xl font-bold text-white tracking-tight">
                          Service Requests
                        </h2>
                        <p className="text-sm text-slate-400">
                          Overview of all service requests
                        </p>
                      </div>
                    </div>
                  </div>

                  {serviceRequestsLoading ? (
                    <div className="text-center py-12">
                      <Loader2 className="w-10 h-10 text-blue-400 mx-auto mb-4" />
                      <p className="text-white text-lg font-bold tracking-tight">
                        Loading service requests...
                      </p>
                    </div>
                  ) : serviceRequests.length === 0 ? (
                    <div className="text-center py-12">
                      <CheckCircle2 className="w-16 h-16 text-slate-600 mx-auto mb-4" />
                      <p className="text-lg font-bold text-slate-400">
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
                          className="w-full text-left p-4 rounded-xl border border-white/5 bg-slate-800/40 hover:border-indigo-500/30 hover:bg-slate-800/70 transition-all group"
                        >
                          <div className="flex items-start justify-between mb-3">
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-3 mb-2 flex-wrap">
                                <h3 className="font-bold text-base text-white group-hover:text-indigo-400 transition-colors">
                                  {request.title}
                                  {request.userId?.companyName && (
                                    <span className="text-sm font-normal text-slate-500 ml-2">
                                      ({request.userId.companyName})
                                    </span>
                                  )}
                                </h3>
                                <span
                                  className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[10px] font-bold border uppercase tracking-wider ${request.status === "New"
                                    ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                                    : request.status === "In Progress"
                                      ? "bg-blue-500/10 text-blue-400 border-blue-500/20"
                                      : request.status === "Completed"
                                        ? "bg-green-500/10 text-green-400 border-green-500/20"
                                        : "bg-red-500/10 text-red-400 border-red-500/20"
                                    }`}
                                >
                                  {request.status}
                                </span>
                              </div>
                              <p className="text-[10px] font-mono text-slate-500 mb-2">
                                {request.requestId}
                              </p>
                              <p className="text-sm text-slate-400 line-clamp-2 group-hover:text-slate-300 transition-colors">
                                {request.description}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center justify-between gap-4 pt-3 border-t border-white/5">
                            <span
                              className={`px-2.5 py-1 rounded-lg text-[10px] font-bold border uppercase tracking-wider ${getCategoryColor(
                                request.category
                              )}`}
                            >
                              {request.category}
                            </span>
                            <div className="flex items-center gap-2 text-xs text-slate-500">
                              <Calendar className="w-3.5 h-3.5" />
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
              <div className="flex h-full gap-0 w-full relative z-10 overflow-hidden">
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
                    setActiveTab("dashboard");
                  }}
                  onDelete={(request) => {
                    setServiceRequestToDelete(request);
                    setDeleteServiceRequestModalOpen(true);
                  }}
                  loading={serviceRequestsLoading}
                />
                <div className="flex-1 overflow-y-auto bg-slate-950 h-full">
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
                      onDelete={() => {
                        setServiceRequestToDelete(selectedServiceRequest);
                        setDeleteServiceRequestModalOpen(true);
                      }}
                    />
                  ) : (
                    <div className="glass-card rounded-2xl border border-slate-700/50 shadow-xl p-8 m-6 flex items-center justify-center h-full bg-slate-900/60 backdrop-blur-xl">
                      <div className="text-center">
                        <TicketIcon className="w-16 h-16 text-slate-600 mx-auto mb-4" />
                        <p className="text-lg font-bold text-slate-400">
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
                  className="px-4 py-2 rounded-lg bg-red-600 text-white hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed inline-flex items-center gap-2"
                >
                  {deletingUserId === userToDelete._id ? (
                    <>
                      <Loader2 className="w-4 h-4" />
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

        {deleteTicketModalOpen && ticketToDelete && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
            <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full border border-slate-200 p-6 space-y-4">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="text-xl font-bold text-slate-900">
                    Delete Ticket
                  </h3>
                  <p className="text-sm text-slate-600 mt-1">
                    This will permanently delete ticket{" "}
                    <span className="font-semibold">{ticketToDelete.ticketId}</span>
                  </p>
                </div>
                <button
                  onClick={() => {
                    setDeleteTicketModalOpen(false);
                    setTicketToDelete(null);
                  }}
                  className="text-slate-500 hover:text-slate-700"
                >
                  <XCircle className="w-5 h-5" />
                </button>
              </div>
              <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 text-sm text-amber-800">
                This action cannot be undone. All ticket data, images, and timeline will be permanently removed.
              </div>
              <div className="flex justify-end gap-3">
                <button
                  onClick={() => {
                    setDeleteTicketModalOpen(false);
                    setTicketToDelete(null);
                  }}
                  className="px-4 py-2 rounded-lg border border-slate-200 text-slate-700 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDeleteTicket}
                  className="px-4 py-2 rounded-lg bg-red-600 text-white hover:bg-red-700 inline-flex items-center gap-2"
                >
                  Delete Ticket
                </button>
              </div>
            </div>
          </div>
        )}

        {deleteServiceRequestModalOpen && serviceRequestToDelete && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
            <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full border border-slate-200 p-6 space-y-4">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="text-xl font-bold text-slate-900">
                    Delete Service Request
                  </h3>
                  <p className="text-sm text-slate-600 mt-1">
                    This will permanently delete service request{" "}
                    <span className="font-semibold">{serviceRequestToDelete.requestId}</span>
                  </p>
                </div>
                <button
                  onClick={() => {
                    setDeleteServiceRequestModalOpen(false);
                    setServiceRequestToDelete(null);
                  }}
                  className="text-slate-500 hover:text-slate-700"
                >
                  <XCircle className="w-5 h-5" />
                </button>
              </div>
              <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 text-sm text-amber-800">
                This action cannot be undone. All service request data, images, and timeline will be permanently removed.
              </div>
              <div className="flex justify-end gap-3">
                <button
                  onClick={() => {
                    setDeleteServiceRequestModalOpen(false);
                    setServiceRequestToDelete(null);
                  }}
                  className="px-4 py-2 rounded-lg border border-slate-200 text-slate-700 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDeleteServiceRequest}
                  className="px-4 py-2 rounded-lg bg-red-600 text-white hover:bg-red-700 inline-flex items-center gap-2"
                >
                  Delete Service Request
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div >
  );
};

export default AdminPortal;