import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../../store/useAuth';

interface ProtectedRouteProps {
    allowedRoles?: string[];
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ allowedRoles }) => {
    const { isAuthenticated, user } = useAuth();

    if (!isAuthenticated) {
        return <Navigate to="/login" replace />;
    }

    if (allowedRoles && user) {
        const hasRole = user.roles.some(role => 
            allowedRoles.some(allowed => allowed.toLowerCase() === role.toLowerCase())
        );
        if (!hasRole) {
            return <Navigate to="/inicio" replace />;
        }
    }


    return <Outlet />;
};


export default ProtectedRoute;
