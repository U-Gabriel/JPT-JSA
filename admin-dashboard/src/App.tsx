import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { USER_ROLES } from './types/auth';
import { ProtectedRoute } from './components/ProtectedRoute';
import { AdminLayout } from './components/AdminLayout';
import { Login } from './pages/Login';
import { Home } from './pages/Home';

export const App: React.FC = () => {
  return (
    <AuthProvider>
      <BrowserRouter>
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
              <AdminLayout>
                <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                  <h2 className="text-xl font-bold text-gray-900">Gestion des Utilisateurs</h2>
                  <p className="text-gray-500 mt-1">Réservé au Super Administrateur.</p>
                </div>
              </AdminLayout>
            </ProtectedRoute>
          } />

          {/* 2. Objet (Admin & Super Admin) */}
          <Route path="/objects" element={
            <ProtectedRoute allowedRoles={[USER_ROLES.ADMIN_SIMPLE, USER_ROLES.SUPER_ADMIN]}>
              <AdminLayout>
                <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                  <h2 className="text-xl font-bold text-gray-900">Gestion des Objets</h2>
                </div>
              </AdminLayout>
            </ProtectedRoute>
          } />

          {/* 3. Avis (Admin & Super Admin) */}
          <Route path="/reviews" element={
            <ProtectedRoute allowedRoles={[USER_ROLES.ADMIN_SIMPLE, USER_ROLES.SUPER_ADMIN]}>
              <AdminLayout>
                <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                  <h2 className="text-xl font-bold text-gray-900">Modération des Avis</h2>
                </div>
              </AdminLayout>
            </ProtectedRoute>
          } />

          {/* 4. Indication (Admin & Super Admin) */}
          <Route path="/indications" element={
            <ProtectedRoute allowedRoles={[USER_ROLES.ADMIN_SIMPLE, USER_ROLES.SUPER_ADMIN]}>
              <AdminLayout>
                <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                  <h2 className="text-xl font-bold text-gray-900">Gestion des Indications</h2>
                </div>
              </AdminLayout>
            </ProtectedRoute>
          } />

          {/* 5. Commande (Admin, Super Admin, Manager, Preparator) */}
          <Route path="/orders" element={
            <ProtectedRoute allowedRoles={[USER_ROLES.ADMIN_SIMPLE, USER_ROLES.SUPER_ADMIN, USER_ROLES.MANAGER, USER_ROLES.PREPARATOR]}>
              <AdminLayout>
                <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                  <h2 className="text-xl font-bold text-gray-900">Suivi des Commandes</h2>
                </div>
              </AdminLayout>
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