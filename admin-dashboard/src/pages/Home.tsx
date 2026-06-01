import React from 'react';
import { useAuth } from '../contexts/AuthContext';

export const Home: React.FC = () => {
  const { user } = useAuth();

  return (
    <div className="space-y-6">
      {/* Carte de Bienvenue */}
      <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
        <h2 className="text-2xl font-bold text-gray-900">
          Bienvenue, <span className="text-blue-600 capitalize">{user?.firstname || 'Administrateur'}</span> 👋
        </h2>
        <p className="text-gray-500 mt-1">
          Ravi de vous revoir. Voici un aperçu global de votre activité aujourd'hui.
        </p>
      </div>

      {/* Zone Critique d'Entreprise stylisée */}
      <div className="bg-amber-50 border border-amber-200 rounded-xl p-6 shadow-sm">
        <div className="flex items-start gap-4">
          <div className="p-2 bg-amber-100 text-amber-800 rounded-lg">
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <div>
            <h3 className="text-base font-semibold text-amber-900">Zone Critique : Droits Super Admin</h3>
            <p className="text-sm text-amber-700 mt-1">
              Vous êtes connecté avec les accès maximaux du système GDOME. Soyez vigilant lors de vos actions.
            </p>
            <div className="mt-4">
              <button className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-xs font-semibold rounded-lg shadow-sm transition-colors duration-150">
                Réinitialiser la Base de Données
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};