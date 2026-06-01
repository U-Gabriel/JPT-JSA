import React, { useState } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { USER_ROLES, type UserRole } from '../types/auth';

interface NavigationItem {
  name: string;
  href: string;
  allowedRoles: UserRole[];
}

const NAVIGATION_ITEMS: NavigationItem[] = [
  { name: 'Utilisateurs', href: '/users', allowedRoles: [USER_ROLES.SUPER_ADMIN] },
  { name: 'Objet', href: '/objects', allowedRoles: [USER_ROLES.ADMIN_SIMPLE, USER_ROLES.SUPER_ADMIN] },
  { name: 'Avis', href: '/reviews', allowedRoles: [USER_ROLES.ADMIN_SIMPLE, USER_ROLES.SUPER_ADMIN] },
  { name: 'Indication', href: '/indications', allowedRoles: [USER_ROLES.ADMIN_SIMPLE, USER_ROLES.SUPER_ADMIN] },
  { name: 'Commande', href: '/orders', allowedRoles: [USER_ROLES.ADMIN_SIMPLE, USER_ROLES.SUPER_ADMIN, USER_ROLES.MANAGER, USER_ROLES.PREPARATOR] },
];

const getRoleLabel = (role: UserRole): string => {
  switch (role) {
    case USER_ROLES.SUPER_ADMIN: return 'Super Admin';
    case USER_ROLES.ADMIN_SIMPLE: return 'Admin';
    case USER_ROLES.MANAGER: return 'Manager';
    case USER_ROLES.PREPARATOR: return 'Préparateur';
    case USER_ROLES.ACCOUNTANT: return 'Comptable';
    default: return 'Utilisateur';
  }
};

export const AdminLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  const visibleNavigation = NAVIGATION_ITEMS.filter(item => 
    user && item.allowedRoles.includes(user.id_role)
  );

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-gray-50 flex font-sans overflow-x-hidden relative">
      
      {/* 🟢 SIDEBAR GLISSANTE PREMIUM */}
      <aside 
        className={`bg-slate-900 text-slate-300 flex flex-col border-r border-slate-800 transition-transform duration-300 ease-in-out fixed h-screen top-0 left-0 z-20 w-64 ${
          isSidebarOpen ? 'translate-x-0 shadow-xl' : '-translate-x-full'
        }`}
      >
        {/* Zone Logo latérale centrée */}
        <div className="h-16 flex items-center justify-center bg-slate-950 border-b border-slate-800 shrink-0">
          <Link to="/" className="flex items-center justify-center w-full">
            <img 
              src="/src/assets/logo_original_white.png" 
              alt="Jackpote Logo" 
              className="h-11 w-auto object-contain"
            />
          </Link>
        </div>

        {/* Liens de Navigation */}
        <nav className="flex-1 py-6 px-4 space-y-1.5 overflow-y-auto">
          {visibleNavigation.map((item) => {
            const isActive = location.pathname === item.href;
            return (
              <Link
                key={item.href}
                to={item.href}
                className={`flex items-center px-4 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${
                  isActive 
                    ? 'bg-blue-600 text-white shadow-md shadow-blue-900/30' 
                    : 'text-slate-400 hover:bg-slate-800 hover:text-slate-100'
                }`}
              >
                {item.name}
              </Link>
            );
          })}
        </nav>

        {/* Pied de la Sidebar */}
        <div className="p-4 bg-slate-950 border-t border-slate-800 flex items-center gap-3 shrink-0">
          <div className="h-9 w-9 rounded-full bg-blue-500/10 border border-blue-500/30 flex items-center justify-center text-blue-400 font-bold text-sm uppercase">
            {user?.firstname[0]}{user?.surname[0]}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-slate-200 truncate">{user?.firstname}</p>
            <p className="text-xs text-slate-500 truncate">{user?.mail}</p>
          </div>
        </div>
      </aside>

      {/* 🟢 COMPENSATEUR DE LARGEUR (Évite que le contenu passe sous la sidebar quand elle est ouverte) */}
      <div className={`transition-all duration-300 ease-in-out shrink-0 hidden md:block ${isSidebarOpen ? 'w-64' : 'w-0'}`} />

      {/* ZONE DE CONTENU À DROITE */}
      <div className="flex-1 flex flex-col min-w-0 min-h-screen">
        
        {/* HEADER HAUT */}
        <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-6 shadow-sm shrink-0 sticky top-0 z-10">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="p-2 rounded-lg text-gray-500 hover:bg-gray-100 hover:text-gray-700 transition-colors focus:outline-none"
            >
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>

            
            <h1 className="text-sm font-medium text-gray-500 uppercase tracking-wider hidden sm:inline">
              Panneau d'administration
            </h1>
          </div>

          <div className="flex-1 flex justify-end items-center gap-4">
            {user && (
              <div className="text-right">
                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-100 shadow-sm">
                  {getRoleLabel(user.id_role)}
                </span>
              </div>
            )}
            
            <button
              onClick={handleLogout}
              className="inline-flex items-center gap-2 px-3 py-1.5 border border-gray-300 rounded-md text-xs font-medium text-gray-700 bg-white hover:bg-gray-50 transition-colors shadow-sm"
            >
              <svg className="h-4 w-4 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
              Déconnexion
            </button>
          </div>
        </header>

        {/* CONTENU DYNAMIQUE */}
        <main className="flex-1 p-8 overflow-y-auto">
          <div className="max-w-7xl mx-auto">
            {children}
          </div>
        </main>
      </div>

    </div>
  );
};