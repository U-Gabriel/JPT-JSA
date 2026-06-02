import React, { useState, useEffect } from 'react';
import { createPlantApi, getAllPlantsApi, type PlantDataPayload, type GroupDataPayload, type PlantItem } from '../api/plants';

export const Plants: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'botany' | 'sensors' | 'images'>('botany');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  
  // 🟢 Changement : Masqué par défaut (false)
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [plantsList, setPlantsList] = useState<PlantItem[]>([]);
  const [loadingList, setLoadingList] = useState(false);

  // État pour traquer la ligne actuellement cliquée et dépliée
  const [expandedPlantId, setExpandedPlantId] = useState<number | null>(null);

  // Valeurs initiales pour reset
  const initialPlantData: PlantDataPayload = {
    title: '', description: '', height_max: 0, weight_max: 0, advise: '', category: '',
    scientist_name: '', family_name: '', type_name: '', exposition_type: '', ground_type: '',
    saison_first: '', saison_second: '', saison_third: '', saison_last: '',
    number_good_saison: 1, plantation_saison: '', humidity_ground: 0,
    temperature_sensor_ground: 0, exposition_time_sun: 0
  };

  const initialGroupData: GroupDataPayload = {
    title: '', description: '', conductivity_elec: 0, temp_ground: 0, temp_extern: 0,
    humidity_air: 0, humidity_ground: 0, uv_time: 0, watering_time: 0, priority: 1,
    last_watering: new Date().toISOString().split('T')[0], watering_period: 0
  };

  const [plantData, setPlantData] = useState<PlantDataPayload>(initialPlantData);
  const [groupData, setGroupData] = useState<GroupDataPayload>(initialGroupData);
  const [images, setImages] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);

  // Chargement de la liste via l'API
  const loadPlants = async () => {
    setLoadingList(true);
    try {
      const res = await getAllPlantsApi();
      if (res.status === 'OK' && Array.isArray(res.data)) {
        setPlantsList(res.data);
      } else {
        console.error("L'API a renvoyé un statut KO ou des données invalides", res);
      }
    } catch (err) {
      console.error("Erreur lors de la récupération des plantes :", err);
    } finally {
      setLoadingList(false);
    }
  };

  useEffect(() => {
    loadPlants();
  }, []);

  const handlePlantChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    setPlantData(prev => ({
      ...prev,
      [name]: type === 'number' ? parseFloat(value) || 0 : value
    }));
  };

  const handleGroupChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    setGroupData(prev => ({
      ...prev,
      [name]: type === 'number' ? parseFloat(value) || 0 : value
    }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const filesArray = Array.from(e.target.files);
      setImages(prev => [...prev, ...filesArray]);

      const urls = filesArray.map(file => URL.createObjectURL(file));
      setPreviews(prev => [...prev, ...urls]);
    }
  };

  const removeImage = (index: number) => {
    setImages(prev => prev.filter((_, i) => i !== index));
    setPreviews(prev => prev.filter((_, i) => i !== index));
  };

  // Gestion du clic pour ouvrir/fermer le panneau de détails d'une plante
  const toggleExpandPlant = (id: number) => {
    if (expandedPlantId === id) {
      setExpandedPlantId(null); // On referme si on reclique sur la même
    } else {
      setExpandedPlantId(id); // On ouvre la nouvelle
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);

    if (images.length === 0) {
      setMessage({ type: 'error', text: 'Au moins une image est requise pour créer la plante.' });
      setActiveTab('images');
      return;
    }

    setLoading(true);
    try {
      const res = await createPlantApi(plantData, groupData, images);
      if (res.status === 'OK') {
        setMessage({ type: 'success', text: 'La plante et sa configuration matérielle ont été créées avec succès !' });
        
        setPlantData(initialPlantData);
        setGroupData(initialGroupData);
        setImages([]);
        setPreviews([]);
        setActiveTab('botany');
        setIsFormOpen(false); // Referme le bloc de création

        await loadPlants();
      } else {
        setMessage({ type: 'error', text: res.message || 'Une erreur est survenue.' });
      }
    } catch (err: any) {
      setMessage({ 
        type: 'error', 
        text: err.response?.data?.message || 'Erreur lors de la connexion au serveur.' 
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* En-tête */}
      <div className="flex justify-between items-center bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Gestion des Espèces</h2>
          <p className="text-sm text-gray-500 mt-1">Créez et visualisez vos fiches botaniques associées à leurs capteurs connectés.</p>
        </div>
        
        {/* Bouton pour Développer / Réduire */}
        <button
          onClick={() => setIsFormOpen(!isFormOpen)}
          className="flex items-center gap-2 px-4 py-2 text-sm font-medium bg-blue-50 text-blue-600 hover:bg-blue-100 rounded-lg transition-colors border border-blue-200"
        >
          {isFormOpen ? (
            <>
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
              Masquer le formulaire
            </>
          ) : (
            <>
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Ajouter une nouvelle espèce
            </>
          )}
        </button>
      </div>

      {/* Notifications */}
      {message && (
        <div className={`p-4 rounded-lg border flex items-center ${
          message.type === 'success' ? 'bg-green-50 border-green-200 text-green-800' : 'bg-red-50 border-red-200 text-red-800'
        }`}>
          <span className="font-medium">{message.text}</span>
        </div>
      )}

      {/* Bloc Formulaire Principal (Masqué par défaut) */}
      {isFormOpen && (
        <form onSubmit={handleSubmit} className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="flex border-b border-gray-200 bg-gray-50/70">
            <button type="button" onClick={() => setActiveTab('botany')} className={`px-6 py-3.5 text-sm font-medium border-b-2 transition-colors ${activeTab === 'botany' ? 'border-blue-600 text-blue-600 bg-white' : 'border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-100/50'}`}>1. Caractéristiques Botaniques</button>
            <button type="button" onClick={() => setActiveTab('sensors')} className={`px-6 py-3.5 text-sm font-medium border-b-2 transition-colors ${activeTab === 'sensors' ? 'border-blue-600 text-blue-600 bg-white' : 'border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-100/50'}`}>2. Paramètres Capteurs & Arrosage</button>
            <button type="button" onClick={() => setActiveTab('images')} className={`px-6 py-3.5 text-sm font-medium border-b-2 transition-colors ${activeTab === 'images' ? 'border-blue-600 text-blue-600 bg-white' : 'border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-100/50'}`}>3. Galerie Photos / Avatars</button>
          </div>

          <div className="p-6 sm:p-8">
            {activeTab === 'botany' && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Nom commun *</label>
                    <input required type="text" name="title" value={plantData.title} onChange={handlePlantChange} className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none" placeholder="Ex: Monstera Deliciosa" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Nom scientifique</label>
                    <input type="text" name="scientist_name" value={plantData.scientist_name} onChange={handlePlantChange} className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Nom de famille</label>
                    <input type="text" name="family_name" value={plantData.family_name} onChange={handlePlantChange} className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none" />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Catégorie</label>
                    <input type="text" name="category" value={plantData.category} onChange={handlePlantChange} className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none" placeholder="Ex: Intérieur / Vivace" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Type biologique</label>
                    <input type="text" name="type_name" value={plantData.type_name} onChange={handlePlantChange} className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Saison de plantation</label>
                    <input type="text" name="plantation_saison" value={plantData.plantation_saison} onChange={handlePlantChange} className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none" />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Hauteur Max (cm)</label>
                    <input type="number" name="height_max" value={plantData.height_max} onChange={handlePlantChange} className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Poids Max (g)</label>
                    <input type="number" name="weight_max" value={plantData.weight_max} onChange={handlePlantChange} className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Type d'exposition</label>
                    <input type="text" name="exposition_type" value={plantData.exposition_type} onChange={handlePlantChange} className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Type de Sol</label>
                    <input type="text" name="ground_type" value={plantData.ground_type} onChange={handlePlantChange} className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm" />
                  </div>
                </div>

                <div className="bg-gray-50 p-4 rounded-xl border border-gray-200 grid grid-cols-1 sm:grid-cols-5 gap-4">
                  <div className="sm:col-span-5"><span className="text-xs font-bold uppercase tracking-wider text-gray-400">Cycles Saisonniers</span></div>
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">Saison 1</label>
                    <input type="text" name="saison_first" value={plantData.saison_first} onChange={handlePlantChange} className="w-full rounded-lg border border-gray-300 px-2 py-1.5 text-sm" />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">Saison 2</label>
                    <input type="text" name="saison_second" value={plantData.saison_second} onChange={handlePlantChange} className="w-full rounded-lg border border-gray-300 px-2 py-1.5 text-sm" />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">Saison 3</label>
                    <input type="text" name="saison_third" value={plantData.saison_third} onChange={handlePlantChange} className="w-full rounded-lg border border-gray-300 px-2 py-1.5 text-sm" />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">Saison 4 (Dernière)</label>
                    <input type="text" name="saison_last" value={plantData.saison_last} onChange={handlePlantChange} className="w-full rounded-lg border border-gray-300 px-2 py-1.5 text-sm" />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">Nb bonnes saisons</label>
                    <input type="number" name="number_good_saison" value={plantData.number_good_saison} onChange={handlePlantChange} className="w-full rounded-lg border border-gray-300 px-2 py-1.5 text-sm" />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Description générale</label>
                  <textarea rows={2} name="description" value={plantData.description} onChange={handlePlantChange} className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none" />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Conseils d'entretien (Advise)</label>
                  <textarea rows={2} name="advise" value={plantData.advise} onChange={handlePlantChange} className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none" />
                </div>
              </div>
            )}

            {activeTab === 'sensors' && (
              <div className="space-y-6">
                <div className="bg-blue-50/50 p-4 rounded-xl border border-blue-100 grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className="block text-sm font-semibold text-blue-900 mb-1">Nom du Groupe Standard *</label>
                    <input required type="text" name="title" value={groupData.title} onChange={handleGroupChange} className="w-full bg-white rounded-lg border border-blue-200 px-3 py-2 text-sm focus:outline-blue-500" />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-blue-900 mb-1">Description Profil Target</label>
                    <input type="text" name="description" value={groupData.description} onChange={handleGroupChange} className="w-full bg-white rounded-lg border border-blue-200 px-3 py-2 text-sm focus:outline-blue-500" />
                  </div>
                </div>

                <h3 className="text-sm font-bold uppercase tracking-wider text-gray-400 border-b pb-1">Seuils Matériels requis</h3>
                
                <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Conductivité Élec (Fertilité)</label>
                    <input type="number" name="conductivity_elec" value={groupData.conductivity_elec} onChange={handleGroupChange} className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Temp. Sol (°C)</label>
                    <input type="number" name="temp_ground" value={groupData.temp_ground} onChange={handleGroupChange} className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Temp. Externe (°C)</label>
                    <input type="number" name="temp_extern" value={groupData.temp_extern} onChange={handleGroupChange} className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Humidité Air (%)</label>
                    <input type="number" name="humidity_air" value={groupData.humidity_air} onChange={handleGroupChange} className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm" />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Humidité Sol (%)</label>
                    <input type="number" name="humidity_ground" value={groupData.humidity_ground} onChange={handleGroupChange} className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Temps Exp. UV (h)</label>
                    <input type="number" name="uv_time" value={groupData.uv_time} onChange={handleGroupChange} className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Temps Arrosage (s)</label>
                    <input type="number" name="watering_time" value={groupData.watering_time} onChange={handleGroupChange} className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Période d'ouverture (j)</label>
                    <input type="number" name="watering_period" value={groupData.watering_period} onChange={handleGroupChange} className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm" />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Priorité Système</label>
                    <select name="priority" value={groupData.priority} onChange={handleGroupChange} className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm bg-white">
                      <option value={1}>Terre Prioritaire (1)</option>
                      <option value={2}>Temps Prioritaire (2)</option>
                      <option value={3}>Terre ou Temps (3)</option>
                      <option value={4}>Terre ET Temps (4)</option>
                      <option value={5}>Terre atteinte + Temps proche (5)</option>
                      <option value={6}>Temps atteint + Terre proche (6)</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Dernier Arrosage initial</label>
                    <input type="date" name="last_watering" value={groupData.last_watering} onChange={handleGroupChange} className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm" />
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'images' && (
              <div className="space-y-6">
                <label className="block text-sm font-medium text-gray-700">Images de la plante (1 obligatoire - Max 10)</label>
                <div className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center bg-gray-50 hover:bg-gray-100/70 transition-colors relative cursor-pointer">
                  <input type="file" multiple accept="image/*" onChange={handleFileChange} className="absolute inset-0 opacity-0 cursor-pointer" />
                  <p className="mt-2 text-sm font-medium text-gray-900">Cliquez pour ajouter des images ou glissez-déposez</p>
                </div>

                {previews.length > 0 && (
                  <div className="grid grid-cols-2 sm:grid-cols-5 gap-4 pt-4">
                    {previews.map((url, index) => (
                      <div key={index} className="relative group rounded-lg overflow-hidden border border-gray-200 shadow-sm bg-white aspect-square">
                        <img src={url} alt={`Prévisualisation ${index}`} className="w-full h-full object-cover" />
                        <div className="absolute top-1 right-1 bg-gray-950/20 rounded-md backdrop-blur-xs px-1.5 py-0.5 text-[10px] text-white font-bold">Avatar {index + 1}</div>
                        <button type="button" onClick={() => removeImage(index)} className="absolute inset-0 bg-red-600/80 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white font-semibold transition-opacity text-xs">Supprimer</button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Barre d'action basse */}
          <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex justify-between items-center">
            <div className="text-xs text-gray-400 font-medium">* Champs requis</div>
            <div className="flex gap-3">
              {activeTab !== 'botany' && (
                <button type="button" onClick={() => setActiveTab(activeTab === 'images' ? 'sensors' : 'botany')} className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50">Précédent</button>
              )}
              {activeTab !== 'images' ? (
                <button type="button" onClick={() => setActiveTab(activeTab === 'botany' ? 'sensors' : 'images')} className="px-5 py-2 bg-slate-900 text-white rounded-lg text-sm font-medium hover:bg-slate-800">Suivant</button>
              ) : (
                <button type="submit" disabled={loading} className={`px-6 py-2 bg-blue-600 text-white font-semibold rounded-lg text-sm shadow-md transition-all ${loading ? 'opacity-50 cursor-not-allowed bg-blue-400' : 'hover:bg-blue-700'}`}>{loading ? 'Création...' : 'VALIDER ET CRÉER'}</button>
              )}
            </div>
          </div>
        </form>
      )}

      {/* ----------------- LISTE DES PLANTES DÉPLOYABLE AU CLIC ----------------- */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h3 className="text-lg font-bold text-gray-900">Espèces configurées</h3>
            <p className="text-xs text-gray-400 mt-0.5">💡 Cliquez sur une ligne pour dérouler l'ensemble de ses fiches détaillées.</p>
          </div>
          <button onClick={loadPlants} className="text-xs text-blue-600 hover:underline font-medium" disabled={loadingList}>
            {loadingList ? 'Actualisation...' : 'Rafraîchir'}
          </button>
        </div>

        {loadingList ? (
          <div className="text-center py-6 text-sm text-gray-500">Chargement...</div>
        ) : plantsList.length === 0 ? (
          <div className="text-center py-8 text-sm text-gray-400 border border-dashed border-gray-200 rounded-lg">Aucune espèce enregistrée.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-sm">
              <thead>
                <tr className="bg-gray-50 text-gray-600 font-semibold border-b border-gray-200">
                  <th className="p-4 w-12 text-center"></th>
                  <th className="p-4">Nom commun</th>
                  <th className="p-4">Nom scientifique</th>
                  <th className="p-4">Famille</th>
                  <th className="p-4">Catégorie</th>
                </tr>
              </thead>
              <tbody>
                {plantsList.map((plant) => {
                  const isExpanded = expandedPlantId === plant.id_plant_type;
                  return (
                    <React.Fragment key={plant.id_plant_type}>
                      {/* Ligne Principale cliquable */}
                      <tr 
                        onClick={() => toggleExpandPlant(plant.id_plant_type)}
                        className={`border-b border-gray-100 cursor-pointer select-none transition-colors ${isExpanded ? 'bg-blue-50/40 hover:bg-blue-50/60' : 'hover:bg-gray-50'}`}
                      >
                        <td className="p-4 text-center font-medium text-gray-400">
                          <svg className={`w-4 h-4 text-gray-500 transform transition-transform ${isExpanded ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                          </svg>
                        </td>
                        <td className="p-4 font-bold text-slate-900">{plant.title}</td>
                        <td className="p-4 text-gray-500 italic">{plant.scientist_name || '—'}</td>
                        <td className="p-4 text-gray-500">{plant.family_name || '—'}</td>
                        <td className="p-4">
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-800">
                            {plant.category || 'Non classé'}
                          </span>
                        </td>
                      </tr>

                      {/* Ligne Dépliée : Contient TOUTES les infos détaillées */}
                      {isExpanded && (
                        <tr>
                          <td colSpan={5} className="p-0 bg-gray-50/50 border-b border-gray-200">
                            <div className="p-6 md:p-8 space-y-6 text-gray-700 animate-fadeIn">
                              
                              {/* 1. Informations Botaniques Détaillées */}
                              <div>
                                <h4 className="text-xs font-bold uppercase tracking-wider text-blue-600 mb-3 border-b border-blue-100 pb-1">📋 Fiche d'Identité Botanique</h4>
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-y-4 gap-x-6 bg-white p-4 rounded-xl border border-gray-200 shadow-xs">
                                  <div><span className="block text-xs font-medium text-gray-400">Type biologique</span><span className="text-sm font-semibold">{plant.type_name || 'N/A'}</span></div>
                                  <div><span className="block text-xs font-medium text-gray-400">Saison plantation</span><span className="text-sm font-semibold">{plant.plantation_saison || 'N/A'}</span></div>
                                  <div><span className="block text-xs font-medium text-gray-400">Hauteur Max</span><span className="text-sm font-semibold">{plant.height_max ? `${plant.height_max} cm` : 'Inconnu'}</span></div>
                                  <div><span className="block text-xs font-medium text-gray-400">Poids Max</span><span className="text-sm font-semibold">{plant.weight_max ? `${plant.weight_max} g` : 'Inconnu'}</span></div>
                                  <div><span className="block text-xs font-medium text-gray-400">Exposition lumière</span><span className="text-sm font-semibold">{plant.exposition_type || 'N/A'}</span></div>
                                  <div><span className="block text-xs font-medium text-gray-400">Nature du Sol</span><span className="text-sm font-semibold">{plant.ground_type || 'N/A'}</span></div>
                                  <div><span className="block text-xs font-medium text-gray-400">Temps soleil cible</span><span className="text-sm font-semibold">{plant.exposition_time_sun ? `${plant.exposition_time_sun}h` : 'N/A'}</span></div>
                                  <div><span className="block text-xs font-medium text-gray-400">Humidité sol cible</span><span className="text-sm font-semibold">{plant.humidity_ground ? `${plant.humidity_ground}%` : 'N/A'}</span></div>
                                </div>
                              </div>

                              {/* Cycles Saisonniers */}
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="bg-white p-4 rounded-xl border border-gray-200">
                                  <span className="block text-xs font-bold uppercase tracking-wider text-gray-400 mb-2">🔄 Évolution Temporelle des Saisons</span>
                                  <div className="grid grid-cols-4 gap-2 text-center text-xs">
                                    <div className="bg-slate-50 p-2 rounded border"><span className="block text-[10px] text-gray-400">S1</span><strong>{plant.saison_first || '—'}</strong></div>
                                    <div className="bg-slate-50 p-2 rounded border"><span className="block text-[10px] text-gray-400">S2</span><strong>{plant.saison_second || '—'}</strong></div>
                                    <div className="bg-slate-50 p-2 rounded border"><span className="block text-[10px] text-gray-400">S3</span><strong>{plant.saison_third || '—'}</strong></div>
                                    <div className="bg-slate-50 p-2 rounded border"><span className="block text-[10px] text-gray-400">S4</span><strong>{plant.saison_last || '—'}</strong></div>
                                  </div>
                                  <div className="mt-2 text-xs text-gray-500">Nombre de bonnes saisons : <strong className="text-slate-900">{plant.number_good_saison ?? 'N/A'}</strong></div>
                                </div>
                                
                                <div className="bg-white p-4 rounded-xl border border-gray-200 flex flex-col justify-between">
                                  <div>
                                    <span className="block text-xs font-bold uppercase tracking-wider text-gray-400 mb-1">📝 Description</span>
                                    <p className="text-xs text-gray-600 line-clamp-3">{plant.description || 'Aucune description disponible.'}</p>
                                  </div>
                                  <div className="mt-2 border-t pt-2">
                                    <span className="block text-[11px] font-bold text-gray-500">💡 Conseils d'entretien :</span>
                                    <p className="text-xs italic text-gray-600">{plant.advise || 'Aucun conseil spécifique renseigné.'}</p>
                                  </div>
                                </div>
                              </div>

                              {/* 2. Configuration Matériel / Capteurs (group_info) */}
                              <div>
                                <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-600 mb-3 border-b border-emerald-100 pb-1">⚙️ Seuils Cibles Capteurs Connectés</h4>
                                {plant.group_info ? (
                                  <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-xs">
                                    <div className="bg-emerald-50/50 px-4 py-2 border-b text-xs flex justify-between font-medium text-emerald-900">
                                      <span>Profil de groupe : <strong>{plant.group_info.title || 'Sans titre'}</strong></span>
                                      <span>Priorité d'arrosage : <strong>Niveau {plant.group_info.prority_plant ?? '—'}</strong></span>
                                    </div>
                                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 text-xs">
                                      <div className="bg-gray-50 p-2.5 rounded border"><span className="text-gray-400 block">Conductivité (Fertilité)</span><strong>{plant.group_info.conductivity_electrique_fertility_sensor ?? '—'} µS/cm</strong></div>
                                      <div className="bg-gray-50 p-2.5 rounded border"><span className="text-gray-400 block">Température Sol</span><strong>{plant.group_info.temperature_sensor_ground ?? '—'} °C</strong></div>
                                      <div className="bg-gray-50 p-2.5 rounded border"><span className="text-gray-400 block">Température Extern</span><strong>{plant.group_info.temperature_sensor_extern ?? '—'} °C</strong></div>
                                      <div className="bg-gray-50 p-2.5 rounded border"><span className="text-gray-400 block">Humidité Air</span><strong>{plant.group_info.humidity_air_sensor ?? '—'} %</strong></div>
                                      <div className="bg-gray-50 p-2.5 rounded border"><span className="text-gray-400 block">Humidité Sol</span><strong>{plant.group_info.humidity_ground_sensor ?? '—'} %</strong></div>
                                      <div className="bg-gray-50 p-2.5 rounded border"><span className="text-gray-400 block">Exposition Cible UV</span><strong>{plant.group_info.exposition_time_uv ?? '—'} heures</strong></div>
                                      <div className="bg-gray-50 p-2.5 rounded border"><span className="text-gray-400 block">Durée Électrovanne</span><strong>{plant.group_info.watering_time ?? '—'} secondes</strong></div>
                                      <div className="bg-gray-50 p-2.5 rounded border"><span className="text-gray-400 block">Fréquence d'ouverture</span><strong>Tous les {plant.group_info.watering_period_open ?? '—'} jours</strong></div>
                                    </div>
                                    <div className="px-4 py-2 bg-slate-50 border-t text-[11px] text-gray-500 flex justify-between">
                                      <span>Statut Profil : {plant.group_info.is_active ? '🟢 Actif' : '🔴 Inactif'} | Standard mondial : {plant.group_info.is_standard ? 'Oui' : 'Non'}</span>
                                      <span>Dernier arrosage capté : <strong>{plant.group_info.last_date_arrosage || 'Jamais'}</strong></span>
                                    </div>
                                  </div>
                                ) : (
                                  <div className="text-xs bg-amber-50 text-amber-800 p-3 rounded-lg border border-amber-200">Aucune configuration de groupe ou de capteurs cibles reliée à cette espèce.</div>
                                )}
                              </div>

                              {/* 3. Galerie d'Avatars de l'API (avatars) */}
                              <div>
                                <h4 className="text-xs font-bold uppercase tracking-wider text-purple-600 mb-3 border-b border-purple-100 pb-1">🖼️ Galerie d'Avatars Évolutifs ({plant.avatars?.length || 0})</h4>
                                {plant.avatars && plant.avatars.length > 0 ? (
                                  <div className="grid grid-cols-2 sm:grid-cols-6 gap-4">
                                    {plant.avatars.map((avatar) => (
                                      <div key={avatar.id_avatar} className="bg-white border rounded-lg overflow-hidden shadow-xs p-2 text-center">
                                        <div className="aspect-square w-full rounded bg-gray-100 overflow-hidden mb-2">
                                          <img 
                                            src={`http://51.77.141.175:3000/${avatar.picture_path}`} 
                                            alt={avatar.title}
                                            className="w-full h-full object-cover"
                                            onError={(e) => {
                                              // Fallback si l'image serveur ne charge pas
                                              (e.target as HTMLImageElement).src = 'http://51.77.141.175/dataset/data_plant/Lavande_r_01.jpg';
                                            }}
                                          />
                                        </div>
                                        <div className="text-[11px] font-bold text-gray-900 truncate">{avatar.title}</div>
                                        <div className="text-[9px] text-gray-400 uppercase font-semibold">Étape {avatar.evolution_number || 1}</div>
                                      </div>
                                    ))}
                                  </div>
                                ) : (
                                  <div className="text-xs text-gray-400 italic">Aucun avatar d'évolution téléversé pour cette plante.</div>
                                )}
                              </div>

                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default Plants;