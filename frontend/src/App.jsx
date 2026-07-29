import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';

import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Catalog from './pages/Catalog';
import Settings from './pages/Settings';
import Broadcast from './pages/Broadcast';
import Sidebar from './components/Sidebar';
import Leads from './pages/Leads';

const ProtectedRoute = ({ children }) => {
    const { shop } = useAuth();
    if (!shop) return <Navigate to="/login" replace />;
    return (
        <div className="flex flex-col h-screen bg-gray-950 text-white md:flex-row">
            <Sidebar />
            <main className="flex-1 overflow-y-auto p-4 md:p-6 pb-24 md:pb-6">
                {children}
            </main>
        </div>
    );
};

const PublicRoute = ({ children }) => {
    const { shop } = useAuth();
    if (shop) return <Navigate to="/dashboard" replace />;
    return children;
};

const AppRoutes = () => {
    return (
        <Routes>
            {/* Public */}
            <Route path="/login" element={
                <PublicRoute><Login /></PublicRoute>
            } />
            <Route path="/register" element={
                <PublicRoute><Register /></PublicRoute>
            } />

            {/* Protected */}
            <Route path="/dashboard" element={
                <ProtectedRoute><Dashboard /></ProtectedRoute>
            } />
            <Route path="/catalog" element={
                <ProtectedRoute><Catalog /></ProtectedRoute>
            } />
            <Route path="/broadcast" element={
                <ProtectedRoute><Broadcast /></ProtectedRoute>
            } />
            <Route path="/settings" element={
                <ProtectedRoute><Settings /></ProtectedRoute>
            } />
            <Route path="/leads" element={
                <ProtectedRoute><Leads /></ProtectedRoute>
            } />

            {/* Default */}
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
    );
};

export default function App() {
    return (
        <BrowserRouter>
            <AuthProvider>
                <AppRoutes />
            </AuthProvider>
        </BrowserRouter>
    );
}