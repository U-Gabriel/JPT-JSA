import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import { USER_ROLES } from '../types/auth';

export const Home: React.FC = () => {
  const { user, logout } = useAuth();

  return (
    <div style={{ padding: '20px' }}>
      <h1>Accueeil</h1>
      {user && (
        <div>
          <p>Bienvenue, {user.firstname}</p>
          
          {/* Ce bouton ne s'affichera QUE si la personne est SuperAdmin */}
          {user.id_role === USER_ROLES.SUPER_ADMIN && (
            <div style={{ padding: '10px', background: '#fff3cd', margin: '15px 0', border: '1px solid #ffeeba' }}>
              <p><strong>Zone Critique :</strong> Vous êtes Super Admin.</p>
              <button style={{ color: 'red' }}>Réinitialiser la Base de Données</button>
            </div>
          )}

          <button onClick={logout}>Déconnexion</button>
        </div>
      )}
    </div>
  );
};