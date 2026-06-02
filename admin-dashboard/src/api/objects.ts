import { api } from './client';

// 🟢 Interfaces de Payload (Données envoyées)
export interface CreateCategoryPayload {
  title: string;
  description: string;
  advise: string;
}

export interface CategoryData {
  id_category_type: number;
  title: string;
  description: string;
  advise: string;
}

export interface CreateObjectPayload {
  title: string;
  description: string;
  short_description: string;
  sku: string;
  id_category_type: number;
  price: number;
  discount_price: number | null;
  stock_quantity: number;
  brand: string;
  features: string;
  technical_details: string;
  advise: string;
  value_return: string;
  height: number | null;
  weight: number | null;
  preference_number: number | null;
  id_tag: number | null;
  warranty_info: string;
  installation_guide_url: string;
  is_available: boolean;
  is_active: boolean;
}

export interface CategoryLookup {
  id_category_type: number;
  title: string;
}

interface ApiResponse<T> {
  status: 'OK' | 'KO';
  message: string | null;
  code: number;
  data: T;
}

export interface CatalogCategory {
  id_category_type: number;
  category_title: string;
  category_description: string;
  category_advise: string;
  objects: ObjectData[]; // Réutilise ton interface d'objet si tu en as une, ou crée celle ci-dessous
}

export interface ObjectImage {
  id_asset: number;
  file_path: string;
  is_main_picture: boolean;
}

export interface ObjectData {
  id_object: number;
  title: string;
  sku: string;
  id_category_type: number;
  price: number;
  discount_price?: number | null;
  stock_quantity: number;
  brand?: string | null;
  short_description?: string | null;
  description?: string | null;
  features?: string | null;
  technical_details?: string | null;
  advise?: string | null;
  value_return?: string | null;
  warranty_info?: string | null;
  installation_guide_url?: string | null;
  height?: number | null;
  weight?: number | null;
  preference_number?: number | null;
  id_tag?: number | null;
  is_available: boolean;
  is_active: boolean;
  tag_name?: string | null;
  created_at?: string;
  images: ObjectImage[];
}

/**
 * 🟢 CRÉATION D'UNE CATÉGORIE D'OBJET
 */
export const createCategoryApi = async (categoryData: CreateCategoryPayload): Promise<ApiResponse<CategoryData>> => {
  try {
    const response = await api.post<ApiResponse<CategoryData>>('/categories/create', categoryData);
    return response.data;
  } catch (error: any) {
    if (error.response && error.response.data) return error.response.data;
    return { status: 'KO', message: 'Erreur lors de la création de la catégorie.', code: 500, data: null as any };
  }
};

/**
 * 🟢 CRÉATION D'UN OBJET AVEC TOUS LES CHAMPS + IMAGES MULTIPLES
 */
export const createObjectApi = async (formData: FormData): Promise<ApiResponse<any>> => {
  try {
    const response = await api.post<ApiResponse<any>>('/objects/create', formData);
    return response.data;
  } catch (error: any) {
    if (error.response && error.response.data) {
      return error.response.data;
    }
    return { 
      status: 'KO', 
      message: "Erreur serveur lors de la création de l'objet (Vérifiez les contraintes BDD).", 
      code: 500,
      data: null
    };
  }
};

// 🟢 Nouvelle fonction à ajouter pour le lookup des catégories
export const getCategoriesLookupApi = async (): Promise<ApiResponse<CategoryLookup[]>> => {
  try {
    const response = await api.get<ApiResponse<CategoryLookup[]>>('/categories/lookup');
    return response.data;
  } catch (error: any) {
    return {
      status: 'KO',
      message: error.response?.data?.message || 'Impossible de charger le catalogue des catégories.',
      code: error.response?.status || 500,
      data: [],
    };
  }
};

/**
 * 🟢 Récupération du catalogue complet (Catégories + Objets)
 */
export const getCatalogApi = async (): Promise<ApiResponse<CatalogCategory[]>> => {
  try {
    const response = await api.get<ApiResponse<CatalogCategory[]>>('/categories/catalog');
    return response.data;
  } catch (error: any) {
    return {
      status: 'KO',
      message: error.response?.data?.message || 'Erreur lors du chargement du catalogue.',
      code: error.response?.status || 500,
      data: [],
    };
  }
};