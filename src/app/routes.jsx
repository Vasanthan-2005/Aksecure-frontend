import { lazy, Suspense } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import LoadingState from '../common/components/LoadingState';

// Lazy load components
const Login = lazy(() => import('../auth/login/Login'));
const Register = lazy(() => import('../auth/register/Register'));
const ForgotPassword = lazy(() => import('../auth/password/ForgotPassword'));
const ResetPassword = lazy(() => import('../auth/password/ResetPassword'));
const UserDashboard = lazy(() => import('../user/dashboard/UserDashboard'));
const UserProfile = lazy(() => import('../user/profile/UserProfile'));
const TicketsPage = lazy(() => import('../user/tickets/TicketsPage'));
const ServiceRequestsPage = lazy(() => import('../user/services/ServiceRequestsPage'));
const AdminPortal = lazy(() => import('../admin/dashboard/AdminPortal'));

const PrivateRoute = ({ children, adminOnly = false, userOnly = false }) => {
    const { user, loading } = useAuth();

    if (loading) {
        return (
            <div className="min-h-screen bg-slate-950 flex items-center justify-center">
                <LoadingState message="Authenticating" />
            </div>
        );
    }

    if (!user) {
        return <Navigate to="/login" />;
    }

    if (adminOnly && user.role !== 'admin') {
        return <Navigate to="/" />;
    }

    if (userOnly && user.role === 'admin') {
        return <Navigate to="/admin" />;
    }

    return children;
};

const AppRoutes = () => {
    const { user } = useAuth();

    return (
        <Suspense fallback={
            <div className="min-h-screen bg-slate-950 flex items-center justify-center">
                <LoadingState message="Loading application" />
            </div>
        }>
            <Routes>
                <Route path="/login" element={!user ? <Login /> : <Navigate to={user.role === 'admin' ? '/admin' : '/'} />} />
                <Route path="/register" element={!user ? <Register /> : <Navigate to="/" />} />
                <Route path="/forgot-password" element={!user ? <ForgotPassword /> : <Navigate to="/" />} />
                <Route path="/reset-password/:token" element={<ResetPassword />} />
                <Route
                    path="/"
                    element={
                        <PrivateRoute userOnly>
                            <UserDashboard />
                        </PrivateRoute>
                    }
                />
                <Route
                    path="/profile"
                    element={
                        <PrivateRoute userOnly>
                            <UserProfile />
                        </PrivateRoute>
                    }
                />
                <Route
                    path="/tickets"
                    element={
                        <PrivateRoute userOnly>
                            <TicketsPage />
                        </PrivateRoute>
                    }
                />
                <Route
                    path="/service-requests"
                    element={
                        <PrivateRoute userOnly>
                            <ServiceRequestsPage />
                        </PrivateRoute>
                    }
                />
                <Route
                    path="/admin"
                    element={
                        <PrivateRoute adminOnly>
                            <AdminPortal />
                        </PrivateRoute>
                    }
                />
                <Route path="/admin/dashboard" element={<Navigate to="/admin" replace />} />
            </Routes>
        </Suspense>
    );
};

export default AppRoutes;
