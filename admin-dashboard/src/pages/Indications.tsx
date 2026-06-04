import React, { useEffect, useState } from 'react';
import { getAllTagsApi, createTagApi, deleteTagApi, type TagItem } from '../api/tag';
import { getAllFaqsApi, getObjectsLookupApi, createFaqApi, deleteFaqApi, type FaqItem, type ObjectLookupItem } from '../api/faq';

const Indications: React.FC = () => {
  // --- ÉTATS DES DONNÉES ---
  const [tags, setTags] = useState<TagItem[]>([]);
  const [faqs, setFaqs] = useState<FaqItem[]>([]);
  const [objects, setObjects] = useState<ObjectLookupItem[]>([]);

  // --- ÉTATS DE CHARGEMENT ---
  const [loadingData, setLoadingData] = useState<boolean>(false);
  const [deletingTagId, setDeletingTagId] = useState<number | null>(null);
  const [deletingFaqId, setDeletingFaqId] = useState<number | null>(null);
  const [isSubmittingTag, setIsSubmittingTag] = useState<boolean>(false);
  const [isSubmittingFaq, setIsSubmittingFaq] = useState<boolean>(false);

  // --- ACCORDÉONS (false = masqué par défaut, true = déplié) ---
  const [showFormTag, setShowFormTag] = useState(false);
  const [showFormFaq, setShowFormFaq] = useState(false);
  const [showListTag, setShowListTag] = useState(true);
  const [showListFaq, setShowListFaq] = useState(true);

  // --- FORMULAIRES STATES ---
  const [tagForm, setTagForm] = useState({ title: '', color_code: '#3498db', description: '' });
  const [faqForm, setFaqForm] = useState({ question: '', answer: '', id_tag: '', id_object: '', order_view: '1' });

  // --- CHARGEMENT GLOBAL ---
  const loadAllData = async () => {
    setLoadingData(true);
    try {
      const [resTags, resFaqs, resObjects] = await Promise.all([
        getAllTagsApi(),
        getAllFaqsApi(),
        getObjectsLookupApi()
      ]);

      if (resTags.status === 'OK') setTags(resTags.data);
      if (resFaqs.status === 'OK') setFaqs(resFaqs.data);
      if (resObjects.status === 'OK') setObjects(resObjects.data);
    } catch (err) {
      console.error("Erreur lors du chargement des données d'indications:", err);
    } finally {
      setLoadingData(false);
    }
  };

  useEffect(() => {
    loadAllData();
  }, []);

  // --- ACTIONS : CRÉATION TAG ---
  const handleCreateTag = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!tagForm.title || !tagForm.description) return alert("Veuillez remplir tous les champs.");
    
    setIsSubmittingTag(true);
    try {
      const res = await createTagApi(tagForm);
      if (res.status === 'OK') {
        alert(res.message || "Tag créé !");
        setTagForm({ title: '', color_code: '#3498db', description: '' });
        setShowFormTag(false);
        const resTags = await getAllTagsApi();
        if (resTags.status === 'OK') setTags(resTags.data);
      }
    } catch (err) {
      alert("Erreur lors de la création du tag.");
    } finally {
      setIsSubmittingTag(false);
    }
  };

  // --- ACTIONS : CRÉATION FAQ ---
  const handleCreateFaq = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!faqForm.question || !faqForm.answer || !faqForm.id_tag) {
      return alert("La question, la réponse et le tag sont obligatoires.");
    }

    setIsSubmittingFaq(true);
    try {
      await createFaqApi({
        question: faqForm.question,
        answer: faqForm.answer,
        id_tag: parseInt(faqForm.id_tag),
        id_object: faqForm.id_object ? parseInt(faqForm.id_object) : null,
        order_view: parseInt(faqForm.order_view) || 1
      });

      alert("FAQ ajoutée avec succès !");
      setFaqForm({ question: '', answer: '', id_tag: '', id_object: '', order_view: '1' });
      setShowFormFaq(false);
      const resFaqs = await getAllFaqsApi();
      if (resFaqs.status === 'OK') setFaqs(resFaqs.data);
    } catch (err) {
      alert("Erreur lors de l'ajout à la FAQ.");
    } finally {
      setIsSubmittingFaq(false);
    }
  };

  // --- ACTIONS : SUPPRESSION TAG ---
  const handleDeleteTag = async (id_tag: number) => {
    if (!window.confirm("Supprimer ce tag ? Cela peut impacter les éléments liés.")) return;
    setDeletingTagId(id_tag);
    try {
      const res = await deleteTagApi(id_tag);
      if (res.status === 'OK') {
        const resTags = await getAllTagsApi();
        if (resTags.status === 'OK') setTags(resTags.data);
      }
    } catch (err) {
      alert("Impossible de supprimer le tag.");
    } finally {
      setDeletingTagId(null);
    }
  };

  // --- ACTIONS : SUPPRESSION FAQ ---
  const handleDeleteFaq = async (id_faq: number) => {
    if (!window.confirm("Voulez-vous retirer cette question de la FAQ ?")) return;
    setDeletingFaqId(id_faq);
    try {
      const res = await deleteFaqApi(id_faq);
      if (res.status === 'OK') {
        const resFaqs = await getAllFaqsApi();
        if (resFaqs.status === 'OK') setFaqs(resFaqs.data);
      }
    } catch (err) {
      alert("Impossible de supprimer la ligne de FAQ.");
    } finally {
      setDeletingFaqId(null);
    }
  };

  return (
    <div className="p-4 md:p-8 bg-gray-50 min-h-screen text-slate-800 font-sans">
      <div className="max-w-6xl mx-auto space-y-8">
        
        {/* EN-TÊTE GLOBAL */}
        <div className="flex justify-between items-center bg-white p-6 rounded-2xl border border-gray-200 shadow-xs">
          <div>
            <h1 className="text-xl font-black uppercase tracking-tight text-gray-900">Gestion des Indications</h1>
            <p className="text-xs text-gray-400 mt-0.5">Configurez les étiquettes (Tags) et enrichissez la Foire Aux Questions (FAQ) globale.</p>
          </div>
          <button onClick={loadAllData} disabled={loadingData} className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold rounded-lg transition-colors">
            {loadingData ? 'Actualisation...' : '🔄 Tout rafraîchir'}
          </button>
        </div>

        {/* ========================================================================= */}
        {/* BLOC 1 : TOUTES LES CRÉATIONS (Formulaires pliés par défaut)             */}
        {/* ========================================================================= */}
        <div className="space-y-4">
          <h2 className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-2">➕ Outils de création</h2>

          {/* FORMULAIRE : CRÉATION TAG */}
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-xs">
            <button onClick={() => setShowFormTag(!showFormTag)} className="w-full flex justify-between items-center p-4 bg-gray-50/50 hover:bg-gray-50 transition-colors font-bold text-sm text-slate-900">
              <span className="flex items-center gap-2">🏷️ Créer un nouveau Tag</span>
              <span className="text-xs text-blue-600 font-semibold">{showFormTag ? 'Masquer 🔼' : 'Déplier 🔽'}</span>
            </button>
            {showFormTag && (
              <form onSubmit={handleCreateTag} className="p-6 border-t border-gray-100 grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                <div>
                  <label className="block font-bold text-gray-500 uppercase tracking-wider mb-1">Nom du tag</label>
                  <input type="text" placeholder="Ex: Jardinage" value={tagForm.title} onChange={e => setTagForm({...tagForm, title: e.target.value})} className="w-full bg-gray-50 border border-gray-200 rounded-lg p-2.5 focus:bg-white focus:ring-1 focus:ring-blue-500 outline-hidden" />
                </div>
                <div>
                  <label className="block font-bold text-gray-500 uppercase tracking-wider mb-1">Couleur associée</label>
                  <div className="flex gap-2">
                    <input type="color" value={tagForm.color_code} onChange={e => setTagForm({...tagForm, color_code: e.target.value})} className="w-11 h-9 bg-transparent border-0 cursor-pointer rounded-lg" />
                    <input type="text" value={tagForm.color_code} onChange={e => setTagForm({...tagForm, color_code: e.target.value})} className="w-full bg-gray-50 border border-gray-200 rounded-lg p-2.5 font-mono uppercase" />
                  </div>
                </div>
                <div className="md:col-span-3">
                  <label className="block font-bold text-gray-500 uppercase tracking-wider mb-1">Description</label>
                  <textarea placeholder="Décrivez l'usage de ce tag..." rows={2} value={tagForm.description} onChange={e => setTagForm({...tagForm, description: e.target.value})} className="w-full bg-gray-50 border border-gray-200 rounded-lg p-2.5 focus:bg-white focus:ring-1 focus:ring-blue-500 outline-hidden" />
                </div>
                <div className="md:col-span-3 flex justify-end">
                  <button type="submit" disabled={isSubmittingTag} className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg transition-colors shadow-xs">
                    {isSubmittingTag ? 'Enregistrement...' : 'Enregistrer le Tag'}
                  </button>
                </div>
              </form>
            )}
          </div>

          {/* FORMULAIRE : CRÉATION FAQ */}
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-xs">
            <button onClick={() => setShowFormFaq(!showFormFaq)} className="w-full flex justify-between items-center p-4 bg-gray-50/50 hover:bg-gray-50 transition-colors font-bold text-sm text-slate-900">
              <span className="flex items-center gap-2">❓ Ajouter une question à la FAQ</span>
              <span className="text-xs text-blue-600 font-semibold">{showFormFaq ? 'Masquer 🔼' : 'Déplier 🔽'}</span>
            </button>
            {showFormFaq && (
              <form onSubmit={handleCreateFaq} className="p-6 border-t border-gray-100 grid grid-cols-1 md:grid-cols-4 gap-4 text-xs">
                <div className="md:col-span-2">
                  <label className="block font-bold text-gray-500 uppercase tracking-wider mb-1">Tag parent *</label>
                  <select value={faqForm.id_tag} onChange={e => setFaqForm({...faqForm, id_tag: e.target.value})} className="w-full bg-gray-50 border border-gray-200 rounded-lg p-2.5 font-medium">
                    <option value="">-- Choisir un Tag --</option>
                    {tags.map(t => <option key={t.id_tag} value={t.id_tag}>{t.title}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-gray-500 uppercase tracking-wider mb-1">Objet relié (Optionnel)</label>
                  <select value={faqForm.id_object} onChange={e => setFaqForm({...faqForm, id_object: e.target.value})} className="w-full bg-gray-50 border border-gray-200 rounded-lg p-2.5 font-medium">
                    <option value="">Aucun (FAQ Générale)</option>
                    {objects.map(o => <option key={o.id_object} value={o.id_object}>{o.title}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-gray-500 uppercase tracking-wider mb-1">Ordre de vue</label>
                  <input type="number" min="1" value={faqForm.order_view} onChange={e => setFaqForm({...faqForm, order_view: e.target.value})} className="w-full bg-gray-50 border border-gray-200 rounded-lg p-2.5" />
                </div>
                <div className="md:col-span-4">
                  <label className="block font-bold text-gray-500 uppercase tracking-wider mb-1">Question posée *</label>
                  <input type="text" placeholder="Ex: Comment connecter l'arroseur au réseau ?" value={faqForm.question} onChange={e => setFaqForm({...faqForm, question: e.target.value})} className="w-full bg-gray-50 border border-gray-200 rounded-lg p-2.5 focus:bg-white focus:ring-1 focus:ring-blue-500 outline-hidden" />
                </div>
                <div className="md:col-span-4">
                  <label className="block font-bold text-gray-500 uppercase tracking-wider mb-1">Réponse apportée *</label>
                  <textarea placeholder="Rédigez la réponse d'aide complète..." rows={3} value={faqForm.answer} onChange={e => setFaqForm({...faqForm, answer: e.target.value})} className="w-full bg-gray-50 border border-gray-200 rounded-lg p-2.5 focus:bg-white focus:ring-1 focus:ring-blue-500 outline-hidden" />
                </div>
                <div className="md:col-span-4 flex justify-end">
                  <button type="submit" disabled={isSubmittingFaq} className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg transition-colors shadow-xs">
                    {isSubmittingFaq ? 'Enregistrement...' : 'Ajouter à la FAQ'}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>

        {/* ========================================================================= */}
        {/* BLOC 2 : TOUTES LES LISTES (Dépliées par défaut pour contrôle)            */}
        {/* ========================================================================= */}
        <div className="space-y-6">
          <h2 className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-2">📊 Gestion des données existantes</h2>

          {/* LISTING : LES TAGS */}
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-xs">
            <button onClick={() => setShowListTag(!showListTag)} className="w-full flex justify-between items-center p-4 bg-gray-50/50 hover:bg-gray-50 transition-colors font-bold text-sm text-slate-900">
              <span>📋 Liste des Tags Actifs ({tags.length})</span>
              <span className="text-xs text-blue-600 font-semibold">{showListTag ? 'Masquer 🔼' : 'Afficher 🔽'}</span>
            </button>
            {showListTag && (
              <div className="border-t border-gray-100 overflow-x-auto text-xs">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-gray-50 text-gray-500 font-bold border-b border-gray-200 uppercase tracking-wider">
                      <th className="p-4 w-32">Visuel</th>
                      <th className="p-4 w-48">Titre</th>
                      <th className="p-4">Description</th>
                      <th className="p-4 w-20 text-center">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {tags.map(tag => (
                      <tr key={tag.id_tag} className="hover:bg-gray-50/50 transition-colors">
                        <td className="p-4">
                          <span className="inline-block px-2.5 py-1 rounded-md font-bold text-[11px] uppercase tracking-wider shadow-xs border" style={{ backgroundColor: `${tag.color_code}15`, borderColor: tag.color_code, color: tag.color_code }}>
                            {tag.title}
                          </span>
                        </td>
                        <td className="p-4 font-bold text-gray-900">{tag.title}</td>
                        <td className="p-4 text-gray-500 leading-relaxed">{tag.description || '—'}</td>
                        <td className="p-4 text-center">
                          <button onClick={() => handleDeleteTag(tag.id_tag)} disabled={deletingTagId !== null} className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors">
                            {deletingTagId === tag.id_tag ? '...' : '🗑️'}
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* LISTING : LA FAQ */}
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-xs">
            <button onClick={() => setShowListFaq(!showListFaq)} className="w-full flex justify-between items-center p-4 bg-gray-50/50 hover:bg-gray-50 transition-colors font-bold text-sm text-slate-900">
              <span>📋 Liste de la FAQ en ligne ({faqs.length})</span>
              <span className="text-xs text-blue-600 font-semibold">{showListFaq ? 'Masquer 🔼' : 'Afficher 🔽'}</span>
            </button>
            {showListFaq && (
              <div className="border-t border-gray-100 overflow-x-auto text-xs">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-gray-50 text-gray-500 font-bold border-b border-gray-200 uppercase tracking-wider">
                      <th className="p-4 w-16 text-center">Ordre</th>
                      <th className="p-4 w-40">Contextes / Éléments</th>
                      <th className="p-4">Contenu Q / A</th>
                      <th className="p-4 w-20 text-center">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {faqs.map(faq => (
                      <tr key={faq.id_faq} className="hover:bg-gray-50/50 transition-colors align-top">
                        <td className="p-4 text-center font-bold text-gray-400">{faq.order_view}</td>
                        <td className="p-4 space-y-1.5">
                          {faq.tag_title && (
                            <span className="block px-2 py-0.5 rounded bg-slate-100 text-slate-700 border text-[10px] font-bold uppercase w-max">
                              {faq.tag_title}
                            </span>
                          )}
                          {faq.object_title ? (
                            <span className="block text-gray-600 font-medium">🤖 {faq.object_title}</span>
                          ) : (
                            <span className="block text-gray-400 italic">🌍 Aide Générale</span>
                          )}
                        </td>
                        <td className="p-4 space-y-2 max-w-xl">
                          <div className="font-bold text-gray-900 text-sm">🔹 {faq.question}</div>
                          <div className="text-gray-600 leading-relaxed bg-gray-50/60 p-3 rounded-lg border border-gray-100 whitespace-pre-line">{faq.answer}</div>
                        </td>
                        <td className="p-4 text-center">
                          <button onClick={() => handleDeleteFaq(faq.id_faq)} disabled={deletingFaqId !== null} className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors mt-1">
                            {deletingFaqId === faq.id_faq ? '...' : '🗑️'}
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
};

export default Indications;