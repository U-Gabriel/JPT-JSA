import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { USER_ROLES } from './types/auth';
import type { UserRole } from './types/auth';
import { Login } from './pages/Login';
import { Home } from './pages/Home';

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: UserRole[];
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, allowedRoles }) => {
  const { user, loading } = useAuth();

  if (loading) return <div>Chargement...</div>;
  
  // 1. Si pas connecté -> Redirection Connexion
  if (!user) return <Navigate to="/login" replace />;

  // 2. Sécurité absolue : Si rôle = 1 (BANNED), rejet immédiat
  if (user.id_role === USER_ROLES.BANNED) {
    return <Navigate to="/login" replace />; 
  }

  // 3. Vérification des droits spécifiques
  if (allowedRoles && !allowedRoles.includes(user.id_role)) {
    return <Navigate to="/" replace />; 
  }

  return <>{children}</>;
};

export const App: React.FC = () => {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          
          <Route 
            path="/" 
            element = {
              <ProtectedRoute>
                <Home />
              </ProtectedRoute>
            } 
          />

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
};

export default App;