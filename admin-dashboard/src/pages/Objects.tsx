import React, { useState, useEffect } from 'react';
import { createCategoryApi, createObjectApi, getCategoriesLookupApi, getCatalogApi, type CategoryLookup, type CatalogCategory } from '../api/objects';
import { getTagsApi, type Tag } from '../api/tags'; 
import { Input } from '../components/Input';
import { Button } from '../components/Button';

export const Objects: React.FC = () => {
  // --- ÉTATS ACCORDÉONS (OUVERTURE/FERMETURE) ---
  const [isOpenCat, setIsOpenCat] = useState(false); // 🟢 Fermé par défaut
  const [isOpenObj, setIsOpenObj] = useState(false); // 🟢 Tout le bloc Objet est fermé par défaut

  // --- ÉTATS FORMULAIRE CATÉGORIE ---
  const [catTitle, setCatTitle] = useState('');
  const [catDescription, setCatDescription] = useState('');
  const [catAdvise, setCatAdvise] = useState('');

  // --- ÉTATS DONNÉES DISTANTES (LOOKUPS) ---
  const [categoriesList, setCategoriesList] = useState<CategoryLookup[]>([]);
  const [tagsList, setTagsList] = useState<Tag[]>([]);

  // --- ÉTATS FORMULAIRE OBJET (21 CHAMPS API REQUIS) ---
  const [objTitle, setObjTitle] = useState('');
  const [objSku, setObjSku] = useState('');
  const [objCategoryId, setObjCategoryId] = useState(''); 
  const [objPrice, setObjPrice] = useState('');
  const [objDiscountPrice, setObjDiscountPrice] = useState('');
  const [objStock, setObjStock] = useState('');
  const [objBrand, setObjBrand] = useState('');
  const [objShortDesc, setObjShortDesc] = useState('');
  const [objDescription, setObjDescription] = useState('');
  const [objFeatures, setObjFeatures] = useState('');
  const [objTechDetails, setObjTechDetails] = useState('');
  const [objAdvise, setObjAdvise] = useState('');
  const [objValueReturn, setObjValueReturn] = useState('Retour sous 14 jours');
  const [objWarranty, setObjWarranty] = useState('Garantie constructeur 2 ans');
  const [objGuideUrl, setObjGuideUrl] = useState('');
  const [objHeight, setObjHeight] = useState('');
  const [objWeight, setObjWeight] = useState('');
  const [objPreferenceNum, setObjPreferenceNum] = useState('');
  const [objTagId, setObjTagId] = useState(''); 
  const [objIsAvailable, setObjIsAvailable] = useState(true);
  const [objIsActive, setObjIsActive] = useState(true);

  // GESTION DES IMAGES (Jusqu'à 10 images cumulées)
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);

  // --- ÉTATS FEEDBACK & LOADING ---
  const [loadingCat, setLoadingCat] = useState(false);
  const [loadingObj, setLoadingObj] = useState(false);
  const [feedback, setFeedback] = useState<{ status: 'OK' | 'KO'; message: string; type: 'cat' | 'obj' } | null>(null);
  
  const [expandedObjectIds, setExpandedObjectIds] = useState<number[]>([]);

  const toggleExpand = (id: number) => {
    setExpandedObjectIds(prev => 
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    );
  };

  // CHARGEMENT DES TAGS ET CATÉGORIES AU DÉMARRAGE
  useEffect(() => {
    const loadLookups = async () => {
      const catRes = await getCategoriesLookupApi();
      if (catRes.status === 'OK') setCategoriesList(catRes.data);

      const tagRes = await getTagsApi();
      if (tagRes.status === 'OK') setTagsList(tagRes.data);
    };
    loadLookups();
  }, []);

    // Sous tes autres états
    const [catalog, setCatalog] = useState<CatalogCategory[]>([]);

    // Dans ton useEffect de chargement (le même que celui des lookups)
    useEffect(() => {
    const loadLookups = async () => {
        // Tes appels existants...
        const catRes = await getCategoriesLookupApi();
        if (catRes.status === 'OK') setCategoriesList(catRes.data);

        const tagRes = await getTagsApi();
        if (tagRes.status === 'OK') setTagsList(tagRes.data);
        
        // 🟢 Ajoute le chargement du catalogue complet ici
        const catCatalog = await getCatalogApi();
        if (catCatalog.status === 'OK') setCatalog(catCatalog.data);
    };
    loadLookups();
    }, []);

  // Vider complètement la sélection d'images (React + DOM)
  const handleClearImages = () => {
    setSelectedFiles([]);
    const fileInput = document.getElementById('images-upload') as HTMLInputElement;
    if (fileInput) {
      fileInput.value = ''; 
    }
  };

  // Définir une image comme principale en la déplaçant à l'index 0
  const handleSetMainPicture = (indexToMove: number) => {
    if (indexToMove === 0) return; 
    
    setSelectedFiles(prevFiles => {
      const updatedFiles = [...prevFiles];
      const [chosenFile] = updatedFiles.splice(indexToMove, 1); 
      return [chosenFile, ...updatedFiles]; 
    });
  };

    const refreshCatalog = async () => {
        const catCatalog = await getCatalogApi();
        if (catCatalog.status === 'OK') {
            setCatalog(catCatalog.data);
        }
    };

  // Soumission de la Catégorie
  const handleCreateCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    setFeedback(null);

    if (!catTitle || !catDescription || !catAdvise) {
      setFeedback({ status: 'KO', message: 'Tous les champs marqués d’un astérisque sont obligatoires.', type: 'cat' });
      return;
    }

    setLoadingCat(true);
    const response = await createCategoryApi({ title: catTitle, description: catDescription, advise: catAdvise });

    
    setLoadingCat(false);

    if (response.status === 'OK') {
      setFeedback({ status: 'OK', message: 'Catégorie créée avec succès !', type: 'cat' });
      setCatTitle(''); setCatDescription(''); setCatAdvise('');
      
      const catRes = await getCategoriesLookupApi();
      if (catRes.status === 'OK') setCategoriesList(catRes.data);

      await refreshCatalog();

    } else {
      setFeedback({ status: 'KO', message: response.message || 'Une erreur est survenue.', type: 'cat' });
    }
  };

  // Soumission de l'Objet
  const handleCreateObject = async (e: React.FormEvent) => {
    e.preventDefault();
    setFeedback(null);

    if (!objTitle || !objSku || !objCategoryId || !objPrice) {
      setFeedback({ status: 'KO', message: 'Le Titre, le SKU, la Catégorie et le Prix sont obligatoires.', type: 'obj' });
      return;
    }

    setLoadingObj(true);
    const formData = new FormData();

    formData.append('title', objTitle);
    formData.append('sku', objSku);
    formData.append('id_category_type', objCategoryId);
    formData.append('price', objPrice);
    
    formData.append('description', objDescription || '');
    formData.append('short_description', objShortDesc || objTitle);
    formData.append('stock_quantity', objStock || '0');
    formData.append('brand', objBrand || 'Générique');
    formData.append('features', objFeatures || '');
    formData.append('technical_details', objTechDetails || '');
    formData.append('advise', objAdvise || 'Aucun conseil particulier');
    formData.append('value_return', objValueReturn);
    formData.append('warranty_info', objWarranty);
    
    if (objDiscountPrice) formData.append('discount_price', objDiscountPrice);
    if (objHeight) formData.append('height', objHeight);
    if (objWeight) formData.append('weight', objWeight);
    if (objPreferenceNum) formData.append('preference_number', objPreferenceNum);
    if (objTagId) formData.append('id_tag', objTagId);
    if (objGuideUrl) formData.append('installation_guide_url', objGuideUrl);

    formData.append('is_available', String(objIsAvailable));
    formData.append('is_active', String(objIsActive));

    if (selectedFiles.length > 0) {
      selectedFiles.forEach((file) => {
        formData.append('images', file);
      });
    }

    const response = await createObjectApi(formData);
    setLoadingObj(false);

    if (response.status === 'OK') {
      setFeedback({ status: 'OK', message: response.message || 'Objet inséré et images stockées avec succès !', type: 'obj' });
      
      setObjTitle(''); setObjSku(''); setObjCategoryId(''); setObjPrice(''); setObjDiscountPrice('');
      setObjStock(''); setObjBrand(''); setObjShortDesc(''); setObjDescription(''); setObjFeatures('');
      setObjTechDetails(''); setObjAdvise(''); setObjGuideUrl(''); setObjHeight(''); setObjWeight('');
      setObjPreferenceNum(''); setObjTagId(''); 
      setObjIsAvailable(true); setObjIsActive(true);

      await refreshCatalog();

      handleClearImages(); 
    } else {
      setFeedback({ status: 'KO', message: response.message || 'Erreur lors de la création (Vérifiez les logs du serveur).', type: 'obj' });
    }
  };

    // Composant pour gérer le défilement des images
    const ObjectImageSlider = ({ images }: { images: any[] }) => {
        const [currentIndex, setCurrentIndex] = useState(0);
        const [isLoading, setIsLoading] = useState(true); // État pour le loader

        const getImageUrl = (path: string) => {
            if (path.startsWith('http')) return path;
            return `http://51.77.141.175${path}`;
        };

        if (!images || images.length === 0) {
            return <div className="h-48 bg-gray-100 flex items-center justify-center text-gray-400 mb-4">Pas d'image</div>;
        }

        const next = () => { setIsLoading(true); setCurrentIndex((prev) => (prev + 1) % images.length); };
        const prev = () => { setIsLoading(true); setCurrentIndex((prev) => (prev - 1 + images.length) % images.length); };

        return (
            <div className="relative group h-48 overflow-hidden rounded-t-lg mb-4 bg-gray-100">
                {/* Loader qui s'affiche pendant le chargement */}
                {isLoading && (
                    <div className="absolute inset-0 flex items-center justify-center z-10">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                    </div>
                )}

                <img 
                    src={getImageUrl(images[currentIndex].file_path)}
                    alt="Objet" 
                    onLoad={() => setIsLoading(false)} // Image chargée, on cache le loader
                    className={`w-full h-full object-cover transition-all duration-500 ${
                        currentIndex === 0 ? 'border-4 border-blue-500' : ''
                    }`}
                />
                
                {/* Boutons de navigation */}
                {images.length > 1 && (
                    <>
                        <button onClick={prev} className="absolute left-2 top-1/2 bg-white/70 p-1 rounded-full opacity-0 group-hover:opacity-100 transition z-20">◀</button>
                        <button onClick={next} className="absolute right-2 top-1/2 bg-white/70 p-1 rounded-full opacity-0 group-hover:opacity-100 transition z-20">▶</button>
                        
                        {/* Indicateurs avec style spécial pour le premier */}
                        <div className="absolute bottom-2 left-0 right-0 flex justify-center gap-1 z-20">
                            {images.map((_, idx) => (
                                <div key={idx} className={`h-1.5 w-1.5 rounded-full ${idx === currentIndex ? 'bg-white' : 'bg-white/50'} ${idx === 0 ? 'ring-1 ring-blue-500' : ''}`} />
                            ))}
                        </div>
                    </>
                )}
                
                {/* Badge image principale */}
                {currentIndex === 0 && (
                    <span className="absolute top-2 left-2 bg-blue-600 text-white text-[10px] px-2 py-0.5 rounded shadow-sm z-20">
                        Principale
                    </span>
                )}
            </div>
        );
    };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-gray-900">Gestion de la Base Catalogue</h2>
        <p className="text-sm text-gray-500 mt-1">Gérez vos catégories et ajoutez des objets complets avec photos.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* FORMULAIRE CATÉGORIE (À GAUCHE) */}
        <section className="bg-white rounded-xl border border-gray-200 shadow-sm lg:col-span-4 overflow-hidden transition-all">
          <button 
            type="button"
            onClick={() => setIsOpenCat(!isOpenCat)}
            className="w-full flex items-center justify-between p-5 bg-gray-50/50 hover:bg-gray-50 transition-colors border-b border-gray-100 text-left focus:outline-none"
          >
            <div>
              <h3 className="text-base font-bold text-gray-900">Créer une catégorie</h3>
              <p className="text-xs text-gray-500 font-normal mt-0.5">Ajouter un type d'objet au catalogue</p>
            </div>
            <span className={`text-xs font-bold px-2 py-1 bg-white border border-gray-200 rounded-md text-gray-500 transition-transform duration-200 ${isOpenCat ? 'rotate-180' : ''}`}>
              ▼
            </span>
          </button>

          {isOpenCat && (
            <div className="p-6 space-y-4 animate-fadeIn">
              {feedback && feedback.type === 'cat' && (
                <div className={`p-3 text-sm rounded-lg font-medium border ${
                  feedback.status === 'OK' ? 'bg-green-50 border-green-200 text-green-700' : 'bg-red-50 border-red-200 text-red-700'
                }`}>
                  {feedback.message}
                </div>
              )}

              <form onSubmit={handleCreateCategory} className="space-y-4">
                <Input label="Titre de la catégorie *" type="text" placeholder="Ex: Électronique" value={catTitle} onChange={e => setCatTitle(e.target.value)} disabled={loadingCat} />
                <div className="flex flex-col space-y-1">
                  <label className="text-xs font-semibold text-gray-600 uppercase">Description *</label>
                  <textarea placeholder="Détails..." value={catDescription} onChange={e => setCatDescription(e.target.value)} disabled={loadingCat} rows={2} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 text-gray-800 transition-all" />
                </div>
                <div className="flex flex-col space-y-1">
                  <label className="text-xs font-semibold text-gray-600 uppercase">Conseil / Avis *</label>
                  <textarea placeholder="Conseils..." value={catAdvise} onChange={e => setCatAdvise(e.target.value)} disabled={loadingCat} rows={2} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 text-gray-800 transition-all" />
                </div>
                <Button type="submit" isLoading={loadingCat} className="w-full bg-blue-600 hover:bg-blue-700 text-white">Enregistrer la catégorie</Button>
              </form>
            </div>
          )}
        </section>

        {/* 🟢 FORMULAIRE OBJET ENTIÈREMENT PLIABLE (À DROITE) */}
        <section className="bg-white rounded-xl border border-gray-200 shadow-sm lg:col-span-8 overflow-hidden transition-all">
          
          {/* En-tête cliquable pour l'intégralité du bloc Objet */}
          <button 
            type="button"
            onClick={() => setIsOpenObj(!isOpenObj)}
            className="w-full flex items-center justify-between p-5 bg-gray-50/50 hover:bg-gray-50 transition-colors border-b border-gray-100 text-left focus:outline-none"
          >
            <div>
              <h3 className="text-base font-bold text-gray-900">Créer une fiche Objet</h3>
              <p className="text-xs text-gray-500 font-normal mt-0.5">Ajouter un produit avec tous ses attributs et photos</p>
            </div>
            <span className={`text-xs font-bold px-2 py-1 bg-white border border-gray-200 rounded-md text-gray-500 transition-transform duration-200 ${isOpenObj ? 'rotate-180' : ''}`}>
              ▼
            </span>
          </button>

          {/* Corps pliable complet */}
          {isOpenObj && (
            <div className="p-6 space-y-4 animate-fadeIn">
              {feedback && feedback.type === 'obj' && (
                <div className={`p-3 text-sm rounded-lg mb-2 font-medium border ${
                  feedback.status === 'OK' ? 'bg-green-50 border-green-200 text-green-700' : 'bg-red-50 border-red-200 text-red-700'
                }`}>
                  {feedback.message}
                </div>
              )}

              <form onSubmit={handleCreateObject} className="space-y-4">
                
                {/* 1. Informations Essentielles */}
                <div className="bg-gray-50/50 p-4 rounded-xl border border-gray-100 space-y-4">
                  <span className="text-xs font-bold text-blue-600 uppercase tracking-wider block">1. Informations Essentielles</span>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Input label="Nom de l'objet *" type="text" placeholder="Ex: Borne d'arcade retro" value={objTitle} onChange={e => setObjTitle(e.target.value)} disabled={loadingObj} />
                    <Input label="Code SKU unique *" type="text" placeholder="Ex: BR-ARC-54" value={objSku} onChange={e => setObjSku(e.target.value)} disabled={loadingObj} />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div className="flex flex-col space-y-1">
                      <label className="text-xs font-semibold text-gray-600 uppercase">Catégorie *</label>
                      <select
                        value={objCategoryId}
                        onChange={e => setObjCategoryId(e.target.value)}
                        disabled={loadingObj}
                        className="w-full h-[38px] px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 text-gray-800 transition-all cursor-pointer"
                      >
                        <option value="">-- Choisir --</option>
                        {categoriesList.map((cat) => (
                          <option key={cat.id_category_type} value={cat.id_category_type}>
                            {cat.title || `Catégorie N°${cat.id_category_type}`}
                          </option>
                        ))}
                      </select>
                    </div>

                    <Input label="Prix de vente (€) *" type="number" placeholder="150" value={objPrice} onChange={e => setObjPrice(e.target.value)} disabled={loadingObj} />
                    <Input label="Prix barré / Discount (€)" type="number" placeholder="120" value={objDiscountPrice} onChange={e => setObjDiscountPrice(e.target.value)} disabled={loadingObj} />
                    <Input label="Quantité en Stock" type="number" placeholder="10" value={objStock} onChange={e => setObjStock(e.target.value)} disabled={loadingObj} />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Input label="Marque / Constructeur" type="text" placeholder="Ex: Sony, Sega..." value={objBrand} onChange={e => setObjBrand(e.target.value)} disabled={loadingObj} />
                    
                    <div className="flex flex-col space-y-1">
                      <label className="text-xs font-semibold text-gray-600 uppercase">Tag Associé</label>
                      <select
                        value={objTagId}
                        onChange={e => setObjTagId(e.target.value)}
                        disabled={loadingObj}
                        className="w-full h-[38px] px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 text-gray-800 transition-all cursor-pointer"
                      >
                        <option value="">-- Aucun Tag --</option>
                        {tagsList.map((tag) => (
                          <option key={tag.id_tag} value={tag.id_tag}>
                            {tag.title}
                          </option>
                        ))}
                      </select>
                    </div>

                    <Input label="Numéro Préférence" type="number" placeholder="Ex: 1" value={objPreferenceNum} onChange={e => setObjPreferenceNum(e.target.value)} disabled={loadingObj} />
                  </div>
                </div>

                {/* 2. Textes de présentation & Spécifications */}
                <div className="bg-gray-50/50 p-4 rounded-xl border border-gray-100 space-y-4">
                  <span className="text-xs font-bold text-blue-600 uppercase tracking-wider block">2. Textes de présentation & Spécifications</span>
                  <Input label="Description Courte" type="text" placeholder="Résumé accrocheur en une ligne..." value={objShortDesc} onChange={e => setObjShortDesc(e.target.value)} disabled={loadingObj} />
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex flex-col space-y-1">
                      <label className="text-xs font-semibold text-gray-600 uppercase">Description Détaillée</label>
                      <textarea placeholder="Description complète..." value={objDescription} onChange={e => setObjDescription(e.target.value)} disabled={loadingObj} rows={2} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20" />
                    </div>
                    <div className="flex flex-col space-y-1">
                      <label className="text-xs font-semibold text-gray-600 uppercase">Caractéristiques (Features)</label>
                      <textarea placeholder="Ex: Écran OLED, Joysticks sanwa..." value={objFeatures} onChange={e => setObjFeatures(e.target.value)} disabled={loadingObj} rows={2} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20" />
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex flex-col space-y-1">
                      <label className="text-xs font-semibold text-gray-600 uppercase">Détails Techniques</label>
                      <textarea placeholder="Ex: Piles incluses, Alimentation 220V..." value={objTechDetails} onChange={e => setObjTechDetails(e.target.value)} disabled={loadingObj} rows={2} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20" />
                    </div>
                    <div className="flex flex-col space-y-1">
                      <label className="text-xs font-semibold text-gray-600 uppercase">Conseil d’Utilisation (Advise)</label>
                      <textarea placeholder="Conseils pour l'utilisateur final..." value={objAdvise} onChange={e => setObjAdvise(e.target.value)} disabled={loadingObj} rows={2} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20" />
                    </div>
                  </div>
                </div>

                {/* 3. Logistique, Garanties & Statuts */}
                <div className="bg-gray-50/50 p-4 rounded-xl border border-gray-100 space-y-4">
                  <span className="text-xs font-bold text-blue-600 uppercase tracking-wider block">3. Logistique, Garanties & Statuts</span>
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <Input label="Hauteur (cm)" type="number" placeholder="80" value={objHeight} onChange={e => setObjHeight(e.target.value)} disabled={loadingObj} />
                    <Input label="Poids (kg)" type="number" placeholder="12" value={objWeight} onChange={e => setObjWeight(e.target.value)} disabled={loadingObj} />
                    <Input label="Conditions de Retour" type="text" value={objValueReturn} onChange={e => setObjValueReturn(e.target.value)} disabled={loadingObj} />
                    <Input label="Infos Garantie" type="text" value={objWarranty} onChange={e => setObjWarranty(e.target.value)} disabled={loadingObj} />
                  </div>
                  <Input label="URL du Guide d'Installation" type="text" placeholder="https://example.com/guide.pdf" value={objGuideUrl} onChange={e => setObjGuideUrl(e.target.value)} disabled={loadingObj} />
                  
                  <div className="flex space-x-6 pt-2">
                    <label className="flex items-center space-x-2 cursor-pointer text-sm font-semibold text-gray-700">
                      <input type="checkbox" checked={objIsAvailable} onChange={e => setObjIsAvailable(e.target.checked)} className="h-4 w-4 text-blue-600 rounded border-gray-300" />
                      <span>Disponible à la vente</span>
                    </label>
                    <label className="flex items-center space-x-2 cursor-pointer text-sm font-semibold text-gray-700">
                      <input type="checkbox" checked={objIsActive} onChange={e => setObjIsActive(e.target.checked)} className="h-4 w-4 text-blue-600 rounded border-gray-300" />
                      <span>Fiche Active (Visible)</span>
                    </label>
                  </div>
                </div>

                {/* Zone de téléchargement d'images */}
                <div className="flex flex-col space-y-2 bg-gray-50 p-4 rounded-xl border border-gray-200">
                  <label className="text-xs font-bold uppercase text-gray-700 tracking-wider">Images de l'objet (10 max)</label>
                  <input 
                    id="images-upload" 
                    type="file" 
                    multiple 
                    accept="image/*" 
                    disabled={loadingObj}
                    onChange={e => {
                        if (e.target.files) {
                            const newFiles = Array.from(e.target.files);
                            
                            // 1. Calcul du total après ajout
                            const totalCount = selectedFiles.length + newFiles.length;
                            
                            if (totalCount > 10) {
                                // 2. Feedback utilisateur (Optionnel : ajouter une alerte ou un message)
                                alert("Vous ne pouvez pas ajouter plus de 10 images au total.");
                                return; // On arrête tout, rien n'est ajouté
                            }

                            // 3. Mise à jour de l'état si tout est valide
                            setSelectedFiles(prevFiles => [...prevFiles, ...newFiles]);
                        }
                    }}
                    className="block w-full text-sm text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-600 file:text-white hover:file:bg-blue-500 cursor-pointer"
                />

                  {selectedFiles.length > 0 && (
                      <div className="mt-3 space-y-2">
                          <div className="text-xs font-bold text-green-700 bg-green-50 border border-green-200 px-3 py-2 rounded-lg flex justify-between items-center">
                            <span>🚀 {selectedFiles.length} photo(s) prête(s) à l'envoi (Max 10).</span>
                            <button 
                                type="button" 
                                onClick={handleClearImages} 
                                className="text-red-600 hover:text-red-500 underline font-normal text-xs"
                            >
                                Tout vider
                            </button>
                          </div>
                          
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 bg-white p-3 rounded-lg border border-gray-100 max-h-60 overflow-y-auto">
                            {selectedFiles.map((file, idx) => (
                              <div key={idx} className={`p-2 rounded-lg border text-xs flex items-center justify-between transition-all ${
                                idx === 0 
                                  ? 'bg-blue-50/70 border-blue-300 text-blue-900 font-medium' 
                                  : 'bg-gray-50 border-gray-200 text-gray-600'
                              }`}>
                                <span className="truncate max-w-[180px]">{idx === 0 ? '⭐ ' : ''}{file.name}</span>
                                {idx === 0 ? (
                                  <span className="text-[10px] bg-blue-600 text-white px-2 py-0.5 rounded-full font-bold uppercase tracking-wider">Principale</span>
                                ) : (
                                  <button
                                    type="button"
                                    onClick={() => handleSetMainPicture(idx)}
                                    className="text-[11px] text-blue-600 hover:text-blue-800 font-semibold underline hover:no-underline transition-all"
                                  >
                                    Définir principale
                                  </button>
                                )}
                              </div>
                            ))}
                          </div>
                      </div>
                  )}
                </div>

                {/* Bouton de validation interne */}
                <div className="flex justify-end pt-4 border-t border-gray-100">
                  <Button type="submit" isLoading={loadingObj} className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3">
                    Créer l'objet et téléverser les photos
                  </Button>
                </div>
              </form>
            </div>
          )}
        </section>
      </div>

        {/* 🟢 LISTE DU CATALOGUE (AFFICHAGE PRO) */}
        <div className="mt-12">
        <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl font-extrabold text-gray-900">Mon Catalogue</h2>
            <span className="text-sm text-gray-500 font-medium">{catalog.length} catégories</span>
        </div>

        <div className="space-y-10">
            {catalog.map((cat) => (
            <div key={cat.id_category_type} className="bg-white p-6 md:p-8 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow duration-300">
                
                {/* En-tête de catégorie */}
                <div className="mb-6 border-b border-gray-100 pb-4">
                <h3 className="text-xl font-bold text-gray-900 tracking-tight">{cat.category_title}</h3>
                <p className="text-sm text-gray-500 mt-1">{cat.category_description}</p>
                </div>

                {/* Grille des objets */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
                {cat.objects.length > 0 ? (
                    cat.objects.map((obj) => (
                    <div 
                        key={obj.id_object} 
                        className={`group flex flex-col p-5 bg-gray-50 rounded-xl border transition-all duration-300 ${
                        expandedObjectIds.includes(obj.id_object) ? 'border-blue-400 bg-blue-50/50 sm:col-span-2' : 'border-gray-200 hover:border-blue-300 hover:bg-blue-50/30'
                        }`}
                        
                    >
                        <ObjectImageSlider images={obj.images || []} />
                        {/* Header de la carte objet */}
                        <div className="flex justify-between items-start mb-3">
                        <h4 className="font-bold text-gray-900 leading-tight group-hover:text-blue-900 transition-colors">{obj.title}</h4>
                        <button 
                            onClick={() => toggleExpand(obj.id_object)}
                            className="text-[10px] font-bold px-2 py-1 bg-white border border-gray-200 rounded-md text-blue-600 hover:bg-blue-50 transition-colors"
                        >
                            {expandedObjectIds.includes(obj.id_object) ? 'Réduire' : 'Détails'}
                        </button>
                        </div>

                        {/* Détails toujours visibles */}
                        <div className="space-y-2 mt-auto">
                        <div className="flex items-center justify-between">
                            <span className="text-xs text-gray-500">Prix</span>
                            <span className="font-bold text-blue-600">{obj.price.toFixed(2)} €</span>
                        </div>
                        <div className="flex items-center justify-between">
                            <span className="text-xs text-gray-500">Stock</span>
                            <span className={`text-xs font-semibold ${obj.stock_quantity > 0 ? 'text-gray-900' : 'text-red-600'}`}>
                            {obj.stock_quantity > 0 ? obj.stock_quantity : 'Épuisé'}
                            </span>
                        </div>
                        </div>

                        {/* Détails déroulants (conditionnels) */}
                        {expandedObjectIds.includes(obj.id_object) && (
                        <div className="mt-4 pt-4 border-t border-blue-200 animate-fadeIn text-sm">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-3">
                            <p><strong>SKU :</strong> {obj.sku}</p>
                            <p><strong>Marque :</strong> {obj.brand || 'N/A'}</p>
                            <p><strong>Prix :</strong> {obj.price ? `${obj.price} €` : 'N/A'}</p>
                            <p><strong>Prix Discount :</strong> {obj.discount_price ? `${obj.discount_price} €` : 'N/A'}</p>
                            <p><strong>Tag :</strong> {obj.tag_name || 'Aucun'}</p>
                            <p><strong>Poids / Hauteur :</strong> {obj.weight ?? 0} kg / {obj.height ?? 0} cm</p>
                            <p><strong>Préférence :</strong> {obj.preference_number ?? 'N/A'}</p>
                            <p><strong>Disponibilité :</strong> {obj.is_available ? 'Oui' : 'Non'}</p>
                            <p><strong>Active :</strong> {obj.is_active ? 'Oui' : 'Non'}</p>
                            <p className="md:col-span-2"><strong>Résumé :</strong> {obj.short_description}</p>
                            <p className="md:col-span-2"><strong>Description :</strong> {obj.description || 'Non renseignée'}</p>
                            <p className="md:col-span-2"><strong>Caractéristiques :</strong> {obj.features || 'Non renseignées'}</p>
                            <p className="md:col-span-2"><strong>Détails Techniques :</strong> {obj.technical_details || 'Non renseignés'}</p>
                            <p className="md:col-span-2"><strong>Conseils :</strong> {obj.advise || 'Aucun'}</p>
                            <p className="md:col-span-2"><strong>Garantie :</strong> {obj.warranty_info}</p>
                            <p className="md:col-span-2"><strong>Retour :</strong> {obj.value_return}</p>
                            {obj.installation_guide_url && (
                                <p className="md:col-span-2 text-blue-600 underline">
                                <a href={obj.installation_guide_url} target="_blank" rel="noopener noreferrer">Guide d'installation</a>
                                </p>
                            )}
                            <p className="md:col-span-2 text-[10px] text-gray-400 mt-2 italic">
                                Créé le : {new Date(obj.created_at || '').toLocaleDateString()}
                            </p>
                            </div>
                        </div>
                        )}

                        {/* Footer de la carte */}
                        <div className="mt-4 pt-3 border-t border-gray-200 flex justify-between items-center text-[10px] text-gray-400 uppercase font-bold tracking-widest">
                        <span>SKU: {obj.sku}</span>
                        <span className={obj.is_active ? 'text-green-600' : 'text-gray-400'}>
                            {obj.is_active ? 'Actif' : 'Masqué'}
                        </span>
                        </div>
                    </div>
                    ))
                ) : (
                    <div className="col-span-full py-8 text-center bg-gray-50 rounded-xl border border-dashed border-gray-200">
                    <p className="text-sm text-gray-400 italic">Aucun objet ajouté à cette catégorie pour le moment.</p>
                    </div>
                )}
                </div>
            </div>
            ))}
        </div>
        </div>
    </div>
  );
};