import React, { useEffect, useState } from 'react';
import { getAllNoticesApi, updateNoticeStatusApi, type NoticeItem, type NoticeStatus } from '../api/notices';

const Notice: React.FC = () => {
  const [noticesList, setNoticesList] = useState<NoticeItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  
  // Stocke les statuts modifiés localement avant soumission : { [id_notice]: 'NEW_STATUS' }
  const [localStatuses, setLocalStatuses] = useState<{ [key: number]: NoticeStatus }>({});
  // Gère l'état de chargement de la sauvegarde par ligne : { [id_notice]: true/false }
  const [submittingIds, setSubmittingIds] = useState<{ [key: number]: boolean }>({});

  // Chargement initial des données
  const loadNotices = async () => {
    setLoading(true);
    try {
      const response = await getAllNoticesApi();
      if (response.status === 'OK') {
        setNoticesList(response.data);
        // Réinitialise les statuts locaux à chaque rechargement global
        setLocalStatuses({});
      } else {
        alert(response.message || "Erreur lors de la récupération des remarques.");
      }
    } catch (error) {
      console.error("Erreur getAllNoticesApi:", error);
      alert("Impossible de joindre le serveur.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadNotices();
  }, []);

  // Gestion du changement dans le select d'une ligne
  const handleStatusChange = (id_notice: number, newStatus: NoticeStatus) => {
    setLocalStatuses((prev) => ({
      ...prev,
      [id_notice]: newStatus,
    }));
  };

  
    // Envoi de la modification au serveur
    const handleSaveStatus = async (id_notice: number) => {
        const statusToSend = localStatuses[id_notice];
        if (!statusToSend) return;

        setSubmittingIds((prev) => ({ ...prev, [id_notice]: true }));

        try {
            const result = await updateNoticeStatusApi({
            id_notice,
            status: statusToSend,
            });

            if (result.status === 'OK') {
            alert(result.message || "Le statut a été mis à jour !");
            
            // 🔄 RECHARGEMENT GLOBAL : On va chercher la nouvelle liste fraîche depuis le serveur
            await loadNotices();
            } else {
            alert(`Échec : ${result.message}`);
            }
        } catch (error) {
            console.error("Erreur updateNoticeStatusApi:", error);
            alert("Une erreur est survenue lors de la mise à jour.");
        } finally {
            setSubmittingIds((prev) => ({ ...prev, [id_notice]: false }));
        }
    };

  // Helper de badge couleur Tailwind pour rendre les statuts lisibles d'un coup d'œil
  const getStatusBadgeClass = (status: NoticeStatus) => {
    switch (status) {
      case 'PENDING': return 'bg-amber-100 text-amber-800 border-amber-200';
      case 'LOADING': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'RESOLVED': return 'bg-emerald-100 text-emerald-800 border-emerald-200';
      case 'CLOSED': return 'bg-gray-100 text-gray-800 border-gray-200';
      default: return 'bg-slate-100 text-slate-800 border-slate-200';
    }
  };

  return (
    <div className="p-4 md:p-8 bg-gray-50 min-h-screen font-sans">
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* En-tête de page */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
          <div>
            <h2 className="text-xl font-black text-gray-950 uppercase tracking-tight">Suivi des Remarques & Tickets</h2>
            <p className="text-xs text-gray-400 mt-1">Consultez les requêtes des utilisateurs et gérez l'état d'avancement des résolutions.</p>
          </div>
          <button
            onClick={loadNotices}
            disabled={loading}
            className="px-4 py-2 bg-slate-900 text-white rounded-lg text-xs font-semibold hover:bg-slate-800 transition-colors disabled:opacity-50 self-start sm:self-center"
          >
            {loading ? 'Chargement...' : '🔄 Rafraîchir la liste'}
          </button>
        </div>

        {/* Corps principal / Liste */}
        {loading ? (
          <div className="text-center py-12 text-sm text-gray-500 bg-white rounded-xl border border-gray-200">Chargement des tickets...</div>
        ) : noticesList.length === 0 ? (
          <div className="text-center py-16 text-sm text-gray-400 border border-dashed border-gray-300 bg-white rounded-xl">
            Aucune remarque enregistrée pour le moment.
          </div>
        ) : (
          <div className="space-y-4">
            {noticesList.map((notice) => {
              // Le statut actuellement choisi dans le select (sinon celui de base en BDD)
              const currentSelectedStatus = localStatuses[notice.id_notice] || notice.status;
              // Est-ce que le statut a changé par rapport à la BDD ?
              const hasChanged = currentSelectedStatus !== notice.status;
              const isSubmitting = submittingIds[notice.id_notice] || false;

              return (
                <div 
                  key={notice.id_notice} 
                  className={`bg-white rounded-xl border transition-all p-5 md:p-6 shadow-xs flex flex-col lg:flex-row lg:items-start justify-between gap-6 ${
                    hasChanged ? 'border-blue-300 ring-1 ring-blue-100 bg-blue-50/10' : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  {/* Partie Gauche : Infos ticket */}
                  <div className="space-y-3 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider bg-slate-100 text-slate-700 border border-slate-200">
                        {notice.tag_name}
                      </span>
                      <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold border ${getStatusBadgeClass(notice.status)}`}>
                        {notice.status}
                      </span>
                      <span className="text-xs text-gray-400 font-medium">
                        N°{notice.id_notice} • Par <strong className="text-gray-700">{notice.author_pseudo}</strong>, le {new Date(notice.created_at).toLocaleDateString('fr-FR')}
                      </span>
                    </div>

                    <div>
                      <h3 className="text-base font-bold text-gray-900">{notice.title}</h3>
                      <p className="text-sm text-gray-600 mt-1 leading-relaxed whitespace-pre-line">{notice.content}</p>
                    </div>

                    {/* Liaisons matérielles (uniquement si présentes) */}
                    {(notice.object_title || notice.object_profile_title) && (
                      <div className="flex flex-wrap gap-x-4 gap-y-1 pt-2 text-xs text-gray-400 border-t border-gray-100">
                        {notice.object_title && (
                          <span>🤖 Objet : <strong className="text-gray-600">{notice.object_title}</strong></span>
                        )}
                        {notice.object_profile_title && (
                          <span>📋 Profil assigné : <strong className="text-gray-600">{notice.object_profile_title}</strong></span>
                        )}
                        <span>Visibilité : <strong>{notice.is_public ? '🌐 Public' : '🔒 Privé'}</strong></span>
                      </div>
                    )}
                  </div>

                  {/* Partie Droite : Actions de changement de statut */}
                  <div className="flex sm:items-center lg:flex-col lg:items-end justify-between sm:justify-start lg:justify-start gap-3 pt-4 lg:pt-0 border-t sm:border-t-0 lg:border-l lg:pl-6 border-gray-100 lg:w-60 shrink-0">
                    <div className="w-full max-w-[200px] lg:max-w-none">
                      <label className="block text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-1">Modifier l'état</label>
                      <select
                        value={currentSelectedStatus}
                        onChange={(e) => handleStatusChange(notice.id_notice, e.target.value as NoticeStatus)}
                        disabled={isSubmitting}
                        className="w-full text-xs font-semibold text-gray-800 bg-gray-50 border border-gray-200 rounded-lg p-2.5 focus:bg-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors cursor-pointer"
                      >
                        <option value="PENDING">⏳ PENDING (En attente)</option>
                        <option value="LOADING">🔄 LOADING (En cours de traitement)</option>
                        <option value="RESOLVED">🟢 RESOLVED (Résolu)</option>
                        <option value="CLOSED">🔒 CLOSED (Clôturé)</option>
                      </select>
                    </div>

                    {/* Le bouton s'active ou s'anime selon les modifications */}
                    <button
                      onClick={() => handleSaveStatus(notice.id_notice)}
                      disabled={!hasChanged || isSubmitting}
                      className={`w-full sm:w-auto lg:w-full px-4 py-2.5 rounded-lg text-xs font-bold transition-all shadow-xs flex items-center justify-center gap-1.5 ${
                        hasChanged 
                          ? 'bg-blue-600 text-white hover:bg-blue-700 cursor-pointer' 
                          : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                      }`}
                    >
                      {isSubmitting ? (
                        <>
                          <svg className="w-3.5 h-3.5 animate-spin text-white" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                          </svg>
                          <span>Envoi...</span>
                        </>
                      ) : (
                        <span>Mettre à jour</span>
                      )}
                    </button>
                  </div>

                </div>
              );
            })}
          </div>
        )}

      </div>
    </div>
  );
};

export default Notice;