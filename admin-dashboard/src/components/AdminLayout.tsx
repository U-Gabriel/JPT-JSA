import React, { useState, useEffect } from 'react';
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
  { name: 'Objet', href: '/objects', allowedRoles: [USER_ROLES.ADMIN_SIMPLE, USER_ROLES.SUPER_ADMIN, USER_ROLES.ENGINEER] },
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
    case USER_ROLES.ENGINEER: return 'Ingénieur';
    default: return 'Utilisateur';
  }
};

export const AdminLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Ouvert par défaut sur PC (>= 1024px), fermé sur mobile
  const [isSidebarOpen, setIsSidebarOpen] = useState(window.innerWidth >= 1024);

  const visibleNavigation = NAVIGATION_ITEMS.filter(item => 
    user && item.allowedRoles.includes(user.id_role)
  );

  // Fermer la sidebar automatiquement uniquement sur mobile quand on change de page
  useEffect(() => {
    if (window.innerWidth < 1024) {
      setIsSidebarOpen(false);
    }
  }, [location.pathname]);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-gray-50 flex font-sans overflow-x-hidden relative">
      
      {/* 🟢 OVERLAY SOMBRE (Seulement sur Mobile/Tablette) */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-20 lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* 🟢 SIDEBAR GLISSANTE CORRIGÉE (Gère dynamiquement l'ouverture sur PC et Mobile) */}
      <aside 
        className={`bg-slate-900 text-slate-300 flex flex-col border-r border-slate-800 transition-transform duration-300 ease-in-out fixed h-screen top-0 left-0 z-30 w-64 ${
          isSidebarOpen ? 'translate-x-0 shadow-xl' : '-translate-x-full'
        }`}
      >
        {/* Zone Logo latérale */}
        <div className="h-16 flex items-center justify-between px-4 bg-slate-950 border-b border-slate-800 shrink-0">
          <Link to="/" className="flex items-center justify-center flex-1">
            <img 
              src="/src/assets/logo_original_white.png" 
              alt="Jackpote Logo" 
              className="h-11 w-auto object-contain"
            />
          </Link>
          
          {/* BOUTON FERMER (Mobile uniquement) */}
          <button
            onClick={() => setIsSidebarOpen(false)}
            className="lg:hidden p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 focus:outline-none"
          >
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
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
            {user?.firstname ? user.firstname[0] : 'A'}
            {user?.surname ? user.surname[0] : 'D'}
          </div>
          
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-slate-200 truncate">
              {user?.firstname || 'Administrateur'}
            </p>
            <p className="text-xs text-slate-500 truncate">
              {user?.mail || 'Pas d\'email'}
            </p>
          </div>
        </div>
      </aside>

      {/* 🟢 COMPENSATEUR DE LARGEUR (S'adapte dynamiquement si la sidebar est fermée ou ouverte sur PC) */}
      <div className={`transition-all duration-300 ease-in-out shrink-0 hidden lg:block ${isSidebarOpen ? 'w-64' : 'w-0'}`} />

      {/* ZONE DE CONTENU À DROITE */}
      <div className="flex-1 flex flex-col min-w-0 min-h-screen">
        
        {/* HEADER HAUT */}
        <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-4 sm:px-6 shadow-sm shrink-0 sticky top-0 z-10">
          <div className="flex items-center gap-2 sm:gap-4">
            
            {/* LE BOUTON BURGER (Fonctionne maintenant parfaitement sur PC et Mobile) */}
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

          <div className="flex-1 flex justify-end items-center gap-2 sm:gap-4">
            {user && (
              <div className="text-right">
                <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-100 shadow-sm">
                  {getRoleLabel(user.id_role)}
                </span>
              </div>
            )}
            
            <button
              onClick={handleLogout}
              className="inline-flex items-center gap-2 px-2.5 py-1.5 border border-gray-300 rounded-md text-xs font-medium text-gray-700 bg-white hover:bg-gray-50 transition-colors shadow-sm"
            >
              <svg className="h-4 w-4 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
              <span className="hidden xs:inline">Déconnexion</span>
            </button>
          </div>
        </header>

        {/* CONTENU DYNAMIQUE */}
        <main className="flex-1 p-4 sm:p-8 overflow-y-auto">
          <div className="max-w-7xl mx-auto">
            {children}
          </div>
        </main>
      </div>

    </div>
  );
};