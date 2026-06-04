import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { USER_ROLES } from './types/auth';
import { ProtectedRoute } from './components/ProtectedRoute';
import { AdminLayout } from './components/AdminLayout';
import { Login } from './pages/Login';
import { Home } from './pages/Home';
import { Users } from './pages/Users';
import { Objects } from './pages/Objects';
import { Plants } from './pages/Plants';
import Notices from './pages/Notices';
import Indications from './pages/Indications';
import Orders from './pages/Orders';

export const App: React.FC = () => {
  return (
    <AuthProvider>
      <BrowserRouter basename="/gabuzarf">
        <Routes>
          {/* Route publique */}
          <Route path="/login" element={<Login />} />
          
          {/* Accueil d'administration (Accessible à tous les connectés valides) */}
          <Route path="/" element={
            <ProtectedRoute>
              <AdminLayout><Home /></AdminLayout>
            </ProtectedRoute>
          } />

          {/* 1. Utilisateurs (Super Admin seulement) */}
          <Route path="/users" element={
            <ProtectedRoute allowedRoles={[USER_ROLES.SUPER_ADMIN]}>
              <AdminLayout><Users /></AdminLayout>
            </ProtectedRoute>
          } />

          {/* 2. Objet (Admin Simple, Super Admin & Engineer) */}
          <Route path="/objects" element={
            <ProtectedRoute allowedRoles={[USER_ROLES.SUPER_ADMIN, USER_ROLES.ADMIN_SIMPLE, USER_ROLES.ENGINEER]}>
              <AdminLayout><Objects /></AdminLayout> {/* 🟢 Changé <Users /> par <Objects /> */}
            </ProtectedRoute>
          } />

          {/* 3. Plantes (Admin & Super Admin) */}
          <Route path="/plants" element={
            <ProtectedRoute allowedRoles={[USER_ROLES.SUPER_ADMIN, USER_ROLES.ADMIN_SIMPLE, USER_ROLES.ENGINEER]}>
              <AdminLayout><Plants /></AdminLayout> 
            </ProtectedRoute>
          } />

          {/* 3. Avis (Admin & Super Admin) */}
          <Route path="/notices" element={
            <ProtectedRoute allowedRoles={[USER_ROLES.SUPER_ADMIN, USER_ROLES.ADMIN_SIMPLE, USER_ROLES.MANAGER, USER_ROLES.ENGINEER]}>
              <AdminLayout><Notices /></AdminLayout> 
            </ProtectedRoute>
          } />

          {/* 4. Indication (Admin & Super Admin) */}
          <Route path="/indications" element={
            <ProtectedRoute allowedRoles={[USER_ROLES.SUPER_ADMIN, USER_ROLES.ADMIN_SIMPLE]}>
              <AdminLayout><Indications /></AdminLayout> 
            </ProtectedRoute>
          } />


          {/* 5. Commande (Admin, Super Admin, Manager, Preparator) */}
          <Route path="/orders" element={
            <ProtectedRoute allowedRoles={[USER_ROLES.ADMIN_SIMPLE, USER_ROLES.SUPER_ADMIN, USER_ROLES.MANAGER, USER_ROLES.PREPARATOR]}>
              <AdminLayout><Orders /></AdminLayout>
            </ProtectedRoute>
          } />

          {/* Redirection automatique */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
};

export default App;