import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { USER_ROLES, type UserRole } from '../types/auth';

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: UserRole[];
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, allowedRoles }) => {
  const { user, loading } = useAuth();

  if (loading) return <div className="p-8 text-center text-gray-500 font-medium">Chargement...</div>;
  
  // 1. Si pas connecté -> Redirection Connexion
  if (!user) return <Navigate to="/login" replace />;

  // 2. Sécurité absolue : Si rôle = 1 (BANNED), rejet immédiat
  if (user.id_role === USER_ROLES.BANNED) {
    return <Navigate to="/login" replace />; 
  }

  // 3. Si la route demande des rôles spécifiques, on vérifie si l'utilisateur en fait partie
  if (allowedRoles && !allowedRoles.includes(user.id_role)) {
    return <Navigate to="/" replace />; 
  }

  return <>{children}</>;
};