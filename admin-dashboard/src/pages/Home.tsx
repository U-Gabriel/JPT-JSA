import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { USER_ROLES, type UserRole } from '../types/auth';
import { getMeApi } from '../api/auth';

// Interface locale du profil utilisateur renvoyé par /persons/me
interface PersonProfile {
  id_person: number;
  pseudo: string;
  mail: string;
  firstname: string;
  surname: string;
  number_phone: string;
  id_role: number;
  last_connexion: string;
  is_verified: boolean;
}

// Structure des éléments de navigation pour le filtrage dynamique
interface NavigationItem {
  name: string;
  href: string;
  allowedRoles: UserRole[];
  icon: string;
  description: string;
}

// Liste synchronisée avec ton AdminLayout et ton App.tsx (enrichie d'icônes et de descriptions)
const NAVIGATION_ITEMS: NavigationItem[] = [
  { 
    name: 'Utilisateurs', 
    href: '/users', 
    allowedRoles: [USER_ROLES.SUPER_ADMIN],
    icon: '👥',
    description: 'Gestion des comptes et des droits d\'accès globaux.'
  },
  { 
    name: 'Objet', 
    href: '/objects', 
    allowedRoles: [USER_ROLES.ADMIN_SIMPLE, USER_ROLES.SUPER_ADMIN, USER_ROLES.ENGINEER],
    icon: '⚙️',
    description: 'Configuration et monitoring des modules IoT connectés.'
  },
  { 
    name: 'Plantes', 
    href: '/plants', 
    allowedRoles: [USER_ROLES.ADMIN_SIMPLE, USER_ROLES.SUPER_ADMIN],
    icon: '🌱',
    description: 'Suivi botanique, cycles et métriques de santé.'
  },
  { 
    name: 'Avis', 
    href: '/notices', 
    allowedRoles: [USER_ROLES.ADMIN_SIMPLE, USER_ROLES.SUPER_ADMIN, USER_ROLES.MANAGER, USER_ROLES.ENGINEER],
    icon: '💬',
    description: 'Modération des retours d\'expérience et commentaires.'
  },
  { 
    name: 'Indication', 
    href: '/indications', 
    allowedRoles: [USER_ROLES.ADMIN_SIMPLE, USER_ROLES.SUPER_ADMIN],
    icon: 'ℹ️',
    description: 'Gestion des consignes d\'entretien et seuils d\'alerte.'
  },
  { 
    name: 'Commande', 
    href: '/orders', 
    allowedRoles: [USER_ROLES.ADMIN_SIMPLE, USER_ROLES.SUPER_ADMIN, USER_ROLES.MANAGER, USER_ROLES.PREPARATOR],
    icon: '📦',
    description: 'Traitement, statuts d\'expédition et suivi logistique.'
  },
];

export const Home: React.FC = () => {
  const [profile, setProfile] = useState<PersonProfile | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Récupération des données du profil au montage du composant
  useEffect(() => {
    getMeApi()
      .then((res) => {
        if (res.status === 'OK' && res.data) {
          setProfile(res.data);
        } else {
          setError(res.message || "Erreur lors de la récupération des données de session.");
        }
      })
      .catch((err) => {
        console.error("Erreur Home profil:", err);
        setError("Impossible de joindre le serveur de gestion.");
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  
  const allowedActions = NAVIGATION_ITEMS.filter(item => 
    profile && item.allowedRoles.includes(profile.id_role as UserRole)
  );

  // Helper de badge stylisé pour les rôles structurels
  const renderRoleBadge = (roleId: number) => {
    switch (roleId) {
      case USER_ROLES.SUPER_ADMIN:
        return <span className="px-3 py-1 bg-red-100 text-red-800 border border-red-200 rounded-full font-bold text-xs uppercase tracking-wider">🛠️ Super Admin</span>;
      case USER_ROLES.ADMIN_SIMPLE:
        return <span className="px-3 py-1 bg-blue-100 text-blue-800 border border-blue-200 rounded-full font-bold text-xs uppercase tracking-wider">💻 Admin</span>;
      case USER_ROLES.MANAGER:
        return <span className="px-3 py-1 bg-emerald-100 text-emerald-800 border border-emerald-200 rounded-full font-bold text-xs uppercase tracking-wider">📈 Manager</span>;
      case USER_ROLES.ENGINEER:
        return <span className="px-3 py-1 bg-purple-100 text-purple-800 border border-purple-200 rounded-full font-bold text-xs uppercase tracking-wider">🚀 Ingénieur</span>;
      case USER_ROLES.PREPARATOR:
        return <span className="px-3 py-1 bg-amber-100 text-amber-800 border border-amber-200 rounded-full font-bold text-xs uppercase tracking-wider">📦 Préparateur</span>;
      default:
        return <span className="px-3 py-1 bg-gray-100 text-gray-800 border border-gray-200 rounded-full font-bold text-xs uppercase tracking-wider">👤 Utilisateur</span>;
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] space-y-3">
        <div className="w-8 h-8 border-4 border-slate-900 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest">Initialisation de votre tableau de bord...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-800 p-4 rounded-xl text-xs font-semibold flex items-center gap-2 max-w-xl mx-auto mt-6">
        <span>❌</span> {error}
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto p-2 animate-fadeIn">
      
      {/* 1. BANNIÈRE D'ACCUEIL AVEC RÔLE */}
      <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-black uppercase tracking-tight text-gray-900">
            Console de Session : <span className="text-blue-600 font-extrabold">{profile?.firstname} {profile?.surname}</span> 👋
          </h2>
          <p className="text-xs text-gray-400 mt-0.5">
            Bienvenue sur l'infrastructure GDOME. Utilisez les modules autorisés pour gérer l'activité courante.
          </p>
        </div>
        <div className="self-start sm:self-center">
          {profile && renderRoleBadge(profile.id_role)}
        </div>
      </div>

      {/* 2. DISPOSITION BI-COLONNE : PROFIL vs MODULES APPLICATIFS */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 items-start">
        
        {/* A. FICHE PROFIL TECHNIQUE (Prend 1 colonne sur écran large) */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-xs overflow-hidden">
          <div className="px-5 py-4 bg-slate-50 border-b border-gray-200 flex items-center justify-between">
            <h3 className="font-black text-xs uppercase tracking-wider text-slate-700 flex items-center gap-2">
              👤 Identité Numérique
            </h3>
            {profile?.is_verified && (
              <span className="text-[10px] bg-emerald-50 text-emerald-700 font-bold px-2 py-0.5 rounded border border-emerald-200">
                Vérifié
              </span>
            )}
          </div>

          <div className="p-5 space-y-4 text-xs">
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-slate-50 p-3 rounded-xl border border-gray-100">
                <span className="text-gray-400 block font-bold uppercase text-[9px] tracking-wider mb-0.5">ID Système</span>
                <strong className="text-gray-900 text-sm">#{profile?.id_person}</strong>
              </div>
              <div className="bg-slate-50 p-3 rounded-xl border border-gray-100">
                <span className="text-gray-400 block font-bold uppercase text-[9px] tracking-wider mb-0.5">Pseudo</span>
                <strong className="text-gray-900 text-sm truncate block">{profile?.pseudo}</strong>
              </div>
            </div>

            <div className="border-b border-gray-100 pb-3">
              <span className="text-gray-400 block font-bold uppercase text-[9px] tracking-wider">Adresse E-mail</span>
              <strong className="text-gray-800 block mt-0.5 text-xs truncate font-medium">{profile?.mail}</strong>
            </div>

            <div className="border-b border-gray-100 pb-3">
              <span className="text-gray-400 block font-bold uppercase text-[9px] tracking-wider">Téléphone</span>
              <strong className="text-gray-800 block mt-0.5 text-xs font-medium">
                {profile?.number_phone || <span className="text-gray-300 italic font-normal">Non configuré</span>}
              </strong>
            </div>

            <div className="pt-1 flex flex-col text-gray-400 text-[10px] space-y-1">
              <span className="font-semibold uppercase tracking-wider text-[9px]">Dernier accès réseau :</span>
              <span className="font-mono text-slate-600 font-bold bg-slate-50 px-2 py-1 rounded border border-slate-100 text-center">
                {profile?.last_connexion ? new Date(profile.last_connexion).toLocaleString('fr-FR') : 'Date indéterminée'}
              </span>
            </div>
          </div>
        </div>

        {/* B. MODULES & ACCÈS AUTORISÉS (Prend 2 colonnes sur écran large) */}
        <div className="xl:col-span-2 space-y-4">
          <div className="flex flex-col">
            <h3 className="font-black text-xs uppercase tracking-wider text-slate-700 flex items-center gap-2">
              🛠️ Vos Modules Accessibles ({allowedActions.length})
            </h3>
            <p className="text-xs text-gray-400 mt-0.5">
              En fonction de votre habilitation de sécurité, vous pouvez naviguer directement vers ces applications :
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {allowedActions.map((item) => (
              <Link
                key={item.href}
                to={item.href}
                className="group bg-white p-4 rounded-xl border border-gray-200 shadow-xs hover:border-blue-500 hover:shadow-md hover:shadow-blue-500/5 transition-all duration-200 flex items-start gap-4"
              >
                <div className="text-2xl p-2.5 bg-slate-50 group-hover:bg-blue-50 rounded-xl transition-colors shrink-0">
                  {item.icon}
                </div>
                <div className="space-y-1 min-w-0">
                  <div className="flex items-center gap-1.5">
                    <h4 className="text-xs font-black text-slate-900 uppercase tracking-wide group-hover:text-blue-600 transition-colors">
                      {item.name}
                    </h4>
                    <span className="text-gray-300 group-hover:text-blue-500 transform group-hover:translate-x-0.5 transition-all text-[11px]">
                      →
                    </span>
                  </div>
                  <p className="text-[11px] text-gray-400 leading-relaxed line-clamp-2">
                    {item.description}
                  </p>
                </div>
              </Link>
            ))}

            {/* Cas ultra-rare (ex: un rôle "Comptable" sans aucun menu mappé pour le moment) */}
            {allowedActions.length === 0 && (
              <div className="col-span-2 bg-amber-50 border border-amber-200 text-amber-800 p-4 rounded-xl text-xs font-medium text-center">
                ⚠️ Aucun module applicatif direct n'est associé à vos droits de sécurité actuels.
              </div>
            )}
          </div>
        </div>

      </div>

    </div>
  );
};