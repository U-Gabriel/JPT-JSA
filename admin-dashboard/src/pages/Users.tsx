import React, { useState, useEffect } from 'react';
import { createUserApi, searchPersonsApi, deletePersonApi, type CreateUserData, type PersonData } from '../api/users';
import { USER_ROLES } from '../types/auth';
import { Input } from '../components/Input';
import { Button } from '../components/Button';

const ROLE_OPTIONS = [
  { label: 'Super Admin', id: USER_ROLES.SUPER_ADMIN },
  { label: 'Admin', id: USER_ROLES.ADMIN_SIMPLE },
  { label: 'Manager', id: USER_ROLES.MANAGER },
  { label: 'Préparateur', id: USER_ROLES.PREPARATOR },
  { label: 'Comptable', id: USER_ROLES.ACCOUNTANT },
];

const getRoleBadgeStyles = (roleId: number) => {
  switch (roleId) {
    case USER_ROLES.SUPER_ADMIN: return 'bg-purple-50 text-purple-700 border-purple-100';
    case USER_ROLES.ADMIN_SIMPLE: return 'bg-blue-50 text-blue-700 border-blue-100';
    case USER_ROLES.MANAGER: return 'bg-amber-50 text-amber-700 border-amber-100';
    case USER_ROLES.PREPARATOR: return 'bg-teal-50 text-teal-700 border-teal-100';
    default: return 'bg-gray-50 text-gray-600 border-gray-100';
  }
};

const getRoleLabel = (roleId: number): string => {
  switch (roleId) {
    case USER_ROLES.SUPER_ADMIN: return 'Super Admin';
    case USER_ROLES.ADMIN_SIMPLE: return 'Admin';
    case USER_ROLES.MANAGER: return 'Manager';
    case USER_ROLES.PREPARATOR: return 'Préparateur';
    case USER_ROLES.ACCOUNTANT: return 'Comptable';
    default: return 'Client / User';
  }
};

export const Users: React.FC = () => {
  // États Formulaire Création
  const [pseudo, setPseudo] = useState('');
  const [mail, setMail] = useState('');
  const [password, setPassword] = useState('');
  const [firstname, setFirstname] = useState('');
  const [surname, setSurname] = useState('');
  const [phone, setPhone] = useState('');
  const [roleId, setRoleId] = useState<number>(USER_ROLES.ADMIN_SIMPLE);

  // États Liste & Recherche
  const [persons, setPersons] = useState<PersonData[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchLoading, setSearchLoading] = useState(false);

  // Graphes globaux d'action / feedbacks
  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState<{ status: 'OK' | 'KO'; message: string } | null>(null);

  // État de la boîte modale de confirmation de suppression
  const [userToDelete, setUserToDelete] = useState<PersonData | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  // 🟢 CHARGEMENT INITIAL & RECHERCHE DYNAMIQUE
  const fetchUsers = async (textToSearch: string) => {
    setSearchLoading(true);
    const res = await searchPersonsApi(textToSearch);
    setSearchLoading(false);
    if (res.status === 'OK' && res.data) {
      setPersons(res.data);
    }
  };

  useEffect(() => {
    fetchUsers(''); // Charge les 200 premiers au montage
  }, []);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchUsers(searchQuery);
  };

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setFeedback(null);

    if (!pseudo || !mail || !password) {
      setFeedback({ status: 'KO', message: 'Le pseudo, mail et mot de passe sont obligatoires.' });
      return;
    }

    setLoading(true);
    const payload: CreateUserData = {
      pseudo,
      mail,
      password,
      firstname: firstname || null,
      surname: surname || null,
      number_phone: phone || '0000000000',
      id_role: roleId,
      is_verified: true,
    };

    const response = await createUserApi(payload);
    setLoading(false);

    if (response.status === 'OK') {
      setFeedback({ status: 'OK', message: response.message || 'Compte créé avec succès !' });
      setPseudo(''); setMail(''); setPassword(''); setFirstname(''); setSurname(''); setPhone('');
      fetchUsers(searchQuery); // Rafraîchit instantanément la table
    } else {
      setFeedback({ status: 'KO', message: response.message || 'Une erreur est survenue.' });
    }
  };

  // 🟢 ACTION DE SUPPRESSION COMPLÈTE
  const confirmDeleteUser = async () => {
    if (!userToDelete) return;
    setDeleteLoading(true);

    const res = await deletePersonApi(userToDelete.id_person);
    setDeleteLoading(false);

    if (res.status === 'OK') {
      setUserToDelete(null); // Ferme la modal
      fetchUsers(searchQuery); // Rafraîchit la liste des utilisateurs
    } else {
      alert(res.message || 'Erreur lors de la suppression.');
    }
  };

  return (
    <div className="space-y-6 relative">
      <div>
        <h2 className="text-xl font-bold text-gray-900">Gestion des Utilisateurs</h2>
        <p className="text-sm text-gray-500 mt-1">Configurez les profils d'accès et administrez la base globale.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* L'ENSEMBLE BLOC CRÉATION (Gauche) */}
        <section className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm lg:col-span-4">
          <h3 className="text-base font-bold text-gray-900 border-b border-gray-100 pb-3 mb-4">
            Créer un compte administratif
          </h3>

          {feedback && (
            <div className={`p-3 text-sm rounded-lg mb-4 font-medium border ${
              feedback.status === 'OK' ? 'bg-green-50 border-green-200 text-green-700' : 'bg-red-50 border-red-200 text-red-700'
            }`}>
              {feedback.message}
            </div>
          )}

          <form onSubmit={handleCreateUser} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <Input label="Nom" type="text" placeholder="Dupont" value={surname} onChange={e => setSurname(e.target.value)} disabled={loading} />
              <Input label="Prénom" type="text" placeholder="Jean" value={firstname} onChange={e => setFirstname(e.target.value)} disabled={loading} />
            </div>
            <Input label="Nom d'utilisateur (Pseudo) *" type="text" placeholder="j.dupont" value={pseudo} onChange={e => setPseudo(e.target.value)} disabled={loading} />
            <Input label="Adresse Email *" type="email" placeholder="jean@jackpote.com" value={mail} onChange={e => setMail(e.target.value)} disabled={loading} />
            <Input label="Mot de passe *" type="password" placeholder="••••••••" value={password} onChange={e => setPassword(e.target.value)} disabled={loading} />
            <Input label="Numéro de téléphone" type="text" placeholder="0612345678" value={phone} onChange={e => setPhone(e.target.value)} disabled={loading} />

            <div className="flex flex-col space-y-1">
              <label className="text-xs font-semibold text-gray-600 uppercase tracking-wider">Rôle attribué</label>
              <select
                value={roleId}
                onChange={e => setRoleId(Number(e.target.value))}
                disabled={loading}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-gray-800 font-medium transition-all"
              >
                {ROLE_OPTIONS.map(opt => <option key={opt.id} value={opt.id}>{opt.label}</option>)}
              </select>
            </div>

            <div className="pt-2">
              <Button type="submit" isLoading={loading} className="w-full bg-blue-600 hover:bg-blue-700 text-white">
                Ajouter au personnel
              </Button>
            </div>
          </form>
        </section>

        {/* 🟢 BLOC RECHERCHE & TABLE RESPONSIVE (Droite) */}
        <section className="bg-white rounded-xl border border-gray-200 shadow-sm lg:col-span-8 overflow-hidden">
          {/* Barre de Recherche supérieure */}
          <div className="p-6 border-b border-gray-100 bg-gray-50/50">
            <form onSubmit={handleSearchSubmit} className="flex gap-2 max-w-md">
              <div className="relative flex-1">
                <input
                  type="text"
                  placeholder="Rechercher par pseudo, mail..."
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 border border-gray-300 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-gray-800"
                />
                <svg className="h-4 w-4 text-gray-400 absolute left-3 top-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <button
                type="submit"
                disabled={searchLoading}
                className="px-4 py-2 bg-gray-900 text-white hover:bg-gray-800 text-sm font-medium rounded-lg transition-colors shadow-sm disabled:opacity-50"
              >
                {searchLoading ? 'Chargement...' : 'Filtrer'}
              </button>
            </form>
          </div>

          {/* ========================================================================= */}
          {/* 🟢 MODE RESPONSIVE : CARTES SUR MOBILE (Caché sur PC avec md:hidden) */}
          {/* ========================================================================= */}
          <div className="block md:hidden divide-y divide-gray-100">
            {persons.length === 0 ? (
              <div className="py-12 text-center text-gray-400 font-medium">
                Aucun utilisateur ne correspond à la recherche.
              </div>
            ) : (
              persons.map(person => (
                <div key={person.id_person} className="p-4 space-y-3 hover:bg-gray-50/50 transition-colors">
                  {/* Ligne principale : Pseudo + Poubelle */}
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="font-bold text-gray-900 text-base">@{person.pseudo}</span>
                      <div className="text-xs text-gray-500">{person.mail}</div>
                    </div>
                    
                    {/* Bouton Action unique et accessible sur mobile */}
                    <button
                      onClick={() => setUserToDelete(person)}
                      className="p-2 text-gray-400 hover:text-red-600 rounded-lg hover:bg-red-50 transition-all border border-gray-100 shadow-sm shrink-0"
                      title="Supprimer le compte"
                    >
                      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>

                  {/* Ligne secondaire : Identité et Badges */}
                  <div className="flex flex-wrap items-center gap-2 pt-1 text-xs">
                    {/* Identité physique */}
                    <div className="text-gray-700 bg-gray-100 px-2 py-1 rounded font-medium">
                      👤 {person.firstname || person.surname 
                        ? `${person.firstname || ''} ${person.surname || ''}`.trim() 
                        : 'Non renseigné'
                      }
                    </div>

                    {/* Badge Rôle */}
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full font-semibold border ${getRoleBadgeStyles(person.id_role)}`}>
                      {getRoleLabel(person.id_role)}
                    </span>

                    {/* Badge Statut Mail */}
                    <span className={`inline-flex px-2 py-0.5 rounded font-bold ${
                      person.is_verified ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                    }`}>
                      {person.is_verified ? 'Vérifié' : 'En attente'}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* ========================================================================= */}
          {/* 🟢 MODE DESKTOP : TABLEAU COMPLET SUR PC (Caché sur Mobile avec hidden md:block) */}
          {/* ========================================================================= */}
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  <th className="py-3 px-4">Utilisateur / Mail</th>
                  <th className="py-3 px-4">Identité</th>
                  <th className="py-3 px-4">Rôle</th>
                  <th className="py-3 px-4 text-center">Statut Mail</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-sm">
                {persons.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-12 text-center text-gray-400 font-medium">
                      Aucun utilisateur ne correspond à la recherche.
                    </td>
                  </tr>
                ) : (
                  persons.map(person => (
                    <tr key={person.id_person} className="hover:bg-gray-50/50 transition-colors">
                      <td className="py-3.5 px-4">
                        <div className="font-semibold text-gray-900">{person.pseudo}</div>
                        <div className="text-xs text-gray-500">{person.mail}</div>
                      </td>
                      <td className="py-3.5 px-4 text-gray-700">
                        {person.firstname || person.surname 
                          ? `${person.firstname || ''} ${person.surname || ''}`.trim() 
                          : <span className="text-gray-400 italic text-xs">Non renseigné</span>
                        }
                      </td>
                      <td className="py-3.5 px-4">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border ${getRoleBadgeStyles(person.id_role)}`}>
                          {getRoleLabel(person.id_role)}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        <span className={`inline-flex px-2 py-0.5 rounded text-xs font-bold ${
                          person.is_verified ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                        }`}>
                          {person.is_verified ? 'Vérifié' : 'En attente'}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <button
                          onClick={() => setUserToDelete(person)}
                          className="p-1.5 text-gray-400 hover:text-red-600 rounded-md hover:bg-red-50 transition-all"
                          title="Supprimer le compte"
                        >
                          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </section>
      </div>

      {/* 🟢 MODAL DE CONFIRMATION DE SUPPRESSION (S'affiche par-dessus l'écran uniquement si un utilisateur est sélectionné) */}
      {userToDelete && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6 border border-gray-100 transform scale-100 transition-all">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-full bg-red-50 flex items-center justify-center text-red-600 shrink-0">
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <div className="flex-1">
                <h4 className="text-base font-bold text-gray-900">Confirmer la suppression</h4>
                <p className="text-sm text-gray-500 mt-2">
                  Êtes-vous sûr de vouloir supprimer définitivement le compte de <span className="font-semibold text-gray-800">@{userToDelete.pseudo}</span> ({userToDelete.mail}) ? Cette action est irréversible.
                </p>
              </div>
            </div>

            <div className="mt-6 flex justify-end gap-3 border-t border-gray-100 pt-4">
              <button
                type="button"
                disabled={deleteLoading}
                onClick={() => setUserToDelete(null)}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Annuler
              </button>
              <button
                type="button"
                disabled={deleteLoading}
                onClick={confirmDeleteUser}
                className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 transition-colors shadow-sm disabled:opacity-50 flex items-center gap-2"
              >
                {deleteLoading ? 'Suppression...' : 'Supprimer définitivement'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};